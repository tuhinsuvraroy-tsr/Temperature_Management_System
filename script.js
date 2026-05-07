const locations = [
    { id: 'a-block', name: 'A Block', temp: 26.5, humidity: 72.0 },
    { id: 'b-block', name: 'B Block', temp: 35.6, humidity: 42.5 },
    { id: 'c-block', name: 'C Block', temp: 31.6, humidity: 37.2 },
    { id: 'learners-arena', name: 'Learners Arena', temp: 27.7, humidity: 39.7 },
    { id: 'residency-2', name: 'Residency 2', temp: 35.3, humidity: 68.5 }
];

function updateClock() {
    const now = new Date();
    const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    const timeString = now.toLocaleTimeString('en-US', options);
    document.getElementById('ist-clock').textContent = timeString;

    updateBackground(now);
}

function updateBackground(now) {
    // Get hour in IST
    const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: 'numeric', hour12: false });
    const [hourStr, minuteStr] = istString.split(':');
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    const totalMinutes = hour * 60 + minute;

    const bgElement = document.getElementById('sky-background');
    const celestialBody = document.getElementById('celestial-body');

    // Remove all bg classes
    bgElement.classList.remove('bg-dawn', 'bg-day', 'bg-dusk', 'bg-night');
    celestialBody.classList.remove('sun', 'moon');
    celestialBody.style.transform = ''; // Reset transform

    // Day time: 6:00 (360 min) to 18:00 (1080 min)
    if (totalMinutes >= 360 && totalMinutes < 1080) {
        celestialBody.classList.add('sun');

        // Calculate position (10% to 90%)
        const dayDuration = 1080 - 360; // 720 minutes
        const progress = (totalMinutes - 360) / dayDuration;
        const leftPos = 10 + (progress * 80);

        // Parabolic arc for top position (starts low, goes high, ends low)
        // 10% top at noon (progress 0.5), 60% top at dawn/dusk
        const topPos = 60 - (Math.sin(progress * Math.PI) * 50);

        celestialBody.style.left = `${leftPos}%`;
        celestialBody.style.top = `${topPos}%`;

        if (hour >= 6 && hour < 8) bgElement.classList.add('bg-dawn');
        else if (hour >= 8 && hour < 17) bgElement.classList.add('bg-day');
        else bgElement.classList.add('bg-dusk');

    } else {
        // Night time
        bgElement.classList.add('bg-night');
        celestialBody.classList.add('moon');

        // Moon position logic (optional, but keeps it dynamic)
        // Map night time to 10% - 90%
        let nightProgress;
        if (totalMinutes >= 1080) {
            // 18:00 to 24:00
            nightProgress = (totalMinutes - 1080) / 720; // Using 12h night for simplicity
        } else {
            // 00:00 to 6:00
            nightProgress = (totalMinutes + 360) / 720; // Offset by time before midnight
        }
        // Normalize to 0-1 roughly for visible night duration

        celestialBody.style.left = '80%'; // Keep moon fixed or simple for now as requested "sun should go..."
        celestialBody.style.top = '15%';
    }
}

