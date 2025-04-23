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

INSERT INTO indicator_definitions (name, description, unit, category, source) VALUES
-- 1. Population
(
  'Population',
  'Total number of residents officially registered in the city on January 1 of each year, based on municipal population records.',
  'inhabitants',
  'Demography',
  '{
    "barcelona": {
      "url": "https://opendata-ajuntament.barcelona.cat/data/en/dataset/pad_mdbas",
      "description": "Population of Barcelona according to the Municipal Register of Inhabitants on January 1 of each year",
      "calculation": "Direct count based on the Municipal Register of Inhabitants (Padró Municipal d Habitants)"
    },
    "madrid": {
      "url": "tbd",
      "description": "TBD",
      "calculation": "TBD"
    }
  }'
),

-- 2. Surface
(
  'Surface',
  'Total surface area of each neighborhood in the city, measured in hectares.',
  'hectares',
  'Territory, Town Planning and Infrastructures',
  '{
    "barcelona": {
      "url": "https://opendata-ajuntament.barcelona.cat/data/en/dataset/est-superficie",
      "description": "Neighborhoods area size of the city of Barcelona (h2).",
      "calculation": "Geospatial measurement of each surface neighborhood in hectares"
    },
    "madrid": {
      "url": "tbd",
      "description": "TBD",
      "calculation": "TBD"
    }
  }'
),

-- 3. Average gross taxable income per person
(
  'Average gross taxable income per person',
  'Gross annual taxable income per person, estimated at neighborhood level based on census section aggregation.',
  'euros per person',
  'Society and Welfare',
  '{
    "barcelona": {
      "url": "https://opendata-ajuntament.barcelona.cat/data/en/dataset/atles-renda-bruta-per-persona",
      "description": "Average gross taxable income per person (€) in the city of Barcelona based on the experimental project Atlas de distribución de la renta de los hogares of Instituto Nacional de Estadística (INE).",
      "calculation": "Mean of census section values aggregated at the neighborhood level"
    },
    "madrid": {
      "url": "tbd",
      "description": "TBD",
      "calculation": "TBD"
    }
  }'
),

-- 4. Disposable income per capita
(
  'Disposable income per capita',
  'Net annual disposable income available per person in the household, estimated from household-level data and divided by average household size.',
  'euros per person',
  'Society and Welfare',
  '{
    "barcelona": {
      "url": "https://opendata-ajuntament.barcelona.cat/data/en/dataset/renda-disponible-llars-bcn",
      "description": "Estimation of the Disposable Income of households per person (€) in the city of Barcelona by census sections, based on the Income Account for Barcelona of the Idescat and the Atlas de Distribución de la Renta de las Hogares del INE.",
      "calculation": "Net household income divided by average household size, aggregated from census data"
    },
    "madrid": {
      "url": "tbd",
      "description": "TBD",
      "calculation": "TBD"
    }
  }'
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