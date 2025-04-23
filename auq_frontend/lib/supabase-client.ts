import { createClient } from "@supabase/supabase-js"
import {
  mockBarcelonaDistrictsGeoJsonResponse,
  mockBarcelonaNeighborhoodsGeoJsonResponse,
  mockMadridDistrictsGeoJsonResponse,
  mockMadridNeighborhoodsGeoJsonResponse,
  mockBarcelonaPointFeaturesResponse,
  mockMadridPointFeaturesResponse,
  mockFeatureDefinitionsResponse,
} from "./mock-api-responses"

// Create a Supabase client only if credentials are available
let supabaseClient: any = null

// Initialize the Supabase client if credentials are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (supabaseUrl && supabaseKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey)
    console.log("Supabase client initialized successfully")
  } catch (error) {
    console.error("Error initializing Supabase client:", error)
    supabaseClient = null
  }
} else {
  console.warn("Supabase credentials not found. Using mock data for polygon data.")
}

// Cache for Supabase data
const dataCache = {
  districts: {} as Record<number, any>, // cityId -> districts data
  neighborhoods: {} as Record<number, any>, // cityId -> neighborhoods data
  indicators: {} as Record<string, any>, // geoLevelId_geoId -> indicators data
  pointFeatures: {} as Record<number, any>, // cityId -> point features
  featureDefinitions: null as any, // Feature definitions
}

// Function to get indicator values for a specific area
async function getIndicatorValues(geoLevelId: number, geoId: number) {
  // Create a cache key for this indicator request
  const cacheKey = `${geoLevelId}_${geoId}`

  // Check if we have cached data
  if (dataCache.indicators[cacheKey]) {
    console.log(`Using cached indicator data for ${cacheKey}`)
    return dataCache.indicators[cacheKey]
  }

  try {
    const { data, error } = await supabaseClient
      .from("indicators")
      .select(`
        indicator_def_id,
        value
      `)
      .eq("geo_level_id", geoLevelId)
      .eq("geo_id", geoId)
      // Get the most recent year's data
      .order("year", { ascending: false })
      .limit(20)

    if (error) throw error

    // Create a map of indicator_def_id to value
    const indicatorMap: Record<number, number> = {}
    if (data && data.length > 0) {
      data.forEach((indicator: any) => {
        indicatorMap[indicator.indicator_def_id] = indicator.value
      })
    }

    const result = {
      // Common indicators (using IDs from indicator_definitions table)
      population: indicatorMap[1] || 0,
      avg_income: indicatorMap[3] || 0,
      surface: indicatorMap[2] || 0,
      disposable_income: indicatorMap[4] || 0,
    }

    // Cache the result
    dataCache.indicators[cacheKey] = result

    return result
  } catch (error) {
    console.error("Error fetching indicator values:", error)
    return {
      population: 0,
      avg_income: 0,
      surface: 0,
      disposable_income: 0,
    }
  }
}

