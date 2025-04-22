-- Migration: 003 add geographical levels.sql

-- === Table: geographical_levels ===
CREATE TABLE geographical_levels (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);