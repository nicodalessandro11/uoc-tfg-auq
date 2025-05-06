# *Are U Query-ous?* - GIT LOGS

## 📄 Docs | 2025-05-06 | Update README.md

    - Updated README.md with latest project information
    - To provide up-to-date details about the project for new contributors and users
    - Markdown language was used for documentation

    This update ensures that the project documentation remains current and comprehensive, aiding in project understanding and onboarding.

## 🛠️ Setup | 2025-05-06 | Update .gitignore, Makefile, and READMEs; Add LICENSE and .env files

    - Updated .gitignore and Makefile for better build management
    - Revised README.md files in auq_nlp and shared directories for clearer project documentation
    - Added LICENSE file in shared directory for legal protection
    - Introduced .env.example and .env.local.example files in shared directory for environment configuration

    This commit enhances the project setup, making it easier for other developers to understand and contribute to the project. It also provides legal protection through the LICENSE file and enables better environment configuration with the addition of .env files.

## 📦 Feature | 2025-05-06 | Added new frontend components and updated documentation

    - Added new frontend components and pages to `auq_frontend/app` and `auq_frontend/components`
    - These components and pages were added to improve user interface and experience
    - Technical details: TypeScript and React were used to build these components
    - Updated `README.md` and added new documentation files in `auq_frontend/docs` to provide more context about the project structure and data pipeline.

    This commit marks a significant milestone in our frontend development, providing a more interactive and user-friendly interface. It also enhances our documentation, making it easier for new developers to understand the project.

## 📄 Docs | 2025-05-06 | Update documentation and changelog generation script

    - Updated CHANGELOG.md with recent changes and modifications
    - Modified api-design.md in auq_backend to include new API endpoints
    - Removed deprecated shared/CHANGELOG.md
    - Improved the generate_changelog.py script in shared/scripts for better changelog generation

    This commit aims to keep our documentation up-to-date and improve the way we generate our changelogs. The removal of the shared changelog is part of a broader effort to centralize our documentation.

## 🛠️ Setup | 2025-05-06 | Update Makefile

    - Modified the Makefile to include new build rules
    - This was done to streamline the build process and improve efficiency
    - Technical detail: Added rules for new dependencies and updated the ones for existing files

    This change will help in maintaining a consistent build process across the team and reduce potential issues related to build inconsistencies.

## 📄 Docs | 2025-05-06 | Update scripts and documentation

    - Modified shared/CHANGELOG.md to include recent changes
    - Moved shared/scripts/git_history.md to shared/scripts/data/git_history.md for better file organization
    - Updated shared/scripts/generate_changelog.py to improve functionality
    - Enhanced shared/scripts/git_commit_message_generator.py for more expressive commit messages

    This commit improves the documentation and script functionality, making it easier for the team to track changes and generate expressive commit messages.

## 🗃️ DB | 2024-05-05 | Major project restructuring and cleanup

    - Updated README files in auq_data_engine, auq_database, and shared/common_lib
    - Removed deprecated scripts documentation
    
    Project cleanup to remove outdated and unused files, improving maintainability and reducing confusion

## 🗃️ DB | 2025-05-05 | Updated database schema

    - Modified  to update table definitions and constraints
    - Ensures alignment with new application requirements and improves data integrity
    - Prepares the database for upcoming feature enhancements
    
    This update is part of the ongoing effort to optimize the database structure for scalability and maintainability.

## 🗃️ DB | 2025-05-05 | Fix RLS + insert issues and finalize reset flow

    - Added  to fully reset public schema while preserving PostGIS system tables
    - Updated  with missing INSERT, SELECT, and EXECUTE grants for  on all tables and functions
    - Reordered Makefile target  to fix broken line continuation and ensure seeds are applied
    - Validated Supabase auth context via  and  to confirm  usage
    - Fixed ETL upload issues by aligning schema grants and enforcing REST-based access with proper JWT
    
    This commit ensures a clean, reproducible DB setup compatible with Supabase’s RLS and service-role-based ETL workflows.

## 📦 Feature | 2025-05-04 | Added advanced filtering capabilities

    - Implemented multi-criteria filtering for map data
    - Added filter presets for common use cases
    - Created filter history to allow users to revert to previous filter states
    - Enhanced filter UI with visual indicators for active filters
    - Added export functionality for filtered datasets
    - Improved filter performance with optimized query generation

    This feature enhances the user experience by providing more powerful and flexible ways to explore geospatial data, allowing for complex queries and data exploration scenarios.