// Function to convert PostGIS geometry to GeoJSON with fallback to mock data
export async function getDistrictPolygons(cityId: number): Promise<any> {
  // Check if we have cached data for this city's districts
  if (dataCache.districts[cityId]) {
    console.log(`Using cached district data for city ${cityId}`)
    return dataCache.districts[cityId]
  }

  try {
    console.log(`Fetching district polygons for city ${cityId}`)

    // If Supabase client is not available, use mock data
    if (!supabaseClient) {
      console.log("Using mock data for district polygons")
      const mockData = cityId === 1 ? mockBarcelonaDistrictsGeoJsonResponse : mockMadridDistrictsGeoJsonResponse
      dataCache.districts[cityId] = mockData // Cache the mock data
      return mockData
    }

    let data = null
    let error = null

    try {
      // Try using the rpc method first
      const result = await supabaseClient.rpc("execute_sql", {
        sql_query: `
        SELECT 
          d.id, 
          d.name, 
          d.district_code, 
          d.city_id, 
          ST_AsGeoJSON(d.geom)::json as geometry
        FROM 
          districts d
        WHERE 
          d.city_id = ${cityId}
      `,
      })

      data = result.data
      error = result.error
    } catch (rpcError) {
      console.warn("RPC method failed, falling back to direct query:", rpcError)
      // If the execute_sql RPC doesn't exist, try direct SQL query
      const result = await supabaseClient
        .from("districts")
        .select("id, name, district_code, city_id")
        .eq("city_id", cityId)
      data = result.data
      error = result.error
    }

    if (error) {
      console.error("Supabase query error:", error)
      throw error
    }

    if (!data || data.length === 0) {
      console.warn(`No district data found for city ${cityId}, falling back to mock data`)
      const mockData = cityId === 1 ? mockBarcelonaDistrictsGeoJsonResponse : mockMadridDistrictsGeoJsonResponse
      dataCache.districts[cityId] = mockData // Cache the mock data
      return mockData
    }

    // Process the features
    const features = await Promise.all(
      data.map(async (district: any, index: number) => {
        // Get indicator values for this district
        const indicators = await getIndicatorValues(2, district.id)

        // Create the feature
        return {
          type: "Feature",
          properties: {
            id: district.id,
            name: district.name,
            district_code: district.district_code,
            city_id: district.city_id,
            population: indicators.population,
            avg_income: indicators.avg_income,
            surface: indicators.surface,
            disposable_income: indicators.disposable_income,
            level: "district",
            index: index,
          },
          geometry: district.geometry || {
            // Generate a simple polygon if geometry is not available
            type: "Polygon",
            coordinates: [
              [
                [
                  cityId === 1 ? 2.14 + index * 0.02 : -3.71 + index * 0.02,
                  cityId === 1 ? 41.37 + index * 0.02 : 40.41 + index * 0.02,
                ],
                [
                  cityId === 1 ? 2.16 + index * 0.02 : -3.69 + index * 0.02,
                  cityId === 1 ? 41.37 + index * 0.02 : 40.41 + index * 0.02,
                ],
                [
                  cityId === 1 ? 2.16 + index * 0.02 : -3.69 + index * 0.02,
                  cityId === 1 ? 41.39 + index * 0.02 : 40.43 + index * 0.02,
                ],
                [
                  cityId === 1 ? 2.14 + index * 0.02 : -3.71 + index * 0.02,
                  cityId === 1 ? 41.39 + index * 0.02 : 40.43 + index * 0.02,
                ],
                [
                  cityId === 1 ? 2.14 + index * 0.02 : -3.71 + index * 0.02,
                  cityId === 1 ? 41.37 + index * 0.02 : 40.41 + index * 0.02,
                ],
              ],
            ],
          },
        }
      }),
    )

    const result = {
      type: "FeatureCollection",
      features,
    }

    // Cache the result
    dataCache.districts[cityId] = result

    return result
  } catch (error) {
    console.error("Error fetching district polygons:", error)
    // Fallback to mock data
    console.log("Falling back to mock data for district polygons")
    const mockData = cityId === 1 ? mockBarcelonaDistrictsGeoJsonResponse : mockMadridDistrictsGeoJsonResponse
    dataCache.districts[cityId] = mockData // Cache the mock data
    return mockData
  }
}

