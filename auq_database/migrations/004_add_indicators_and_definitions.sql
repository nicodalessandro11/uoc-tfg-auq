-- Migration: 004 add indicators and definitions.sql

-- === Table: indicators ===
CREATE TABLE indicator__definitions (
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