## 🐛 Fix | 2025-05-03 | Resolved mobile responsiveness issues

    - Fixed sidebar collapse behavior on small screens
    - Improved touch interactions for map controls on mobile devices
    - Adjusted font sizes and spacing for better readability on small screens
    - Fixed overflow issues in the comparison view on mobile
    - Enhanced zoom controls for touch devices
    - Implemented better handling of orientation changes

    These fixes ensure a consistent and usable experience across all device sizes, particularly improving the mobile experience for field users.

## 🚀 Performance | 2025-05-01 | Optimized map rendering and data loading

    - Implemented progressive loading for large GeoJSON datasets
    - Added level-of-detail switching based on zoom level
    - Optimized marker clustering for dense point features
    - Reduced initial load time by 40% through improved caching
    - Implemented virtualized rendering for large data tables
    - Added background data prefetching for common navigation patterns

    These optimizations significantly improve the application's performance, especially when dealing with large datasets or when used on lower-powered devices.

## 📦 Feature | 2025-04-30 | Added data export and sharing capabilities

    - Implemented export to CSV, GeoJSON, and PDF formats
    - Added shareable URL generation with current map state
    - Created embeddable map widget for external websites
    - Added social media sharing integration
    - Implemented collaborative map annotations
    - Added export history to track and manage previous exports

    This feature allows users to easily share their findings and analysis with others, enhancing collaboration and extending the utility of the platform beyond the application itself.

## 🐛 Fix | 2025-04-29 | Fixed Supabase PostGIS query with raw SQL

    - Replaced direct PostGIS function calls with raw SQL queries using the execute_sql RPC
    - Added SQL file for creating the execute_sql function in Supabase
    - Implemented indicator data fetching from the indicators table
    - Added fallback to mock geometries when PostGIS data is not available
    - Created ConnectionStatus component to check and display Supabase and PostGIS availability
    - Improved error handling and logging for Supabase queries

    This fix resolves the "Could not find a relationship between 'districts' and 'ST_AsGeoJSON'" error by using raw SQL queries instead of trying to call PostGIS functions directly in the query builder.

## 🐛 Fix | 2025-04-27 | Fixed syntax error in map-context.tsx

    - Corrected object creation syntax when updating the GeoJSON cache
    - Fixed the "Rest parameter must be last formal parameter" error
    - Updated setGeoJSONCache function to use proper object literal syntax with curly braces
    - Ensured spread operator is used correctly within object literals
    - Improved code readability and maintainability

    This fix resolves a syntax error that was preventing the application from properly caching and displaying GeoJSON data on the map.

## 🐛 Fix | 2025-04-26 | Fixed point features filtering and improved error handling

    - Updated point-features-toggle.tsx to handle both string and numeric feature types
    - Improved api-service.ts to ensure consistent data formatting for point features
    - Enhanced LeafletMap component with better error handling and coordinate validation
    - Added logging for debugging point feature rendering issues
    - Fixed icon creation in the map component

    These changes ensure that point features are properly filtered and displayed on the map, with improved error handling and debugging capabilities.

## 🐛 Fix | 2025-04-25 | Fixed point features not appearing on map

    - Updated api-service.ts to properly transform point feature data
    - Modified MapComponent to correctly filter point features by type
    - Updated LeafletMap component to properly handle markers and coordinates
    - Added error handling and logging for point feature rendering
    - Updated MapContext to include numeric feature types

    This fix resolves the issue where point features were not appearing on the map, ensuring that museums, parks, and other points of interest are correctly displayed.

## 📦 Feature | 2025-04-24 | Added admin dashboard and authentication

    - Created admin-view.tsx with interface for managing datasets and features
    - Implemented login-modal.tsx for admin authentication
    - Added auth-context.tsx for managing authentication state
    - Created mock authentication system with Supabase integration preparation
    - Added protected routes for admin functionality

    This commit adds administrative capabilities to the platform, allowing authorized users to manage datasets and monitor platform analytics.

## 🗃️ DB | 2025-04-23 | Grant SELECT on all tables and views to anon

    Ensures public read-only access for Supabase's `anon` role across the entire schema.
    This includes:
    - Granting SELECT on all existing tables in `public`
    - Granting SELECT on all existing views in `public`
    - Setting default privileges to grant SELECT on future tables and views
    
    This change improves compatibility with frontend clients that query views or reference raw tables directly.

