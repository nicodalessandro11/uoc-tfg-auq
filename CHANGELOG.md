# 📦 Changelog — ARE-U-QUERY-OUS

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and uses [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Features

- 2025-04-17: Implemented indicators ETL for Barcelona and Madrid
- 2025-04-17: Enhanced data ingestion and project structure
- 2025-04-16: Enhanced data loading pipeline for Barcelona and Madrid
- 2025-04-15: Added ETL scripts and processed data for BCN & Madrid

### Refactor

- 2025-04-17: Restructured project organization and data handling
- 2025-04-15: Cleaned up compiled .pyc files from venv
- 2025-04-15: Separated ETL and upload stages for districts and neighbourhoods

### Database

- 2025-04-16: Added database schema and datasets mapping documentation
- 2025-04-15: Added PostGIS schema fixes and point features loader
- 2025-04-15: Added city_id to geographical_unit_view for clarity
- 2025-04-15: Normalize geo code fields and fix geographical view
- 2025-04-15: Updated processed geojson exports and refined schema
- 2025-04-15: Added full PostGIS schema and unified views

### Docs

- 2025-04-16: Added datasets mapping documentation for ETL process
- 2025-04-15: Added commit message template for project documentation

### Setup

- 2025-04-15: Finalized Makefile automation and documentation cleanup
- 2025-04-15: Refactored Makefile with modular test commands
- 2025-04-15: ETL pipeline + Supabase config for geographical data
- 2025-04-15: Added Supabase credentials to .env.example and removed exposed password
- 2025-04-15: Added safe .env.example and removed password file
- 2025-04-14: Initial backend + Supabase integration setup

### Test

- 2025-04-15: Added geometry integrity tests and silenced Shapely deprecation warning

## [2025-04-14]

- Initial project structure from CA3 template