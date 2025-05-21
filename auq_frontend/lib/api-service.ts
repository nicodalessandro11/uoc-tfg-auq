import { fetchAPI, buildEndpoint } from "./api-utils"
import type {
  City,
  GranularityLevel,
  District,
  Neighborhood,
  IndicatorDefinition,
  Indicator,
  FeatureDefinition,
  PointFeature,
  GeoJSONResponse,
} from "./api-types"

// Import Supabase functions
import {
  getCities as getSupabaseCities,
  getDistricts as getSupabaseDistricts,
  getNeighborhoods as getSupabaseNeighborhoods,
  getDistrictPolygons,
  getNeighborhoodPolygons,
  getCityPointFeatures as getSupabaseCityPointFeatures,
  getFeatureDefinitions as getSupabaseFeatureDefinitions,
  getIndicatorDefinitions as getSupabaseIndicatorDefinitions,
  getCityIndicators as getSupabaseCityIndicators,
  getGeographicalLevels as getSupabaseGeographicalLevels,
  getGeographicalUnits as getSupabaseGeographicalUnits,
  getEnrichedGeoJSON,
} from "./supabase-client"

// Flag to determine whether to use Supabase or API
// Default to true for development, but respect the environment variable if set
const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE !== "false"

// Cache for API responses
const apiCache = new Map<string, { data: any; timestamp: number }>()

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000

/**
 * Get data from cache or fetch it
 */
async function getCachedData<T>(cacheKey: string, fetchFn: () => Promise<T>, ttl: number = CACHE_TTL): Promise<T> {
  const cachedItem = apiCache.get(cacheKey)
  const now = Date.now()

  // Return cached data if it exists and is not expired
  if (cachedItem && now - cachedItem.timestamp < ttl) {
    if (process.env.NODE_ENV === "development") {
      console.log(`Using cached API data for ${cacheKey}`)
    }
    return cachedItem.data as T
  }

  // Fetch fresh data
  const data = await fetchFn()

  // Cache the result
  apiCache.set(cacheKey, { data, timestamp: now })

  return data
}

/**
 * Get all cities
 */
export async function getCities(): Promise<City[]> {
  return getCachedData("cities", async () => {
    if (USE_SUPABASE) {
      return await getSupabaseCities()
    } else {
      return await fetchAPI("/api/cities")
    }
  })
}

/**
 * Get all geographical levels
 */
export async function getGeographicalLevels(): Promise<GranularityLevel[]> {
  return getCachedData("geographical_levels", async () => {
    if (USE_SUPABASE) {
      return await getSupabaseGeographicalLevels()
    } else {
      return await fetchAPI("/api/geographical-levels")
    }
  })
}

/**
 * Get districts for a city
 */
export async function getDistricts(cityId: number): Promise<District[]> {
  return getCachedData(`districts_${cityId}`, async () => {
    if (USE_SUPABASE) {
      return await getSupabaseDistricts(cityId)
    } else {
      return await fetchAPI(`/api/cities/${cityId}/districts`)
    }
  })
}

/**
 * Get neighborhoods for a district
 */
export async function getNeighborhoods(districtId: number): Promise<Neighborhood[]> {
  return getCachedData(`neighborhoods_${districtId}`, async () => {
    if (USE_SUPABASE) {
      return await getSupabaseNeighborhoods(districtId)
    } else {
      return await fetchAPI(`/api/districts/${districtId}/neighborhoods`)
    }
  })
}

/**
 * Get geographical units for a city at a specific level
 */
export async function getGeographicalUnits(cityId: number, level: string): Promise<any[]> {
  return getCachedData(`geo_units_${cityId}_${level}`, async () => {
    if (USE_SUPABASE) {
      return await getSupabaseGeographicalUnits(cityId, level)
    } else {
      return await fetchAPI(`/api/cities/${cityId}/geo-units?level=${level}`)
    }
  })
}

/**
 * Get GeoJSON data for a city at a specific level
 */
export async function getGeoJSON(cityId: number, level: string): Promise<GeoJSONResponse> {
  return getEnrichedGeoJSON(cityId, level)
}

/**
 * Get feature definitions
 */
export async function getFeatureDefinitions(): Promise<FeatureDefinition[]> {
  return getCachedData("feature_definitions", async () => {
    if (USE_SUPABASE) {
      return await getSupabaseFeatureDefinitions()
    } else {
      return await fetchAPI("/api/feature-definitions")
    }
  })
}

/**
 * Get indicator definitions
 */
export async function getIndicatorDefinitions(): Promise<IndicatorDefinition[]> {
  return getCachedData("indicator_definitions", async () => {
    if (USE_SUPABASE) {
      return await getSupabaseIndicatorDefinitions()
    } else {
      return await fetchAPI("/api/indicator-definitions")
    }
  })
}

/**
 * Get point features for a city
 */
export async function getCityPointFeatures(cityId: number): Promise<PointFeature[]> {
  return getCachedData(`point_features_${cityId}`, async () => {
    if (USE_SUPABASE) {
      return await getSupabaseCityPointFeatures(cityId)
    } else {
      return await fetchAPI(`/api/cities/${cityId}/point-features`)
    }
  })
}

/**
 * Get indicators for a city at a specific granularity level
 */
export async function getCityIndicators(cityId: number, level: string, year?: number): Promise<Indicator[]> {
  return getCachedData(`indicators_${cityId}_${level}_${year || "latest"}`, async () => {
    if (USE_SUPABASE) {
      return await getSupabaseCityIndicators(cityId, level, year)
    } else {
      const endpoint = buildEndpoint(`/api/cities/${cityId}/indicators`, {
        level,
        year: year ? year.toString() : undefined,
      })
      return await fetchAPI(endpoint)
    }
  })
}

/**
 * Clear all API caches
 */
export function clearApiCache(): void {
  apiCache.clear()
  if (process.env.NODE_ENV === "development") {
    console.log("API cache cleared")
  }
}

/**
 * Clear specific API cache entry
 */
export function clearApiCacheEntry(key: string, subKey?: string): void {
  if (subKey) {
    // Clear a specific entry with a subkey (e.g., pointFeatures for a specific city)
    const entries = Array.from(apiCache.entries())
    for (const [cacheKey, value] of entries) {
      if (cacheKey.startsWith(`${key}_${subKey}`)) {
        apiCache.delete(cacheKey)
        if (process.env.NODE_ENV === "development") {
          console.log(`API cache cleared for ${cacheKey}`)
        }
      }
    }
  } else {
    // Clear all entries with a specific key prefix
    const entries = Array.from(apiCache.entries())
    for (const [cacheKey, value] of entries) {
      if (cacheKey.startsWith(key)) {
        apiCache.delete(cacheKey)
        if (process.env.NODE_ENV === "development") {
          console.log(`API cache cleared for ${cacheKey}`)
        }
      }
    }
  }
}
