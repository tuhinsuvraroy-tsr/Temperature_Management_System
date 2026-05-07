import React from 'react';

// Receives stable minMaxData array generated once in App.jsx via useMemo — no logic changes
function MinMaxSection({ minMaxData }) {
  return (
    <section className="min-max-section">
      <p className="section-label">Yesterday's Temperature Range</p>
      <div className="min-max-grid">
        {minMaxData.map((item) => (
          <div key={item.id} className="min-max-card">
            <div className="min-max-location">{item.name}</div>
            <div className="min-max-pills">
              {/* Min temp pill */}
              <div className="temp-pill min-pill">
                <span className="pill-label">Min</span>
                <span className="pill-value">{item.minTemp}°</span>
              </div>
              {/* Max temp pill */}
              <div className="temp-pill max-pill">
                <span className="pill-label">Max</span>
                <span className="pill-value">{item.maxTemp}°</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default MinMaxSection;
