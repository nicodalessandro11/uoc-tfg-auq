.PHONY: install run clean setup ollama help

# Variables
PYTHON = python3.11
VENV = venv
PIP = $(VENV)/bin/pip
PYTHON_VENV = $(VENV)/bin/python

# Colors for output
GREEN = \033[0;32m
NC = \033[0m # No Color

# Main commands
setup: $(VENV)
	@echo "$(GREEN)Setting up virtual environment...$(NC)"
	$(PYTHON) -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt

install:
	@echo "$(GREEN)Installing dependencies...$(NC)"
	$(PIP) install -r requirements.txt

run:
	@echo "$(GREEN)Running the model...$(NC)"
	$(PYTHON_VENV) main.py

clean:
	@echo "$(GREEN)Cleaning temporary files...$(NC)"
	find . -type d -name "__pycache__" -exec rm -r {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.pyd" -delete
	find . -type f -name ".coverage" -delete
	find . -type d -name "*.egg-info" -exec rm -r {} +
	find . -type d -name "*.egg" -exec rm -r {} +
	find . -type d -name ".pytest_cache" -exec rm -r {} +
	find . -type d -name ".coverage" -exec rm -r {} +
	find . -type d -name "htmlcov" -exec rm -r {} +
	find . -type d -name "dist" -exec rm -r {} +
	find . -type d -name "build" -exec rm -r {} +

ollama:
	@echo "$(GREEN)Starting Ollama and pulling llama3:3b model if needed...$(NC)"
	@if ! pgrep -f "ollama serve" > /dev/null; then \
		echo "🔄 Starting Ollama server in background..."; \
		ollama serve & sleep 2; \
	else \
		echo "✅ Ollama is already running."; \
	fi
	@ollama list | grep -q "llama3" || (echo "📥 Pulling llama3 model..." && ollama pull llama3)
	@echo "$(GREEN)✅ Ready! You can now run 'make run'$(NC)"

help:
	@echo "$(GREEN)Available commands:$(NC)"
	@echo "  make setup    - Set up virtual environment and dependencies"
	@echo "  make install  - Install project dependencies"
	@echo "  make run      - Run the model"
	@echo "  make ollama   - Ensure Ollama is running and llama3:3b is downloaded"
	@echo "  make clean    - Clean temporary files and cache"
	@echo "  make help     - Show this help message"
