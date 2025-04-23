// API service functions for making specific API calls

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
  ComparisonResponse,
  FilterResponse,
} from "./api-types"

// Add the import for the Supabase functions at the top of the file
import {
  getDistrictPolygons,
  getNeighborhoodPolygons,
  getCityPointFeatures as getSupabaseCityPointFeatures,
  getFeatureDefinitionsWithNames,
} from "./supabase-client"

// Cache for API responses
const apiCache = {
  cities: null as City[] | null,
  districts: {} as Record<number, District[]>, // cityId -> districts
  neighborhoods: {} as Record<number, Neighborhood[]>, // districtId -> neighborhoods
  pointFeatures: {} as Record<number, PointFeature[]>, // cityId -> point features
  featureDefinitions: null as FeatureDefinition[] | null, // Feature definitions
}

// Flag to determine whether to use Supabase for point features
// Set to true to use Supabase, false to use API
const USE_SUPABASE_FOR_POINT_FEATURES = true

/**
 * Get all cities
 */
export async function getCities(): Promise<City[]> {
  // Check cache first
  if (apiCache.cities) {
    console.log("Using cached cities data")
    return apiCache.cities
  }

  const cities = await fetchAPI("/api/cities")
  apiCache.cities = cities // Cache the result
  return cities
}

/**
 * Get all geographical levels
 */
export async function getGeographicalLevels(): Promise<GranularityLevel[]> {
  return fetchAPI("/api/geographical-levels")
}

/**
 * Get districts for a city
 */
export async function getDistricts(cityId: number): Promise<District[]> {
  // Check cache first
  if (apiCache.districts[cityId]) {
    console.log(`Using cached districts data for city ${cityId}`)
    return apiCache.districts[cityId]
  }

  const districts = await fetchAPI(`/api/cities/${cityId}/districts`)
  apiCache.districts[cityId] = districts // Cache the result
  return districts
}

/**
 * Get neighborhoods for a district
 */
export async function getNeighborhoods(districtId: number): Promise<Neighborhood[]> {
  // Check cache first
  if (apiCache.neighborhoods[districtId]) {
    console.log(`Using cached neighborhoods data for district ${districtId}`)
    return apiCache.neighborhoods[districtId]
  }

  const neighborhoods = await fetchAPI(`/api/districts/${districtId}/neighborhoods`)
  apiCache.neighborhoods[districtId] = neighborhoods // Cache the result
  return neighborhoods
}

// Update the getGeoJSON function to use direct Supabase access for polygons
export async function getGeoJSON(cityId: number, level: string): Promise<GeoJSONResponse> {
  try {
    console.log(`Getting GeoJSON for city ${cityId} at level ${level}`)

    // For polygons (districts and neighborhoods), use direct Supabase access
    if (level === "district") {
      return await getDistrictPolygons(cityId)
    } else if (level === "neighborhood") {
      return await getNeighborhoodPolygons(cityId)
    } else {
      // Fallback to API for other data types
      const endpoint = buildEndpoint(`/api/cities/${cityId}/geojson`, { level })
      return fetchAPI(endpoint)
    }
  } catch (error) {
    console.error(`Error getting GeoJSON for city ${cityId} at level ${level}:`, error)
    throw error
  }
}

/**
 * Get indicator definitions
 */
export async function getIndicatorDefinitions(): Promise<IndicatorDefinition[]> {
  return fetchAPI("/api/indicator-definitions")
}

/**
 * Get indicators for a specific geographical entity
 */
export async function getIndicators(geoLevelId: number, geoId: number, year: number): Promise<Indicator[]> {
  const endpoint = buildEndpoint("/api/indicators", { geoLevelId, geoId, year })
  return fetchAPI(endpoint)
}

/**
 * Get indicators for a city at a specific granularity level
 */
export async function getCityIndicators(cityId: number, level: string, year: number): Promise<Indicator[]> {
  const endpoint = buildEndpoint(`/api/cities/${cityId}/indicators`, { level, year })
  return fetchAPI(endpoint)
}

/**
 * Get feature definitions
 */
export async function getFeatureDefinitions(): Promise<FeatureDefinition[]> {
  // Check cache first
  if (apiCache.featureDefinitions) {
    console.log("Using cached feature definitions")
    return apiCache.featureDefinitions
  }

  try {
    let featureDefinitions

    if (USE_SUPABASE_FOR_POINT_FEATURES) {
      // Use Supabase to get feature definitions with proper names
      featureDefinitions = await getFeatureDefinitionsWithNames()
    } else {
      // Fallback to API
      featureDefinitions = await fetchAPI("/api/feature-definitions")
    }

    // Cache the result
    apiCache.featureDefinitions = featureDefinitions
    return featureDefinitions
  } catch (error) {
    console.error("Error fetching feature definitions:", error)
    // Fallback to API if Supabase fails
    const featureDefinitions = await fetchAPI("/api/feature-definitions")
    apiCache.featureDefinitions = featureDefinitions
    return featureDefinitions
  }
}

