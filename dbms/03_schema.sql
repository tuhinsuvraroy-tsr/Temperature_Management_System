-- Coursework schema: PostgreSQL equivalent of the live MongoDB readings model.
-- It is intentionally not imported by Backend/server.js, so it cannot affect
-- the deployed Node/MongoDB application.
CREATE SCHEMA IF NOT EXISTS temperature_management;
SET search_path TO temperature_management;

CREATE TABLE locations (
  location_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK (btrim(name) <> ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sensor_nodes (
  device_id TEXT PRIMARY KEY CHECK (device_id ~ '^[A-Za-z0-9_-]{1,40}$'),
  location_id BIGINT NOT NULL REFERENCES locations(location_id) ON DELETE RESTRICT,
  display_name TEXT NOT NULL UNIQUE CHECK (btrim(display_name) <> ''),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sensor_readings (
  device_id TEXT NOT NULL REFERENCES sensor_nodes(device_id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL,
  temperature_c NUMERIC(5,2) NOT NULL CHECK (temperature_c BETWEEN -50 AND 100),
  humidity_pct NUMERIC(5,2) NOT NULL CHECK (humidity_pct BETWEEN 0 AND 100),
  PRIMARY KEY (device_id, recorded_at)
);

CREATE INDEX sensor_readings_recorded_idx
  ON sensor_readings (recorded_at DESC);
