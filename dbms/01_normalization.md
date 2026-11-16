# Temperature Management System normalization

The UI shows named campus locations, ESP sensor nodes, current temperature/humidity,
and historical readings. A single unnormalized record would repeat location name and
sensor metadata for every timestamp: (sensor_id, location_name, temperature, humidity,
captured_at).

**1NF.** Store one scalar reading per sensor and timestamp; no repeating hourly arrays.
**2NF.** The natural reading key is (sensor_id, captured_at), so location details do not
belong in a reading because they depend only on sensor_id.
**3NF.** Separate locations(location_id, name) from
sensor_nodes(sensor_id, location_id, display_name, active), then keep
sensor_readings(sensor_id, captured_at, temperature_c, humidity_pct).
This removes the transitive dependency sensor_id → location_id → location_name.

Functional dependencies: location_id → location_name; sensor_id → location_id,
display_name, active; (sensor_id, captured_at) → temperature_c, humidity_pct.
All final relations are in BCNF because every determinant is a candidate key.
