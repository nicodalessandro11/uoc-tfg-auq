# 🛠️ Project: Are-U-Query-ous – Setup Guide

This document walks you through the full setup process to run the project from scratch — including environment setup, data ingestion, testing, and deployment to Supabase.

---

## ✅ System Requirements

Ensure you have the following tools installed:

---

### 🐍 Python 3.10 or Higher

Use a virtual environment to isolate dependencies.

```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

Then install the dependencies:

```bash
pip install -r requirements.txt
```

---

### 🐘 PostgreSQL Client (`psql`)

Used to execute SQL files against your Supabase database.

#### ▪ Ubuntu / Debian

```bash
sudo apt update
sudo apt install postgresql-client
```

#### ▪ macOS (Homebrew)

```bash
brew install postgresql
```

#### ▪ Windows

- [Download PostgreSQL](https://www.postgresql.org/download/windows/)
- Make sure `psql` is added to your PATH
- Or use WSL (recommended)

---

### ⚙️ GNU Make

Used to automate your workflow.

- **macOS/Linux**: Already available
- **Windows**: Use [Git Bash](https://gitforwindows.org/) or install via WSL

---

## 🔐 Environment Variables

Create a `.env` file in the root:

```bash
cp .env.example .env
```

Fill in your **Supabase project credentials**:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
DATABASE_URL=postgresql://user:password@host:port/database
```

---

## 🚀 Run the Full Pipeline

```bash
make all
```

This command:

1. Installs Python dependencies
2. Applies the Supabase schema (`schema.sql`, `views.sql`, `seed.sql`)
3. Runs all ETL jobs (districts, neighbourhoods)
4. Executes geometry validation tests
5. Uploads data to Supabase
6. Cleans up processed files and caches

---

## 🧪 Run Tests Only

To validate geometry and processed files without uploading:

```bash
make test
```

You can also run:

```bash
make test-only
```

Which runs both ETL and tests — without upload.

---

## 👨‍💻 Developer Mode

Run only the ETL scripts and tests (no upload):

```bash
make dev
```

Useful for local iterations and validations.

---

## ⚙️ Run ETL Scripts Without Upload

To just generate the processed files:

```bash
make etl
```

---

## 🧼 Clean the Workspace

```bash
make clean
```

This deletes:

- `data/processed/*`
- Python cache files (`__pycache__`, `.pytest_cache`)

---

## 🧨 Reset the Database (Danger Zone 🚨)

To drop all tables and reset the public schema:

```bash
make reset-db
```

> ⚠️ Use **only in development**. It executes `DROP SCHEMA public CASCADE`.

---

## 📤 Manual Upload (Optional)

You can manually trigger uploads via CLI:

```bash
# Upload all processed files to Supabase
python scripts/upload/upload_to_supabase.py

# Upload only districts
python scripts/upload/upload_to_supabase.py --only districts
```

Supported values for `--only`: `districts`, `neighbourhoods`, `points`, `indicators`, `all`

---

## 🧾 Commit History Report

To generate a Markdown log of all Git commits:

```bash
make commits-report
```

This creates `docs/implementation_report.md`.

---

## 📦 Generate CHANGELOG from Commits (AI-Assisted)

If you have OpenAI configured, generate a `CHANGELOG.md` from the implementation report:

```bash
make changelog
```

---

## 📚 Quick Command Reference

| Command          | Description                                      |
|------------------|--------------------------------------------------|
| `make`           | Full setup: install, schema, ETL, test, upload   |
| `make install`   | Install Python packages and shared lib           |
| `make setup`     | Apply database schema and views                  |
| `make etl`       | Run ETL scripts (no upload)                      |
| `make test`      | Run only the test suite                          |
| `make test-only` | Run ETL + tests (no upload)                      |
| `make dev`       | Dev mode (ETL + tests, skip upload)              |
| `make ingest`    | Run ETL + test + upload                          |
| `make clean`     | Remove processed files and cache                 |
| `make reset-db`  | Drop all tables (dev only)                       |
| `make commits-report` | Generate Git log as Markdown                |
| `make changelog` | Generate CHANGELOG from commit history           |

---

## 🧠 Final Notes

- Uploads are authenticated with the `service_role` key
- Geometry integrity is **automatically validated** via `pytest`
- All ETLs are modular, and can be run per city and feature type
- Logs are enhanced using emoji-logger for readability

---

🎉 That’s it! You’re all set to run, validate, and extend the **Are-U-Query-ous** project. Happy querying!