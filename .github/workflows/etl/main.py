# main.py limpio para solo point features

import argparse
from pathlib import Path
from load_point_features_barcelona import run as run_bcn
from load_point_features_madrid import run as run_mad
from upload_to_supabase import run_point_feature_upload as run_upload

F = "[main.py]"

def process_point_features():
    print(f"{F} 📍 Running POINT FEATURE ETLs...")
    manifest_path = Path(__file__).resolve().parent / "data/api-file-manifest.json"
    # Ejecutar ETL de Barcelona
    run_bcn(manifest_path=manifest_path)
    # Ejecutar ETL de Madrid
    run_mad(manifest_path=manifest_path)
    # Subir a Supabase
    run_upload()
    print(f"{F} ✅ Point features ETL and upload complete.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the point features ETL pipeline.")
    args = parser.parse_args()
    process_point_features()
