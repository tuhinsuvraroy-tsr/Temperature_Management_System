# Query timing plan

The running application uses MongoDB Atlas; therefore no PostgreSQL timing values are
invented here. Once a representative PostgreSQL export is available, run every query in
04_queries.sql three times with EXPLAIN (ANALYZE, BUFFERS) and save each plan in
dbms/plans/. The expected access path is the composite primary-key index
sensor_readings(device_id, recorded_at) for R1 and the descending time index for R2.

| Query | Type | Application function | Run 1 | Run 2 | Run 3 | Average | Scan type |
|---|---|---|---:|---:|---:|---:|---|
| R1 | READ | Latest dashboard cards | pending representative data | | | | expected Index Scan |
| R2 | READ | 24-hour chart history | pending representative data | | | | expected Index Scan |
| R3 | READ | Dashboard averages | pending representative data | | | | depends on cardinality |
| R4 | READ | Daily location ranges | pending representative data | | | | time-window index |
| W1 | WRITE | Sensor upload | pending representative data | | | | insert |
