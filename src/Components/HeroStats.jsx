import React from 'react';

// Receives pre-calculated averages from App.jsx — no logic changes
function HeroStats({ avgTemp, avgHumidity }) {
  return (
    <section className="hero-stats">
      <div className="container">
        <div className="hero-card">
          {/* Temperature — hero centerpiece */}
          <div className="hero-left">
            <span className="hero-label">Campus Average · Live</span>
            <div className="hero-temp-row">
              <span className="hero-temp-value">{avgTemp}</span>
              <span className="hero-temp-unit">°C</span>
            </div>
            <span className="hero-subtitle">Averaged across all sensor nodes</span>
          </div>
          <div className="hero-divider" />
          <div className="hero-right">
            <span className="hero-humidity-label">Humidity</span>
            <div className="hero-humidity-row">
              <span className="hero-humidity-value">{avgHumidity}</span>
              <span className="hero-humidity-unit">%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroStats;
