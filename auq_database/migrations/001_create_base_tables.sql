-- Migration: 001 create base tables.sql

-- Note: PostGIS extension must be enabled in Supabase dashboard first
-- Database -> Extensions -> PostGIS

-- Set search path to include public schema
SET search_path TO public;

-- Enable PostGIS extension in public schema explicitly
DROP EXTENSION IF EXISTS postgis CASCADE;
CREATE EXTENSION postgis SCHEMA public;

-- === Table: Cities ===
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert cities
INSERT INTO cities (name) VALUES
    ('Barcelona'),
    ('Madrid');