function renderLocations() {
    const container = document.getElementById('locations-container');
    container.innerHTML = '';

    locations.forEach(loc => {
        const card = document.createElement('div');
        card.className = 'glass-card location-card';
        card.innerHTML = `
            <h3>${loc.name}</h3>
            <div class="location-stat">
                <span class="label">Temperature</span>
                <span class="val temp-val" style="color: ${loc.temp > 35 ? '#f87171' : '#38bdf8'}">${loc.temp.toFixed(1)}°C</span>
            </div>
            <div class="location-stat">
                <span class="label">Humidity</span>
                <span class="val humidity-val">${loc.humidity.toFixed(1)}%</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function calculateAverages() {
    let totalTemp = 0;
    let totalHumidity = 0;

    locations.forEach(loc => {
        totalTemp += loc.temp;
        totalHumidity += loc.humidity;
    });

    const avgTemp = (totalTemp / locations.length).toFixed(1);
    const avgHumidity = (totalHumidity / locations.length).toFixed(1);

    document.getElementById('avg-temp').textContent = `${avgTemp}°C`;
    document.getElementById('avg-humidity').textContent = `${avgHumidity}%`;
}

function renderHistoryChart() {
    const ctx = document.getElementById('historyChart').getContext('2d');

    // Generate labels (24 hours)
    const labels = Array.from({ length: 24 }, (_, i) => i < 10 ? `0${i}:00` : `${i}:00`);

    // Generate datasets for each location
    const datasets = locations.map((loc, index) => {
        const data = [];
        for (let i = 0; i < 24; i++) {
            let variance = 0;
            if (i >= 10 && i <= 16) variance = 2;
            if (i >= 0 && i < 6) variance = -3;
            if (i >= 20) variance = -2;

            // Add some randomness and curve
            const temp = (loc.temp + variance + Math.sin(i / 24 * Math.PI) * 5 + (Math.random() * 1 - 0.5)).toFixed(1);
            data.push(temp);
        }

        // Assign specific colors for each location
        const colors = ['#38bdf8', '#f87171', '#4ade80', '#fbbf24', '#a78bfa'];
        const color = colors[index % colors.length];

        return {
            label: loc.name,
            data: data,
            borderColor: color,
            backgroundColor: color,
            borderWidth: 2,
            tension: 0.4, // Smooth curves
            pointRadius: 0,
            pointHoverRadius: 6
        };
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#fff',
                        font: {
                            family: "'Inter', sans-serif"
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: function (value) {
                            return value + '°C';
                        }
                    }
                }
            }
        }
    });
}

function generateMinMaxData() {
    const container = document.getElementById('min-max-container');
    container.innerHTML = '';

    locations.forEach(loc => {
        // Mock yesterday's min/max based on current temp
        const minTemp = (loc.temp - 5 - Math.random() * 2).toFixed(1);
        const maxTemp = (loc.temp + 3 + Math.random() * 2).toFixed(1);

        const card = document.createElement('div');
        card.className = 'min-max-card';
        card.innerHTML = `
            <h4>${loc.name}</h4>
            <div class="temp-range">
                <div class="temp-min">
                    <span class="temp-label">Min</span>
                    <span class="temp-value" style="color: #38bdf8">${minTemp}°C</span>
                </div>
                <div class="temp-max">
                    <span class="temp-label">Max</span>
                    <span class="temp-value" style="color: #f87171">${maxTemp}°C</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderLocations();
    calculateAverages();
    renderHistoryChart();
    generateMinMaxData();

    // Clock
    updateClock();
    setInterval(updateClock, 1000);
});

import { Chart } from "chart.js";
// for server to site connection
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  databaseURL: "https://rishihood-temperature-tracker-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const campusRef = ref(db, "campus");

onValue(campusRef, (snapshot) => {
  const data = snapshot.val();
  const firebaseData = snapshot.val();
if (!firebaseData) return;

// 1️⃣ Clear old data
locations.length = 0;

// 2️⃣ Map ESPs → Your UI locations
// You can rename these labels anytime
const espNameMap = {
  esp1: "A Block",
  esp2: "B Block",
  esp3: "C Block",
  esp4: "Learners Arena",
  esp5: "Residency 2"
};

// 3️⃣ Convert Firebase data → UI data structure
Object.keys(firebaseData).forEach(espId => {
  const esp = firebaseData[espId];

  locations.push({
    id: espId,
    name: espNameMap[espId] || espId.toUpperCase(),
    temp: esp.temp,
    humidity: esp.humidity
  });
});

// 4️⃣ Update UI components
renderLocations();
calculateAverages();
generateMinMaxData();

// ⚠️ Chart is mock-based, so re-render only if needed

});
