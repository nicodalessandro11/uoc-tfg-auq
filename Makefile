# ====================================
# Makefile — Are U Query-ous Project
# Author: Nico D'Alessandro Calderon
# ====================================

# Install shared libraries
install-common-lib:
	pip install -e shared/common_lib

# Run full ETL engine
run-engine:
	PYTHONPATH=shared python -m auq_data_engine.main

# Run ETL in developer mode (skip uploads)
run-engine-dev:	
	PYTHONPATH=shared python -m auq_data_engine.main --skip-upload

# Run tests
test:
	pytest

# Clean pycache
clean:
	find . -type d -name "__pycache__" -exec rm -r {} +
	rm -rf .pytest_cache

# Reset and apply migrations and seeds
reset-and-migrate-db:
	@set -a; . "$(CURDIR)/.env"; set +a; \
	echo "Resetting database..."; \
	psql "$$SUPABASE_DB_URL" -f auq_database/reset_db.sql && \
	echo "Applying schema..."; \
	psql "$$SUPABASE_DB_URL" -f auq_database/schema.sql && \
	echo "Applying seed data..."; \
	psql "$$SUPABASE_DB_URL" -f auq_database/seed.sql && \
	echo "Database reset and migrated successfully."

print-env:
	@set -a; . "$(CURDIR)/.env"; set +a; \
	echo "SUPABASE_URL=$$SUPABASE_URL" && \
	echo "SUPABASE_DB_URL=$$SUPABASE_DB_URL"

check-perms:
	@set -a; . "$(CURDIR)/.env"; set +a; \
	psql "$$SUPABASE_DB_URL" -c "SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_schema = 'public' AND table_name = 'districts';"

