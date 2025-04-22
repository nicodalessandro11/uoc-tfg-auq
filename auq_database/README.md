# 🗃️ Are U Query-ous — Database Schema & Migrations

This module defines the complete **relational database schema** for the Are U Query-ous platform, designed to support geospatial visualization, comparative urban analysis, and multi-level filtering of open data across cities.

It includes:
- The full schema structure (`schema.sql`)
- Initial seed data (`seed.sql`)
- A `migrations/` folder for step-by-step schema evolution
- A `migrate_all.sql` runner for applying migrations in order

---

## 📦 Contents

| File/Folder         | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| `schema.sql`        | Consolidated SQL schema — full database structure at current state          |
| `seed.sql`          | Optional test dataset for local development and demo purposes               |
| `migrations/`       | Ordered SQL files reflecting incremental schema changes over time           |
| `migrate_all.sql`   | Master runner to apply all migrations in sequence                           |
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

You can either:

✅ Run the full schema:

```bash
psql -U postgres -d areuqueryous -f schema.sql
```

or

✅ Run migrations incrementally:

```bash
psql -U postgres -d areuqueryous -f migrate_all.sql
```

### 3. (Optional) Insert seed data

```bash
psql -U postgres -d areuqueryous -f seed.sql
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

---

## 🧭 Migrations Workflow

To trace how the schema evolved, check the `migrations/` folder. Each file is named sequentially and can be applied individually:

```bash
psql -U postgres -d areuqueryous -f migrations/001_create_base_tables.sql
psql -U postgres -d areuqueryous -f migrations/002_add_districts_neighborhoods.sql
# etc.
```

You can also run them all using:

```bash
psql -U postgres -d areuqueryous -f migrate_all.sql
```

---

## 🛡️ Versioning & Maintenance

If new changes to the schema are needed:
1. Create a new migration: `migrations/008_add_new_feature.sql`
2. Apply it manually or add it to `migrate_all.sql`
3. Avoid editing `schema.sql` directly — regenerate it if needed from the live DB

---

## 🧠 License & Ownership

This database structure was designed and documented by Nico Dalessandro  
for the UOC Final Degree Project (TFG) — "Are U Query-ous?"
