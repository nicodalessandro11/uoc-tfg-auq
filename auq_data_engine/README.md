# Data Engine Service — *Are U Query-ous?*

This document outlines the updated structure of the ETL pipeline for integrating and uploading open urban geospatial datasets into Supabase. The system supports multiple cities (e.g., Barcelona, Madrid) and handles various dataset types (districts, neighbourhoods, point features, indicators).

---

## Standard ETL Flow

Each dataset follows this 3-phase process:

1. **Extract**: Dataset is downloaded (manually or via URL) into `data/raw/`.
2. **Transform**: Data is cleaned, validated, and formatted. Output saved to `data/processed/`.
3. **Load**: The final dataset is uploaded to Supabase.

---

## Execution Flow (Orchestration)

All processes are orchestrated via:

```
scripts/etl/ingest.py
```

This script runs in this exact order:

1. **District ETLs**
2. **Neighbourhood ETLs** *(depends on districts)*
3. **Run validation tests**
4. **Point Feature ETLs**
5. **Indicator ETLs**

Uploads to Supabase only happen if validations pass (`pytest`).

---

## 📁 Project Structure

```
are-u-query-ous/
├── data/
│   ├── raw/                  # Raw source files
│   ├── processed/            # Cleaned & formatted datasets
│
├── scripts/
│   ├── etl/
│   │   ├── barcelona/
│   │   │   ├── load_districts.py
│   │   │   ├── load_neighbourhoods.py
│   │   │   ├── load_point_features.py
│   │   │   └── load_indicators.py
│   │   ├── madrid/
│   │   │   ├── load_districts.py
│   │   │   ├── load_neighbourhoods.py
│   │   │   ├── load_point_features.py
│   │   │   └── load_indicators.py
│   │   ├── upload/
│   │   │   └── upload_to_supabase.py
│   │   └── ingest.py          # 🔁 Main orchestrator
│
├── shared/
│   └── emoji_logger.py       # Custom logger for feedback
│
├── tests/
│   └── test_base_data_upload.py  # Pytest validation rules
```

---

## 🔍 Example Execution

```python
# Ingest.py simplified:

# ETL: Districts
bcn_d.run()
mad_d.run()
upload.run_district_upload()

# ETL: Neighbourhoods (uses district map from Supabase)
bcn_n.run()
mad_n.run()
upload.run_neighbourhood_upload()

# Run tests
run_tests("test_base_data_upload.py")

# Point features & indicators
bcn_p.run()
mad_p.run()
upload.run_point_feature_upload()

bcn_i.run()
mad_i.run()
upload.run_indicator_upload()
```

---

## ✅ Benefits of This Structure

- **Modular**: Add cities or datasets without breaking existing logic.
- **Safe**: Uploads only proceed after passing validation.
- **Scalable**: Easily extendable with new dataset types.
- **Consistent**: Reusable naming and folder conventions.

---

## 📌 Naming Conventions

- `load_districts.py` → contains `run()` for that dataset
- `insert_ready_[dataset]_[city].json` → processed file for upload
- `[city]-[dataset].json` → original file hosted on Supabase

---

## 🧪 Validation

Each processed dataset is tested against:
- Geometry structure match
- Record counts
- Join validity (e.g. neighbourhoods with valid district IDs)

Tests are written using `pytest`.

---

## 🧰 Technologies

| Tool          | Purpose                    |
|---------------|----------------------------|
| **Pandas**    | Data wrangling             |
| **GeoPandas** | Geometry + GeoJSON parsing |
| **Shapely**   | Geometry objects           |
| **Supabase**  | Cloud DB for open data     |
| **pytest**    | Dataset validations        |
| **Click**     | (Optional) CLI automation  |

---

## 🗂️ Future Datasets (Ideas)

- 🚉 Transit stops, metro entrances  
- 🏫 Public schools and health centers  
- 🏞️ Parks, gardens, green zones  
- 📊 Income per district, population stats

---

## 🔒 Licensing

> Most datasets are under:
- **Barcelona** → [CC BY 4.0](https://opendata-ajuntament.barcelona.cat/)
- **Madrid** → Open Municipal License

Always retain attribution when visualizing or sharing.

---