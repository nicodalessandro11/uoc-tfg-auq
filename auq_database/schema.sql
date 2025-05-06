-- ====================================
-- Description: This SQL script sets up the database schema for the AUQ application.
-- Author: Nico D'Alessandro Calderon
-- Email: nicodalessandro11@gmail.com
-- Date: 2025-04-01
-- Version: 1.0.0
-- License: MIT License
-- ====================================

-- === Database Setup ===
-- This script is designed to be run in a PostgreSQL database with PostGIS extension enabled.
-- Note: PostGIS extension must be enabled in Supabase dashboard first
-- Database -> Extensions -> PostGIS

-- Set search path to include public schema
SET search_path TO public;

-- === 1. Extensions ===
-- Ensure PostGIS extension is enabled (do not drop it to avoid losing system tables)
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public;

-- === 2. Tables ===
-- === Table: cities ===
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- === Table: geographical_levels ===
CREATE TABLE geographical_levels (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- === Table: districts ===
CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    district_code INTEGER NOT NULL,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    geom GEOMETRY(POLYGON, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(city_id, district_code),
    UNIQUE(city_id, name)
);

-- === Table: neighbourhoods ===
CREATE TABLE neighbourhoods (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    neighbourhood_code INTEGER NOT NULL,
    district_id INTEGER REFERENCES districts(id) ON DELETE CASCADE,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    geom GEOMETRY(POLYGON, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(district_id, neighbourhood_code),
    UNIQUE(district_id, name)
);

-- === Table: indicator_definitions ===
CREATE TABLE indicator_definitions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    unit TEXT,
    description TEXT,
    category TEXT,
    source JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- === Table: indicators ===
CREATE TABLE indicators (
    id SERIAL PRIMARY KEY,
    indicator_def_id INTEGER REFERENCES indicator_definitions(id) ON DELETE CASCADE,
    geo_level_id INTEGER REFERENCES geographical_levels(id),
    geo_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    value DECIMAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(indicator_def_id, geo_level_id, geo_id, year)
);

-- === Table: feature_definitions ===
CREATE TABLE feature_definitions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- === Table: point_features ===
CREATE TABLE point_features (
    id SERIAL PRIMARY KEY,
    feature_definition_id INTEGER REFERENCES feature_definitions(id) ON DELETE SET NULL,
    name TEXT,
    latitude DECIMAL NOT NULL,
    longitude DECIMAL NOT NULL,
    geom GEOMETRY(POINT, 4326),
    geo_level_id INTEGER REFERENCES geographical_levels(id),
    geo_id INTEGER NOT NULL,
    properties JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- === 3. Indexes ===
CREATE INDEX idx_indicators_geo ON indicators (geo_level_id, geo_id);
CREATE INDEX idx_point_features_geo ON point_features (geo_level_id, geo_id);
CREATE INDEX idx_point_features_definition ON point_features (feature_definition_id);

-- === 4. Views ===
-- Drop existing views if they exist
DROP VIEW IF EXISTS geographical_unit_view;
DROP VIEW IF EXISTS district_polygons_view;
DROP VIEW IF EXISTS neighborhood_polygons_view;

-- === View: geographical_unit_view ===
CREATE OR REPLACE VIEW geographical_unit_view WITH (security_invoker = on) AS
SELECT 1 AS geo_level_id, c.id AS geo_id, c.name, NULL::INTEGER AS code, NULL::INTEGER AS parent_id, c.id AS city_id, c.created_at, c.updated_at
FROM cities c
UNION ALL
SELECT 2, d.id, d.name, d.district_code, d.city_id, d.city_id, d.created_at, d.updated_at
FROM districts d
UNION ALL
SELECT 3, n.id, n.name, n.neighbourhood_code, n.district_id, n.city_id, n.created_at, n.updated_at
FROM neighbourhoods n;

-- === View: district_polygons_view ===
CREATE OR REPLACE VIEW district_polygons_view AS
SELECT id, name, district_code, city_id, ST_AsGeoJSON(geom)::json AS geometry
FROM districts;

-- === View: neighborhood_polygons_view ===
CREATE OR REPLACE VIEW neighborhood_polygons_view AS
SELECT id, name, neighbourhood_code, district_id, city_id, ST_AsGeoJSON(geom)::json AS geometry
FROM neighbourhoods;

-- Grant SELECT permissions on views
GRANT SELECT ON geographical_unit_view TO anon;
GRANT SELECT ON district_polygons_view TO anon;
GRANT SELECT ON neighborhood_polygons_view TO anon;

-- === 5. Functions ===
DROP FUNCTION IF EXISTS execute_sql(text);

CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    EXECUTE 'SELECT jsonb_agg(row_to_json(t)) FROM (' || sql_query || ') t' INTO result;
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'error', SQLERRM,
        'detail', SQLSTATE
    );
END;
$$;

-- Document the purpose of the function
COMMENT ON FUNCTION execute_sql(text) IS 'Executes dynamic SQL and returns the result as JSONB. Use with trusted input only.';

-- Grant access to use the function
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO authenticated;

-- === 6. Permissions ===
-- Grant schema usage
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant SELECT on app tables
GRANT SELECT ON
  cities,
  districts,
  neighbourhoods,
  geographical_levels,
  indicator_definitions,
  indicators,
  feature_definitions,
  point_features
TO service_role;

GRANT SELECT ON
  cities,
  districts,
  neighbourhoods,
  geographical_levels,
  indicator_definitions,
  indicators,
  feature_definitions,
  point_features
TO anon;

-- Default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;

-- Grant INSERT on selected tables
GRANT INSERT ON cities TO service_role;
GRANT INSERT ON districts TO service_role;
GRANT INSERT ON neighbourhoods TO service_role;
GRANT INSERT ON point_features TO service_role;
GRANT INSERT ON feature_definitions TO service_role;
GRANT INSERT ON indicator_definitions TO service_role;
GRANT INSERT ON indicators TO service_role;

-- Grant access to sequences
GRANT USAGE, SELECT ON SEQUENCE cities_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE districts_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE neighbourhoods_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE point_features_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE feature_definitions_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE indicator_definitions_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE indicators_id_seq TO service_role;

-- === 7. Row-Level Security (RLS) ===
-- Enable RLS
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighbourhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE geographical_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicator_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_features ENABLE ROW LEVEL SECURITY;


-- === 8. RLS Policies ===
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

-- === Create SELECT policies for public (anon) access ===
CREATE POLICY "Anon read: cities" 
ON cities FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read: districts" ON districts FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read: neighbourhoods" ON neighbourhoods FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read: geographical_levels" ON geographical_levels FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read: indicator_definitions" ON indicator_definitions FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read: indicators" ON indicators FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read: feature_definitions" ON feature_definitions FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read: point_features" ON point_features FOR SELECT TO anon USING (true);

-- Grant Insert, Select, Update, Delete on all tables in schema public to service_role
GRANT INSERT, SELECT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT, SELECT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;