# auq_data_engine/barcelona/load_point_features.py

"""
ETL Script: Load Point Features of Barcelona

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
from typing import Dict, List, Any, Optional, Callable
from io import StringIO, BytesIO
import os
from dotenv import load_dotenv
from supabase import create_client, Client

from shared.common_lib.emoji_logger import info, success, warning, error, debug


# ============================
# Configuration & Constants
# ============================

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Geographical level IDs
GEO_LEVELS = {
    "City": 1,
    "District": 2,
    "Neighbourhood": 3
}

# Default output filename
OUTPUT_FILENAME = "insert_ready_point_features_bcn.json"
BASE_DIR = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_PATH = BASE_DIR / "data/processed" / OUTPUT_FILENAME

# File processing configurations
FILE_PROCESSORS = {
    "parques_y_jardines": {
        "feature_definition": "Parks and gardens",
        "processor": "process_parcs_jardins",
        "encoding": "utf-16",  # File has UTF-16 BOM
        "delimiter": "\t",     # Tab-separated
        "quoting": csv.QUOTE_NONE  # No quotes in the file
    },
    "mercados": {
        "feature_definition": "Municipal markets",
        "processor": "process_mercats",
        "encoding": "utf-8-sig",
        "delimiter": ";",
        "quoting": csv.QUOTE_MINIMAL
    },
    "varios": {
        "feature_definition": None,  # Will be determined by Tipus_Equipament
        "processor": "process_equipaments",
        "encoding": "utf-8-sig",
        "delimiter": ",",
        "quoting": csv.QUOTE_MINIMAL
    }
}

# Mapping of equipment types to feature definitions
EQUIPMENT_TYPE_MAPPING = {
    "Biblioteques de Barcelona": "Libraries",
    "Centres cívics": "Cultural centers",
    "Grans auditoris": "Auditoriums",
    "Espais d'interès patrimonial": "Heritage spaces",
    "Fàbriques de Creació": "Creation factories",
    "Museus i col·leccions": "Museums",
    "Cinemes": "Cinemas",
    "Centres d'exposicions": "Exhibition centers",
    "Arxius": "Archives",
    "Arxius de districte": "Archives",
    "Arxius i biblioteques patrimonials": "Archives and patrimonial libraries",
    "Sales de música en viu": "Live music venues",
    "Sales d'arts escèniques": "Performing arts venues",
    "Mercats municipals": "Municipal markets",
    "Parcs i jardins": "Parks and gardens",
    "Centres educatius": "Educational centers",
    "Ateneus": "Cultural centers",
    "Cases de la Festa": "Cultural centers"
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

def clean_coordinate(coord_str: str, is_northing: bool = True) -> float:
    """
    Clean and convert a coordinate string to a float.
    
    Args:
        coord_str: The coordinate string to clean
        is_northing: Whether this is a northing (latitude) coordinate
        
    Returns:
        float: The cleaned coordinate value
    """
    if not coord_str or pd.isna(coord_str):
        return None
        
    try:
        # Remove whitespace
        coord_str = str(coord_str).strip()
        
        # Replace comma with dot for decimal point
        coord_str = coord_str.replace(',', '.')
        
        # Handle multiple dots as thousand separators
        if '.' in coord_str:
            # Split by dots and join all parts except the last one
            parts = coord_str.split('.')
            if len(parts) > 2:
                # Join all parts except the last one (which is the decimal part)
                integer_part = ''.join(parts[:-1])
                decimal_part = parts[-1]
                coord_str = f"{integer_part}.{decimal_part}"
        
        # Convert to float
        coord = float(coord_str)
        
        # If the coordinate is in the expected range for Barcelona, return it as is
        if is_northing and 41.0 <= coord <= 42.0:
            return coord
        elif not is_northing and 1.0 <= coord <= 3.0:
            return coord
            
        # If not in the expected range, try converting from UTM
        # This is a simplified conversion - in production you'd want to use pyproj
        if is_northing:
            # Assuming UTM zone 31N for Barcelona
            coord = coord / 1000000  # Convert from UTM meters to degrees
        else:
            coord = coord / 1000000  # Convert from UTM meters to degrees
            
        return coord
        
    except (ValueError, TypeError) as e:
        print(f"⚠️ Could not convert coordinate '{coord_str}' to float: {str(e)}")
        return None

def clean_market_coordinate(coord_str: str) -> float:
    """
    Clean and convert a market coordinate string to a float.
    Specifically handles the format like '41.399.835.932.090.400'
    
    Args:
        coord_str: The coordinate string to clean
        
    Returns:
        float: The cleaned coordinate value
    """
    if not coord_str or pd.isna(coord_str):
        return None
        
    try:
        # Remove whitespace
        coord_str = str(coord_str).strip()
        
        # Replace comma with dot for decimal point
        coord_str = coord_str.replace(',', '.')
        
        # Handle multiple dots as thousand separators
        if '.' in coord_str:
            # Split by dots
            parts = coord_str.split('.')
            
            # If there are more than 2 parts, this is using dots as thousand separators
            if len(parts) > 2:
                # For coordinates like "41.399.835.932.090.400"
                # We need to join all parts except the last one
                integer_part = ''.join(parts[:-1])
                decimal_part = parts[-1]
                
                # Create a new string with a single decimal point
                coord_str = f"{integer_part}.{decimal_part}"
                
                # Debug output
                print(f"Original: {coord_str}, Cleaned: {coord_str}")
        
        # Convert to float
        return float(coord_str)
        
    except (ValueError, TypeError) as e:
        print(f"⚠️ Could not convert market coordinate '{coord_str}' to float: {str(e)}")
        return None


# ===================
# File Processors
# ===================

def process_parcs_jardins(data: List[Dict]) -> List[Dict]:
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
            name = row.get('name')
            y_coord = row.get('geo_epgs_4326_lat')  # This is actually UTM northing
            x_coord = row.get('geo_epgs_4326_lon')  # This is actually UTM easting
            neighborhood_id = row.get('addresses_neighborhood_id')
            register_id = row.get('register_id')
            
            # Skip if required fields are missing or empty
            if not all([name, y_coord, x_coord, neighborhood_id, register_id]):
                debug(f"Skipping park/garden record due to missing required fields")
                continue
            
            # Convert coordinates to WGS84 decimal degrees
            try:
                lat = clean_coordinate(y_coord, is_northing=True)
                lon = clean_coordinate(x_coord, is_northing=False)
                
                # Validate coordinates are in reasonable range for Barcelona
                if not (41.0 <= lat <= 42.0 and 1.5 <= lon <= 2.5):
                    debug(f"Skipping park/garden record due to coordinates outside Barcelona range: lat={lat}, lon={lon}")
                    continue
                
                # Convert neighborhood_id to integer
                neighborhood_id_int = int(neighborhood_id)
            except (ValueError, TypeError) as e:
                debug(f"Skipping park/garden record due to invalid coordinates or neighborhood_id: {str(e)}")
                continue
            
            # Create the processed record
            processed.append({
                'feature_definition_id': feature_def,
                'name': name,
                'latitude': lat,
                'longitude': lon,
                'geom': f"SRID=4326;POINT({lon} {lat})",  # Note: longitude first in WKT
                'geo_level_id': GEO_LEVELS['Neighbourhood'],
                'geo_id': neighborhood_id_int,
                'properties': {
                    'address': row.get('addresses_road_name'),
                    'postal_code': row.get('addresses_zip_code'),
                }
            })
        except Exception as e:
            error(f"Error processing park/garden record: {str(e)}")
            continue
    
    info(f"Processed {len(processed)} parks and gardens records")
    return processed


def process_mercats(data: List[Dict]) -> List[Dict]:
    """Process markets data."""
    processed = []
    feature_def = FEATURE_DEFINITIONS.get('Municipal markets')
    
    if not feature_def:
        warning("'Municipal markets' feature definition not found in database - skipping all records")
        return processed
        
    for row in data:
        try:
            # Clean up column names - handle both string and non-string values
            row = {k.strip().replace('\ufeff', '') if isinstance(k, str) else k: 
                  v.strip() if isinstance(v, str) else v 
                  for k, v in row.items()}
            
            # Required fields
            required_fields = {
                'register_id': str,
                'name': str,
                'addresses_neighborhood_id': int
            }
            
            # Validate and convert required fields
            record = {}
            for field, field_type in required_fields.items():
                value = row.get(field)
                if value is None or (isinstance(value, str) and value.strip() == ''):
                    debug(f"Skipping market record due to missing {field}")
                    break
                try:
                    if isinstance(value, str):
                        record[field] = field_type(value.strip())
                    else:
                        record[field] = field_type(value)
                except (ValueError, TypeError) as e:
                    debug(f"Skipping market record due to invalid {field}: {str(e)}")
                    break
            else:  # All required fields are valid
                # Handle coordinates separately
                lat = clean_market_coordinate(row.get('geo_epgs_4326_lat'))
                lon = clean_market_coordinate(row.get('geo_epgs_4326_lon'))
                
                if lat is None or lon is None:
                    debug(f"Skipping market record due to invalid coordinates")
                    continue
                
                # Extract only the requested fields
                address = row.get('addresses_road_name', '')
                street_number = row.get('addresses_start_street_number', '')
                postal_code = row.get('addresses_zip_code', '')
                telephone = row.get('values_value', '')
                
                # Create properties with only the requested fields
                properties = {}
                if address:
                    properties['address'] = address
                if street_number:
                    properties['street_number'] = street_number
                if postal_code:
                    properties['postal_code'] = postal_code
                if telephone:
                    properties['telephone'] = telephone
                
                # Validate coordinates are in reasonable range for Barcelona
                if not (41.3 <= lat <= 41.5 and 2.0 <= lon <= 2.3):
                    debug(f"Skipping market record due to coordinates outside Barcelona range: lat={lat}, lon={lon}")
                    continue
                
                processed.append({
                    'feature_definition_id': feature_def,
                    'name': record['name'],
                    'latitude': lat,
                    'longitude': lon,
                    'geom': f"SRID=4326;POINT({lon} {lat})",
                    'geo_level_id': GEO_LEVELS['Neighbourhood'],
                    'geo_id': record['addresses_neighborhood_id'],
                    'properties': properties
                })
        except Exception as e:
            warning(f"Error processing market record: {str(e)}")
            continue
    
    info(f"Processed {len(processed)} market records")
    return processed


def process_equipaments(data: List[Dict]) -> List[Dict]:
    """Process equipment data."""
    processed = []
    
    for row in data:
        try:
            # Clean up column names - remove any BOM or whitespace
            row = {k.strip().replace('\ufeff', '') if isinstance(k, str) else k: 
                  v.strip() if isinstance(v, str) else v 
                  for k, v in row.items()}
            
            # Get equipment type and feature definition
            equipment_type = row.get('Tipus_Equipament', '').strip()
            feature_def = None
            
            # Try exact match first
            eng_name = EQUIPMENT_TYPE_MAPPING.get(equipment_type)
            if eng_name:
                feature_def = FEATURE_DEFINITIONS.get(eng_name)
                if feature_def:
                    debug(f"Exact match found: '{equipment_type}' -> '{eng_name}' -> {feature_def}")
                else:
                    warning(f"Feature definition not found in database for type: {eng_name}")
                    continue
            else:
                warning(f"Equipment type not found in mapping: {equipment_type}")
                continue
            
            # Map the column names to our expected format
            name = row.get('Nom_Equipament')
            y_coord = row.get('Latitud')  # This is actually UTM northing
            x_coord = row.get('Longitud')  # This is actually UTM easting
            neighborhood_code = row.get('Codi_Barri')
            district_code = row.get('Codi_Districte')
            
            # Skip if required fields are missing or empty
            if not all([name, y_coord, x_coord, neighborhood_code, district_code]):
                debug(f"Skipping equipment record due to missing required fields")
                continue
            
            # Convert coordinates to WGS84 decimal degrees
            try:
                lat = clean_coordinate(y_coord, is_northing=True)
                lon = clean_coordinate(x_coord, is_northing=False)
                
                # Validate coordinates are in reasonable range for Barcelona
                # For equipaments, the coordinates are already in WGS84 format after conversion
                if not (41.3 <= lat <= 41.5 and 2.0 <= lon <= 2.3):
                    debug(f"Skipping equipment record due to coordinates outside Barcelona range: lat={lat}, lon={lon}")
                    continue
                
                # Convert codes to integers
                neighborhood_code_int = int(neighborhood_code)
            except (ValueError, TypeError) as e:
                debug(f"Skipping equipment record due to invalid coordinates or codes: {str(e)}")
                continue
            
            # Create properties excluding the specified columns
            excluded_columns = [
                "Tipus_Equipament",
                "Nom_Equipament",
                "Latitud",
                "Longitud",
                "Codi_Barri",
                "Codi_Districte",
                "Id_Equipament",
                "Te_Subseus",
                "Id_Seu_Principal",
                "Es_subseu_de",
                "Es_seu_principal",
                "Nom_Districte",
                "Nom_Barri",
                "Notes_Equipament",
            ]
            
            properties = {
                'register_id': row.get('Id_Equipament'),
                'equipment_type': equipment_type
            }
            
            # Add any other properties that aren't in the excluded list
            for k, v in row.items():
                if k not in excluded_columns and v:
                    properties[k] = v
            
            # Create the point feature object
            point_feature = {
                "feature_definition_id": feature_def,
                "name": name,
                "latitude": lat,
                "longitude": lon,
                "geom": f"SRID=4326;POINT({lon} {lat})",  # Note: longitude first in WKT
                "geo_level_id": GEO_LEVELS["Neighbourhood"],
                "geo_id": neighborhood_code_int,
                "properties": properties
            }
            
            processed.append(point_feature)
            
        except Exception as e:
            warning(f"Error processing equipment record: {str(e)}")
            continue
    
    info(f"Processed {len(processed)} equipment records")
    return processed


# ===================
# Data Loading
# ===================

def load_csv_data(url: str, source_name: str) -> List[Dict]:
    """
    Load CSV data from a URL.
    
    Args:
        url: The URL to load data from
        source_name: The name of the source for logging purposes
        
    Returns:
        List of dictionaries containing the CSV data
    """
    info(f"Loading CSV data from {url}")
    
    # Get the processor configuration
    processor_config = FILE_PROCESSORS.get(source_name)
    if not processor_config:
        error(f"No processor configuration found for {source_name}")
        raise ValueError(f"No processor configuration found for {source_name}")
    
    # Download the content
    try:
        response = requests.get(url)
        response.raise_for_status()
        content = response.content
    except requests.exceptions.RequestException as e:
        error(f"Failed to download CSV from {url}: {str(e)}")
        raise
    
    # Try to read with the configured encoding and delimiter
    try:
        df = pd.read_csv(
            io.BytesIO(content),
            encoding=processor_config['encoding'],
            sep=processor_config['delimiter'],
            quoting=processor_config['quoting'],
            on_bad_lines='skip',
            dtype=str  # Read all columns as strings to avoid type inference issues
        )
        
        # Check if we got a valid dataframe with multiple columns
        if len(df.columns) > 1:
            info(f"Successfully loaded CSV with encoding={processor_config['encoding']}, delimiter={processor_config['delimiter']}")
            return df.to_dict('records')
        else:
            debug(f"CSV loaded but only got {len(df.columns)} columns with configured settings")
    except Exception as e:
        debug(f"Failed to load CSV with configured settings: {str(e)}")
    
    # If the configured settings failed, try other combinations
    encodings = ['utf-8-sig', 'utf-8', 'latin1', 'iso-8859-1']
    delimiters = [',', ';', '\t']
    
    for encoding in encodings:
        for delimiter in delimiters:
            if encoding == processor_config['encoding'] and delimiter == processor_config['delimiter']:
                continue  # Skip the combination we already tried
            
            try:
                df = pd.read_csv(
                    io.BytesIO(content),
                    encoding=encoding,
                    sep=delimiter,
                    quoting=processor_config['quoting'],
                    on_bad_lines='skip',
                    dtype=str
                )
                
                # Check if we got a valid dataframe with multiple columns
                if len(df.columns) > 1:
                    info(f"Successfully loaded CSV with encoding={encoding}, delimiter={delimiter}")
                    return df.to_dict('records')
                else:
                    debug(f"CSV loaded but only got {len(df.columns)} columns with encoding={encoding}, delimiter={delimiter}")
            except Exception as e:
                debug(f"Failed to load CSV with encoding={encoding}, delimiter={delimiter}: {str(e)}")
                continue
    
    # If pandas failed, try with Python's csv module
    for encoding in encodings:
        try:
            # Decode the content
            text_content = content.decode(encoding)
            
            # Try to detect the dialect
            dialect = csv.Sniffer().sniff(text_content[:1024])
            
            # Read the CSV
            reader = csv.DictReader(
                io.StringIO(text_content),
                dialect=dialect
            )
            
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
            continue
    
    # If all attempts failed, raise an error
    error_msg = f"Failed to parse CSV data from {source_name} with any combination of encoding and delimiter"
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
    info(f"Starting ETL process for Barcelona point features...")
    
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
    
    # Get Barcelona point features URLs
    bcn_point_features = manifest.get("barcelona", {}).get("point_features", {}).get("raw_file", {})
    
    if not bcn_point_features:
        error("No point feature URLs found in the manifest")
        return
    
    info(f"Found {len(bcn_point_features)} point feature sources to process")
    
    # Process each file
    all_processed_data = []
    
    for filename, url in bcn_point_features.items():
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
    
    parser = argparse.ArgumentParser(description="ETL script for loading Barcelona point features.")
    parser.add_argument("--manifest_path", type=str, default=str(BASE_DIR / "data/files_manifest.json"), 
                        help="Path to the files manifest JSON.")
    parser.add_argument("--output_path", type=str, default=str(DEFAULT_OUTPUT_PATH), 
                        help="Output path for the processed JSON file.")
    
    args = parser.parse_args()
    run(
        manifest_path=Path(args.manifest_path),
        output_path=Path(args.output_path)
    )