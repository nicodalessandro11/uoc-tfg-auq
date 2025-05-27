import { createClient } from "@supabase/supabase-js"
import type {
  City,
  District,
  Neighborhood,
  IndicatorDefinition,
  FeatureDefinition,
  PointFeature,
  Indicator,
  GeoJSONResponse,
  GeoJSONFeature,
} from "./api-types"

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === "true" || true // Default to true for development

// Create a singleton Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (!supabaseInstance && SUPABASE_URL && SUPABASE_KEY) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY)
    console.log("Supabase client initialized")
  }
  return supabaseInstance
})()

// Simple cache implementation
const cache = new Map<string, { data: any; timestamp: number }>()

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000

/**
 * Get data from cache or fetch it
 */
async function getCachedData<T>(cacheKey: string, fetchFn: () => Promise<T>, ttl: number = CACHE_TTL): Promise<T> {
  const cachedItem = cache.get(cacheKey)
  const now = Date.now()

  // Return cached data if it exists and is not expired
  if (cachedItem && now - cachedItem.timestamp < ttl) {
    // console.log(`Using cached data for ${cacheKey}`)
    return cachedItem.data as T
  }

  // Fetch fresh data
  const data = await fetchFn()

  // Cache the result
  cache.set(cacheKey, { data, timestamp: now })

  return data
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  cache.clear()
  // console.log("Cache cleared")
}

/**
 * Clear specific cache entry
 */
export function clearCacheEntry(key: string): void {
  cache.delete(key)
  // console.log(`Cache cleared for ${key}`)
}

/**
 * Get all cities
 */
