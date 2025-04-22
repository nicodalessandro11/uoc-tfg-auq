-- Migration: 005 add point features.sql

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