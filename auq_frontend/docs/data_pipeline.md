# # *Are U Query-ous?* — Frontend Data Pipeline Documentation

This document explains how data flows through the application, focusing on the integration between Supabase, the API layer, and the frontend components.

## Architecture Overview

The application uses a three-tier data architecture:

1. **Supabase Database** - Primary data source with PostGIS capabilities
2. **API Layer** - Service functions that abstract data access
3. **React Components** - UI layer that consumes and displays data

## Data Flow Diagram

```plaintext
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Supabase DB   │     │   API Service   │     │    Mock Data    │
│  (PostgreSQL)   │     │    Layer        │     │    Fallback     │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                       Data Adapters                             │
│                                                                 │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐     │
│  │ supabase-   │      │ api-        │      │ indicator-  │     │
│  │ client.ts   │      │ service.ts  │      │ service.ts  │     │
│  └─────────────┘      └─────────────┘      └─────────────┘     │
│                                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                       Context Providers                         │
│                                                                 │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐     │
│  │ MapContext  │      │ AuthContext │      │ ThemeContext│     │
│  └─────────────┘      └─────────────┘      └─────────────┘     │
│                                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                       React Components                          │
│                                                                 │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐     │
│  │ Map View    │      │ Visualize   │      │ Compare     │     │
│  │ Components  │      │ Components  │      │ Components  │     │
│  └─────────────┘      └─────────────┘      └─────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

The Supabase database includes the following key tables:

1. **cities** - List of cities with basic information
2. **geographical_levels** - Defines hierarchy levels (city, district, neighborhood)
3. **districts** - Districts within cities with polygon geometries
4. **neighbourhoods** - Neighborhoods within districts with polygon geometries
5. **indicator_definitions** - Metadata about indicators (population, income, etc.)
6. **indicators** - Actual indicator values for geographical entities
7. **feature_definitions** - Types of point features (museums, parks, etc.)
8. **point_features** - Points of interest on the map with coordinates and properties

## Data Access Patterns

### Supabase Client (supabase-client.ts)

The Supabase client provides direct access to the database with caching:

```typescript
// Create a singleton Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (!supabaseInstance && SUPABASE_URL && SUPABASE_KEY) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY)
    if (process.env.NODE_ENV === "development") {
      console.log("Supabase client initialized")
    }
  }
  return supabaseInstance
})()
```

Key functions include:

- `getCities()` - Retrieves all cities
- `getDistrictPolygons(cityId)` - Gets district polygons as GeoJSON
- `getNeighbourhoodPolygons(cityId)` - Gets neighborhood polygons as GeoJSON
- `getCityPointFeatures(cityId)` - Gets point features for a city
- `getIndicatorDefinitions()` - Gets metadata about indicators
- `getCityIndicators(cityId, level, year)` - Gets indicator values for a city

### API Service (api-service.ts)

The API service layer abstracts data access and provides a unified interface:

```typescript
export async function getCities(): Promise<City[]> {
  return getCachedData("cities", async () => {
    if (USE_SUPABASE) {
      return await getSupabaseCities()
    } else {
      return await fetchAPI("/api/cities")
    }
  })
}
```

This layer:

- Determines whether to use Supabase or external API based on configuration
- Implements caching for all data requests
- Handles error cases and provides fallbacks
- Transforms data into consistent formats

### Indicator Service (indicator-service.ts)

Specialized service for retrieving indicator values:

```typescript
export async function getIndicatorValue(areaId: number, indicatorId: number, level: string): Promise<number | null> {
  const cacheKey = `indicator_${areaId}_${indicatorId}_${level}`
  const cachedItem = indicatorCache.get(cacheKey)
  const now = Date.now()

  // Return cached data if it exists and is not expired
  if (cachedItem && now - cachedItem.timestamp < CACHE_TTL) {
    return cachedItem.data
  }

  // ... fetch logic ...
}
```

## Caching Mechanism

The application implements a multi-level caching strategy:

1. **Memory Cache** - In-memory caching for API and Supabase responses

   ```typescript
   const cache = new Map<string, { data: any; timestamp: number }>()
   const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
   ```

2. **Cache Invalidation** - Functions to clear specific cache entries

   ```typescript
   export function clearCacheEntry(key: string): void {
     cache.delete(key)
     if (process.env.NODE_ENV === "development") {
       console.log(`Cache cleared for ${key}`)
     }
   }
   ```

3. **Conditional Fetching** - Only fetch data when needed

   ```typescript
   if (geoJSONCache[cacheKey]) {
     console.log("Using GeoJSON data from cache:", cacheKey)
     setCurrentGeoJSON(geoJSONCache[cacheKey])
     // ...
     return
   }
   ```

## Map Context State Management

The MapContext manages the application state related to the map:

```typescript
export function MapProvider({ children }: { children: ReactNode }) {
  // State variables
  const [selectedCity, _setSelectedCity] = useState<City | null>(globalSelectedCity)
  const [selectedGranularity, _setSelectedGranularity] = useState<GranularityLevel | null>(globalSelectedGranularity)
  const [selectedArea, setSelectedArea] = useState<Area | null>(null)
  // ... more state variables ...

  // Functions to load data
  const loadGeoJSON = useCallback(async (cityId: number, granularityLevel: string) => {
    // ... implementation ...
  }, [dependencies])

  // ... more functions ...

  return (
    <MapContext.Provider value={{
      // Expose state and functions
    }}>
      {children}
    </MapContext.Provider>
  )
}
```

Key features:

- Global state persistence across page navigations
- Optimized loading with request tracking
- Automatic data loading when dependencies change
- Cache management for GeoJSON and point features

## Leaflet Map Integration

The Leaflet map component (`leaflet-map.jsx`) integrates with the data pipeline:

1. **Initialization**
   - Loads Leaflet from CDN
   - Creates map instance with appropriate configuration
   - Sets up layers for GeoJSON and markers

2. **GeoJSON Rendering**
   - Validates GeoJSON data before rendering
   - Applies styling based on selection state
   - Handles user interactions (click, hover)

3. **Point Features**
   - Renders point features as circle markers
   - Applies colors based on feature type
   - Creates interactive tooltips with feature information

4. **Event Handling**
   - Updates selected area in context when user clicks on a feature
   - Ensures markers stay on top of GeoJSON layers
   - Handles map type changes and view updates

## Error Handling and Fallbacks

The application implements robust error handling:

1. **Service Layer Errors**

   ```typescript
   try {
     return await getSupabaseCityPointFeatures(cityId)
   } catch (error) {
     console.warn(`Error fetching point features from Supabase for city ${cityId}:`, error)
     return [] // Return empty array instead of propagating the error
   }
   ```

2. **Component Level Errors**

   ```typescript
   if (isLoading) {
     return (
       <Card>
         <CardContent className="h-[400px] flex items-center justify-center">
           <div className="flex flex-col items-center gap-4">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
             <p className="text-muted-foreground">Loading data...</p>
           </div>
         </CardContent>
       </Card>
     )
   }
   ```

3. **Fallback Content**
   - Empty state displays when no data is available
   - Loading indicators during data fetching
   - Error messages when operations fail

## Configuration Options

The data pipeline can be configured through environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_USE_SUPABASE=true
```

