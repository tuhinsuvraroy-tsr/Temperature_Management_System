/* ================================================================
   TempFlow — Application Logic
   No functional changes. Only visual output updated to match the
   new design token system (chart colors, empty states, status dot).
   ================================================================ */

const config = window.APP_CONFIG || {};
const apiBaseUrl = (config.apiBaseUrl || '').replace(/\/$/, '');
const deviceNames = { esp1: 'A Block', esp2: 'B Block', esp3: 'C Block', esp4: 'Learners Arena', esp5: 'Residency 2' };

/* Single accent for first dataset; muted secondaries for the rest */
const deviceColors = ['#1F2A44', '#6B6B6B', '#3F7D5C', '#B7791F', '#8A8F98'];

let chart;

/* ── Helpers (unchanged) ─────────────────────────────────────── */
function token() { return sessionStorage.getItem('temperature_session'); }
function setMessage(id, message) { document.getElementById(id).textContent = message || ''; }
function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (token()) headers.Authorization = `Bearer ${token()}`;
  return fetch(`${apiBaseUrl}${path}`, { ...options, headers }).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Request failed.');
    return data;
  });
}

/* ── Auth (unchanged logic) ──────────────────────────────────── */
window.handleGoogleCredential = async ({ credential }) => {
  setMessage('login-message', 'Signing you in\u2026');
  try {
    const result = await api('/api/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential }) });
    sessionStorage.setItem('temperature_session', result.token);
    showDashboard(result.user);
    await refreshDashboard();
  } catch (error) { setMessage('login-message', error.message); }
};

function renderGoogleButton() {
  if (!config.googleClientId || config.googleClientId.startsWith('PASTE_')) {
    setMessage('login-message', 'Add your Google web client ID in Frontend/config.js first.');
    return;
  }
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const waitForGoogle = setInterval(() => {
    if (!window.google?.accounts?.id) return;
    clearInterval(waitForGoogle);
    google.accounts.id.initialize({ client_id: config.googleClientId, callback: window.handleGoogleCredential });
    google.accounts.id.renderButton(document.getElementById('google-signin'), {
      theme: isDark ? 'filled_black' : 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular'
    });
  }, 100);
}

function showDashboard(user) {
  document.getElementById('login-panel').hidden = true;
  document.getElementById('dashboard').hidden = false;
  document.getElementById('account-area').innerHTML =
    `<div class="account">${user.picture ? `<img src="${user.picture}" alt="" />` : ''}<span>${escapeHtml(user.name)}</span><button class="btn-ghost" id="logout-button">Sign out</button></div>`;
  document.getElementById('logout-button').addEventListener('click', logout);
}

async function logout() {
  try { await api('/api/auth/logout', { method: 'POST' }); } catch { /* local sign-out is still safe */ }
  sessionStorage.removeItem('temperature_session');
  window.location.reload();
}

/* ── Utilities (unchanged) ───────────────────────────────────── */
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[character]); }
function number(value) { return Number(value).toFixed(1); }
function localTime(value) { return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }

/* ── Resolve CSS custom properties for chart ─────────────────── */
function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

/* ── Show Latest Readings ────────────────────────────────────── */
function showLatest(readings) {
  const grid = document.getElementById('location-grid');
  if (!readings.length) {
    grid.innerHTML = '<article class="panel location-card empty-state"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg><span>Waiting for sensor data</span></article>';
    return;
  }
  grid.innerHTML = readings.map((reading) =>
    `<article class="panel location-card"><div class="card-title-row"><h3>${escapeHtml(deviceNames[reading.deviceId] || reading.deviceId)}</h3><span class="status-dot live"></span></div><div class="metric-row"><div class="metric"><span>TEMPERATURE</span><strong>${number(reading.temperature)}°C</strong></div><div class="metric"><span>HUMIDITY</span><strong class="humidity">${number(reading.humidity)}%</strong></div></div><time class="reading-time">Reported ${localTime(reading.recordedAt)}</time></article>`
  ).join('');
  const temperature = readings.reduce((sum, reading) => sum + reading.temperature, 0) / readings.length;
  const humidity = readings.reduce((sum, reading) => sum + reading.humidity, 0) / readings.length;
  document.getElementById('average-temperature').textContent = number(temperature);
  document.getElementById('average-humidity').textContent = number(humidity);
  document.getElementById('active-locations').textContent = readings.length;
  document.getElementById('updated-at').innerHTML =
    `<span class="status-dot live"></span> Live \u00b7 Updated ${localTime(Math.max(...readings.map((reading) => new Date(reading.recordedAt))))}`;
}

