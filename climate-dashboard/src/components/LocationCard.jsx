function LocationCard({ name, temp, humidity }) {
  return (
    <div className="glass-card location-card">
      <h3>{name}</h3>
      <p className="temp-small">{temp}°C</p>
      <p className="humidity-small">Humidity: {humidity}%</p>
    </div>
  );
}

export default LocationCard;