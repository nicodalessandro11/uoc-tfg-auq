# Are U Query-ous? - API Documentation

## Overview

This document outlines the API endpoints required for the "Are U Query-ous?" geospatial data visualization platform. The platform allows users to explore, visualize, and compare urban data across different cities, districts, and neighborhoods.

## API Base URL example

<https://api.areuqueryous.com/v1>

## Authentication

All API requests require an API key to be included in the header:

```
Authorization: Bearer YOUR_API_KEY
```

## API Endpoints

### Cities

#### Get All Cities

Retrieves a list of all available cities.

- **URL**: `/api/cities`
- **Method**: `GET`
- **Response**:

  ```json
  [
    {
      "id": 1,
      "name": "Barcelona"
    },
    {
      "id": 2,
      "name": "Madrid"
    }
  ]
  ```

### Geographical Levels

#### Get All Geographical Levels

Retrieves available geographical levels (city, district, neighborhood).

- **URL**: `/api/geographical-levels`
- **Method**: `GET`
- **Response**:

  ```json
  [
    {
      "id": 1,
      "name": "City",
      "level": "city"
    },
    {
      "id": 2,
      "name": "Districts",
      "level": "district"
    },
    {
      "id": 3,
      "name": "Neighborhoods",
      "level": "neighborhood"
    }
  ]
  ```

### Districts

#### Get Districts by City

Retrieves all districts for a specific city.

- **URL**: `/api/cities/{cityId}/districts`
- **Method**: `GET`
- **URL Parameters**:
  - `cityId`: ID of the city
- **Response**:

  ```json
  [
    {
      "id": 1,
      "name": "Ciutat Vella",
      "district_code": 1,
      "city_id": 1,
      "population": 100000,
      "avg_income": 30000,
      "surface": 4.5,
      "disposable_income": 22000
    },
    {
      "id": 2,
      "name": "Eixample",
      "district_code": 2,
      "city_id": 1,
      "population": 200000,
      "avg_income": 40000,
      "surface": 7.5,
      "disposable_income": 28000
    }
  ]
  ```

### Neighborhoods

#### Get Neighborhoods by District

Retrieves all neighborhoods for a specific district.

- **URL**: `/api/districts/{districtId}/neighborhoods`
- **Method**: `GET`
- **URL Parameters**:
  - `districtId`: ID of the district
- **Response**:

  ```json
  [
    {
      "id": 101,
      "name": "El Raval",
      "neighbourhood_code": 1,
      "district_id": 1,
      "city_id": 1,
      "population": 50000,
      "avg_income": 25000,
      "surface": 1.1,
      "disposable_income": 18000
    },
    {
      "id": 102,
      "name": "Gothic Quarter",
      "neighbourhood_code": 2,
      "district_id": 1,
      "city_id": 1,
      "population": 50000,
      "avg_income": 35000,
      "surface": 0.8,
      "disposable_income": 24000
    }
  ]
  ```

### GeoJSON Data

#### Get GeoJSON for City

Retrieves GeoJSON data for a specific city at a specific granularity level.

- **URL**: `/api/cities/{cityId}/geojson`
- **Method**: `GET`
- **URL Parameters**:
  - `cityId`: ID of the city
- **Query Parameters**:
  - `level`: Granularity level (`district` or `neighborhood`)
- **Response**: GeoJSON FeatureCollection with properties for each area

