# *Are U Query-ous?* - Python Script Standards & Best Practices

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and uses [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added

- DB: Major project restructuring and cleanup (2024-05-05)
- DB: Updated database schema (2025-05-05)
- DB: Fix RLS + insert issues and finalize reset flow (2025-05-05)
- Feature: Added advanced filtering capabilities (2025-05-04)
- Feature: Added data export and sharing capabilities (2025-04-30)
- Feature: Added admin dashboard and authentication (2025-04-24)
- Feature: Migrated frontend module into monorepo structure (2025-04-23)
- Feature: Implemented chat sidebar and API service layer (2025-04-23)
- Feature: Added data visualization and comparison views (2025-04-22)
- Feature: Added point features and filtering system (2025-04-21)
- Feature: Implemented map context and basic map view (2025-04-20)
- Feature: Enhanced data ingestion and project structure (2024-03-21)
- Feature: Enhanced data loading pipeline for Barcelona and Madrid (2024-03-21)

### Fixed

- DB: Fixed Supabase PostGIS query with raw SQL (2025-04-29)
- DB: Fixed syntax error in map-context.tsx (2025-04-27)
- DB: Fixed point features filtering and improved error handling (2025-04-26)
- DB: Fixed point features not appearing on map (2025-04-25)
- Fix: Resolved mobile responsiveness issues (2025-05-03)

### Changed

- Refactor: Restructured project organization and data handling (2024-03-21)
- Refactor: Separated ETL and upload stages for districts and neighbourhoods (2025-04-15)
- Refactor: Cleaned up compiled .pyc files from venv (2025-04-15)
- Refactor: Finalized Makefile automation and documentation cleanup (2025-04-15)

### Performance

- Performance: Optimized map rendering and data loading (2025-05-01)

### Setup

- Setup: Fixed upsert operation in data upload (2025-04-23)
- Setup: Standardized data directory structure in data engine (2025-04-23)
- Setup: Added PostgreSQL support to DevContainer (2025-04-23)
- Setup: Initial project setup with Next.js and Tailwind CSS (2025-04-19)
- Setup: Restructured backend with FastAPI template and organized project structure (2024-04-18)

### Test

- Test: Refactored test structure and data organization (2025-04-18)
- Test: Added geometry integrity tests and silenced Shapely deprecation warning (2025-04-15)

### Config

- Config: Remove system files from git tracking (2025-04-18)
- Config: Update gitignore to exclude system files (2025-04-17)

### Docs

- Docs: Added commit message template for project documentation (2025-04-15)
- Docs: Added datasets mapping documentation for ETL process (2025-04-15)

### Removed

- Config: Removed .DS_Store files from git tracking (2025-04-18)
- Config: Removed .env file from git tracking (2025-04-18)