export async function getNeighborhoodPolygons(cityId: number): Promise<any> {
  // Check if we have cached data for this city's neighborhoods
  if (dataCache.neighborhoods[cityId]) {
    console.log(`Using cached neighborhood data for city ${cityId}`)
    return dataCache.neighborhoods[cityId]
  }

  try {
    console.log(`Fetching neighborhood polygons for city ${cityId}`)

    // If Supabase client is not available, use mock data
    if (!supabaseClient) {
      console.log("Using mock data for neighborhood polygons")
      const mockData = cityId === 1 ? mockBarcelonaNeighborhoodsGeoJsonResponse : mockMadridNeighborhoodsGeoJsonResponse
      dataCache.neighborhoods[cityId] = mockData // Cache the mock data
      return mockData
    }

    let data = null
    let error = null

    try {
      // Try using the rpc method first
      const result = await supabaseClient.rpc("execute_sql", {
        sql_query: `
        SELECT 
          n.id, 
          n.name, 
          n.neighbourhood_code, 
          n.district_id, 
          n.city_id, 
          ST_AsGeoJSON(n.geom)::json as geometry
        FROM 
          neighbourhoods n
        WHERE 
          n.city_id = ${cityId}
      `,
      })

      data = result.data
      error = result.error
    } catch (rpcError) {
      console.warn("RPC method failed, falling back to direct query:", rpcError)
      // If the execute_sql RPC doesn't exist, try direct SQL query
      const result = await supabaseClient
        .from("neighbourhoods")
        .select("id, name, neighbourhood_code, district_id, city_id")
        .eq("city_id", cityId)

      data = result.data
      error = result.error
    }

    if (error) {
      console.error("Supabase query error:", error)
      throw error
    }

    if (!data || data.length === 0) {
      console.warn(`No neighborhood data found for city ${cityId}, falling back to mock data`)
      const mockData = cityId === 1 ? mockBarcelonaNeighborhoodsGeoJsonResponse : mockMadridNeighborhoodsGeoJsonResponse
      dataCache.neighborhoods[cityId] = mockData // Cache the mock data
      return mockData
    }

    // Process the features
    const features = await Promise.all(
      data.map(async (neighborhood: any, index: number) => {
        // Get indicator values for this neighborhood
        const indicators = await getIndicatorValues(3, neighborhood.id)

        // Create the feature
        return {
          type: "Feature",
          properties: {
            id: neighborhood.id,
            name: neighborhood.name,
            neighbourhood_code: neighborhood.neighbourhood_code,
            district_id: neighborhood.district_id,
            city_id: neighborhood.city_id,
            population: indicators.population,
            avg_income: indicators.avg_income,
            surface: indicators.surface,
            disposable_income: indicators.disposable_income,
            level: "neighborhood",
            index: index,
          },
          geometry: neighborhood.geometry || {
            // Generate a simple polygon if geometry is not available
            type: "Polygon",
            coordinates: [
              [
                [
                  cityId === 1 ? 2.145 + index * 0.01 : -3.705 + index * 0.01,
                  cityId === 1 ? 41.375 + index * 0.01 : 40.415 + index * 0.01,
                ],
                [
                  cityId === 1 ? 2.155 + index * 0.01 : -3.695 + index * 0.01,
                  cityId === 1 ? 41.375 + index * 0.01 : 40.415 + index * 0.01,
                ],
                [
                  cityId === 1 ? 2.155 + index * 0.01 : -3.695 + index * 0.01,
                  cityId === 1 ? 41.385 + index * 0.01 : 40.425 + index * 0.01,
                ],
                [
                  cityId === 1 ? 2.145 + index * 0.01 : -3.705 + index * 0.01,
                  cityId === 1 ? 41.385 + index * 0.01 : 40.425 + index * 0.01,
                ],
                [
                  cityId === 1 ? 2.145 + index * 0.01 : -3.705 + index * 0.01,
                  cityId === 1 ? 41.375 + index * 0.01 : 40.415 + index * 0.01,
                ],
              ],
            ],
          },
        }
      }),
    )

    const result = {
      type: "FeatureCollection",
      features,
    }

    // Cache the result
    dataCache.neighborhoods[cityId] = result

    return result
  } catch (error) {
    console.error("Error fetching neighborhood polygons:", error)
    // Fallback to mock data
    console.log("Falling back to mock data for neighborhood polygons")
    const mockData = cityId === 1 ? mockBarcelonaNeighborhoodsGeoJsonResponse : mockMadridNeighborhoodsGeoJsonResponse
    dataCache.neighborhoods[cityId] = mockData // Cache the mock data
    return mockData
  }
}

// Function to get feature definitions
export async function getFeatureDefinitions() {
  // Check if we have cached data
  if (dataCache.featureDefinitions) {
    console.log("Using cached feature definitions")
    return dataCache.featureDefinitions
  }

  try {
    console.log("Fetching feature definitions")

    // If Supabase client is not available, use mock data
    if (!supabaseClient) {
      console.log("Using mock data for feature definitions")
      dataCache.featureDefinitions = mockFeatureDefinitionsResponse // Cache the mock data
      return mockFeatureDefinitionsResponse
    }

    // Fetch feature definitions from Supabase
    const { data, error } = await supabaseClient.from("feature_definitions").select("*").order("id")

    if (error) {
      console.error("Supabase query error:", error)
      throw error
    }

    if (!data || data.length === 0) {
      console.warn("No feature definitions found, falling back to mock data")
      dataCache.featureDefinitions = mockFeatureDefinitionsResponse // Cache the mock data
      return mockFeatureDefinitionsResponse
    }

    // Cache the result
    dataCache.featureDefinitions = data
    return data
  } catch (error) {
    console.error("Error fetching feature definitions:", error)
    // Fallback to mock data
    console.log("Falling back to mock data for feature definitions")
    dataCache.featureDefinitions = mockFeatureDefinitionsResponse // Cache the mock data
    return mockFeatureDefinitionsResponse
  }
}

