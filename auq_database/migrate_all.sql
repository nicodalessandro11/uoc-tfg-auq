-- Master migration runner for Are U Query-ous database
-- Executes all migrations in proper order
-- Updated on 2025-04-22

\i auq_database/migrations/001_create_base_tables.sql
\i auq_database/migrations/002_add_districts_neighborhoods.sql
\i auq_database/migrations/003_add_geographical_levels.sql
\i auq_database/migrations/004_add_indicators_and_definitions.sql
\i auq_database/migrations/005_add_point_features.sql
\i auq_database/migrations/006_add_indexes_permissions_policies.sql
\i auq_database/migrations/007_create_views.sql