## 🗃️ DB | 2025-04-23 | Updated database migrations and processed data files

    - Modified `Makefile` to reflect updated build or migration commands
    - Updated processed JSON files for indicators and neighbourhoods in `auq_data_engine/data/processed/`
    - Adjusted SQL migrations in `auq_database/migrations/` to refine table structures and add new features:
      - `001_create_base_tables.sql`
      - `003_add_geographical_levels.sql`
      - `004_add_indicators_and_definitions.sql`
      - `005_add_point_features.sql`
      - `007_create_views.sql`
    - Updated `auq_database/migrate_all.sql` and `seed.sql` for consistency with schema changes
    - Added new example environment variables in `shared/.env.example`
    - Untracked new frontend documentation files:
      - `auq_frontend/hierarchy.md`
      - `auq_frontend/project-structure.md`
    
    These changes improve database schema consistency, update processed data for reproducibility, and add frontend documentation for better project structure understanding.

## 📦 Feature | 2025-04-23 | Migrated frontend module into monorepo structure

    - Moved all frontend code from `auq-frontend/` into `auq_frontend/` following monorepo conventions
    - Removed deprecated folder `auq-frontend/` and its associated Dockerfile, docs, and README
    - Updated `.gitignore` to reflect new paths and structure
    
    This migration aligns the frontend with the unified monorepo architecture, improving maintainability and cross-module integration.

## 🛠️ Setup | 2025-04-23 | Fixed upsert operation in data upload

    - Added on_conflict parameter to upsert operation in upload_to_supabase.py
    - Specified unique constraint columns for indicators table
    - Ensures proper handling of duplicate records during upload
    
    This change properly implements the upsert operation to handle conflicts based on the table's unique constraints.

## 🛠️ Setup | 2025-04-23 | Standardized data directory structure in data engine

    - Updated BASE_DIR path in Barcelona and Madrid point feature loaders to use parents[1] instead of parents[2]
    - Aligned data output path with test expectations to use auq_data_engine/data/processed/
    - Ensures consistent data location and improves module encapsulation
    
    This change maintains better separation of concerns by keeping processed data within the data engine module's scope.

## 🗃️ DB | 2025-04-23 | Implemented direct Supabase access for polygon data

    - Added supabase-client.ts with functions to fetch district and neighborhood polygons directly from the database
    - Updated api-service.ts to use direct Supabase access for GeoJSON polygon data
    - Modified map-context.tsx to handle the Supabase data format for districts and neighborhoods
    - Updated LeafletMap component to properly render polygons from Supabase
    - Kept API calls for other data types while optimizing polygon data access

    This change improves performance by directly accessing static polygon data from Supabase instead of going through the API layer, while maintaining the API service for dynamic data.

## 🛠️ Setup | 2025-04-23 | Added PostgreSQL support to DevContainer

    - Enabled PostgreSQL 15 feature in `.devcontainer/devcontainer.json`
    - Ensures `psql` CLI is available by default in Codespaces
    - Supports local testing of migrations and database interaction
    - Keeps Python 3.11 and Node 20 environments for backend and frontend
    
    Improves reproducibility and simplifies setup for local/remote development in Codespaces.

## 📦 Feature | 2025-04-23 | Implemented chat sidebar and API service layer

    - Added chat-sidebar.tsx with conversational interface for geospatial queries
    - Created mock-api-responses.ts and api-adapter.ts for simulating API responses
    - Implemented api-service.ts with functions for fetching data from endpoints
    - Added api-utils.ts with utility functions for API calls
    - Created api-debug.tsx component for monitoring API calls during development

    These changes add a conversational interface for interacting with the map data and establish a service layer for future API integration.

## 📦 Feature | 2025-04-22 | Added data visualization and comparison views

    - Created visualize-view.tsx with charts for population, income, education, etc.
    - Implemented compare-view.tsx for side-by-side comparison of different areas
    - Added district-comparison-chart.tsx for visual data comparison
    - Created population-chart.tsx, income-chart.tsx and other visualization components
    - Implemented responsive layout for both desktop and mobile views

    This commit adds comprehensive data visualization capabilities, allowing users to analyze and compare urban data across different areas.

