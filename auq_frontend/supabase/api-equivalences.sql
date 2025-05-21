-- getCities()
SELECT * 
FROM cities 
ORDER BY id;

--getDistrictPolygons(cityId)
SELECT * 
FROM district_polygons_view 
WHERE city_id = :cityId;

--getNeighborhoodPolygons(cityId)
SELECT * 
FROM neighborhood_polygons_view 
WHERE city_id = :cityId;

--getGeographicalUnits(cityId, level)
SELECT * 
FROM geographical_unit_view 
WHERE city_id = :cityId 
AND geo_level_id = CASE 
    WHEN :level = 'district' THEN 2 
    WHEN :level = 'neighborhood' THEN 3 
END;

-- getDistricts(cityId):
SELECT * 
FROM districts 
WHERE city_id = :cityId 
ORDER BY id;

-- getNeighborhoods(districtId):
SELECT * 
FROM neighbourhoods 
WHERE district_id = :districtId 
ORDER BY id;

-- getFeatureDefinitions():
SELECT * 
FROM feature_definitions 
ORDER BY id;

-- getCityPointFeatures(cityId)
SELECT pf.*, fd.name as feature_type_name
FROM point_features pf
JOIN feature_definitions fd ON pf.feature_definition_id = fd.id
WHERE pf.city_id = :cityId;

-- getIndicatorDefinitions()
SELECT * 
FROM indicator_definitions 
ORDER BY id;

-- getCityIndicators(cityId, level, year)
SELECT i.*, id.name as indicator_name
FROM indicators i
JOIN indicator_definitions id ON i.indicator_definition_id = id.id
WHERE i.city_id = :cityId 
AND i.geo_level_id = CASE 
    WHEN :level = 'district' THEN 2 
    WHEN :level = 'neighborhood' THEN 3 
END
AND (:year IS NULL OR i.year = :year)
ORDER BY i.year DESC, i.id;

-- checkPostGISAvailability()
SELECT postgis_version();

-- getGeographicalLevels()
SELECT * 
FROM geographical_levels 
ORDER BY id;

/*
Algunas notas importantes:
Todas estas consultas están envueltas en un sistema de caché que dura 5 minutos
Las funciones que devuelven GeoJSON realizan una transformación adicional después de obtener los datos
Algunas consultas usan vistas (district_polygons_view, neighborhood_polygons_view, geographical_unit_view) que probablemente contienen lógica adicional para formatear los datos
Las consultas incluyen manejo de errores y validaciones
*/