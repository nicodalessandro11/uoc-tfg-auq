# auq_data_engine/madrid/load_point_features.py

"""
ETL Script: Load Point Features of Madrid

This script performs the following tasks:
- Loads point feature data from JSON files in the data/raw_sample/madrid_sample/point_features directory
- Processes each file according to its specific format
- Transforms the data into a standardized format for database insertion
- Saves the processed point features as a JSON file in the /data/processed folder

Usage:
    python load_point_features.py
    (Optional) with CLI arguments for input URLs and output file.

Author: Nico D'Alessandro Calderon
Email: nicodalessandro11@gmail.com
Date: 2025-04-17
Version: 1.0.0
License: MIT License
"""

import json
import logging
import pandas as pd
from pathlib import Path
from typing import Dict, List, Any, Optional
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import requests

from shared.common_lib.emoji_logger import info, success, warning, error, debug

# ============================
# Configuration & Constants
# ============================

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Constants
CITY_ID = 2  # Madrid city ID

# Geographical level IDs
GEO_LEVELS = {
    "City": 1,
    "District": 2,
    "Neighbourhood": 3
}

# Default output filename
OUTPUT_FILENAME = "insert_ready_point_features_madrid.json"
BASE_DIR = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_PATH = BASE_DIR / "data/processed" / OUTPUT_FILENAME

# File processing configurations
FILE_PROCESSORS = {
    "parques_y_jardines": {
        "feature_definition": "Parks and gardens",
        "processor": "process_parques_jardines"
    },
    "museos": {
        "feature_definition": "Museums",
        "processor": "process_museos"
    },
    "salud": {
        "feature_definition": "Health centers",
        "processor": "process_centros_salud"
    },
    "centros_educativos": {
        "feature_definition": "Educational centers",
        "processor": "process_centros_educativos"
    },
    "bibliotecas": {
        "feature_definition": "Libraries",
        "processor": "process_bibliotecas"
    }
}

# ===================
# Database Functions
# ===================