// Add this function after the getFeatureDefinitions function

// Function to get feature definitions with proper names
export async function getFeatureDefinitionsWithNames() {
  // Check if we have cached data
  if (dataCache.featureDefinitions) {
    console.log("Using cached feature definitions")
    return dataCache.featureDefinitions
  }

  try {
    console.log("Fetching feature definitions")

    // If Supabase client is not available, use mock data with proper names
    if (!supabaseClient) {
      console.log("Using mock data for feature definitions with proper names")
      const mockDataWithNames = [
        { id: 1, name: "Libraries", description: "Public libraries and documentation centers" },
        { id: 2, name: "Cultural centers", description: "Athenaeums, civic centers and community cultural spaces" },
        { id: 3, name: "Auditoriums", description: "Large auditoriums and concert halls" },
        { id: 4, name: "Heritage spaces", description: "Places of historical, cultural or heritage interest" },
        { id: 5, name: "Creation factories", description: "Cultural and artistic innovation centers" },
        { id: 6, name: "Museums", description: "Museums and permanent collections" },
        { id: 7, name: "Cinemas", description: "Commercial or cultural movie theaters" },
        { id: 8, name: "Exhibition centers", description: "Spaces for artistic or thematic exhibitions" },
        { id: 9, name: "Archives", description: "Historical, district archives and heritage libraries" },
        { id: 10, name: "Live music venues", description: "Venues for concerts and musical performances" },
        { id: 11, name: "Performing arts venues", description: "Theaters and spaces for stage performances" },
        { id: 12, name: "Municipal markets", description: "Public markets for food and local products" },
        {
          id: 13,
          name: "Parks and gardens",
          description: "Urban green spaces including parks, gardens, and natural areas",
        },
        { id: 14, name: "Educational centers", description: "Schools, colleges, and other educational institutions" },
      ]
      dataCache.featureDefinitions = mockDataWithNames // Cache the mock data
      return mockDataWithNames
    }

    // Fetch feature definitions from Supabase
    const { data, error } = await supabaseClient.from("feature_definitions").select("*").order("id")
    console.log("Feature definitions correctly gathered from Supabase")

    if (error) {
      console.error("Supabase query error:", error)
      throw error
    }

    if (!data || data.length === 0) {
      console.warn("No feature definitions found, falling back to mock data")
      const mockDataWithNames = [
        { id: 1, name: "Libraries", description: "Public libraries and documentation centers" },
        { id: 2, name: "Cultural centers", description: "Athenaeums, civic centers and community cultural spaces" },
        { id: 3, name: "Auditoriums", description: "Large auditoriums and concert halls" },
        { id: 4, name: "Heritage spaces", description: "Places of historical, cultural or heritage interest" },
        { id: 5, name: "Creation factories", description: "Cultural and artistic innovation centers" },
        { id: 6, name: "Museums", description: "Museums and permanent collections" },
        { id: 7, name: "Cinemas", description: "Commercial or cultural movie theaters" },
        { id: 8, name: "Exhibition centers", description: "Spaces for artistic or thematic exhibitions" },
        { id: 9, name: "Archives", description: "Historical, district archives and heritage libraries" },
        { id: 10, name: "Live music venues", description: "Venues for concerts and musical performances" },
        { id: 11, name: "Performing arts venues", description: "Theaters and spaces for stage performances" },
        { id: 12, name: "Municipal markets", description: "Public markets for food and local products" },
        {
          id: 13,
          name: "Parks and gardens",
          description: "Urban green spaces including parks, gardens, and natural areas",
        },
        { id: 14, name: "Educational centers", description: "Schools, colleges, and other educational institutions" },
      ]
      dataCache.featureDefinitions = mockDataWithNames // Cache the mock data
      return mockDataWithNames
    }

    // Cache the result
    dataCache.featureDefinitions = data
    return data
  } catch (error) {
    console.error("Error fetching feature definitions:", error)
    // Fallback to mock data
    console.log("Falling back to mock data for feature definitions")
    const mockDataWithNames = [
      { id: 1, name: "Libraries", description: "Public libraries and documentation centers" },
      { id: 2, name: "Cultural centers", description: "Athenaeums, civic centers and community cultural spaces" },
      { id: 3, name: "Auditoriums", description: "Large auditoriums and concert halls" },
      { id: 4, name: "Heritage spaces", description: "Places of historical, cultural or heritage interest" },
      { id: 5, name: "Creation factories", description: "Cultural and artistic innovation centers" },
      { id: 6, name: "Museums", description: "Museums and permanent collections" },
      { id: 7, name: "Cinemas", description: "Commercial or cultural movie theaters" },
      { id: 8, name: "Exhibition centers", description: "Spaces for artistic or thematic exhibitions" },
      { id: 9, name: "Archives", description: "Historical, district archives and heritage libraries" },
      { id: 10, name: "Live music venues", description: "Venues for concerts and musical performances" },
      { id: 11, name: "Performing arts venues", description: "Theaters and spaces for stage performances" },
      { id: 12, name: "Municipal markets", description: "Public markets for food and local products" },
      {
        id: 13,
        name: "Parks and gardens",
        description: "Urban green spaces including parks, gardens, and natural areas",
      },
      { id: 14, name: "Educational centers", description: "Schools, colleges, and other educational institutions" },
    ]
    dataCache.featureDefinitions = mockDataWithNames // Cache the mock data
    return mockDataWithNames
  }
}