export async function getCities(): Promise<City[]> {
  if (!USE_SUPABASE || !supabase) {
    throw new Error("Supabase client not available or disabled")
  }

  return getCachedData("cities", async () => {
    const { data, error } = await supabase.from("cities").select("*").order("id")

    if (error) {
      throw new Error(`Error fetching cities: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error("No cities found")
    }

    return data
  })
}

/**
 * Get district polygons as GeoJSON for a city
 */
export async function getDistrictPolygons(cityId: number): Promise<GeoJSONResponse> {
  if (!USE_SUPABASE || !supabase) {
    throw new Error("Supabase client not available or disabled")
  }

  return getCachedData(`district_polygons_${cityId}`, async () => {
    const { data, error } = await supabase.from("district_polygons_view").select("*").eq("city_id", cityId)

    if (error) {
      throw new Error(`Error fetching district polygons: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error(`No district polygons found for city ${cityId}`)
    }

    // Transform to GeoJSON
    const features: GeoJSONFeature[] = data.map((district, index) => ({
      type: "Feature",
      properties: {
        id: district.id,
        name: district.name,
        district_code: district.district_code,
        city_id: district.city_id,
        level: "district",
        index,
      },
      geometry: district.geometry,
    }))

    return {
      type: "FeatureCollection",
      features,
    }
  })
}

/**
 * Get neighborhood polygons as GeoJSON for a city
 */
export async function getNeighbourhoodPolygons(cityId: number): Promise<GeoJSONResponse> {
  if (!USE_SUPABASE || !supabase) {
    throw new Error("Supabase client not available or disabled")
  }

  return getCachedData(`neighborhood_polygons_${cityId}`, async () => {
    const { data, error } = await supabase.from("neighborhood_polygons_view").select("*").eq("city_id", cityId)

    if (error) {
      throw new Error(`Error fetching neighborhood polygons: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error(`No neighborhood polygons found for city ${cityId}`)
    }

    // Transform to GeoJSON
    const features: GeoJSONFeature[] = data.map((neighborhood, index) => ({
      type: "Feature",
      properties: {
        id: neighborhood.id,
        name: neighborhood.name,
        neighbourhood_code: neighborhood.neighbourhood_code,
        district_id: neighborhood.district_id,
        city_id: neighborhood.city_id,
        level: "neighborhood",
        index,
      },
      geometry: neighborhood.geometry,
    }))

    return {
      type: "FeatureCollection",
      features,
    }
  })
}

export const getNeighborhoodPolygons = getNeighbourhoodPolygons

/**
 * Get geographical units for a city at a specific level
 */
export async function getGeographicalUnits(cityId: number, level: string): Promise<any[]> {
  if (!USE_SUPABASE || !supabase) {
    throw new Error("Supabase client not available or disabled")
  }

  const geoLevelId = level === "district" ? 2 : level === "neighborhood" ? 3 : null

  if (geoLevelId === null) {
    throw new Error(`Invalid geographical level: ${level}`)
  }

  return getCachedData(`geo_units_${cityId}_${level}`, async () => {
    const { data, error } = await supabase
      .from("geographical_unit_view")
      .select("*")
      .eq("city_id", cityId)
      .eq("geo_level_id", geoLevelId)

    if (error) {
      throw new Error(`Error fetching geographical units: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error(`No geographical units found for city ${cityId} at level ${level}`)
    }

    return data
  })
}

/**
 * Get districts for a city
 */
export async function getDistricts(cityId: number): Promise<District[]> {
  if (!USE_SUPABASE || !supabase) {
    throw new Error("Supabase client not available or disabled")
  }

  return getCachedData(`districts_${cityId}`, async () => {
    const { data, error } = await supabase.from("districts").select("*").eq("city_id", cityId).order("id")

    if (error) {
      throw new Error(`Error fetching districts: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error(`No districts found for city ${cityId}`)
    }

    return data
  })
}

/**
 * Get neighborhoods for a district
 */
export async function getNeighborhoods(districtId: number): Promise<Neighborhood[]> {
  if (!USE_SUPABASE || !supabase) {
    throw new Error("Supabase client not available or disabled")
  }

  return getCachedData(`neighborhoods_${districtId}`, async () => {
    const { data, error } = await supabase.from("neighbourhoods").select("*").eq("district_id", districtId).order("id")

    if (error) {
      throw new Error(`Error fetching neighborhoods: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error(`No neighborhoods found for district ${districtId}`)
    }

    return data
  })
}

/**
 * Get feature definitions
 */
export async function getFeatureDefinitions(): Promise<FeatureDefinition[]> {
  if (!USE_SUPABASE || !supabase) {
    throw new Error("Supabase client not available or disabled")
  }

  return getCachedData("feature_definitions", async () => {
    const { data, error } = await supabase.from("feature_definitions").select("*").order("id")

    if (error) {
      throw new Error(`Error fetching feature definitions: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error("No feature definitions found")
    }

    return data
  })
}

/**
 * Get point features for a city
 */
export async function getCityPointFeatures(cityId: number): Promise<PointFeature[]> {
  if (!USE_SUPABASE || !supabase) {
    throw new Error("Supabase client not available or disabled")
  }

  return getCachedData(`point_features_${cityId}`, async () => {
    // console.log(`[Supabase] Fetching point features for city ID: ${cityId}`)

    // Primero obtenemos los feature definitions
    const { data: featureDefinitions, error: featureError } = await supabase
      .from("feature_definitions")
      .select("id, name")

    if (featureError) {
      // console.error(`[Supabase] Error fetching feature definitions: ${featureError.message}`)
      throw new Error(`Error fetching feature definitions: ${featureError.message}`)
    }

    // Creamos un mapa de IDs a nombres
    const featureTypeMap = Object.fromEntries(
      (featureDefinitions as { id: number; name: string }[]).map(def => [
        def.id,
        def.name.toLowerCase().replace(/\s+/g, "_")
      ])
    )

    // console.log(`[Supabase] Feature type map created with ${Object.keys(featureTypeMap).length} types`)

    // Ahora obtenemos los point features
    const { data, error } = await supabase
      .from("point_features")
      .select("*")
      .eq("city_id", cityId)
      .limit(10000)

    if (error) {
      // console.error(`[Supabase] Error fetching point features: ${error.message}`)
      throw new Error(`Error fetching point features: ${error.message}`)
    }

    if (!data || data.length === 0) {
      // console.error(`[Supabase] No point features found for city ${cityId}`)
      throw new Error(`No point features found for city ${cityId}`)
    }

    // console.log(`[Supabase] Total point features fetched from database: ${data.length}`)

    // Mapeamos los tipos usando el mapa de IDs a nombres
    const mappedData = (data as PointFeature[])
      .map((feature) => {
        const typeString = featureTypeMap[feature.feature_definition_id]
        if (!typeString) {
          // console.warn(`[Supabase] No feature type found for feature ID ${feature.id} with definition_id ${feature.feature_definition_id}`)
          return null
        }
        return {
          ...feature,
          featureType: typeString,
          geoId: feature.geo_id,
          city_id: cityId,
        }
      })
      .filter((feature): feature is PointFeature => feature !== null)

    // console.log(`[Supabase] Total point features after mapping: ${mappedData.length}`)
    // console.log(`[Supabase] Feature types distribution:`, 
    //   Object.entries(
    //     mappedData.reduce<Record<string, number>>((acc, f) => {
    //       acc[f.featureType] = (acc[f.featureType] || 0) + 1
    //       return acc
    //     }, {})
    //   )
    // )

    return mappedData
  })
}

/**
 * Get indicator definitions
 */
export async function getIndicatorDefinitions(): Promise<IndicatorDefinition[]> {
  if (!USE_SUPABASE || !supabase) {
    throw new Error("Supabase client not available or disabled")
  }

  return getCachedData("indicator_definitions", async () => {
    const { data, error } = await supabase.from("indicator_definitions").select("*").order("id")

    if (error) {
      throw new Error(`Error fetching indicator definitions: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error("No indicator definitions found")
    }

    return data
  })
}

/**
 * Get city indicators at a specific level
 */
export async function getCityIndicators(cityId: number, level: string, year?: number): Promise<Indicator[]> {
  if (!USE_SUPABASE || !supabase) {
    throw new Error("Supabase client not available or disabled")
  }

  const geoLevelId = level === "district" ? 2 : level === "neighborhood" || level === "neighbourhood" ? 3 : level === "city" ? 1 : null

  if (geoLevelId === null) {
    throw new Error(`Invalid geographical level: ${level}`)
  }

  // Get disabled indicators from localStorage
  const disabledIndicators = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('disabledIndicators') || '[]') 
    : []

  return getCachedData(`indicators_${cityId}_${level}_${year || "latest"}`, async () => {
    try {
      // First get the indicator definitions to map names to IDs
      const { data: indicatorDefs, error: defError } = await supabase
        .from("indicator_definitions")
        .select("id, name")
        .in("name", disabledIndicators)

      if (defError) {
        throw new Error(`Error fetching indicator definitions: ${defError.message}`)
      }

      const disabledIds = indicatorDefs?.map(def => def.id) || []

      let query = supabase
        .from("current_indicators_view")
        .select("*")
        .eq("city_id", cityId)
        .eq("geo_level_id", geoLevelId)

      // If there are disabled indicators, filter them out by their IDs
      if (disabledIds.length > 0) {
        query = query.not('indicator_def_id', 'in', `(${disabledIds.join(',')})`)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Error fetching indicators: ${error.message}`)
      }

      if (!data || data.length === 0) {
        return []
      }

      return data.map(item => ({
        id: Number(item.id) || 0,
        indicator_def_id: Number(item.indicator_def_id),
        geo_level_id: Number(item.geo_level_id),
        geo_id: Number(item.geo_id),
        year: Number(item.year),
        value: Number(item.value),
        created_at: item.created_at
      }))
    } catch (error) {
      throw error
    }
  })
}

/**
 * Check if PostGIS is available
 */
export async function checkPostGISAvailability(): Promise<boolean> {
  if (!USE_SUPABASE || !supabase) {
    return false
  }

  try {
    const { data, error } = await supabase.rpc("postgis_version")
    return !error && !!data
  } catch (error) {
    return false
  }
}

/**
 * Get geographical levels
 */
export async function getGeographicalLevels(): Promise<any[]> {
  if (!USE_SUPABASE || !supabase) {
    throw new Error("Supabase client not available or disabled")
  }

  return getCachedData("geographical_levels", async () => {
    const { data, error } = await supabase.from("geographical_levels").select("*").order("id")

    if (error) {
      throw new Error(`Error fetching geographical levels: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error("No geographical levels found")
    }

    // Transform to expected format
    return data.map((level) => ({
      id: level.id,
      name: level.name,
      level: level.name.toLowerCase(),
    }))
  })
}

// Cache for indicator values
const indicatorCache = new Map<string, { data: number; timestamp: number }>()

/**
 * Get indicator value for a specific area and indicator
 */
export async function getIndicatorValue(areaId: number, indicatorId: number, level: string): Promise<number | null> {
  const cacheKey = `indicator_${areaId}_${indicatorId}_${level}`
  const cachedItem = indicatorCache.get(cacheKey)
  const now = Date.now()

  // Return cached data if it exists and is not expired
  if (cachedItem && now - cachedItem.timestamp < CACHE_TTL) {
    return cachedItem.data
  }

  if (!supabase) {
    // console.error("Supabase client not available")
    return null
  }

  try {
    // Convert level to geo_level_id
    const geoLevelId = level === "district" ? 2 : level === "neighborhood" || level === "neighbourhood" ? 3 : level === "city" ? 1 : null

    if (geoLevelId === null) {
      throw new Error(`Invalid geographical level: ${level}`)
    }

    // Get indicator value from the view, using the appropriate geo_level_id
    const { data, error } = await supabase
      .from("current_indicators_view")
      .select("value, year")
      .eq("indicator_def_id", indicatorId)
      .eq("geo_level_id", geoLevelId)
      .eq("geo_id", areaId)
      .order("year", { ascending: false })
      .limit(1)

    if (error) {
      // console.error(`Error fetching indicator value: ${error.message}`)
      return null
    }

    if (!data || data.length === 0) {
      return null // Return null without logging error for missing indicators
    }

    // Get the first (and should be only) result
    const value = data[0].value

    // Cache the result
    indicatorCache.set(cacheKey, { data: value, timestamp: now })
    return value
  } catch (error) {
    // console.error(`Error getting indicator value: ${error}`)
    return null
  }
}

/**
 * Clear indicator cache
 */
export function clearIndicatorCache(): void {
  indicatorCache.clear()
}

/**
 * Get enriched GeoJSON (polygons + indicators) for a city and level
 */
export async function getEnrichedGeoJSON(cityId: number, level: string): Promise<any> {
  if (!USE_SUPABASE || !supabase) {
    throw new Error("Supabase client not available or disabled")
  }

  // Get disabled indicators from localStorage
  const disabledIndicators = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('disabledIndicators') || '[]') 
    : []

  const cacheKey = `enriched_geojson_${cityId}_${level}`
  return getCachedData(cacheKey, async () => {
    // Build the SQL query string
    let sql = ''
    const disabledIndicatorsFilter = disabledIndicators.length > 0 
      ? `AND civ.indicator_name NOT IN (${disabledIndicators.map(name => `'${name}'`).join(',')})`
      : ''

    if (level === 'district') {
      sql = `
        SELECT jsonb_build_object(
          'type', 'FeatureCollection',
          'features', jsonb_agg(
            jsonb_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(d.geom)::jsonb,
              'properties', jsonb_build_object(
                'id', d.id,
                'name', d.name,
                'district_code', d.district_code,
                'city_id', d.city_id
              ) || (
                SELECT jsonb_object_agg(ind.indicator_name, ind.value)
                FROM (
                  SELECT civ.indicator_name, civ.value
                  FROM current_indicators_view civ
                  WHERE civ.geo_level_id = 2
                    AND civ.city_id = d.city_id
                    AND civ.geo_id = d.id
                    ${disabledIndicatorsFilter}
                ) ind
              )
            )
          )
        ) AS geojson
        FROM districts d
        WHERE d.city_id = ${cityId}
      `
    } else if (level === 'neighborhood' || level === 'neighbourhood') {
      sql = `
        SELECT jsonb_build_object(
          'type', 'FeatureCollection',
          'features', jsonb_agg(
            jsonb_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(n.geom)::jsonb,
              'properties', jsonb_build_object(
                'id', n.id,
                'name', n.name,
                'neighbourhood_code', n.neighbourhood_code,
                'district_id', n.district_id,
                'city_id', n.city_id
              ) || (
                SELECT jsonb_object_agg(ind.indicator_name, ind.value)
                FROM (
                  SELECT civ.indicator_name, civ.value
                  FROM current_indicators_view civ
                  WHERE civ.geo_level_id = 3
                    AND civ.city_id = n.city_id
                    AND civ.geo_id = n.id
                    ${disabledIndicatorsFilter}
                ) ind
              )
            )
          )
        ) AS geojson
        FROM neighbourhoods n
        WHERE n.city_id = ${cityId}
      `
    } else {
      throw new Error(`Unsupported level: ${level}`)
    }

    // Call the execute_sql function via Supabase RPC
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql })
    if (error) {
      throw new Error(`Error fetching enriched GeoJSON: ${error.message}`)
    }
    const geojson = data && data[0] && data[0].geojson ? data[0].geojson : null
    if (!geojson) {
      throw new Error('No enriched GeoJSON returned from database')
    }
    return geojson
  })
}

export async function fetchIndicators(cityId: number, level: string): Promise<Indicator[]> {
  // console.log(`Fetching indicators for city ${cityId}, level ${level} (geo_level_id: ${getGeoLevelId(level)})`)

  // Try to get indicators from cache first
  const cacheKey = `indicators_${cityId}_${level}`
  const cachedData = getCachedData(cacheKey)
  if (cachedData) {
    // console.log("Using cached indicators data")
    return cachedData
  }

  // If not in cache, fetch from Supabase
  const { data, error } = await supabase
    .from("current_indicators_view")
    .select("*")
    .eq("city_id", cityId)
    .eq("geo_level_id", getGeoLevelId(level))

  if (error) {
    // console.error("Error fetching indicators:", error)
    throw error
  }

  // console.log("Fetched indicators:", data)

  // Transform the data to match the Indicator type
  const transformedData = data.map((item: any) => ({
    id: item.id,
    geoId: item.geo_id,
    geoLevelId: item.geo_level_id,
    cityId: item.city_id,
    indicatorName: item.indicator_name,
    value: item.value,
    year: item.year,
    source: item.source,
    description: item.description,
  }))

  // console.log("Transformed indicators:", transformedData)

  // Cache the transformed data
  setCachedData(cacheKey, transformedData)

  return transformedData
}

/**
 * Insert a user event (for analytics)
 */
export async function insertUserEvent(event: { user_id: string; event_type: string; event_details?: any }): Promise<void> {
  if (!USE_SUPABASE || !supabase) throw new Error("Supabase client not available or disabled")
  const { error } = await supabase.from("user_events").insert([event])
  if (error) throw new Error(`Error inserting user event: ${error.message}`)
}

/**
 * Get user events (optionally filter by user_id, event_type, limit)
 */
export async function getUserEvents({ user_id, event_type, limit = 100 }: { user_id?: string; event_type?: string; limit?: number }): Promise<any[]> {
  if (!USE_SUPABASE || !supabase) throw new Error("Supabase client not available or disabled")
  let query = supabase.from("user_events").select("*")
  if (user_id) query = query.eq("user_id", user_id)
  if (event_type) query = query.eq("event_type", event_type)
  if (limit) query = query.limit(limit)
  const { data, error } = await query.order("created_at", { ascending: false })
  if (error) throw new Error(`Error fetching user events: ${error.message}`)
  return data || []
}

/**
 * Get user config by user_id
 */
export async function getUserConfig(user_id: string): Promise<any | null> {
  if (!USE_SUPABASE || !supabase) throw new Error("Supabase client not available or disabled")
  const { data, error } = await supabase.from("user_config").select("*").eq("user_id", user_id).single()
  if (error && error.code !== 'PGRST116') throw new Error(`Error fetching user config: ${error.message}`)
  return data || null
}

/**
 * Upsert user config (by user_id)
 */
export async function upsertUserConfig(config: { user_id: string; custom_features?: any; custom_indicators?: any; other_prefs?: any }): Promise<void> {
  if (!USE_SUPABASE || !supabase) throw new Error("Supabase client not available or disabled")
  const { error } = await supabase.from("user_config").upsert([config], { onConflict: "user_id" })
  if (error) throw new Error(`Error upserting user config: ${error.message}`)
}

/**
 * Get profile by user_id
 */
export async function getProfile(user_id: string): Promise<any | null> {
  if (!USE_SUPABASE || !supabase) throw new Error("Supabase client not available or disabled")
  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user_id).single()
  if (error && error.code !== 'PGRST116') throw new Error(`Error fetching profile: ${error.message}`)
  return data || null
}

/**
 * Upsert profile (by user_id)
 */
export async function upsertProfile(profile: { user_id: string; is_admin?: boolean; display_name?: string }): Promise<void> {
  if (!USE_SUPABASE || !supabase) throw new Error("Supabase client not available or disabled")
  const { error } = await supabase.from("profiles").upsert([profile], { onConflict: "user_id" })
  if (error) throw new Error(`Error upserting profile: ${error.message}`)
}

/**
 * Get user profile by user_id (from 'profiles' table)
 */
export async function getUserProfile(user_id: string): Promise<{ display_name?: string; is_admin?: boolean } | null> {
  if (!USE_SUPABASE || !supabase) throw new Error("Supabase client not available or disabled")
  console.log("[getUserProfile] CONSULTING profiles with user_id:", user_id)
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, is_admin")
    .eq("user_id", user_id)
    .single()
  console.log("[getUserProfile] RESULT for user_id:", user_id, "data:", data, "error:", error)
  if (error && error.code !== 'PGRST116') throw new Error(`Error fetching user profile: ${error.message}`)
  if (!data) return null
  return {
    display_name: typeof data.display_name === "string" ? data.display_name : undefined,
    is_admin: typeof data.is_admin === "boolean" ? data.is_admin : undefined,
  }
}
