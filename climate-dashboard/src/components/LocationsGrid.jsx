import locations from "../data/locations";
import LocationCard from "./LocationCard";

function LocationsGrid() {
  return (
    <div className="locations-grid">
      {locations.map((loc, index) => (
        <LocationCard
          key={index}
          name={loc.name}
          temp={loc.temp}
          humidity={loc.humidity}
        />
      ))}
    </div>
  );
}

export default LocationsGrid;