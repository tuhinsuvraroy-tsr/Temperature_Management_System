-- Temperature Management System database schema (PostgreSQL)
CREATE SCHEMA IF NOT EXISTS temperature_management;
SET search_path TO temperature_management;

CREATE TABLE locations (
  location_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK (btrim(name) <> ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sensor_nodes (
  sensor_id TEXT PRIMARY KEY CHECK (sensor_id ~ '^esp[0-9]+$'),
  location_id BIGINT NOT NULL REFERENCES locations(location_id) ON DELETE RESTRICT,
  display_name TEXT NOT NULL UNIQUE CHECK (btrim(display_name) <> ''),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sensor_readings (
  sensor_id TEXT NOT NULL REFERENCES sensor_nodes(sensor_id) ON DELETE CASCADE,
  captured_at TIMESTAMPTZ NOT NULL,
  temperature_c NUMERIC(5,2) NOT NULL CHECK (temperature_c BETWEEN -40 AND 85),
  humidity_pct NUMERIC(5,2) NOT NULL CHECK (humidity_pct BETWEEN 0 AND 100),
  PRIMARY KEY (sensor_id, captured_at)
);

CREATE INDEX sensor_readings_captured_idx ON sensor_readings (captured_at DESC);
