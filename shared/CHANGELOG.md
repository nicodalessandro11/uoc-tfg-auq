# *Are U Query-ous?* - Python Script Standards & Best Practices

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [2025-05-05]

### 🗃️ Database

- Major project restructuring and cleanup
- Updated database schema
- Fix RLS + insert issues and finalize reset flow

### 📦 Feature

- Added advanced filtering capabilities

### 🐛 Fix

- Resolved mobile responsiveness issues

### 🚀 Performance

- Optimized map rendering and data loading

## [2025-05-04]

### 📦 Feature

- Added data export and sharing capabilities

## [2025-05-03]

### 🐛 Fix

- Fixed Supabase PostGIS query with raw SQL

## [2025-05-01]

### 🐛 Fix

- Fixed syntax error in map-context.tsx
- Fixed point features filtering and improved error handling

## [2025-04-30]

### 🐛 Fix

- Fixed point features not appearing on map

### 📦 Feature

- Added admin dashboard and authentication

## [2025-04-29]

### 🗃️ Database

- Grant SELECT on all tables and views to anon
- Updated database migrations and processed data files

### 📦 Feature

- Migrated frontend module into monorepo structure

## [2025-04-27]

### 🛠️ Setup

- Fixed upsert operation in data upload
- Standardized data directory structure in data engine

### 🗃️ Database

- Implemented direct Supabase access for polygon data

## [2025-04-26]

### 🛠️ Setup

- Added PostgreSQL support to DevContainer

### 📦 Feature

- Implemented chat sidebar and API service layer

## [2025-04-25]

### 📦 Feature

- Added data visualization and comparison views

## [2025-04-24]

### 📦 Feature

- Added point features and filtering system

## [2025-04-23]

### 📦 Feature

- Implemented map context and basic map view

## [2025-04-22]

### 🛠️ Setup

- Initial project setup with Next.js and Tailwind CSS

## [2025-04-21]

### 🛠️ Setup

- Restructured backend with FastAPI template and organized project structure

### 🧪 Test

- Refactored test structure and data organization

### 🔐 Config

- Remove system files from git tracking

## [2025-04-20]

### 🔐 Config

- Update gitignore to exclude system files

### 🗃️ Database

- Processed and prepared city data for database insertion

### 📦 Feature

- Implemented indicators ETL for Barcelona and Madrid

## [2025-04-19]

### 🔄 Refactor

- Restructured project organization and data handling

### 📦 Feature

- Enhanced data ingestion and project structure

### 📦 Feature

- Enhanced data loading pipeline for Barcelona and Madrid

### 🗃️ Database

- Added database schema and datasets mapping documentation

### 📄 Docs

- Added datasets mapping documentation for ETL process

### 🗃️ Database

- Added PostGIS schema fixes and point features loader

### 🗃️ Database

- Added city_id to geographical_unit_view for clarity

### 🗃️ Database

- Normalize geo code fields and fix geographical view

### ♻️ Refactor

- Cleaned up compiled .pyc files from venv

### 🛠️ Setup

- Finalized Makefile automation and documentation cleanup

### 🧪 Test

- Added geometry integrity tests and silenced Shapely deprecation warning

### 🗃️ Database

- Updated processed geojson exports and refined schema

### ♻️ Refactor

- Separated ETL and upload stages for districts and neighbourhoods

### 🛠️ Setup

- Refactored Makefile with modular test commands

### 📦 Feature

- Added ETL scripts and processed data for BCN & Madrid

### 📄 Docs

- Added commit message template for project documentation

### 🗃️ Database

- Added full PostGIS schema and unified views

### 📦 Data Pipeline

- ETL pipeline + Supabase config for geographical data

### 🔐 Config

- Added Supabase credentials to .env.example and removed exposed password

### 🔐 Config

- Added safe .env.example and removed password file

### 🛠️ Setup

- Initial backend + Supabase integration setup

### Initial project structure from CA3 template

- 2025-04-14

[Unreleased]: https://github.com/your_username/your_project/compare/v2025-05-05...HEAD
[2025-05-05]: https://github.com/your_username/your_project/compare/v2025-05-04...v2025-05-05
[2025-05-04]: https://github.com/your_username/your_project/compare/v2025-05-03...v2025-05-04
[2025-05-03]: https://github.com/your_username/your_project/compare/v2025-05-01...v2025-05-03
[2025-05-01]: https://github.com/your_username/your_project/compare/v2025-04-30...v2025-05-01
[2025-04-30]: https://github.com/your_username/your_project/compare/v2025-04-29...v2025-04-30
[2025-04-29]: https://github.com/your_username/your_project/compare/v2025-04-27...v2025-04-29
[2025-04-27]: https://github.com/your_username/your_project/compare/v2025-04-26...v2025-04-27
[2025-04-26]: https://github.com/your_username/your_project/compare/v2025-04-25...v2025-04-26
[2025-04-25]: https://github.com/your_username/your_project/compare/v2025-04-24...v2025-04-25
[2025-04-24]: https://github.com/your_username/your_project/compare/v2025-04-23...v2025-04-24
[2025-04-23]: https://github.com/your_username/your_project/compare/v2025-04-22...v2025-04-23
[2025-04-22]: https://github.com/your_username/your_project/compare/v2025-04-21...v2025-04-22
[2025-04-21]: https://github.com/your_username/your_project/compare/v2025-04-20...v2025-04-21
[2025-04-20]: https://github.com/your_username/your_project/compare/v2025-04-19...v2025-04-20
[2025-04-19]: https://github.com/your_username/your_project/compare/v2025-04-18...v2025-04-19
