import React from 'react';
import LocationCard from './LocationCard';

// Plain CSS Grid replaces Ant Design Row/Col — same map logic
function LocationsGrid({ locations }) {
  return (
    <section className="locations-grid-section">
      <p className="section-label">Sensor Nodes · Live Data</p>
      <div className="locations-grid">
        {locations.map((loc) => (
          <LocationCard key={loc.id} loc={loc} />
        ))}
      </div>
    </section>
  );
}

export default LocationsGrid;
