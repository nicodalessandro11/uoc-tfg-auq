# 🧪 Methods and Resources

## 1. Methodological Approach

The **Are-U-Query-ous** project follows a **modular, data-centric development methodology**, progressing iteratively through:

- ✅ **CA1**: Data modeling, PostGIS schema definition, and SQL automation
- ✅ **CA2**: Geospatial data ingestion, ETL validation, and geometry tests
- 🔄 **CA3** *(In Progress)*: Backend and frontend development to expose and explore the geospatial data interactively

Each step is designed to be **reproducible**, **testable**, and **separable**, aligning with best practices in open geospatial development and academic prototyping.

---

## 2. Tech Stack Overview

### 📦 Data Layer (Core focus so far)

- **ETL Language:** Python 3.11
- **Libraries:** `GeoPandas`, `Shapely`, `dotenv`, `psycopg2`, `pytest`
- **Database:** Supabase (PostgreSQL + PostGIS)
- **Upload Strategy:** REST API (Supabase Python client)
- **Validation:** Geometry integrity tests via Pytest
- **Automation:** `Makefile`

### 🧠 Backend (Upcoming)

- **Framework:** FastAPI (planned)
- **Structure:** `routes`, `schemas`, `services`, `models`, `utils`
- **Testing:** `backend/tests`

### 🌐 Frontend (Upcoming)

- **Tooling:** React + Leaflet (planned)
- **Directory:** `frontend/src`, `public`
- **Static hosting (future):** Supabase or GitHub Pages

### ⚙️ DevOps & Tooling

- **Environment setup:** `.env` + `.env.example`
- **Task runner:** `make` (schema, test, upload, clean)
- **Containerization (optional):** `docker-compose.yml` present

---

## 3. Folder Structure

```bash
are-u-query-ous/
├── backend/              # API routes, models, services, utils (planned FastAPI)
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   └── tests/
├── data/                 # Geospatial ingestion pipeline
│   ├── raw/             # GeoJSON/TopoJSON input
│   ├── processed/       # Upload-ready JSON files
│   ├── scripts/         # ETL logic (Barcelona, Madrid)
│   └── tests/           # Pytest geometry validations
├── database/             # Supabase schema + views
│   ├── schema.sql
│   ├── views.sql
│   └── seed.sql
├── docs/                 # Setup guide, reports, commit template
├── frontend/             # Web UI (to be implemented)
│   ├── public/
│   └── src/
├── .env.example          # Template for Supabase credentials
├── .gitignore
├── docker-compose.yml    # (Optional) for future containerization
├── Makefile              # One-liner project automation
├── pytest.ini
├── README.md
└── requirements.txt
```

---

## 4. Key Resources

| Resource                    | Purpose                                                   |
|----------------------------|-----------------------------------------------------------|
| `Makefile`                 | One command to setup, test and deploy the full project    |
| `docs/SETUP.md`            | Step-by-step environment configuration                    |
| `.env.example`             | Template for secure connection to Supabase               |
| `database/*.sql`           | All schema, view and seed instructions                    |
| `data/scripts/ingest_data.py` | Full ETL + upload automation                          |
| `data/tests/test_geometry_integrity.py` | Validates geometry consistency           |