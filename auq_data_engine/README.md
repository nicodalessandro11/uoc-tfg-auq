# *Are U Query-ous?* — Data Engine Service

This document outlines the updated structure of the ETL pipeline for integrating and uploading open urban geospatial datasets into Supabase. The system supports multiple cities (e.g., Barcelona, Madrid) and handles various dataset types (districts, neighbourhoods, point features, indicators).

## Standard ETL Flow

Each dataset follows this 3-phase process:

1. **Extract**: Dataset is downloaded (manually or via URL) into `[city_name]/data/raw/`.
2. **Transform**: Data is cleaned, validated, and formatted. Output saved to `[city_name]/data/processed/`.
3. **Load**: The final dataset is uploaded to Supabase `upload/`.

## Execution Flow (Orchestration)

All processes are orchestrated via:

```bash
main.py
```

This script runs in this exact order:

1. **District ETLs**
2. **Neighbourhood ETLs**
3. **Run validation tests**
4. **Point Feature ETLs**
5. **Indicator ETLs**

Uploads to Supabase only happen if validations pass (`pytest`).

## Project Structure

```bash
auq_data_engine/
├── data/                   # Raw and processed datasets
│   ├── raw/                # Raw source files
│   └── processed/          # Cleaned & formatted datasets
│
├── barcelona/              # Barcelona-specific ETL scripts
│   ├── load_districts.py
│   ├── load_neighbourhoods.py
│   ├── load_point_features.py
│   └── load_indicators.py
│
├── madrid/                 # Madrid-specific ETL scripts
│   ├── load_districts.py
│   ├── load_neighbourhoods.py
│   ├── load_point_features.py
│   └── load_indicators.py
│
├── upload/                 # Supabase upload utilities
│   └── upload_to_supabase.py
│
├── tests/                  # Pytest validation rules
│   └── test_base_data_upload.py
│
├── main.py                 # Main orchestrator
├── pyproject.toml          # Project configuration
└── __init__.py             # Package initialization
```

## Example Execution

```python
# main.py simplified:

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

## Benefits of This Structure

- **Modular**: Add cities or datasets without breaking existing logic.
- **Safe**: Uploads only proceed after passing validation.
- **Scalable**: Easily extendable with new dataset types.
- **Consistent**: Reusable naming and folder conventions.

## Naming Conventions

- `load_districts.py` → contains `run()` for that dataset
- `insert_ready_[dataset]_[city].json` → processed file for upload
- `[city]-[dataset].json` → original file hosted on Supabase

## Validation

Each processed dataset is tested against:

- Geometry structure match
- Record counts
- Join validity (e.g. neighbourhoods with valid district IDs)

Tests are written using `pytest`.

## Technologies

| Tool          | Purpose                    |
|---------------|----------------------------|
| **Pandas**    | Data wrangling             |
| **GeoPandas** | Geometry + GeoJSON parsing |
| **Shapely**   | Geometry objects           |
| **Supabase**  | Cloud DB for open data     |
| **pytest**    | Dataset validations        |

## Future Datasets (Ideas)

- 🚉 Transit stops, metro entrances  
- 🏫 Public schools and health centers  
- 🏞️ Parks, gardens, green zones  
- 📊 Income per district, population stats

## License & Ownership

This **database structure** was designed and documented by Nico Dalessandro  
for the UOC Final Degree Project (TFG) — "Are U Query-ous?"

All code and scripts in this repository are released under the [MIT License](./LICENSE).  
You are free to use, modify, and distribute them with proper attribution.

### Datasets Licensing

> Most datasets are under:

- **Barcelona** → [CC BY 4.0](https://opendata-ajuntament.barcelona.cat/)
- **Madrid** → Open Municipal License

Always retain attribution when visualizing or sharing.