Example response for districts:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": 1,
        "name": "Ciutat Vella",
        "district_code": 1,
        "city_id": 1,
        "population": 100000,
        "avg_income": 30000,
        "surface": 4.5,
        "disposable_income": 22000,
        "level": "district",
        "index": 0
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [2.14, 41.37],
            [2.16, 41.37],
            [2.16, 41.39],
            [2.14, 41.39],
            [2.14, 41.37]
          ]
        ]
      }
    }
  ]
}
```

### Indicators

#### Get Indicator Definitions

Retrieves definitions for all available indicators.

- **URL**: `/api/indicator-definitions`
- **Method**: `GET`
- **Response**:

  ```json
  [
    {
      "id": 1,
      "name": "Population",
      "unit": "people",
      "description": "Total number of residents",
      "category": "demographics"
    },
    {
      "id": 2,
      "name": "Surface",
      "unit": "km²",
      "description": "Area in square kilometers",
      "category": "geography"
    }
  ]
  ```

#### Get Indicators for Specific Area

Retrieves indicator values for a specific geographical entity.

- **URL**: `/api/indicators`
- **Method**: `GET`
- **Query Parameters**:
  - `geoLevelId`: ID of the geographical level (2 for district, 3 for neighborhood)
  - `geoId`: ID of the geographical entity
  - `year`: Year for the data (e.g., 2023)
- **Response**:

  ```json
  [
    {
      "id": 1,
      "indicator_def_id": 1,
      "geo_level_id": 2,
      "geo_id": 1,
      "year": 2023,
      "value": 100000
    },
    {
      "id": 2,
      "indicator_def_id": 2,
      "geo_level_id": 2,
      "geo_id": 1,
      "year": 2023,
      "value": 4.5
    }
  ]
  ```

#### Get Indicators for City

Retrieves indicator values for all areas in a city at a specific granularity level.

- **URL**: `/api/cities/{cityId}/indicators`
- **Method**: `GET`
- **URL Parameters**:
  - `cityId`: ID of the city
- **Query Parameters**:
  - `level`: Granularity level (`district` or `neighborhood`)
  - `year`: Year for the data (e.g., 2023)
- **Response**:

  ```json
  [
    {
      "id": 101,
      "indicator_def_id": 1,
      "geo_level_id": 2,
      "geo_id": 1,
      "year": 2023,
      "value": 100000
    },
    {
      "id": 102,
      "indicator_def_id": 3,
      "geo_level_id": 2,
      "geo_id": 1,
      "year": 2023,
      "value": 30000
    }
  ]
  ```

### Point Features

#### Get Feature Definitions

Retrieves definitions for all types of point features.

- **URL**: `/api/feature-definitions`
- **Method**: `GET`
- **Response**:

  ```json
  [
    {
      "id": 1,
      "name": "museum",
      "description": "Museums and art galleries"
    },
    {
      "id": 2,
      "name": "heritage_space",
      "description": "Historical and heritage sites"
    }
  ]
  ```

#### Get Point Features for City

Retrieves all point features for a specific city.

- **URL**: `/api/cities/{cityId}/point-features`
- **Method**: `GET`
- **URL Parameters**:
  - `cityId`: ID of the city
- **Response**:

  ```json
  [
    {
      "id": 1,
      "feature_definition_id": 1,
      "name": "Museu Picasso",
      "latitude": 41.385,
      "longitude": 2.181,
      "geo_level_id": 2,
      "geo_id": 1,
      "properties": {
        "exhibitions": 12,
        "address": "Carrer Montcada, 15-23",
        "website": "www.museupicasso.bcn.cat",
        "phone": "+34 932 56 30 00"
      }
    }
  ]
  ```

#### Get Point Features for Specific Area

Retrieves point features for a specific geographical entity.

- **URL**: `/api/point-features`
- **Method**: `GET`
- **Query Parameters**:
  - `geoLevelId`: ID of the geographical level (2 for district, 3 for neighborhood)
  - `geoId`: ID of the geographical entity
- **Response**:

  ```json
  [
    {
      "id": 1,
      "feature_definition_id": 1,
      "name": "Museu Picasso",
      "latitude": 41.385,
      "longitude": 2.181,
      "geo_level_id": 2,
      "geo_id": 1,
      "properties": {
        "exhibitions": 12,
        "address": "Carrer Montcada, 15-23",
        "website": "www.museupicasso.bcn.cat",
        "phone": "+34 932 56 30 00"
      }
    }
  ]
  ```

### Comparison

#### Compare Areas

Compares indicators between two areas in a city.

- **URL**: `/api/cities/{cityId}/compare`
- **Method**: `GET`
- **URL Parameters**:
  - `cityId`: ID of the city
- **Query Parameters**:
  - `level`: Granularity level (`district` or `neighborhood`)
  - `area1`: ID of the first area
  - `area2`: ID of the second area
  - `year`: Year for the data (e.g., 2023)
- **Response**:

  ```json
  {
    "area1": {
      "id": 1,
      "name": "Ciutat Vella",
      "indicators": [
        {
          "id": 1,
          "name": "Population",
          "value": 100000,
          "unit": "people"
        },
        {
          "id": 2,
          "name": "Surface",
          "value": 4.5,
          "unit": "km²"
        }
      ]
    },
    "area2": {
      "id": 2,
      "name": "Eixample",
      "indicators": [
        {
          "id": 1,
          "name": "Population",
          "value": 200000,
          "unit": "people"
        },
        {
          "id": 2,
          "name": "Surface",
          "value": 7.5,
          "unit": "km²"
        }
      ]
    }
  }
  ```

### Filtering

#### Filter Areas

Filters areas in a city based on criteria.

- **URL**: `/api/cities/{cityId}/filter`
- **Method**: `GET`
- **URL Parameters**:
  - `cityId`: ID of the city
- **Query Parameters**:
  - `level`: Granularity level (`district` or `neighborhood`)
  - `minPopulation`: Minimum population
  - `maxPopulation`: Maximum population
  - `minIncome`: Minimum average income
  - `maxIncome`: Maximum average income
  - `minSurface`: Minimum surface area
  - `maxSurface`: Maximum surface area
  - `minDisposableIncome`: Minimum disposable income
  - `maxDisposableIncome`: Maximum disposable income
- **Response**:

  ```json
  [
    {
      "id": 1,
      "name": "Ciutat Vella",
      "district_code": 1,
      "city_id": 1,
      "population": 100000,
      "avg_income": 30000,
      "surface": 4.5,
      "disposable_income": 22000
    },
    {
      "id": 3,
      "name": "Sants-Montjuïc",
      "district_code": 3,
      "city_id": 1,
      "population": 150000,
      "avg_income": 35000,
      "surface": 8.2,
      "disposable_income": 25000
    }
  ]
  ```

## Implementation Guidelines

### Database Schema

The API should be backed by a database with the following core tables:

1. `cities` - Stores city information
2. `geographical_levels` - Defines the available granularity levels
3. `districts` - Stores district information
4. `neighborhoods` - Stores neighborhood information
5. `indicator_definitions` - Defines the available indicators
6. `indicators` - Stores indicator values for geographical entities
7. `feature_definitions` - Defines the available point feature types
8. `point_features` - Stores point feature information

### Geospatial Support

The API should use a database with geospatial support (e.g., PostgreSQL with PostGIS) to efficiently store and query geographical data.

### Caching Strategy

Implement caching for frequently accessed data, especially GeoJSON responses which can be large:

1. Use Redis or a similar in-memory cache
2. Set appropriate cache expiration times
3. Implement cache invalidation when data is updated

### Error Handling

All endpoints should return appropriate HTTP status codes:

- 200: Success
- 400: Bad Request (invalid parameters)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error

Error responses should follow this format:

```json
{
  "error": true,
  "message": "Descriptive error message",
  "code": "ERROR_CODE"
}
```

### Rate Limiting

Implement rate limiting to prevent abuse:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1619380800
```

### Versioning

The API uses versioning in the URL path (`/v1`) to allow for future changes without breaking existing clients.

## Testing

Each endpoint should have comprehensive tests covering:

1. Happy path scenarios
2. Error cases
3. Edge cases (empty results, maximum values, etc.)
4. Performance under load

## Deployment

The API should be deployed with:

1. HTTPS encryption
2. Load balancing for high availability
3. Monitoring and logging
4. Automated scaling based on demand