## 📦 Feature | 2025-04-21 | Added point features and filtering system

    - Implemented point-features-toggle.tsx component for toggling different types of POIs
    - Created filter-panel.tsx with sliders for filtering areas by population, income, etc.
    - Added district-info.tsx component to display detailed information about selected areas
    - Implemented caching system for GeoJSON data to improve performance
    - Added responsive sidebar layout with toggle buttons

    These features enhance the map's interactivity by allowing users to filter data and view specific points of interest, improving the overall user experience.

## 📦 Feature | 2025-04-20 | Implemented map context and basic map view

    - Created contexts/map-context.tsx with state management for city and area selection
    - Added dynamic Leaflet map component with SSR handling
    - Implemented city selector component with dropdown interface
    - Added granularity selector for switching between district and neighborhood views
    - Set up basic GeoJSON rendering capabilities for geographical data

    This implementation provides the core map visualization functionality, allowing users to select cities and view different granularity levels of geographical data.

## 🛠️ Setup | 2025-04-19 | Initial project setup with Next.js and Tailwind CSS

    - Created project structure with Next.js App Router and Tailwind CSS configuration
    - Set up shadcn/ui components for consistent UI design system
    - Added basic layout with header and navigation components
    - Configured theme provider with light/dark mode support
    - Established project typography and color scheme in globals.css

    This commit establishes the foundation for the geospatial data visualization platform with a modern tech stack and design system.

## 🛠️ Setup | 2024-04-18 | Restructured backend with FastAPI template and organized project structure

- Created backend/app directory with initial FastAPI application setup including CORS middleware
- Moved legacy code to zz_deprecated/ directory for reference while building new structure
- Added migrations directory for database schema management with Alembic
- Set up initial test structure with test_auth.py and test_indicators.py
- Added documentation for API pipeline and ETL structure

This commit establishes the foundation for the new backend architecture, providing a clean slate for building the API while preserving legacy code for reference.

## 🧪 Test | 2025-04-18 | Refactored test structure and data organization

- Renamed test files to better reflect their purpose (test_indicators.py → test_indicators_upload.py, test_point_features pytest_point_features_upload.py)
- Removed processed JSON files from version control to follow best practices
- Removed raw sample JSON files that should not be tracked
- Modified ETL ingestion script to improve data handling

This commit improves the project structure by separating test files by functionality and removing generated data files from version control.

## 2025-04-18 | 🔐 Config | 2025-04-18 | Remove system files from git tracking

- Removed .DS_Store files from git tracking
- Removed .env file from git tracking
- These files are now properly ignored via .gitignore

## 🔐 Config |2025-04-17 | Update gitignore to exclude system files

- Added .DS_Store and **/.DS_Store patterns to ignore macOS system files
- Ensures system files are not tracked in version control

## 🗃️ DB | 2025-04-17 | Processed and prepared city data for database insertion

- Generated JSON files for districts, neighbourhoods, indicators, and point features for both Barcelona and Madrid
- Updated ETL scripts for point features loading in both cities
- Reorganized data structure by moving sample data to raw_sample directory
- Updated tests to reflect new data processing changes
- Modified implementation report to document changes

This commit prepares the data in a format ready for database insertion, improving the ETL pipeline for both cities.

## 📦 Feature | 2025-04-17 | Implemented indicators ETL for Barcelona and Madrid

- Added load_indicators.py for Barcelona with support for income, population, and surface metrics
- Added load_indicators.py for Madrid with support for population and surface metrics
- Updated ingest.py to enable indicator ETL execution and testing
- Enhanced documentation with clearer ETL flow and naming conventions
- Added proper error handling and logging for indicator processing

This implementation completes the core ETL pipeline for both cities, enabling standardized processing of socioeconomic indicators across different geographical levels.

## 🔄 Refactor | 2024-03-21 | Restructured project organization and data handling

- Moved data scripts from data/scripts to scripts/etl for better organization
- Created new upload module in scripts/etl/upload for data upload functionality
- Added files_manifest.json for tracking data file metadata
- Updated documentation (SETUP.md, implementation_report.md) to reflect new structure
- Added scripts-best-practices.md for standardized development guidelines
- Cleaned up deprecated files and moved them to zz_deprecated directory
- Updated requirements.txt and Makefile to match new project structure

This restructuring improves code maintainability and sets up a more scalable foundation for future development, with clear separation of concerns between data processing, upload, and documentation.

## 📦 Feature | 2024-03-21 | Enhanced data ingestion and project structure

