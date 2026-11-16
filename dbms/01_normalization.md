# Temperature Management System: normalization

The production app stores readings as MongoDB documents:
{ deviceId, temperature, humidity, recordedAt }. The dashboard turns the latest
reading from each device into a card and uses the last 24 hours for its chart.
The relational design below is the PostgreSQL model submitted for the DBMS assignment;
it does not replace the deployed MongoDB store.

## From unnormalized data to 3NF

An unnormalized log repeats the device's human name and location in every row:
(device_id, device_name, location_name, recorded_at, temperature_c, humidity_pct).

- **1NF:** one reading is one row; temperature, humidity and timestamp are scalar
  attributes—not an array of dashboard values.
- **2NF:** the natural reading key is (device_id, recorded_at). Device name and
  location depend only on device_id, so they are removed from sensor_readings.
- **3NF:** location is separated from sensor metadata. This removes the transitive
  dependency device_id → location_id → location_name.

| Relation | Candidate key | Functional dependencies |
|---|---|---|
| locations | location_id, name | location_id → name, created_at |
| sensor_nodes | device_id, display_name | device_id → location_id, display_name, active, installed_at |
| sensor_readings | (device_id, recorded_at) | (device_id, recorded_at) → temperature_c, humidity_pct |

Every determinant above is a candidate key, so the final tables are in BCNF (and
therefore 3NF). The app's deviceNames object is migrated into sensor_nodes, where it
becomes data rather than repeated UI configuration.
