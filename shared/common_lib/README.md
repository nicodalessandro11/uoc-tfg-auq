# 📚 common_lib — Emoji Logger

A lightweight emoji-enhanced logging utility for ETL pipelines and data scripts.

---

## ✨ Overview

`common_lib.emoji_logger` provides a set of simple functions for printing log messages with visual emoji prefixes to distinguish log levels. It's especially useful in CLI tools, ETL workflows, and data processing pipelines where quick visual feedback improves clarity.

---

## 🔧 Log Levels Supported

| Function  | Emoji | Description                        |
|-----------|-------|------------------------------------|
| `info()`     | 📊    | General process updates           |
| `success()`  | ✅    | Completed steps or milestones     |
| `warning()`  | ⚠️    | Non-critical warnings             |
| `error()`    | ❗    | Errors or execution failures      |
| `debug()`    | 🐞    | Developer-level debug logs        |

---

## 🚀 Example Usage

```python
from common_lib import emoji_logger as log

log.info("Starting ETL process")
log.success("Data successfully loaded")
log.warning("Missing values found in column 'age'")
log.error("Failed to write to database")
log.debug("Current record ID: 12345")