- Added new data loading scripts for Madrid indicators and Barcelona districts
- Updated database schema and seed files for improved data organization
- Modified ETL pipeline with new ingest_data.py and run_etl.py scripts
- Added project setup files (setup.py, requirements.txt) and test infrastructure
- Updated documentation with dataset mappings and implementation details
- Enhanced Makefile and environment configuration

This commit establishes a more robust data ingestion pipeline and project structure, enabling better data management across multiple cities and indicators.

## 📦 Feature | 2024-03-21 | Enhanced data loading pipeline for Barcelona and Madrid

- Added new indicator loading scripts (barcelona/load_indicators.py, madrid/load_indicators.py) to standardize data processing
- Added Madrid point features loading script to match Barcelona's functionality
- Modified database schema and seed files to accommodate new data structures
- Added proper Python package structure with __init__.py files in data/scripts directories
- Updated ETL pipeline documentation to reflect new changes
- Added new Barcelona raw data file (2022_atles_renda_bruta_llar.csv)
- Created shared/ directory for common utilities and functions

This commit standardizes the data loading process between Barcelona and Madrid, improving code organization and maintainability.

## 🗃️ DB | 2025-04-16 | Added database schema and datasets mapping documentation

- Created comprehensive database schema with PostGIS support for cities, districts, and neighbourhoods
- Added geographical_unit_view to unify all geographical levels
- Implemented proper permissions and RLS policies for database security
- Added support for point features and indicators with proper indexing

## 📄 Docs | 2025-04-16 | Added datasets mapping documentation for ETL process

- Created datasets_mapping.md with comprehensive list of data sources from Barcelona and Madrid
- Defined structure for point features and indicators datasets
- Added documentation for ETL script mapping and data source URLs

## 🗃️ DB | 2025-04-16 | Added PostGIS schema fixes and point features loader

- Updated  to fix SECURITY DEFINER view issue and apply correct RLS policies
- Fixed  to create  without the SECURITY DEFINER flag
- Added new script  under  to handle ETL of cultural equipment
- Adjusted  and  to support the new point features pipeline
- Updated  with initial values for  (libraries, museums, etc.)

Linter errors on Supabase dashboard are resolved and ETL for Barcelona point features is now operational.

## 🗃️ DB | 2025-04-15 | Added city_id to geographical_unit_view for clarity

- Updated database/views.sql to include `city_id` in all levels of geographical_unit_view
- Enables disambiguation of neighbourhood and district codes across different cities
- Facilitates clearer joins and lookups in future ETLs (e.g. point_features, indicators)

This change improves data traceability across geo levels and supports multi-city datasets more reliably.

## 🗃️ DB | 2025-04-15 | Normalize geo code fields and fix geographical view

- Updated all ETL scripts to store  and  as integers
- Aligned database schema to define  and  as INTEGER types
- Fixed  to cast all  fields as INTEGER to enable type-safe joins
- Ensures compatibility for future joins in ETLs for indicators and point_features using (geo_level_id, code)

This change standardizes geo code fields across the DB and ETL to prevent type mismatch errors.

## ♻️ Refactor | 2025-04-15 | Cleaned up compiled .pyc files from venv

