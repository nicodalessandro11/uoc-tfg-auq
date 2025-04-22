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