// Function to get point features for a city
export async function getCityPointFeatures(cityId: number) {
  // Check if we have cached data
  if (dataCache.pointFeatures[cityId]) {
    console.log(`Using cached point features for city ${cityId}`)
    return dataCache.pointFeatures[cityId]
  }

  try {
    console.log(`Fetching point features for city ${cityId}`)

    // If Supabase client is not available, use mock data
    if (!supabaseClient) {
      console.log("Using mock data for point features")
      const mockData = cityId === 1 ? mockBarcelonaPointFeaturesResponse : mockMadridPointFeaturesResponse

      // Transform to expected format
      const transformedFeatures = await transformPointFeatures(mockData)

      // Cache the result
      dataCache.pointFeatures[cityId] = transformedFeatures
      return transformedFeatures
    }

    // First, get the districts for this city to use their IDs for filtering
    let districtIds: number[] = []
    try {
      const { data: districts, error: districtError } = await supabaseClient
        .from("districts")
        .select("id")
        .eq("city_id", cityId)

      if (districtError) {
        console.error("Error fetching district IDs:", districtError)
      } else if (districts && districts.length > 0) {
        districtIds = districts.map((d: any) => d.id)
        console.log(`Found ${districtIds.length} districts for city ${cityId}:`, districtIds)
      }
    } catch (districtError) {
      console.error("Error fetching district IDs:", districtError)
    }

    // Fetch point features from Supabase using the geo_id (district ID) instead of city_id
    let data
    let error

    if (districtIds.length > 0) {
      // Use SQL query to get point features for all districts in the city
      try {
        const result = await supabaseClient.rpc("execute_sql", {
          sql_query: `
            SELECT 
              pf.id,
              pf.feature_definition_id,
              pf.name,
              pf.latitude,
              pf.longitude,
              pf.geo_level_id,
              pf.geo_id,
              pf.properties
            FROM 
              point_features pf
            WHERE 
              pf.geo_id IN (${districtIds.join(",")})
          `,
        })

        data = result.data
        error = result.error
      } catch (sqlError) {
        console.error("SQL query for point features failed:", sqlError)

        // Fallback to direct query with in filter
        try {
          const { data: queryData, error: queryError } = await supabaseClient
            .from("point_features")
            .select(`
              id,
              feature_definition_id,
              name,
              latitude,
              longitude,
              geo_level_id,
              geo_id,
              properties
            `)
            .in("geo_id", districtIds)

          data = queryData
          error = queryError
        } catch (queryError) {
          console.error("Direct query for point features failed:", queryError)
        }
      }
    } else {
      // If we couldn't get district IDs, try to get all point features and filter later
      try {
        const { data: allData, error: allError } = await supabaseClient
          .from("point_features")
          .select(`
            id,
            feature_definition_id,
            name,
            latitude,
            longitude,
            geo_level_id,
            geo_id,
            properties
          `)
          .limit(100) // Limit to avoid too many results

        data = allData
        error = allError
      } catch (allError) {
        console.error("Query for all point features failed:", allError)
      }
    }

    if (error) {
      console.error("Supabase query error:", error)
      throw error
    }

    if (!data || data.length === 0) {
      console.warn(`No point features found for city ${cityId}, falling back to mock data`)
      const mockData = cityId === 1 ? mockBarcelonaPointFeaturesResponse : mockMadridPointFeaturesResponse

      // Transform to expected format
      const transformedFeatures = await transformPointFeatures(mockData)

      // Cache the result
      dataCache.pointFeatures[cityId] = transformedFeatures
      return transformedFeatures
    }

    // Transform to expected format
    const transformedFeatures = await transformPointFeatures(data)

    // Add this after line 580, before returning transformedFeatures
    console.log(
      `Feature types for city ${cityId}:`,
      transformedFeatures.map((f) => f.featureType),
    )

    // Cache the result
    dataCache.pointFeatures[cityId] = transformedFeatures
    return transformedFeatures
  } catch (error) {
    console.error(`Error fetching point features for city ${cityId}:`, error)
    // Fallback to mock data
    console.log("Falling back to mock data for point features")
    const mockData = cityId === 1 ? mockBarcelonaPointFeaturesResponse : mockMadridPointFeaturesResponse

    // Transform to expected format
    const transformedFeatures = await transformPointFeatures(mockData)

    // Cache the result
    dataCache.pointFeatures[cityId] = transformedFeatures
    return transformedFeatures
  }
}

