# 📄 ETL Script Standards & Best Practices

This document defines the professional standard for all Python ETL scripts within the `are-u-query-ous` project. Each script must follow this structure to ensure consistency, testability, and maintainability.

---

## ✅ Required Components in Every ETL Script

### 1. 🧾 Module-Level Docstring
Each script must start with a docstring that includes:
- Script name and purpose
- Input/output description
- Author name

```python
"""
ETL Script: Load Districts of Barcelona

- Downloads GeoJSON/WKT data from Supabase
- Validates and processes geometries
- Outputs a JSON file ready for Supabase/PostGIS

Author: [Your Name]
"""
```

---

### 2. ⚙️ Configuration Block
Declare constants at the top:
- `INPUT_URL`, `OUTPUT_FILENAME`, `CITY_ID`, etc.
- `BASE_DIR` for consistent path handling

```python
INPUT_URL = "https://.../districts.json"
OUTPUT_FILENAME = "insert_ready_districts_bcn.json"
CITY_ID = 1
BASE_DIR = Path(__file__).resolve().parents[3]
DEFAULT_OUTPUT_PATH = BASE_DIR / "data/processed" / OUTPUT_FILENAME
```

---

### 3. 🪄 Logging with `shared.emoji_logger`
Use standard emoji-enhanced logging for clarity:

```python
from shared.emoji_logger import info, success, warning, error
```

Example usage:
```python
info("Downloading data...")
success("File processed successfully.")
warning("Skipped malformed row.")
error("Connection to Supabase failed.")
```

---

### 4. 🛡️ Error Handling
Use try/except blocks to:
- Handle failed downloads or decoding
- Validate numeric values or WKT
- Log and skip problematic entries

---

### 5. 🧪 The `run()` Function
Each ETL script must define a single `run()` function:

```python
def run(input_url: str = INPUT_URL, output_path: Path = DEFAULT_OUTPUT_PATH, city_id: int = CITY_ID) -> None:
    ...
```

This function:
- Loads and processes the data
- Saves the transformed output
- Logs a summary

---

### 6. 🗺️ Geometry Validation
Use `shapely.wkt.loads()` to validate geometries:

```python
_ = wkt.loads(wkt_geom)
```

Catch parsing errors and skip invalid records.

---

### 7. 📤 Output Format
Always write output as a formatted JSON file:

```python
with output_path.open("w", encoding="utf-8") as f:
    json.dump(prepared_data, f, ensure_ascii=False, indent=2)
```

---

### 8. 📊 Summary Log
At the end of the script, log:
- Total input records
- Number of processed entries
- Number of skipped entries (if any)

---

### 9. 🧪 CLI Fallback with `argparse`
Add an optional block to allow direct execution with arguments:

```python
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="ETL script for loading ...")
    parser.add_argument("--input_url", type=str, default=INPUT_URL)
    parser.add_argument("--output_path", type=str, default=str(DEFAULT_OUTPUT_PATH))
    parser.add_argument("--city_id", type=int, default=CITY_ID)

    args = parser.parse_args()
    run(input_url=args.input_url, output_path=Path(args.output_path), city_id=args.city_id)
```

---

## ✅ Summary Checklist

| Component                  | Required | Notes                                  |
|---------------------------|----------|----------------------------------------|
| Module docstring          | ✅        | Script metadata                        |
| Constant config block     | ✅        | Defined at top                         |
| Emoji logger usage        | ✅        | info/success/warning/error             |
| `run()` function          | ✅        | Main callable                          |
| Error handling            | ✅        | Try/except around risky ops            |
| Geometry validation       | ✅        | Required for spatial data              |
| Output to JSON            | ✅        | Pretty-printed to `data/processed/`    |
| Summary logging           | ✅        | Counts of processed/skipped            |
| Optional CLI (`argparse`) | ✅        | For direct script execution            |

---

Following this standard ensures that all scripts:
- Can be tested independently
- Plug into a larger pipeline (`ingest.py`)
- Support reusable ETL patterns for any city or dataset
- Are easy to debug, review, and maintain

Let your future self and teammates thank you 🙌