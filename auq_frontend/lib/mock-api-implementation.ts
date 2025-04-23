// Mock API implementation that intercepts API calls and returns mock data

import {
  mockCitiesResponse,
  mockGeographicalLevelsResponse,
  mockBarcelonaDistrictsResponse,
  mockMadridDistrictsResponse,
  mockCiutatVellaNeighborhoodsResponse,
  mockEixampleNeighborhoodsResponse,
  mockCentroNeighborhoodsResponse,
  mockArganzuelaNeighborhoodsResponse,
  mockBarcelonaDistrictsGeoJsonResponse,
  mockBarcelonaNeighborhoodsGeoJsonResponse,
  mockMadridDistrictsGeoJsonResponse,
  mockMadridNeighborhoodsGeoJsonResponse,
  mockIndicatorDefinitionsResponse,
  mockBarcelonaPointFeaturesResponse,
  mockMadridPointFeaturesResponse,
  mockFeatureDefinitionsResponse,
  mockBarcelonaDistrictIndicatorsResponse,
  mockBarcelonaNeighborhoodIndicatorsResponse,
  mockCiutatVellaIndicatorsResponse,
  mockCompareDistrictsResponse,
  mockFilterDistrictsResponse,
} from "./mock-api-responses"

// Helper function to simulate API delay
const simulateDelay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock implementation of API endpoints
export const mockApiImplementation = {
  // Cities
  "/api/cities": async () => {
    await simulateDelay()
    return mockCitiesResponse
  },

  // Geographical levels
  "/api/geographical-levels": async () => {
    await simulateDelay()
    return mockGeographicalLevelsResponse
  },

  // Districts
  "/api/cities/1/districts": async () => {
    await simulateDelay()
    return mockBarcelonaDistrictsResponse
  },
  "/api/cities/2/districts": async () => {
    await simulateDelay()
    return mockMadridDistrictsResponse
  },

  // Neighborhoods
  "/api/districts/1/neighborhoods": async () => {
    await simulateDelay()
    return mockCiutatVellaNeighborhoodsResponse
  },
  "/api/districts/2/neighborhoods": async () => {
    await simulateDelay()
    return mockEixampleNeighborhoodsResponse
  },
  "/api/districts/11/neighborhoods": async () => {
    await simulateDelay()
    return mockCentroNeighborhoodsResponse
  },
  "/api/districts/12/neighborhoods": async () => {
    await simulateDelay()
    return mockArganzuelaNeighborhoodsResponse
  },

  // GeoJSON
  "/api/cities/1/geojson?level=district": async () => {
    await simulateDelay()
    return mockBarcelonaDistrictsGeoJsonResponse
  },
  "/api/cities/1/geojson?level=neighborhood": async () => {
    await simulateDelay()
    return mockBarcelonaNeighborhoodsGeoJsonResponse
  },
  "/api/cities/2/geojson?level=district": async () => {
    await simulateDelay()
    return mockMadridDistrictsGeoJsonResponse
  },
  "/api/cities/2/geojson?level=neighborhood": async () => {
    await simulateDelay()
    return mockMadridNeighborhoodsGeoJsonResponse
  },

  // Indicator definitions
  "/api/indicator-definitions": async () => {
    await simulateDelay()
    return mockIndicatorDefinitionsResponse
  },

  // Indicators
  "/api/indicators": async (params: any) => {
    await simulateDelay()
    // Parse the parameters
    const geoLevelId = params.geoLevelId
    const geoId = params.geoId

    // Return appropriate mock data based on parameters
    if (geoLevelId === 2 && geoId === 1) {
      return mockCiutatVellaIndicatorsResponse
    }

    // Default fallback
    return []
  },

  // City indicators
  "/api/cities/1/indicators": async (params: any) => {
    await simulateDelay()
    const level = params.level
    return level === "district" ? mockBarcelonaDistrictIndicatorsResponse : mockBarcelonaNeighborhoodIndicatorsResponse
  },

  // Feature definitions
  "/api/feature-definitions": async () => {
    await simulateDelay()
    return mockFeatureDefinitionsResponse
  },

  // Point features
  "/api/cities/1/point-features": async () => {
    await simulateDelay()
    return mockBarcelonaPointFeaturesResponse
  },
  "/api/cities/2/point-features": async () => {
    await simulateDelay()
    return mockMadridPointFeaturesResponse
  },

  // Compare areas
  "/api/cities/1/compare": async (params: any) => {
    await simulateDelay()
    // For simplicity, always return the same comparison data
    return mockCompareDistrictsResponse
  },

  // Filter areas
  "/api/cities/1/filter": async (params: any) => {
    await simulateDelay()
    // For simplicity, always return the same filtered data
    return mockFilterDistrictsResponse
  },

  // Default handler for any unmatched endpoint
  default: async () => {
    await simulateDelay()
    console.warn("No mock implementation for this endpoint")
    return []
  },
}

// Helper function to find the right mock implementation for a given endpoint
export const getMockResponse = async (endpoint: string, params: any = {}) => {
  // Check for exact endpoint match
  if (mockApiImplementation[endpoint]) {
    return mockApiImplementation[endpoint](params)
  }

  // Check for endpoints with query parameters
  const baseEndpoint = endpoint.split("?")[0]
  if (mockApiImplementation[endpoint]) {
    return mockApiImplementation[endpoint](params)
  }

  // Handle dynamic endpoints like /api/cities/{id}/districts
  if (endpoint.match(/\/api\/cities\/\d+\/districts/)) {
    const cityId = Number.parseInt(endpoint.split("/")[3])
    if (cityId === 1) return mockApiImplementation["/api/cities/1/districts"]()
    if (cityId === 2) return mockApiImplementation["/api/cities/2/districts"]()
  }

  if (endpoint.match(/\/api\/districts\/\d+\/neighborhoods/)) {
    const districtId = Number.parseInt(endpoint.split("/")[3])
    if (districtId === 1) return mockApiImplementation["/api/districts/1/neighborhoods"]()
    if (districtId === 2) return mockApiImplementation["/api/districts/2/neighborhoods"]()
    if (districtId === 11) return mockApiImplementation["/api/districts/11/neighborhoods"]()
    if (districtId === 12) return mockApiImplementation["/api/districts/12/neighborhoods"]()
  }

  if (endpoint.match(/\/api\/cities\/\d+\/geojson/)) {
    const cityId = Number.parseInt(endpoint.split("/")[3])
    const level = new URLSearchParams(endpoint.split("?")[1]).get("level")
    if (cityId === 1 && level === "district") return mockApiImplementation["/api/cities/1/geojson?level=district"]()
    if (cityId === 1 && level === "neighborhood")
      return mockApiImplementation["/api/cities/1/geojson?level=neighborhood"]()
    if (cityId === 2 && level === "district") return mockApiImplementation["/api/cities/2/geojson?level=district"]()
    if (cityId === 2 && level === "neighborhood")
      return mockApiImplementation["/api/cities/2/geojson?level=neighborhood"]()
  }

  if (endpoint.match(/\/api\/cities\/\d+\/point-features/)) {
    const cityId = Number.parseInt(endpoint.split("/")[3])
    if (cityId === 1) return mockApiImplementation["/api/cities/1/point-features"]()
    if (cityId === 2) return mockApiImplementation["/api/cities/2/point-features"]()
  }

  // Default fallback
  console.warn(`No mock implementation found for endpoint: ${endpoint}`)
  return mockApiImplementation.default()
}
