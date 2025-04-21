"""
emoji_logger.py

A lightweight emoji-enhanced logging utility for ETL pipelines and data scripts.

Provides a set of simple functions for printing log messages with visual emoji
prefixes to distinguish log levels. Useful for CLI tools, ETL tasks, and debugging
in a clear and friendly format.

Log levels supported:
- 📊 info()     – General process updates
- ✅ success()  – Completed steps or milestones
- ⚠️ warning()  – Non-critical warnings or skipped items
- ❗ error()    – Errors or failures in execution
- 🐞 debug()    – Detailed developer logs (for debugging only)

Example usage:
    from utils import emoji_logger as log

    log.info("Starting ETL process")
    log.success("Data successfully loaded")
    log.warning("Missing values found")
    log.error("Failed to write to database")
    log.debug("Current record ID: 12345")

Author: Nicolas D'Alessandro
Email: Nicodalessandro11@gmail.com
"""

def info(message: str):
    """Prints an informational message prefixed with 📊."""
    print(f"📊 {message}")

def success(message: str):
    """Prints a success message prefixed with ✅."""
    print(f"✅ {message}")

def warning(message: str):
    """Prints a warning message prefixed with ⚠️."""
    print(f"⚠️ {message}")

def error(message: str):
    """Prints an error message prefixed with ❗."""
    print(f"❗ {message}")

def debug(message: str):
    """Prints a debug message prefixed with 🐞 (for developers)."""
    print(f"🐞 {message}")