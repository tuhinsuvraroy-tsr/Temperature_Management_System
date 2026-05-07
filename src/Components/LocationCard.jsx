import React from 'react';

// Receives a single location object as prop — no logic changes
function LocationCard({ loc }) {
  // Temperature tier determines color class and icon
  const isHot  = loc.temp > 35;
  const isWarm = loc.temp > 30 && loc.temp <= 35;
  const tempClass = isHot ? 'temp-hot' : isWarm ? 'temp-warm' : 'temp-cool';
  const barClass  = isHot || isWarm ? 'hot' : 'cool';
  const icon      = isHot ? '🔥' : isWarm ? '☀️' : '🌤️';

  // Progress bar width: clamp temp between 20–50°C for 0–100% fill
  const barWidth = Math.min(100, Math.max(0, ((loc.temp - 20) / 30) * 100)).toFixed(1);

  return (
    <div className="glass-card location-card">
      {/* Card header: name + icon */}
      <div className="location-card-header">
        <span className="location-name">{loc.name}</span>
        <span className="location-icon">{icon}</span>
      </div>

      {/* Temperature */}
      <div className={`location-temp-value ${tempClass}`}>
        {loc.temp.toFixed(1)}°
      </div>
      <div className="location-temp-label">Temperature · Celsius</div>

      {/* Temperature progress bar */}
      <div className="temp-bar-track">
        <div
          className={`temp-bar-fill ${barClass}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {/* Humidity pill */}
      <div className="humidity-row">
        <span className="humidity-label">Humidity</span>
        <span className="humidity-badge">{loc.humidity.toFixed(1)}%</span>
      </div>
    </div>
  );
}

export default LocationCard;