/* ── Show History Chart ──────────────────────────────────────── */
function showHistory(readings) {
  const groups = new Map();
  readings.forEach((reading) => { if (!groups.has(reading.deviceId)) groups.set(reading.deviceId, []); groups.get(reading.deviceId).push(reading); });

  const accent = cssVar('--accent') || '#1F2A44';
  const textSec = cssVar('--text-secondary') || '#6B6B6B';
  const border = cssVar('--border') || '#E5E3DE';
  const surface = cssVar('--surface') || '#FFFFFF';

  const datasets = [...groups.entries()].map(([deviceId, values], index) => ({
    label: deviceNames[deviceId] || deviceId,
    data: values.map((reading) => ({ x: reading.recordedAt, y: reading.temperature })),
    borderColor: deviceColors[index % deviceColors.length],
    backgroundColor: index === 0 ? (accent + '0F') : 'transparent',
    tension: 0.3,
    pointRadius: 0,
    pointHoverRadius: 4,
    pointHoverBackgroundColor: deviceColors[index % deviceColors.length],
    pointHoverBorderColor: surface,
    pointHoverBorderWidth: 2,
    borderWidth: index === 0 ? 2 : 1.5,
    fill: index === 0
  }));

  chart?.destroy();
  chart = new Chart(document.getElementById('history-chart'), {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      parsing: false,
      interaction: { mode: 'nearest', intersect: false },
      plugins: {
        legend: {
          labels: {
            color: textSec,
            font: { family: "'Inter', system-ui, sans-serif", weight: '500', size: 12 },
            usePointStyle: true,
            pointStyle: 'line',
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: surface,
          titleColor: cssVar('--text') || '#111',
          bodyColor: textSec,
          borderColor: border,
          borderWidth: 1,
          titleFont: { family: "'Inter', system-ui, sans-serif", weight: '600', size: 13 },
          bodyFont: { family: "'Inter', system-ui, sans-serif", weight: '400', size: 12 },
          cornerRadius: 6,
          padding: 12,
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8,
          boxPadding: 4,
          callbacks: {
            title: (items) => localTime(items[0].parsed.x),
            label: (item) => ` ${item.dataset.label}: ${item.parsed.y.toFixed(1)}°C`
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          ticks: {
            color: textSec,
            font: { family: "'Inter', system-ui, sans-serif", size: 11 },
            callback: (value) => new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            maxTicksLimit: 8
          },
          grid: { display: false },
          border: { color: border }
        },
        y: {
          ticks: {
            color: textSec,
            font: { family: "'Inter', system-ui, sans-serif", size: 11 },
            callback: (value) => `${value}°C`,
            padding: 8
          },
          grid: { color: border, lineWidth: 0.5 },
          border: { display: false }
        }
      }
    }
  });
  setMessage('chart-message', readings.length ? '' : 'No history has been recorded in the last 24 hours.');
}

/* ── Refresh Dashboard (unchanged logic) ─────────────────────── */
async function refreshDashboard() {
  try {
    setMessage('chart-message', 'Loading sensor history\u2026');
    const [latest, history] = await Promise.all([api('/api/latest'), api('/api/history?hours=24')]);
    showLatest(latest.readings);
    showHistory(history.readings);
  } catch (error) {
    if (/Sign in/.test(error.message)) return logout();
    setMessage('chart-message', error.message);
  }
}

/* ── Init (unchanged) ────────────────────────────────────────── */
document.getElementById('refresh-button').addEventListener('click', refreshDashboard);
if (token()) { showDashboard({ name: 'Signed in' }); refreshDashboard(); } else renderGoogleButton();
setInterval(() => { if (token()) refreshDashboard(); }, 30_000);
