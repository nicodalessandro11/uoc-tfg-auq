-- Migration: 005 add point features.sql

-- === Table: feature_definitions ===
CREATE TABLE feature_definitions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert feature definitions (used in point_features.feature_type_id)
INSERT INTO feature_definitions (name, description) VALUES
    ('Libraries', 'Public libraries and documentation centers'),
    ('Cultural centers', 'Athenaeums, civic centers and community cultural spaces'),
    ('Auditoriums', 'Large auditoriums and concert halls'),
    ('Heritage spaces', 'Places of historical, cultural or heritage interest'),
    ('Creation factories', 'Cultural and artistic innovation centers'),
    ('Museums', 'Museums and permanent collections'),
    ('Cinemas', 'Commercial or cultural movie theaters'),
    ('Exhibition centers', 'Spaces for artistic or thematic exhibitions'),
    ('Archives', 'Historical, district archives and heritage libraries'),
    ('Live music venues', 'Venues for concerts and musical performances'),
    ('Performing arts venues', 'Theaters and spaces for stage performances'),
    ('Municipal markets', 'Public markets for food and local products'),
    ('Parks and gardens', 'Urban green spaces including parks, gardens, and natural areas'),
    ('Educational centers', 'Schools, colleges, and other educational institutions');

-- Insert point features

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