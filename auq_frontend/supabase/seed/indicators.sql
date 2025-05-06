-- Ensure indicator_definitions table has the necessary indicators
INSERT INTO indicator_definitions (id, name, unit, description, category)
VALUES
  (1, 'Population', 'people', 'Total number of residents', 'demographics'),
  (2, 'Surface', 'km²', 'Area in square kilometers', 'geography'),
  (3, 'Average Income', '€', 'Average gross taxable income per person', 'economics'),
  (4, 'Disposable Income', '€', 'Disposable income per capita', 'economics'),
  (5, 'Population Density', 'people/km²', 'Number of residents per square kilometer', 'demographics'),
  (6, 'Education Level', '%', 'Percentage of population with higher education', 'education'),
  (7, 'Unemployment Rate', '%', 'Percentage of working-age population without employment', 'employment')
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  unit = EXCLUDED.unit,
  description = EXCLUDED.description,
  category = EXCLUDED.category;

-- Ensure geographical_levels table has the necessary levels
INSERT INTO geographical_levels (id, name)
VALUES
  (1, 'City'),
  (2, 'District'),
  (3, 'Neighborhood')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name;

-- Add sample indicator data for Barcelona districts if not exists
-- This is just an example, you would replace this with real data
DO $$
DECLARE
  district_id integer;
  district_ids integer[];
BEGIN
  -- Get all district IDs for Barcelona (city_id = 1)
  SELECT array_agg(id) INTO district_ids FROM districts WHERE city_id = 1;
  
  -- For each district, add sample indicator data if not exists
  FOREACH district_id IN ARRAY district_ids
  LOOP
    -- Population Density (indicator_def_id = 5)
    INSERT INTO indicators (indicator_def_id, geo_level_id, geo_id, year, value)
    SELECT 5, 2, district_id, 2025, (random() * 15000 + 5000)::numeric(10,2)
    WHERE NOT EXISTS (
      SELECT 1 FROM indicators 
      WHERE indicator_def_id = 5 AND geo_level_id = 2 AND geo_id = district_id AND year = 2025
    );
    
    -- Education Level (indicator_def_id = 6)
    INSERT INTO indicators (indicator_def_id, geo_level_id, geo_id, year, value)
    SELECT 6, 2, district_id, 2025, (random() * 50 + 20)::numeric(10,2)
    WHERE NOT EXISTS (
      SELECT 1 FROM indicators 
      WHERE indicator_def_id = 6 AND geo_level_id = 2 AND geo_id = district_id AND year = 2025
    );
    
    -- Unemployment Rate (indicator_def_id = 7)
    INSERT INTO indicators (indicator_def_id, geo_level_id, geo_id, year, value)
    SELECT 7, 2, district_id, 2025, (random() * 15 + 3)::numeric(10,2)
    WHERE NOT EXISTS (
      SELECT 1 FROM indicators 
      WHERE indicator_def_id = 7 AND geo_level_id = 2 AND geo_id = district_id AND year = 2025
    );
  END LOOP;
END $$;

-- Add sample indicator data for Madrid districts if not exists
DO $$
DECLARE
  district_id integer;
  district_ids integer[];
BEGIN
  -- Get all district IDs for Madrid (city_id = 2)
  SELECT array_agg(id) INTO district_ids FROM districts WHERE city_id = 2;
  
  -- For each district, add sample indicator data if not exists
  FOREACH district_id IN ARRAY district_ids
  LOOP
    -- Population Density (indicator_def_id = 5)
    INSERT INTO indicators (indicator_def_id, geo_level_id, geo_id, year, value)
    SELECT 5, 2, district_id, 2025, (random() * 18000 + 4000)::numeric(10,2)
    WHERE NOT EXISTS (
      SELECT 1 FROM indicators 
      WHERE indicator_def_id = 5 AND geo_level_id = 2 AND geo_id = district_id AND year = 2025
    );
    
    -- Education Level (indicator_def_id = 6)
    INSERT INTO indicators (indicator_def_id, geo_level_id, geo_id, year, value)
    SELECT 6, 2, district_id, 2025, (random() * 45 + 25)::numeric(10,2)
    WHERE NOT EXISTS (
      SELECT 1 FROM indicators 
      WHERE indicator_def_id = 6 AND geo_level_id = 2 AND geo_id = district_id AND year = 2025
    );
    
    -- Unemployment Rate (indicator_def_id = 7)
    INSERT INTO indicators (indicator_def_id, geo_level_id, geo_id, year, value)
    SELECT 7, 2, district_id, 2025, (random() * 12 + 4)::numeric(10,2)
    WHERE NOT EXISTS (
      SELECT 1 FROM indicators 
      WHERE indicator_def_id = 7 AND geo_level_id = 2 AND geo_id = district_id AND year = 2025
    );
  END LOOP;
END $$;
