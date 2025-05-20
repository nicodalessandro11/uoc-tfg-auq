# auq_data_engine/madrid/load_point_features.py

"""
ETL Script: Load Point Features of Madrid

This script performs the following tasks:
- Downloads point feature data from multiple sources in the files_manifest.json
- Processes each file according to its specific format and encoding
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
import csv
import requests
import pandas as pd
import re
import io
from pathlib import Path
from typing import Dict, List, Any, Optional, Callable, Tuple
from io import StringIO, BytesIO
import os
from dotenv import load_dotenv
from supabase import create_client, Client

from shared.common_lib.emoji_logger import info, success, warning, error, debug


# ============================
# 🔧 Configuration & Constants
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

# Map of level IDs to names for debugging
GEO_LEVELS_NAMES = {v: k for k, v in GEO_LEVELS.items()}

# Default output filename
OUTPUT_FILENAME = "insert_ready_point_features_madrid.json"
BASE_DIR = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_PATH = BASE_DIR / "data/processed" / OUTPUT_FILENAME

# File processing configurations
FILE_PROCESSORS = {
    "parques_y_jardines": {
        "feature_definition": "Parks and gardens",
        "processor": "process_parques_jardines",
        "encoding": "utf-8",
        "delimiter": ";",
        "quoting": csv.QUOTE_MINIMAL
    },
    "museos": {
        "feature_definition": "Museums",
        "processor": "process_museos",
        "encoding": "utf-8",
        "delimiter": ";",
        "quoting": csv.QUOTE_MINIMAL
    },
    "bibliotecas": {
        "feature_definition": "Libraries",
        "processor": "process_bibliotecas",
        "encoding": "utf-8",
        "delimiter": ";",
        "quoting": csv.QUOTE_MINIMAL
    },
    "centros_educativos": {
        "feature_definition": "Educational centers",
        "processor": "process_centros_educativos",
        "encoding": "utf-8",
        "delimiter": ";",
        "quoting": csv.QUOTE_MINIMAL
    },
    "mercados": {
        "feature_definition": "Municipal markets",
        "processor": "process_mercados",
        "encoding": "utf-8",
        "delimiter": ";",
        "quoting": csv.QUOTE_MINIMAL
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
# Utility Functions
# ===================

def clean_coordinate(coord_str: str, is_longitude: bool = False) -> float:
    """Clean and convert a coordinate string to a float.
    
    Args:
        coord_str: The coordinate string to clean
        is_longitude: Whether this is a longitude coordinate (affects validation)
    
    Returns:
        float: The cleaned coordinate value
    """
    if not coord_str:
        return None
        
    # Save the sign if present
    is_negative = coord_str.startswith('-')
    coord_str = coord_str.replace('-', '')
    
    try:
        # If the string already has a decimal point and looks like a proper coordinate
        if '.' in coord_str and len(coord_str.split('.')[0]) == 2:
            coord = float(coord_str)
        else:
            # Remove all dots (they are thousand separators)
            coord_str = coord_str.replace('.', '')
            
            # Convert to float and scale down
            # The original coordinates are in a format where the decimal point is implicit
            # For example: 4044793196689410 should be 40.44793196689410
            coord = float(coord_str) / 1e14  # Scale down by dividing by 100 trillion
        
        # Restore negative sign if needed
        if is_negative:
            coord = -coord
            
        # For Madrid longitude, ensure it's negative
        if is_longitude and coord > 0:
            coord = -coord
            
        return coord
    except ValueError as e:
        print(f"Error converting coordinate: {e}")
        return None

def is_valid_madrid_coordinate(lat: float, lon: float) -> bool:
    """Check if coordinates are within valid range for Madrid.
    
    Args:
        lat: Latitude value
        lon: Longitude value
        
    Returns:
        bool: True if coordinates are valid for Madrid
    """
    # Madrid coordinates are roughly:
    # Latitude: 40.3° to 40.5°
    # Longitude: -3.9° to -3.5°
    return (
        40.3 <= lat <= 40.5 and
        -3.9 <= lon <= -3.5
    )

def to_snake_case(text: str) -> str:
    """
    Convert a string to snake_case format.
    
    Args:
        text: The string to convert
        
    Returns:
        The string in snake_case format
    """
    if not text:
        return ""
    
    # Replace hyphens and spaces with underscores
    text = text.replace('-', '_').replace(' ', '_')
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove any non-alphanumeric characters (except underscores)
    text = re.sub(r'[^a-z0-9_]', '', text)
    
    # Replace multiple consecutive underscores with a single underscore
    text = re.sub(r'_+', '_', text)
    
    # Remove leading and trailing underscores
    text = text.strip('_')
    
    return text


# ===================
# File Processors
# ===================

def process_parques_jardines(data: List[Dict]) -> List[Dict]:
    """Process parks and gardens data."""
    processed = []
    feature_def = FEATURE_DEFINITIONS.get('Parks and gardens')
    
    if not feature_def:
        warning("'Parks and gardens' feature definition not found in database - skipping all records")
        return processed
    
    for row in data:
        try:
            # Clean up column names - remove any BOM or whitespace
            row = {k.strip().replace('\ufeff', ''): v.strip() if isinstance(v, str) else v 
                  for k, v in row.items()}
            
            # Map the column names to our expected format
            name = row.get('NOMBRE')
            lat = row.get('LATITUD')
            lon = row.get('LONGITUD')
            neighborhood_code = row.get('COD-BARRIO')
            district_code = row.get('COD-DISTRITO')
            
            # Skip if required fields are missing or empty
            if not all([name, lat, lon, neighborhood_code, district_code]):
                debug(f"Skipping park/garden record due to missing required fields: name={name}, lat={lat}, lon={lon}, neighborhood_code={neighborhood_code}, district_code={district_code}")
                continue
            
            # Convert coordinates to decimal degrees
            try:
                lat_float = clean_coordinate(lat, is_longitude=False)
                lon_float = clean_coordinate(lon, is_longitude=True)
                
                # Validate coordinates are in reasonable range for Madrid
                if not is_valid_madrid_coordinate(lat_float, lon_float):
                    debug(f"Skipping park/garden record due to coordinates outside Madrid range: lat={lat_float}, lon={lon_float}")
                    continue
                
                # Convert codes to integers
                neighborhood_code_int = int(neighborhood_code)
            except (ValueError, TypeError) as e:
                debug(f"Skipping park/garden record due to invalid coordinates or codes: {str(e)}")
                continue
            
            # Create the point feature object
            point_feature = {
                "feature_definition_id": feature_def,
                "name": name,
                "latitude": lat_float,
                "longitude": lon_float,
                "geom": f"SRID=4326;POINT({lon_float} {lat_float})",  # Note: longitude first in WKT
                "geo_level_id": GEO_LEVELS["Neighbourhood"],
                "geo_id": neighborhood_code_int,
                "city_id": CITY_ID,
                "properties": {
                    key: value for key, value in row.items()
                    if key not in ['NOMBRE', 'LATITUD', 'LONGITUD', 'COD-BARRIO', 'BARRIO', 'COD-DISTRITO', 'DISTRITO', 
                                 'LOCALIDAD', 'PROVINCIA', 'COORDENADA-X', 'COORDENADA-Y']
                    and value
                }
            }
            
            processed.append(point_feature)
            
        except Exception as e:
            warning(f"Error processing park/garden record: {str(e)}")
            continue
    
    return processed

def process_museos(data: List[Dict]) -> List[Dict]:
    """Process museums data."""
    processed = []
    feature_def = FEATURE_DEFINITIONS.get('Museums')
    
    if not feature_def:
        warning("'Museums' feature definition not found in database - skipping all records")
        return processed
    
    for row in data:
        try:
            # Clean up column names - remove any BOM or whitespace
            row = {k.strip().replace('\ufeff', ''): v.strip() if isinstance(v, str) else v 
                  for k, v in row.items()}
            
            # Map the column names to our expected format
            name = row.get('NOMBRE')
            lat = row.get('LATITUD')
            lon = row.get('LONGITUD')
            neighborhood_code = row.get('COD-BARRIO')
            district_code = row.get('COD-DISTRITO')
            
            # Skip if required fields are missing or empty
            if not all([name, lat, lon, neighborhood_code, district_code]):
                debug(f"Skipping museum record due to missing required fields: name={name}, lat={lat}, lon={lon}, neighborhood_code={neighborhood_code}, district_code={district_code}")
                continue
            
            # Convert coordinates to float
            try:
                lat_float = clean_coordinate(lat, is_longitude=False)
                lon_float = clean_coordinate(lon, is_longitude=True)
                
                # Validate coordinates are in reasonable range for Madrid
                if not is_valid_madrid_coordinate(lat_float, lon_float):
                    debug(f"Skipping museum record due to coordinates outside Madrid range: lat={lat_float}, lon={lon_float}")
                    continue
                
                # Convert codes to integers
                neighborhood_code_int = int(neighborhood_code)
            except (ValueError, TypeError) as e:
                debug(f"Skipping museum record due to invalid coordinates or codes: {str(e)}")
                continue
            
            # Create the point feature object
            point_feature = {
                "feature_definition_id": feature_def,
                "name": name,
                "latitude": lat_float,
                "longitude": lon_float,
                "geom": f"SRID=4326;POINT({lon_float} {lat_float})",  # Note: longitude first in WKT
                "geo_level_id": GEO_LEVELS["Neighbourhood"],
                "geo_id": neighborhood_code_int,
                "city_id": CITY_ID,
                "properties": {
                    key: value for key, value in row.items()
                    if key not in ['NOMBRE', 'LATITUD', 'LONGITUD', 'COD-BARRIO', 'BARRIO', 'COD-DISTRITO', 'DISTRITO', 
                                 'LOCALIDAD', 'PROVINCIA', 'COORDENADA-X', 'COORDENADA-Y']
                    and value
                }
            }
            
            processed.append(point_feature)
            
        except Exception as e:
            warning(f"Error processing museum record: {str(e)}")
            continue
    
    return processed

def process_bibliotecas(data: List[Dict]) -> List[Dict]:
    """Process libraries data."""
    processed = []
    feature_def = FEATURE_DEFINITIONS.get('Libraries')
    
    if not feature_def:
        warning("'Libraries' feature definition not found in database - skipping all records")
        return processed
    
    for row in data:
        try:
            # Clean up column names - remove any BOM or whitespace
            row = {k.strip().replace('\ufeff', ''): v.strip() if isinstance(v, str) else v 
                  for k, v in row.items()}
            
            # Map the column names to our expected format
            name = row.get('NOMBRE')
            lat = row.get('LATITUD')
            lon = row.get('LONGITUD')
            neighborhood_code = row.get('COD-BARRIO')
            district_code = row.get('COD-DISTRITO')
            
            # Skip if required fields are missing or empty
            if not all([name, lat, lon, neighborhood_code, district_code]):
                debug(f"Skipping library record due to missing required fields: name={name}, lat={lat}, lon={lon}, neighborhood_code={neighborhood_code}, district_code={district_code}")
                continue
            
            # Convert coordinates to float
            try:
                lat_float = clean_coordinate(lat, is_longitude=False)
                lon_float = clean_coordinate(lon, is_longitude=True)
                
                # Validate coordinates are in reasonable range for Madrid
                if not is_valid_madrid_coordinate(lat_float, lon_float):
                    debug(f"Skipping library record due to coordinates outside Madrid range: lat={lat_float}, lon={lon_float}")
                    continue
                
                # Convert codes to integers
                neighborhood_code_int = int(neighborhood_code)
            except (ValueError, TypeError) as e:
                debug(f"Skipping library record due to invalid coordinates or codes: {str(e)}")
                continue
            
            # Create the point feature object
            point_feature = {
                "feature_definition_id": feature_def,
                "name": name,
                "latitude": lat_float,
                "longitude": lon_float,
                "geom": f"SRID=4326;POINT({lon_float} {lat_float})",  # Note: longitude first in WKT
                "geo_level_id": GEO_LEVELS["Neighbourhood"],
                "geo_id": neighborhood_code_int,
                "city_id": CITY_ID,
                "properties": {
                    key: value for key, value in row.items()
                    if key not in ['NOMBRE', 'LATITUD', 'LONGITUD', 'COD-BARRIO', 'BARRIO', 'COD-DISTRITO', 'DISTRITO', 
                                 'LOCALIDAD', 'PROVINCIA', 'COORDENADA-X', 'COORDENADA-Y']
                    and value
                }
            }
            
            processed.append(point_feature)
            
        except Exception as e:
            warning(f"Error processing library record: {str(e)}")
            continue
    
    return processed

def process_centros_educativos(data: List[Dict]) -> List[Dict]:
    """Process educational centers data."""
    processed = []
    feature_def = FEATURE_DEFINITIONS.get('Educational centers')
    
    if not feature_def:
        warning("'Educational centers' feature definition not found in database - skipping all records")
        return processed
    
    for row in data:
        try:
            # Clean up column names - remove any BOM or whitespace
            row = {k.strip().replace('\ufeff', ''): v.strip() if isinstance(v, str) else v 
                  for k, v in row.items()}
            
            # Map the column names to our expected format
            name = row.get('NOMBRE')
            lat = row.get('LATITUD')
            lon = row.get('LONGITUD')
            neighborhood_code = row.get('COD-BARRIO')
            district_code = row.get('COD-DISTRITO')
            
            # Skip if required fields are missing or empty
            if not all([name, lat, lon, neighborhood_code, district_code]):
                debug(f"Skipping educational center record due to missing required fields: name={name}, lat={lat}, lon={lon}, neighborhood_code={neighborhood_code}, district_code={district_code}")
                continue
            
            # Convert coordinates to float
            try:
                lat_float = clean_coordinate(lat, is_longitude=False)
                lon_float = clean_coordinate(lon, is_longitude=True)
                
                # Validate coordinates are in reasonable range for Madrid
                if not is_valid_madrid_coordinate(lat_float, lon_float):
                    debug(f"Skipping educational center record due to coordinates outside Madrid range: lat={lat_float}, lon={lon_float}")
                    continue
                
                # Convert codes to integers
                neighborhood_code_int = int(neighborhood_code)
            except (ValueError, TypeError) as e:
                debug(f"Skipping educational center record due to invalid coordinates or codes: {str(e)}")
                continue
            
            # Create the point feature object
            point_feature = {
                "feature_definition_id": feature_def,
                "name": name,
                "latitude": lat_float,
                "longitude": lon_float,
                "geom": f"SRID=4326;POINT({lon_float} {lat_float})",  # Note: longitude first in WKT
                "geo_level_id": GEO_LEVELS["Neighbourhood"],
                "geo_id": neighborhood_code_int,
                "city_id": CITY_ID,
                "properties": {
                    key: value for key, value in row.items()
                    if key not in ['NOMBRE', 'LATITUD', 'LONGITUD', 'COD-BARRIO', 'BARRIO', 'COD-DISTRITO', 'DISTRITO', 
                                 'LOCALIDAD', 'PROVINCIA', 'COORDENADA-X', 'COORDENADA-Y']
                    and value
                }
            }
            
            processed.append(point_feature)
            
        except Exception as e:
            warning(f"Error processing educational center record: {str(e)}")
            continue
    
    return processed

def process_mercados(data: List[Dict]) -> List[Dict]:
    """Process markets data."""
    processed = []
    feature_def = FEATURE_DEFINITIONS.get('Municipal markets')
    
    if not feature_def:
        warning("'Municipal markets' feature definition not found in database - skipping all records")
        return processed
    
    for row in data:
        try:
            # Clean up column names - remove any BOM or whitespace
            row = {k.strip().replace('\ufeff', ''): v.strip() if isinstance(v, str) else v 
                  for k, v in row.items()}
            
            # Map the column names to our expected format
            name = row.get('NOMBRE')
            lat = row.get('LATITUD')
            lon = row.get('LONGITUD')
            neighborhood_code = row.get('COD-BARRIO')
            district_code = row.get('COD-DISTRITO')
            
            # Skip if required fields are missing or empty
            if not all([name, lat, lon, neighborhood_code, district_code]):
                debug(f"Skipping market record due to missing required fields: name={name}, lat={lat}, lon={lon}, neighborhood_code={neighborhood_code}, district_code={district_code}")
                continue
            
            # Convert coordinates to float
            try:
                lat_float = clean_coordinate(lat, is_longitude=False)
                lon_float = clean_coordinate(lon, is_longitude=True)
                
                # Validate coordinates are in reasonable range for Madrid
                if not is_valid_madrid_coordinate(lat_float, lon_float):
                    debug(f"Skipping market record due to coordinates outside Madrid range: lat={lat_float}, lon={lon_float}")
                    continue
                
                # Convert codes to integers
                neighborhood_code_int = int(neighborhood_code)
            except (ValueError, TypeError) as e:
                debug(f"Skipping market record due to invalid coordinates or codes: {str(e)}")
                continue
            
            # Create the point feature object
            point_feature = {
                "feature_definition_id": feature_def,
                "name": name,
                "latitude": lat_float,
                "longitude": lon_float,
                "geom": f"SRID=4326;POINT({lon_float} {lat_float})",  # Note: longitude first in WKT
                "geo_level_id": GEO_LEVELS["Neighbourhood"],
                "geo_id": neighborhood_code_int,
                "city_id": CITY_ID,
                "properties": {
                    key: value for key, value in row.items()
                    if key not in ['NOMBRE', 'LATITUD', 'LONGITUD', 'COD-BARRIO', 'BARRIO', 'COD-DISTRITO', 'DISTRITO', 
                                 'LOCALIDAD', 'PROVINCIA', 'COORDENADA-X', 'COORDENADA-Y']
                    and value
                }
            }
            
            processed.append(point_feature)
            
        except Exception as e:
            warning(f"Error processing market record: {str(e)}")
            continue
    
    return processed


# ===================
# Data Loading
# ===================

def load_csv_data(url: str, source_name: str) -> List[Dict]:
    """
    Load CSV data from a URL or local file.
    
    Args:
        url: URL or local file path to the CSV file
        source_name: Name of the source for logging
        
    Returns:
        List of dictionaries containing the CSV data
    """
    info(f"Loading data from {url}")
    
    # Get the processor configuration
    processor_config = FILE_PROCESSORS.get(source_name)
    if not processor_config:
        error(f"No processor configuration found for {source_name}")
        return []
    
    # Get the encoding and delimiter from the processor configuration
    encoding = processor_config.get("encoding", "utf-8")
    delimiter = processor_config.get("delimiter", ";")
    quoting = processor_config.get("quoting", csv.QUOTE_MINIMAL)
    
    # Try to load the data from the URL
    try:
        if url.startswith("http"):
            response = requests.get(url)
            response.raise_for_status()
            content = response.content
        else:
            # Local file
            with open(url, 'rb') as f:
                content = f.read()
        
        # Try to decode the content with the specified encoding
        try:
            text = content.decode(encoding)
        except UnicodeDecodeError:
            # Try with a different encoding
            text = content.decode('latin-1')
            warning(f"Failed to decode with {encoding}, using latin-1 instead")
        
        # Parse the CSV data
        reader = csv.DictReader(StringIO(text), delimiter=delimiter, quoting=quoting)
        
        # Convert to list of dicts
        data = list(reader)
        
        # Check if we got valid data
        if data and len(data[0].keys()) > 1:
            info(f"Successfully loaded CSV with csv module using encoding={encoding}")
            return data
        else:
            debug(f"CSV loaded with csv module but got invalid data with encoding={encoding}")
    except Exception as e:
        debug(f"Failed to load CSV with csv module using encoding={encoding}: {str(e)}")
    
    # If all attempts failed, raise an error
    error_msg = f"Failed to parse CSV data from {source_name}"
    error(error_msg)
    raise ValueError(error_msg)


# ===================
# Core ETL Process
# ===================

def run(
    manifest_path: Path = BASE_DIR / "data/files_manifest.json",
    output_path: Path = DEFAULT_OUTPUT_PATH
) -> None:
    """
    Main execution logic to fetch, process, and store point feature data.
    
    Args:
        manifest_path: Path to the files manifest JSON
        output_path: Output file path to save the processed data
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
        
        # Determine the processor to use
        processor_config = FILE_PROCESSORS.get(filename)
        if not processor_config:
            warning(f"No processor configured for {filename}. Skipping.")
            continue
        
        # Load the data
        raw_data = load_csv_data(url, filename)
        if not raw_data:
            warning(f"No data loaded from {filename}. Skipping.")
            continue
        
        info(f"Loaded {len(raw_data)} records from {filename}")
        
        # Process the data using the appropriate processor
        processor_name = processor_config["processor"]
        processor_func = globals().get(processor_name)
        
        if not processor_func:
            warning(f"Processor function {processor_name} not found. Skipping {filename}.")
            continue
        
        processed_data = processor_func(raw_data)
        info(f"Processed {len(processed_data)} records from {filename}")
        
        all_processed_data.extend(processed_data)
    
    # Save the processed data
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
    parser.add_argument("--output_path", type=str, default=str(DEFAULT_OUTPUT_PATH), 
                        help="Output path for the processed JSON file.")
    
    args = parser.parse_args()
    run(
        manifest_path=Path(args.manifest_path),
        output_path=Path(args.output_path)
    )
