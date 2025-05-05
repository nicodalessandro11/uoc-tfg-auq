# 🗃️ Are U Query-ous — Database Schema & Migrations

This module defines the complete **relational database schema** for the Are U Query-ous platform, designed to support geospatial visualization, comparative urban analysis, and multi-level filtering of open data across cities.

It includes:

- The full schema structure (`schema.sql`)
- Initial seed data (`seed.sql`)
- A database reset utility (`reset_db.sql`)
- This documentation file (`README.md`)

---

## 📦 Contents

| File/Folder         | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| `schema.sql`        | Consolidated SQL schema — full database structure at current state          |
| `seed.sql`          | Optional test dataset for local development and demo purposes               |
| `reset_db.sql`      | Utility script to reset the database state while preserving PostGIS system tables |
| `README.md`         | This documentation file                                                     |

---

## ⚙️ Database Requirements

- **PostgreSQL** ≥ 13  
- **PostGIS** ≥ 3.0 (for geospatial features)

If you're using [Supabase](https://supabase.com/), these extensions are available by default.

---

## 🚀 Quickstart

### 1. Create your database

You can use Supabase, Docker, or a local PostgreSQL instance.

```bash
createdb areuqueryous
```

### 2. Run the schema

```bash
psql -U postgres -d areuqueryous -f schema.sql
```

### 3. (Optional) Insert seed data

```bash
psql -U postgres -d areuqueryous -f seed.sql
```

### 4. (Optional) Reset the database

If you need to start fresh, you can use the reset script:

```bash
psql -U postgres -d areuqueryous -f reset_db.sql
```

---

## 🧱 Database Structure (Overview)

- **cities**: List of supported cities
- **districts**, **neighborhoods**: Administrative levels with demographic + economic data
- **geographical_levels**: Defines the hierarchy (city, district, neighborhood)
- **indicator_definitions**, **indicators**: Describes and stores dynamic metrics
- **feature_definitions**, **point_features**: Describes point-of-interest features in the city
- **geometry columns**: PostGIS-enabled geometries used for GeoJSON APIs

---

## 🧪 Dev Tips

- You can use [pgAdmin](https://www.pgadmin.org/) or Supabase Studio to inspect the database visually.
- All GeoJSON-compatible geometry columns follow PostGIS standards and can be queried directly via API.
- Use `reset_db.sql` to clean the database while preserving PostGIS system tables and extensions.

---

## 🛡️ Versioning & Maintenance

If new changes to the schema are needed:

1. Update the `schema.sql` file with the new changes
2. Test the changes locally
3. Document any breaking changes in the README

---

## 🧠 License & Ownership

This database structure was designed and documented by Nico Dalessandro  
for the UOC Final Degree Project (TFG) — "Are U Query-ous?"
