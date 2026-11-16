SET search_path TO temperature_management;

-- R1 READ: dashboard cards with latest reading for every active sensor.
SELECT n.sensor_id, n.display_name, l.name AS location_name, r.temperature_c, r.humidity_pct, r.captured_at
FROM sensor_nodes n JOIN locations l ON l.location_id=n.location_id
JOIN LATERAL (SELECT * FROM sensor_readings WHERE sensor_id=n.sensor_id ORDER BY captured_at DESC LIMIT 1) r ON TRUE
WHERE n.active ORDER BY n.display_name;

-- R2 READ: previous 24 hours for the history chart at one node.
SELECT captured_at, temperature_c, humidity_pct FROM sensor_readings
WHERE sensor_id=:sensor_id AND captured_at >= now()-interval '24 hours' ORDER BY captured_at;

-- R3 READ: yesterday's minimum and maximum by location.
SELECT l.name, min(r.temperature_c) AS min_temp, max(r.temperature_c) AS max_temp
FROM locations l JOIN sensor_nodes n ON n.location_id=l.location_id
JOIN sensor_readings r ON r.sensor_id=n.sensor_id
WHERE r.captured_at >= date_trunc('day',now())-interval '1 day' AND r.captured_at < date_trunc('day',now())
GROUP BY l.location_id,l.name ORDER BY l.name;

-- R4 READ: campus averages across the newest values.
WITH newest AS (SELECT DISTINCT ON (sensor_id) sensor_id,temperature_c,humidity_pct FROM sensor_readings ORDER BY sensor_id,captured_at DESC)
SELECT round(avg(temperature_c),1) AS avg_temp,round(avg(humidity_pct),1) AS avg_humidity FROM newest;

-- W1 WRITE: persist an ESP upload; matching timestamp overwrites a retransmission.
INSERT INTO sensor_readings(sensor_id,captured_at,temperature_c,humidity_pct)
VALUES (:sensor_id,:captured_at,:temperature_c,:humidity_pct)
ON CONFLICT(sensor_id,captured_at) DO UPDATE SET temperature_c=EXCLUDED.temperature_c,humidity_pct=EXCLUDED.humidity_pct;
