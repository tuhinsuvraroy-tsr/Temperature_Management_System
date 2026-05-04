import locations from "../data/locations";

function MinMaxSection() {
  return (
    <div className="minmax-section">
      <h2>Yesterday's Temperature Range</h2>

      <div className="minmax-grid">
        {locations.map((loc, index) => (
          <div key={index} className="glass-card minmax-card">
            <h3>{loc.name}</h3>

            <div className="minmax-values">
              <span>Min: {loc.temp - 3}°C</span>
              <span>Max: {loc.temp + 3}°C</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MinMaxSection;