/**
 * Get point features for a city
 */
export async function getCityPointFeatures(cityId: number): Promise<PointFeature[]> {
  // Check cache first
  if (apiCache.pointFeatures[cityId]) {
    console.log(`Using cached point features for city ${cityId}`)
    return apiCache.pointFeatures[cityId]
  }

  try {
    console.log(`Fetching point features for city ID: ${cityId}`)

    let pointFeatures

    if (USE_SUPABASE_FOR_POINT_FEATURES) {
      // Use Supabase to get point features
      pointFeatures = await getSupabaseCityPointFeatures(cityId)
    } else {
      // Fallback to API
      pointFeatures = await fetchAPI(`/api/cities/${cityId}/point-features`)

      // Transform the data to ensure it has the expected format
      pointFeatures = await transformPointFeatures(pointFeatures)
    }

    console.log("Loaded point features:", pointFeatures)

    // Cache the result
    apiCache.pointFeatures[cityId] = pointFeatures
    return pointFeatures
  } catch (error) {
    console.error(`Error fetching point features for city ${cityId}:`, error)

    // If Supabase fails, try the API as fallback
    if (USE_SUPABASE_FOR_POINT_FEATURES) {
      console.log("Falling back to API for point features")
      try {
        const features = await fetchAPI(`/api/cities/${cityId}/point-features`)
        const transformedFeatures = await transformPointFeatures(features)

        // Cache the result
        apiCache.pointFeatures[cityId] = transformedFeatures
        return transformedFeatures
      } catch (apiError) {
        console.error(`API fallback also failed for point features:`, apiError)
        return []
      }
    }

    return []
  }
}

// Helper function to transform point features from API to the expected format
async function transformPointFeatures(features: any[]): Promise<PointFeature[]> {
  try {
    // Get feature definitions to map IDs to names
    const featureDefinitions = await getFeatureDefinitions()

    // Transform the data to ensure it has the expected format
    return features.map((feature: any) => ({
      id: feature.id,
      geoId: feature.geo_id,
      name: feature.name,
      featureType:
        feature.featureType ||
        feature.feature_type ||
        (feature.feature_definition_id
          ? featureDefinitions.find((def: any) => def.id === feature.feature_definition_id)?.name ||
            feature.feature_definition_id.toString()
          : "unknown"),
      latitude: feature.latitude,
      longitude: feature.longitude,
      properties: feature.properties || {},
    }))
  } catch (error) {
    console.error("Error transforming point features:", error)
    // Return the original features if transformation fails
    return features.map((feature: any) => ({
      id: feature.id,
      geoId: feature.geo_id,
      name: feature.name,
      featureType: feature.feature_definition_id ? feature.feature_definition_id.toString() : "unknown",
      latitude: feature.latitude,
      longitude: feature.longitude,
      properties: feature.properties || {},
    }))
  }
}

/**
 * Get point features for a specific geographical entity
 */
export async function getPointFeatures(geoLevelId: number, geoId: number): Promise<PointFeature[]> {
  const endpoint = buildEndpoint("/api/point-features", { geoLevelId, geoId })
  return fetchAPI(endpoint)
}

/**
 * Compare two areas in a city
 */
export async function compareAreas(
  cityId: number,
  level: string,
  area1Id: number,
  area2Id: number,
  year: number,
): Promise<ComparisonResponse> {
  const endpoint = buildEndpoint(`/api/cities/${cityId}/compare`, {
    level,
    area1: area1Id,
    area2: area2Id,
    year,
  })
  return fetchAPI(endpoint)
}

/**
 * Filter areas in a city based on criteria
 */
export async function filterAreas(
  cityId: number,
  level: string,
  filters: {
    minPopulation?: number
    maxPopulation?: number
    minIncome?: number
    maxIncome?: number
    minSurface?: number
    maxSurface?: number
    minDisposableIncome?: number
    maxDisposableIncome?: number
  },
): Promise<FilterResponse> {
  const endpoint = buildEndpoint(`/api/cities/${cityId}/filter`, {
    level,
    ...filters,
  })
  return fetchAPI(endpoint)
}

/**
 * Clear all API caches
 */
export function clearApiCache() {
  apiCache.cities = null
  apiCache.districts = {}
  apiCache.neighborhoods = {}
  apiCache.pointFeatures = {}
  apiCache.featureDefinitions = null
  console.log("API cache cleared")
}

/**
 * Clear specific API cache entry
 */
export function clearApiCacheEntry(
  type: "cities" | "districts" | "neighborhoods" | "pointFeatures" | "featureDefinitions",
  key?: number,
) {
  if (key !== undefined && type !== "cities" && type !== "featureDefinitions") {
    delete apiCache[type][key]
    console.log(`Cleared API cache for ${type} with key ${key}`)
  } else {
    if (type === "cities" || type === "featureDefinitions") {
      apiCache[type] = null
    } else {
      apiCache[type] = {}
    }
    console.log(`Cleared all API cache for ${type}`)
  }
}
