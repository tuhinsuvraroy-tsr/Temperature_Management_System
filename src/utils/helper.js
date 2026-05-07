// ---------------------------------------------------------------------------
// calculateAverages — mirrors original calculateAverages() logic
// ---------------------------------------------------------------------------
export function calculateAverages(locations) {
  let totalTemp = 0;
  let totalHumidity = 0;

  locations.forEach((loc) => {
    totalTemp += loc.temp;
    totalHumidity += loc.humidity;
  });

  const avgTemp = (totalTemp / locations.length).toFixed(1);
  const avgHumidity = (totalHumidity / locations.length).toFixed(1);

  return { avgTemp, avgHumidity };
}

// ---------------------------------------------------------------------------
// generateMinMaxData — mirrors original generateMinMaxData() logic
// Called ONCE (stable per page load via useMemo)
// ---------------------------------------------------------------------------
export function generateMinMaxData(locations) {
  return locations.map((loc) => ({
    id: loc.id,
    name: loc.name,
    minTemp: (loc.temp - 5 - Math.random() * 2).toFixed(1),
    maxTemp: (loc.temp + 3 + Math.random() * 2).toFixed(1),
  }));
}

// ---------------------------------------------------------------------------
// generateChartDatasets — mirrors original renderHistoryChart() dataset logic
// Called ONCE (stable per page load via useMemo)
// ---------------------------------------------------------------------------
export function generateChartDatasets(locations) {
  const labels = Array.from({ length: 24 }, (_, i) =>
    i < 10 ? `0${i}:00` : `${i}:00`
  );

  const colors = ['#38bdf8', '#f87171', '#4ade80', '#fbbf24', '#a78bfa'];

  const datasets = locations.map((loc, index) => {
    const data = [];
    for (let i = 0; i < 24; i++) {
      let variance = 0;
      if (i >= 10 && i <= 16) variance = 2;
      if (i >= 0 && i < 6) variance = -3;
      if (i >= 20) variance = -2;

      const temp = (
        loc.temp +
        variance +
        Math.sin((i / 24) * Math.PI) * 5 +
        (Math.random() * 1 - 0.5)
      ).toFixed(1);
      data.push(temp);
    }

    const color = colors[index % colors.length];

    return {
      label: loc.name,
      data,
      borderColor: color,
      backgroundColor: color,
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
    };
  });

  return { labels, datasets };
}

// ---------------------------------------------------------------------------
// getBackgroundState — mirrors original updateBackground() logic
// Returns { bgClass, celestialClass, celestialStyle }
// ---------------------------------------------------------------------------
export function getBackgroundState(now) {
  const istString = now.toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const [hourStr, minuteStr] = istString.split(':');
  const hour = parseInt(hourStr);
  const minute = parseInt(minuteStr);
  const totalMinutes = hour * 60 + minute;

  // Day time: 6:00 (360 min) to 18:00 (1080 min)
  if (totalMinutes >= 360 && totalMinutes < 1080) {
    const dayDuration = 1080 - 360;
    const progress = (totalMinutes - 360) / dayDuration;
    const leftPos = 10 + progress * 80;
    const topPos = 60 - Math.sin(progress * Math.PI) * 50;

    let bgClass = 'bg-day';
    if (hour >= 6 && hour < 8) bgClass = 'bg-dawn';
    else if (hour >= 17) bgClass = 'bg-dusk';

    return {
      bgClass,
      celestialClass: 'sun',
      celestialStyle: { left: `${leftPos}%`, top: `${topPos}%` },
    };
  }

  // Night time
  return {
    bgClass: 'bg-night',
    celestialClass: 'moon',
    celestialStyle: { left: '80%', top: '15%' },
  };
}

// ---------------------------------------------------------------------------
// getISTTimeString — mirrors original updateClock() time formatting
// ---------------------------------------------------------------------------
export function getISTTimeString(now) {
  return now.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}
