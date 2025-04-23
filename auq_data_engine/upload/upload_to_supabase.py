# scripts/upload/upload_to_supabase.py

"""
ETL Script: Upload Processed Geo Data to Supabase

- Loads processed district, neighbourhood, point feature, and indicator data from disk
- Uploads records to corresponding Supabase tables
- Provides CLI-based execution with logging and error handling

Author: Nico D'Alessandro (nico.dalessandro@gmail.com)
Date: 2025-04-17
"""

import json
import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
from shared.common_lib.emoji_logger import info, success, warning, error

# ==================
# Configuration
# ==================
load_dotenv()

BASE_DIR = Path(__file__).resolve().parents[1]
PROCESSED_DIR = BASE_DIR / "data/processed"

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ==================
# Core Utilities
# ==================
def load_json_data(file_path: Path):
    try:
        with file_path.open(encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        error(f"Failed to read file {file_path}: {e}")
        return []

def upload(table_name: str, records: list[dict]):
    if not records:
        warning(f"No records to upload to '{table_name}'")
        return

    try:
        # Use upsert with on_conflict parameter to handle duplicates
        response = supabase.table(table_name).upsert(
            records,
            on_conflict='indicator_def_id,geo_level_id,geo_id,year' if table_name == 'indicators' else None
        ).execute()
        if hasattr(response, "status_code"):
            info(f"[{table_name}] Status: {response.status_code}")
        if hasattr(response, "data") and response.data:
            success(f"Uploaded {len(response.data)} records to '{table_name}'")
        else:
            warning(f"No data returned after uploading to '{table_name}'. Check Supabase logs.")
    except Exception as e:
        error(f"Error during upload to '{table_name}': {e}")

# ================== 
# Execution Blocks
# ==================
def run_district_upload():
    info("Uploading districts...")
    files = [
        ("districts", PROCESSED_DIR / "insert_ready_districts_bcn.json"),
        ("districts", PROCESSED_DIR / "insert_ready_districts_madrid.json"),
    ]
    for table, path in files:
        data = load_json_data(path)
        upload(table, data)

def run_neighbourhood_upload():
    info("Uploading neighbourhoods...")
    files = [
        ("neighbourhoods", PROCESSED_DIR / "insert_ready_neighbourhoods_bcn.json"),
        ("neighbourhoods", PROCESSED_DIR / "insert_ready_neighbourhoods_madrid.json"),
    ]
    for table, path in files:
        data = load_json_data(path)
        upload(table, data)

def run_point_feature_upload():
    info("Uploading point features...")
    files = [
        ("point_features", PROCESSED_DIR / "insert_ready_point_features_bcn.json"),
        ("point_features", PROCESSED_DIR / "insert_ready_point_features_madrid.json"),
    ]
    for table, path in files:
        data = load_json_data(path)
        upload(table, data)

def run_indicator_upload():
    info("Uploading indicators...")
    files = [
        ("indicators", PROCESSED_DIR / "insert_ready_indicators_bcn.json"),
        ("indicators", PROCESSED_DIR / "insert_ready_indicators_madrid.json"),
    ]
    for table, path in files:
        data = load_json_data(path)
        upload(table, data)

def run_all_uploads():
    info("Starting full Supabase upload flow...")
    run_district_upload()
    run_neighbourhood_upload()
    run_point_feature_upload()
    run_indicator_upload()
    success("All uploads completed successfully.")

# ==================
# CLI Support
# ==================
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Upload processed files to Supabase.")
    parser.add_argument("--only", type=str, choices=["districts", "neighbourhoods", "points", "indicators", "all"], default="all")

    args = parser.parse_args()
    task = args.only

    if task == "districts":
        run_district_upload()
    elif task == "neighbourhoods":
        run_neighbourhood_upload()
    elif task == "points":
        run_point_feature_upload()
    elif task == "indicators":
        run_indicator_upload()
    else:
        run_all_uploads()