Additional configuration in code:

```typescript
// Flag to determine whether to use Supabase or API
// Default to true for development, but respect the environment variable if set
const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE !== "false"
```

## Troubleshooting Common Issues

### 1. Missing or Incomplete Data

**Symptoms:**

- Empty areas in the map
- Missing indicators in charts
- "No data available" messages

**Solutions:**

- Check if the data exists in Supabase tables
- Verify that PostGIS extension is enabled
- Check for permission issues with the Supabase client
- Clear cache and reload the application

### 2. Performance Issues

**Symptoms:**

- Slow loading of map data
- Delayed rendering of point features
- UI freezes during data loading

**Solutions:**

- Check network requests in browser developer tools
- Verify that caching is working correctly
- Consider implementing pagination for large datasets
- Optimize GeoJSON data by simplifying geometries

### 3. Visualization Errors

**Symptoms:**

- Incorrect colors or styles on the map
- Misplaced markers or tooltips
- Charts showing incorrect values

**Solutions:**

- Verify data transformation in the service layer
- Check styling logic in the map component
- Ensure consistent data formats between API and Supabase
- Validate indicator calculations

## Data Flow Examples

### Example 1: Loading City Districts

1. User selects a city from the dropdown
2. `setSelectedCity` is called in MapContext
3. `loadGeoJSON` is triggered with city ID and granularity level
4. API service checks cache for existing data
5. If not in cache, Supabase client fetches district polygons
6. GeoJSON data is transformed and stored in context
7. Leaflet map renders the GeoJSON as interactive polygons

### Example 2: Displaying Point Features

1. MapComponent calls `getCityPointFeatures` with selected city ID
2. API service checks cache for point features
3. If not in cache, Supabase client fetches features from database
4. Features are filtered based on visible types from context
5. Leaflet map creates circle markers for each feature
6. Markers are styled based on feature type
7. Interactive tooltips are added to each marker

### Example 3: Comparing Areas

1. User selects two areas in the Compare view
2. Component fetches indicator data for both areas
3. Indicator service retrieves values from database or cache
4. Data is transformed into chart-friendly format
5. Charts render comparison between the two areas
6. Updates are reflected immediately in the UI
