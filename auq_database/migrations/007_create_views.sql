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
