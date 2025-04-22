-- Migration: Add indexes, permissions, RLS policies

-- === Indexes ===
CREATE INDEX idx_indicators_geo ON indicators (geo_level_id, geo_id);
CREATE INDEX idx_point_features_geo ON point_features (geo_level_id, geo_id);
CREATE INDEX idx_point_features_definition ON point_features (feature_definition_id);

-- === Permissions ===
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO service_role;

GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;

-- Insert permissions for specific tables (excluding PostGIS system tables)
GRANT INSERT ON cities TO service_role;
GRANT INSERT ON districts TO service_role;
GRANT INSERT ON neighbourhoods TO service_role;
GRANT INSERT ON point_features TO service_role;
GRANT INSERT ON feature_definitions TO service_role;
GRANT INSERT ON indicator_definitions TO service_role;
GRANT INSERT ON indicators TO service_role;

-- Sequence access
GRANT USAGE, SELECT ON SEQUENCE cities_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE districts_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE neighbourhoods_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE point_features_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE feature_definitions_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE indicator_definitions_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE indicators_id_seq TO service_role;

-- === RLS (Row-Level Security) Activation ===
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighbourhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE geographical_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicator_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_features ENABLE ROW LEVEL SECURITY;

-- === RLS Policies ===
CREATE POLICY "Service role access on cities"
  ON cities FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role access on districts"
  ON districts FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role access on neighbourhoods"
  ON neighbourhoods FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role access on geographical_levels"
  ON geographical_levels FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role access on indicator_definitions"
  ON indicator_definitions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role access on indicators"
  ON indicators FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role access on feature_definitions"
  ON feature_definitions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role access on point_features"
  ON point_features FOR ALL TO service_role USING (true) WITH CHECK (true);