def get_supabase_client() -> Client:
    """Initialize and return a Supabase client"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        error("Supabase credentials not found in environment variables")
        return None
    
    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        error(f"Failed to initialize Supabase client: {str(e)}")
        return None

def load_feature_definitions(supabase: Client) -> Dict[str, int]:
    """Load feature definitions from the database."""
    try:
        # Query feature definitions from Supabase
        response = supabase.table("feature_definitions").select("id, name").execute()
        
        if not response.data:
            error("No feature definitions found in database")
            return {}
            
        # Convert to dictionary with name as key and id as value
        feature_defs = {row['name']: row['id'] for row in response.data}
        
        info(f"Loaded {len(feature_defs)} feature definitions from database")
        return feature_defs
    except Exception as e:
        error(f"Failed to load feature definitions from database: {str(e)}")
        return {}

# ===================
# Data Loading
# ===================

def load_json_data(url: str, source_name: str) -> Dict:
    """Load and process JSON data from a URL.
    Args:
        url: The URL to load data from
        source_name: The name of the source for logging purposes
    Returns:
        Dictionary containing the JSON data
    """
    info(f"Loading JSON data from {url}")
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        return data
    except requests.exceptions.RequestException as e:
        error(f"Failed to download JSON from {url}: {str(e)}")
        return {}
    except json.JSONDecodeError as e:
        error(f"Failed to parse JSON from {url}: {str(e)}")
        return {}

# ===================
# File Processors
# ===================

def process_parques_jardines(data: Dict) -> List[Dict]:
    """Process parks and gardens data."""
    processed = []
    feature_def = FEATURE_DEFINITIONS.get('Parks and gardens')
    
    if not feature_def:
        warning("'Parks and gardens' feature definition not found in database - skipping all records")
        return processed
    
    for item in data.get('@graph', []):
        try:
            # Extract required fields
            name = item.get('title')
            location = item.get('location', {})
            lat = location.get('latitude')
            lon = location.get('longitude')
            address = item.get('address', {})
            district = address.get('district', {}).get('@id', '').split('/')[-1]
            area = address.get('area', {}).get('@id', '').split('/')[-1]
            
            # Skip if required fields are missing
            if not all([name, lat, lon, district, area]):
                debug(f"Skipping park/garden record due to missing required fields")
                continue
            
            # Create properties
            properties = {
                'address': address.get('street-address'),
                'postal_code': address.get('postal-code'),
                'district': district,
                'area': area,
                'description': item.get('organization', {}).get('organization-desc'),
                'services': item.get('organization', {}).get('services'),
                'schedule': item.get('organization', {}).get('schedule'),
                'accessibility': item.get('organization', {}).get('accesibility')
            }
            
            # Create the processed record
            processed.append({
                'feature_definition_id': feature_def,
                'name': name,
                'latitude': lat,
                'longitude': lon,
                'geom': f"SRID=4326;POINT({lon} {lat})",
                'geo_level_id': GEO_LEVELS['Neighbourhood'],
                'geo_id': hash(area) % 1000000,  # Create a numeric ID from the area name
                'city_id': CITY_ID,
                'properties': properties
            })
        except Exception as e:
            error(f"Error processing park/garden record: {str(e)}")
            continue
    
    info(f"Processed {len(processed)} parks and gardens records")
    return processed

def process_museos(data: Dict) -> List[Dict]:
    """Process museums data."""
    processed = []
    feature_def = FEATURE_DEFINITIONS.get('Museums')
    
    if not feature_def:
        warning("'Museums' feature definition not found in database - skipping all records")
        return processed
    
    for item in data.get('@graph', []):
        try:
            # Extract required fields
            name = item.get('title')
            location = item.get('location', {})
            lat = location.get('latitude')
            lon = location.get('longitude')
            address = item.get('address', {})
            district = address.get('district', {}).get('@id', '').split('/')[-1]
            area = address.get('area', {}).get('@id', '').split('/')[-1]
            
            # Skip if required fields are missing
            if not all([name, lat, lon, district, area]):
                debug(f"Skipping museum record due to missing required fields")
                continue
            
            # Create properties
            properties = {
                'address': address.get('street-address'),
                'postal_code': address.get('postal-code'),
                'district': district,
                'area': area,
                'description': item.get('organization', {}).get('organization-desc'),
                'services': item.get('organization', {}).get('services'),
                'schedule': item.get('organization', {}).get('schedule'),
                'accessibility': item.get('organization', {}).get('accesibility')
            }
            
            # Create the processed record
            processed.append({
                'feature_definition_id': feature_def,
                'name': name,
                'latitude': lat,
                'longitude': lon,
                'geom': f"SRID=4326;POINT({lon} {lat})",
                'geo_level_id': GEO_LEVELS['Neighbourhood'],
                'geo_id': hash(area) % 1000000,  # Create a numeric ID from the area name
                'city_id': CITY_ID,
                'properties': properties
            })
        except Exception as e:
            error(f"Error processing museum record: {str(e)}")
            continue
    
    info(f"Processed {len(processed)} museum records")
    return processed

def process_centros_salud(data: Dict) -> List[Dict]:
    """Process health centers data."""
    processed = []
    feature_def = FEATURE_DEFINITIONS.get('Health centers')
    
    if not feature_def:
        warning("'Health centers' feature definition not found in database - skipping all records")
        return processed
    
    for item in data.get('@graph', []):
        try:
            # Extract required fields
            name = item.get('title')
            location = item.get('location', {})
            lat = location.get('latitude')
            lon = location.get('longitude')
            address = item.get('address', {})
            district = address.get('district', {}).get('@id', '').split('/')[-1]
            area = address.get('area', {}).get('@id', '').split('/')[-1]
            
            # Skip if required fields are missing
            if not all([name, lat, lon, district, area]):
                debug(f"Skipping health center record due to missing required fields")
                continue
            
            # Create properties
            properties = {
                'address': address.get('street-address'),
                'postal_code': address.get('postal-code'),
                'district': district,
                'area': area,
                'description': item.get('organization', {}).get('organization-desc'),
                'services': item.get('organization', {}).get('services'),
                'schedule': item.get('organization', {}).get('schedule'),
                'accessibility': item.get('organization', {}).get('accesibility')
            }
            
            # Create the processed record
            processed.append({
                'feature_definition_id': feature_def,
                'name': name,
                'latitude': lat,
                'longitude': lon,
                'geom': f"SRID=4326;POINT({lon} {lat})",
                'geo_level_id': GEO_LEVELS['Neighbourhood'],
                'geo_id': hash(area) % 1000000,  # Create a numeric ID from the area name
                'city_id': CITY_ID,
                'properties': properties
            })
        except Exception as e:
            error(f"Error processing health center record: {str(e)}")
            continue
    
    info(f"Processed {len(processed)} health center records")
    return processed

def process_centros_educativos(data: Dict) -> List[Dict]:
    """Process educational centers data."""
    processed = []
    feature_def = FEATURE_DEFINITIONS.get('Educational centers')
    
    if not feature_def:
        warning("'Educational centers' feature definition not found in database - skipping all records")
        return processed
    
    for item in data.get('@graph', []):
        try:
            # Extract required fields
            name = item.get('title')
            location = item.get('location', {})
            lat = location.get('latitude')
            lon = location.get('longitude')
            address = item.get('address', {})
            district = address.get('district', {}).get('@id', '').split('/')[-1]
            area = address.get('area', {}).get('@id', '').split('/')[-1]
            
            # Skip if required fields are missing
            if not all([name, lat, lon, district, area]):
                debug(f"Skipping educational center record due to missing required fields")
                continue
            
            # Create properties
            properties = {
                'address': address.get('street-address'),
                'postal_code': address.get('postal-code'),
                'district': district,
                'area': area,
                'description': item.get('organization', {}).get('organization-desc'),
                'services': item.get('organization', {}).get('services'),
                'schedule': item.get('organization', {}).get('schedule'),
                'accessibility': item.get('organization', {}).get('accesibility')
            }
            
            # Create the processed record
            processed.append({
                'feature_definition_id': feature_def,
                'name': name,
                'latitude': lat,
                'longitude': lon,
                'geom': f"SRID=4326;POINT({lon} {lat})",
                'geo_level_id': GEO_LEVELS['Neighbourhood'],
                'geo_id': hash(area) % 1000000,  # Create a numeric ID from the area name
                'city_id': CITY_ID,
                'properties': properties
            })
        except Exception as e:
            error(f"Error processing educational center record: {str(e)}")
            continue
    
    info(f"Processed {len(processed)} educational center records")
    return processed

def process_bibliotecas(data: Dict) -> List[Dict]:
    """Process libraries data."""
    processed = []
    feature_def = FEATURE_DEFINITIONS.get('Libraries')
    
    if not feature_def:
        warning("'Libraries' feature definition not found in database - skipping all records")
        return processed
    
    for item in data.get('@graph', []):
        try:
            # Extract required fields
            name = item.get('title')
            location = item.get('location', {})
            lat = location.get('latitude')
            lon = location.get('longitude')
            address = item.get('address', {})
            district = address.get('district', {}).get('@id', '').split('/')[-1]
            area = address.get('area', {}).get('@id', '').split('/')[-1]
            
            # Skip if required fields are missing
            if not all([name, lat, lon, district, area]):
                debug(f"Skipping library record due to missing required fields")
                continue
            
            # Create properties
            properties = {
                'address': address.get('street-address'),
                'postal_code': address.get('postal-code'),
                'district': district,
                'area': area,
                'description': item.get('organization', {}).get('organization-desc'),
                'services': item.get('organization', {}).get('services'),
                'schedule': item.get('organization', {}).get('schedule'),
                'accessibility': item.get('organization', {}).get('accesibility')
            }
            
            # Create the processed record
            processed.append({
                'feature_definition_id': feature_def,
                'name': name,
                'latitude': lat,
                'longitude': lon,
                'geom': f"SRID=4326;POINT({lon} {lat})",
                'geo_level_id': GEO_LEVELS['Neighbourhood'],
                'geo_id': hash(area) % 1000000,  # Create a numeric ID from the area name
                'city_id': CITY_ID,
                'properties': properties
            })
        except Exception as e:
            error(f"Error processing library record: {str(e)}")
            continue
    
    info(f"Processed {len(processed)} library records")
    return processed

# ===================
# Core ETL Process
# ===================

def run(manifest_path: Path = BASE_DIR / "data/files_manifest.json") -> None:
    """
    Main execution logic to fetch, process, and store point feature data.
    
    Args:
        manifest_path: Path to the files manifest JSON
    """
    info(f"Starting ETL process for Madrid point features...")
    
    # Initialize Supabase client
    supabase = get_supabase_client()
    if not supabase:
        error("Failed to initialize Supabase client. Exiting.")
        return
    
    # Load feature definitions from database
    global FEATURE_DEFINITIONS
    FEATURE_DEFINITIONS = load_feature_definitions(supabase)
    
    # Load the files manifest
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
    except Exception as e:
        error(f"Failed to load files manifest: {e}")
        return
    
    # Get Madrid point features URLs
    mad_point_features = manifest.get("madrid", {}).get("point_features", {}).get("raw_file", {})
    
    if not mad_point_features:
        error("No point feature URLs found in the manifest")
        return
    
    info(f"Found {len(mad_point_features)} point feature sources to process")
    
    # Process each file
    all_processed_data = []
    
    for filename, url in mad_point_features.items():
        info(f"Processing {filename} from {url}")
        
        # Load the data
        raw_data = load_json_data(url, filename)
        if not raw_data:
            warning(f"No data loaded from {filename}. Skipping.")
            continue
        
        info(f"Loaded {len(raw_data)} records from {filename}")
        
        # Process the data using the appropriate processor
        processor_name = f"process_{filename}"
        processor_func = globals().get(processor_name)
        
        if not processor_func:
            warning(f"Processor function {processor_name} not found. Skipping {filename}.")
            continue
        
        processed_data = processor_func(raw_data)
        info(f"Processed {len(processed_data)} records from {filename}")
        
        all_processed_data.extend(processed_data)
    
    # Save the processed data
    output_path = BASE_DIR / "data/processed" / "insert_ready_point_features_madrid.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(all_processed_data, f, ensure_ascii=False, indent=2)
    
    # Summary log
    info(f"Total point features processed: {len(all_processed_data)}")
    success(f"Output saved to: {output_path}")

# ==========================
# CLI Entry Point
# ==========================

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="ETL script for loading Madrid point features.")
    parser.add_argument("--manifest_path", type=str, default=str(BASE_DIR / "data/files_manifest.json"), 
                        help="Path to the files manifest JSON.")
    
    args = parser.parse_args()
    run(manifest_path=Path(args.manifest_path))