- Deleted unnecessary cached Python files () under  for a lighter repo
- Prevented tracking of virtual environment generated files by Git
- Reflects automated clean-up process often run via 🧼 Cleaning processed files and cache...
rm -rf data/processed/*
find . -type d -name "__pycache__" -exec rm -rf {} +
rm -rf .pytest_cache
✅ Clean complete. or pre-deploy steps

This commit helps maintain a clean working directory by avoiding committed environment artifacts.

## 🛠️ Setup | 2025-04-15 | Finalized Makefile automation and documentation cleanup

- Replaced old  with standardized  for full project automation
- Added modular targets for , , , ,  and
- Created  with detailed environment and installation instructions
- Deleted outdated documents: ,
- Updated  to separate ETL and upload logic and improve flow control
- Extended  to include full commit log and project evolution

This commit wraps up the day’s refactor by enabling end-to-end reproducibility and clearer documentation for project onboarding.
!

## 🧪 Test | 2025-04-15 | Added geometry integrity tests and silenced Shapely deprecation warning

- Updated test_geometry_integrity.py to ensure geometry consistency between raw and processed files using GeoPandas and Shapely
- Added  logic for correct module resolution in pytest
- Created pytest.ini to configure test discovery and suppress shapely.geos deprecation warnings

Ensures reliable regression checks on ETL geometry outputs and prepares test suite for CI integration.

## 🗃️ DB | 2025-04-15 | Updated processed geojson exports and refined schema

- Regenerated insert_ready_*.json files for districts and neighbourhoods (Barcelona & Madrid) with correct district_id mappings
- Ensured consistency with new dynamic Supabase ID resolution during ETL
- Minor refinements to database/schema.sql to align with current pipeline structure

These changes finalize the corrected ETL output and schema alignment after refactor.

## ♻️ Refactor | 2025-04-15 | Separated ETL and upload stages for districts and neighbourhoods

- Refactored ingest_data.py to ensure districts are loaded and uploaded before neighbourhood ETL begins
- Updated upload_to_supabase.py to split upload functions into run_district_upload and run_neighbourhood_upload
- Replaced hardcoded district_id mappings in Madrid and Barcelona neighbourhood scripts with dynamic lookup from Supabase
- Improved script reliability by removing assumptions on auto-increment IDs and ensuring valid foreign key relationships

This change ensures consistent ETL pipeline execution and eliminates dependency errors during neighbourhood uploads.

## 🛠️ Setup | 2025-04-15 | Refactored Makefile with modular test commands

- Added separate targets for test_processed and test_geometry under test suite
- Clarified comments for each command including etl, clean, upload, and seed
- Enables isolated test runs and better developer experience during debugging

This update improves maintainability and transparency in running parts of the pipeline independently.

## 📦 Feature | 2025-04-15 | Added ETL scripts and processed data for BCN & Madrid

- Created `load_districts.py` and `load_neighbourhoods.py` for both Barcelona and Madrid under `data/scripts/`
- Generated `insert_ready_*.json` files with cleaned and WKT-wrapped geometries in `data/processed/`
- Ensured all districts and neighbourhoods are standardized and mapped to city IDs
- Added seed.sql to initialize PostGIS schema with all required tables and constraints
- Added `test_geometry_integrity.py` to validate WKT consistency between raw and processed files
- Includes Makefile commands (`etl`, `test`) for pipeline reproducibility

Enables complete ETL and test pipeline for loading and validating geospatial data per city.

## 📄 Docs | 2025-04-15 | Added commit message template for project documentation

## 🗃️ DB | 2025-04-15 | Added full PostGIS schema and unified views

- Added database/schema.sql with table definitions for cities, districts, neighbourhoods, indicators, and point_features
- Added database/views.sql including 'geographical_unit_view' to unify all geo levels
- Enables reproducibility and setup of Supabase schema from scratch

## 📦 Data Pipeline | 2025-04-15 | ETL pipeline + Supabase config for geographical data

- Added working .env and .env.example with Supabase URL and service key
- Removed supabase-password.txt and old placeholder files
- Created ETL scripts for Barcelona and Madrid (districts + neighbourhoods)
- Prepared upload script using supabase-py to send data from JSON to Supabase
- Updated ingest_data.py and requirements.txt to support ETL workflow
- Added real data sources: GeoJSON/TopoJSON files for BCN and MAD

This commit sets up a complete ETL-to-database pipeline for geospatial data ingestion.

## 🔐 Config | 2025-04-15 | Added Supabase credentials to .env.example and removed exposed password

- Updated .env.example with SUPABASE_URL and SUPABASE_SERVICE_KEY placeholders
- Ensured local .env includes real credentials (not committed)
- Deleted supabase-password.txt to prevent accidental exposure

## 🔐 Config | 2025-04-15 | Added safe .env.example and removed password file

- Added .env.example with Supabase placeholders
- Updated .gitignore to exclude .env from versioning
- Removed supabase-password.txt to avoid exposed credentials

## 🛠️ Setup | 2025-04-14 | Initial backend + Supabase integration setup

- Deleted placeholder .env.example (replaced with working .env file locally)
- Modified backend entrypoint and database logic (main.py, db.py)
- Updated backend/frontend Dockerfiles to align with Supabase config
- Adjusted docker-compose to reflect real env variables
- Created documentation stub for methods (docs/methods_resources.md)
- Added supabase-password.txt (⚠️ this should be ignored or encrypted later)
- Prepared requirements.txt for deployment

## 2025-04-14 | Initial project structure from CA3 template