// Helper function to transform point features to the expected format
async function transformPointFeatures(features: any[]) {
  try {
    // Get feature definitions to map IDs to names
    const featureDefinitions = await getFeatureDefinitions()

    // Transform the data to ensure it has the expected format
    return features.map((feature: any) => ({
      id: feature.id,
      geoId: feature.geo_id,
      name: feature.name,
      featureType:
        featureDefinitions.find((def: any) => def.id === feature.feature_definition_id)?.name ||
        feature.featureType ||
        feature.feature_type ||
        (feature.feature_definition_id ? feature.feature_definition_id.toString() : "unknown"),
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
      featureType: feature.feature_definition_id.toString(),
      latitude: feature.latitude,
      longitude: feature.longitude,
      properties: feature.properties || {},
    }))
  }
}

// Function to check if PostGIS is available
export async function checkPostGISAvailability() {
  try {
    if (!supabaseClient) return false

    let data = null
    let error = null

    try {
      // Try using the rpc method
      const result = await supabaseClient.rpc("execute_sql", {
        sql_query: "SELECT PostGIS_Version()",
      })

      data = result.data
      error = result.error
    } catch (rpcError) {
      console.warn("PostGIS check failed - RPC method not available:", rpcError)
      return false
    }

    if (error || !data) {
      console.warn("PostGIS check failed:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error checking PostGIS availability:", error)
    return false
  }
}

// Function to clear the cache (useful for testing or when data might be stale)
export function clearCache() {
  dataCache.districts = {}
  dataCache.neighborhoods = {}
  dataCache.indicators = {}
  dataCache.pointFeatures = {}
  dataCache.featureDefinitions = null
  console.log("Supabase data cache cleared")
}

// Function to clear specific cache entries
export function clearCacheEntry(
  type: "districts" | "neighborhoods" | "indicators" | "pointFeatures" | "featureDefinitions",
  key?: string | number,
) {
  if (key !== undefined) {
    if (type === "indicators" && typeof key === "string") {
      delete dataCache.indicators[key]
      console.log(`Cleared cache for ${type} with key ${key}`)
    } else if (type !== "featureDefinitions" && typeof key === "number") {
      delete dataCache[type][key]
      console.log(`Cleared cache for ${type} with key ${key}`)
    }
  } else {
    if (type === "featureDefinitions") {
      dataCache.featureDefinitions = null
    } else {
      dataCache[type] = {}
    }
    console.log(`Cleared all cache for ${type}`)
  }
}

// Add this export at the end of the file, before the export const supabase line:

// Export the clearCacheEntry function;

// Export the Supabase client for use in other files
export const supabase = supabaseClient
