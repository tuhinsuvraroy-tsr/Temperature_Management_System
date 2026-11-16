const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');
const { OAuth2Client } = require('google-auth-library');
const { createDatabase } = require('../Database/mongo');
const { createReadingsRepository } = require('../Database/readings');
const { createGoogleAuth } = require('../Authentication/googleAuth');

loadEnvFile(path.join(__dirname, '.env'));

const database = createDatabase(MongoClient);
const { getDatabase, closeDatabase } = database;
const { saveReadings, getLatestReadings, getHistory } = createReadingsRepository(database);
const { signInWithGoogle, getUserFromRequest, deleteSession } = createGoogleAuth(OAuth2Client);

const port = Number(process.env.PORT || 3000);
const frontendFolder = path.join(__dirname, '..', 'Frontend');
const allowedOrigins = (process.env.FRONTEND_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean);
const contentTypes = { '.css': 'text/css', '.js': 'application/javascript', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function setCors(request, response) {
  const origin = request.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Device-Key');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 100_000) request.destroy();
    });
    request.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error('Request body must be valid JSON.')); }
    });
    request.on('error', reject);
  });
}

function validReading(reading) {
  return reading && typeof reading.deviceId === 'string' && /^[a-zA-Z0-9_-]{1,40}$/.test(reading.deviceId)
    && Number.isFinite(reading.temperature) && reading.temperature >= -50 && reading.temperature <= 100
    && Number.isFinite(reading.humidity) && reading.humidity >= 0 && reading.humidity <= 100;
}

function deviceKeyMatches(request) {
  const supplied = request.headers['x-device-key'] || '';
  const expected = process.env.DEVICE_API_KEY || '';
  if (!supplied || !expected || supplied.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

function requireUser(request, response) {
  const user = getUserFromRequest(request);
  if (!user) {
    json(response, 401, { error: 'Sign in with Google to view dashboard data.' });
    return null;
  }
  return user;
}

async function handleApi(request, response, url) {
  if (request.method === 'OPTIONS') return response.end();

  if (request.method === 'POST' && url.pathname === '/api/auth/google') {
    const { credential } = await readJson(request);
    if (!credential) return json(response, 400, { error: 'Google credential is required.' });
    return json(response, 200, await signInWithGoogle(credential));
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
    deleteSession(request);
    return json(response, 200, { ok: true });
  }

  if (request.method === 'POST' && url.pathname === '/api/readings') {
    if (!deviceKeyMatches(request)) return json(response, 401, { error: 'Invalid device API key.' });
    const body = await readJson(request);
    const readings = Array.isArray(body.readings) ? body.readings : [body];
    if (!readings.length || readings.length > 10 || !readings.every(validReading)) {
      return json(response, 400, { error: 'Provide 1–10 valid readings with deviceId, temperature and humidity.' });
    }
    return json(response, 201, { saved: await saveReadings(readings) });
  }

  if (request.method === 'GET' && url.pathname === '/api/latest') {
    if (!requireUser(request, response)) return;
    return json(response, 200, { readings: await getLatestReadings() });
  }

  if (request.method === 'GET' && url.pathname === '/api/history') {
    if (!requireUser(request, response)) return;
    const requested = Number(url.searchParams.get('hours') || 24);
    const hours = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 168) : 24;
    return json(response, 200, { hours, readings: await getHistory(hours) });
  }

  return json(response, 404, { error: 'API route not found.' });
}

function serveFrontend(request, response, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(frontendFolder, requested));
  if (!filePath.startsWith(frontendFolder) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return response.end('Not found');
  }
  response.writeHead(200, { 'Content-Type': `${contentTypes[path.extname(filePath)] || 'application/octet-stream'}; charset=utf-8` });
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer(async (request, response) => {
  setCors(request, response);
  const url = new URL(request.url, `http://${request.headers.host}`);
  try {
    if (url.pathname.startsWith('/api/')) await handleApi(request, response, url);
    else if (request.method === 'GET') serveFrontend(request, response, url.pathname);
    else json(response, 405, { error: 'Method not allowed.' });
  } catch (error) {
    console.error(error);
    json(response, 500, { error: 'The server could not complete this request.' });
  }
});

getDatabase().then(() => {
  // 0.0.0.0 accepts requests forwarded by a cloud host as well as local requests.
  server.listen(port, '0.0.0.0', () => console.log(`Temperature dashboard: http://localhost:${port}`));
}).catch((error) => {
  console.error(`Could not connect to MongoDB: ${error.message}`);
  process.exit(1);
});

process.on('SIGINT', async () => { await closeDatabase(); process.exit(0); });
