const config = window.APP_CONFIG || {};
const apiBaseUrl = (config.apiBaseUrl || '').replace(/\/$/, '');
const deviceNames = { esp1: 'A Block', esp2: 'B Block', esp3: 'C Block', esp4: 'Learners Arena', esp5: 'Residency 2' };
const deviceColors = ['#a855f7', '#fb7185', '#06d6a0', '#facc15', '#38bdf8'];
let chart;

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

window.handleGoogleCredential = async ({ credential }) => {
  setMessage('login-message', 'Signing you in…');
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
  const waitForGoogle = setInterval(() => {
    if (!window.google?.accounts?.id) return;
    clearInterval(waitForGoogle);
    google.accounts.id.initialize({ client_id: config.googleClientId, callback: window.handleGoogleCredential });
    google.accounts.id.renderButton(document.getElementById('google-signin'), { theme: 'filled_black', size: 'large', text: 'signin_with', shape: 'pill' });
  }, 100);
}

function showDashboard(user) {
  document.getElementById('login-panel').hidden = true;
  document.getElementById('dashboard').hidden = false;
  document.getElementById('account-area').innerHTML = `<div class="account">${user.picture ? `<img src="${user.picture}" alt="" />` : ''}<span>${escapeHtml(user.name)}</span><button id="logout-button">Sign out</button></div>`;
  document.getElementById('logout-button').addEventListener('click', logout);
}

async function logout() {
  try { await api('/api/auth/logout', { method: 'POST' }); } catch { /* local sign-out is still safe */ }
  sessionStorage.removeItem('temperature_session');
  window.location.reload();
}

function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[character]); }
function number(value) { return Number(value).toFixed(1); }
function localTime(value) { return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }

function showLatest(readings) {
  const grid = document.getElementById('location-grid');
  if (!readings.length) { grid.innerHTML = '<article class="panel location-card">No readings have arrived yet.</article>'; return; }
  grid.innerHTML = readings.map((reading) => `<article class="panel location-card"><h3>${escapeHtml(deviceNames[reading.deviceId] || reading.deviceId)}</h3><div class="metric-row"><div class="metric"><span>TEMPERATURE</span><strong>${number(reading.temperature)}°C</strong></div><div class="metric"><span>HUMIDITY</span><strong class="humidity">${number(reading.humidity)}%</strong></div></div><time class="reading-time">Reported ${localTime(reading.recordedAt)}</time></article>`).join('');
  const temperature = readings.reduce((sum, reading) => sum + reading.temperature, 0) / readings.length;
  const humidity = readings.reduce((sum, reading) => sum + reading.humidity, 0) / readings.length;
  document.getElementById('average-temperature').textContent = `${number(temperature)}°C`;
  document.getElementById('average-humidity').textContent = `${number(humidity)}%`;
  document.getElementById('active-locations').textContent = readings.length;
  document.getElementById('updated-at').textContent = `Latest update: ${localTime(Math.max(...readings.map((reading) => new Date(reading.recordedAt))))}`;
}

function showHistory(readings) {
  const groups = new Map();
  readings.forEach((reading) => { if (!groups.has(reading.deviceId)) groups.set(reading.deviceId, []); groups.get(reading.deviceId).push(reading); });
  const datasets = [...groups.entries()].map(([deviceId, values], index) => ({
    label: deviceNames[deviceId] || deviceId,
    data: values.map((reading) => ({ x: reading.recordedAt, y: reading.temperature })),
    borderColor: deviceColors[index % deviceColors.length],
    backgroundColor: deviceColors[index % deviceColors.length] + '18',
    tension: 0.4,
    pointRadius: 2,
    pointHoverRadius: 6,
    borderWidth: 2.5,
    fill: true
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
            color: '#c8d6e5',
            font: { family: "'Inter', system-ui, sans-serif", weight: 600, size: 12 },
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: 'rgba(18, 18, 40, 0.92)',
          borderColor: 'rgba(168, 85, 247, 0.3)',
          borderWidth: 1,
          titleFont: { family: "'Inter', system-ui, sans-serif", weight: 700 },
          bodyFont: { family: "'Inter', system-ui, sans-serif" },
          cornerRadius: 12,
          padding: 14,
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
            color: '#6b7c8f',
            font: { family: "'Inter', system-ui, sans-serif", size: 11 },
            callback: (value) => new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            maxTicksLimit: 8
          },
          grid: { color: 'rgba(168, 85, 247, 0.06)' }
        },
        y: {
          ticks: {
            color: '#6b7c8f',
            font: { family: "'Inter', system-ui, sans-serif", size: 11 },
            callback: (value) => `${value}°C`
          },
          grid: { color: 'rgba(168, 85, 247, 0.06)' }
        }
      }
    }
  });
  setMessage('chart-message', readings.length ? '' : 'No history has been recorded in the last 24 hours.');
}

async function refreshDashboard() {
  try {
    setMessage('chart-message', 'Loading real sensor history…');
    const [latest, history] = await Promise.all([api('/api/latest'), api('/api/history?hours=24')]);
    showLatest(latest.readings);
    showHistory(history.readings);
  } catch (error) {
    if (/Sign in/.test(error.message)) return logout();
    setMessage('chart-message', error.message);
  }
}

document.getElementById('refresh-button').addEventListener('click', refreshDashboard);
if (token()) { showDashboard({ name: 'Signed in' }); refreshDashboard(); } else renderGoogleButton();
setInterval(() => { if (token()) refreshDashboard(); }, 30_000);
