-- Migration: Create unified views

-- === Views Definition ===

-- Drop existing view to prevent column name conflicts
DROP VIEW IF EXISTS geographical_unit_view;

-- View: geographical_unit_view
-- Unifies cities, districts, and neighbourhoods into a single structure
-- Useful for joining with indicators and point_features using (geo_level_id, geo_id)
-- Includes `city_id` explicitly for easier filtering and joins
-- Note: Using SECURITY INVOKER (default) to respect the permissions of the querying user

CREATE OR REPLACE VIEW geographical_unit_view WITH (security_invoker = on) AS
-- Cities (Level 1)
SELECT
    1 AS geo_level_id,
    c.id AS geo_id,
    c.name AS name,
    NULL::INTEGER AS code,
    NULL::INTEGER AS parent_id,
    c.id AS city_id,
    c.created_at,
    c.updated_at
FROM cities c

UNION ALL

-- Districts (Level 2)
SELECT
    2 AS geo_level_id,
    d.id AS geo_id,
    d.name AS name,
    d.district_code AS code,
    d.city_id AS parent_id,
    d.city_id AS city_id,
    d.created_at,
    d.updated_at
FROM districts d

UNION ALL

-- Neighbourhoods (Level 3)
SELECT
    3 AS geo_level_id,
    n.id AS geo_id,
    n.name AS name,
    n.neighbourhood_code AS code,
    n.district_id AS parent_id,
    n.city_id AS city_id,
    n.created_at,
    n.updated_at
FROM neighbourhoods n;

-- View: cities_geojson_view
-- Provides GeoJSON representation of cities
-- Useful for rendering on maps
-- Note: Using SECURITY INVOKER (default) to respect the permissions of the querying user
-- Drop existing view to prevent column name conflicts
create view public.districts_geojson_view as
select
  districts.id,
  districts.name,
  districts.district_code,
  districts.city_id,
  st_asgeojson (districts.geom)::json as geometry
from
  districts;

-- View: neighbourhoods_geojson_view
-- Provides GeoJSON representation of neighbourhoods
-- Useful for rendering on maps
-- Note: Using SECURITY INVOKER (default) to respect the permissions of the querying user
-- Drop existing view to prevent column name conflicts
create view public.neighbourhoods_geojson_view as
select
  neighbourhoods.id,
  neighbourhoods.name,
  neighbourhoods.neighbourhood_code,
  neighbourhoods.district_id,
  neighbourhoods.city_id,
  st_asgeojson (neighbourhoods.geom)::json as geometry
from
  neighbourhoods;

-- === Create Procedure ===

-- Procedure: execute_sql for supabase integration
DROP FUNCTION IF EXISTS execute_sql(TEXT);

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

-- Grant permissions for usage
GRANT EXECUTE ON FUNCTION execute_sql TO anon;
GRANT EXECUTE ON FUNCTION execute_sql TO authenticated;
