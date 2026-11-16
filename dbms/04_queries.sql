SET search_path TO temperature_management;

-- R1 READ — GET /api/latest (Database/readings.js:getLatestReadings).
SELECT n.device_id, n.display_name, l.name AS location_name,
       r.temperature_c, r.humidity_pct, r.recorded_at
FROM sensor_nodes n
JOIN locations l ON l.location_id = n.location_id
JOIN LATERAL (
  SELECT recorded_at, temperature_c, humidity_pct
  FROM sensor_readings
  WHERE device_id = n.device_id
  ORDER BY recorded_at DESC
  LIMIT 1
) r ON TRUE
WHERE n.active
ORDER BY n.device_id;

-- R2 READ — GET /api/history?hours=<hours> (getHistory).
PREPARE history_for_hours (integer) AS
SELECT device_id, recorded_at, temperature_c, humidity_pct
FROM sensor_readings
WHERE recorded_at >= now() - ($1 * interval '1 hour')
ORDER BY recorded_at;
-- Example: EXECUTE history_for_hours(24);

-- R3 READ — current dashboard headline statistics.
WITH latest AS (
  SELECT DISTINCT ON (device_id) device_id, temperature_c, humidity_pct
  FROM sensor_readings
  ORDER BY device_id, recorded_at DESC
)
SELECT round(avg(temperature_c), 1) AS average_temperature_c,
       round(avg(humidity_pct), 1) AS average_humidity_pct,
       count(*) AS active_locations
FROM latest;

-- R4 READ — daily minimum/maximum for a location.
SELECT l.name, min(r.temperature_c) AS min_temperature_c,
       max(r.temperature_c) AS max_temperature_c
FROM locations l
JOIN sensor_nodes n ON n.location_id = l.location_id
JOIN sensor_readings r ON r.device_id = n.device_id
WHERE r.recorded_at >= date_trunc('day', now()) - interval '1 day'
  AND r.recorded_at < date_trunc('day', now())
GROUP BY l.location_id, l.name
ORDER BY l.name;

-- W1 WRITE — POST /api/readings (saveReadings).
PREPARE insert_reading (text, numeric, numeric) AS
INSERT INTO sensor_readings (device_id, recorded_at, temperature_c, humidity_pct)
VALUES ($1, now(), $2, $3);
-- Example: EXECUTE insert_reading('esp1', 26.5, 72.0);
