// This file serves as an adapter between the old mock-data.ts structure
// and the new API-based approach, making the transition smoother

import {
  mockCitiesResponse,
  mockBarcelonaDistrictsResponse,
  mockMadridDistrictsResponse,
  mockBarcelonaDistrictsGeoJsonResponse,
  mockBarcelonaNeighborhoodsGeoJsonResponse,
  mockMadridDistrictsGeoJsonResponse,
  mockMadridNeighborhoodsGeoJsonResponse,
  mockIndicatorDefinitionsResponse,
  mockBarcelonaPointFeaturesResponse,
  mockMadridPointFeaturesResponse,
} from "./mock-api-responses"
import { fetchAPI } from "./api-utils"

// Export cities in the format expected by the current application
export const cities = mockCitiesResponse

// Export granularity levels in the format expected by the current application
export const granularityLevels = [
  { id: 1, name: "Districts", level: "district" },
  { id: 2, name: "Neighborhoods", level: "neighborhood" },
]

// Export indicator definitions in the format expected by the current application
export const indicatorDefinitions = mockIndicatorDefinitionsResponse

// Function to get available areas based on city and granularity level
// This maintains compatibility with the existing application
export const getAvailableAreas = (cityId: number, level: string) => {
  if (cityId === 1) {
    // Barcelona
    if (level === "district") {
      return mockBarcelonaDistrictsResponse.map((district) => ({
        id: district.id,
        name: district.name,
        cityId: district.city_id,
        population: district.population,
        avgIncome: district.avg_income,
        surface: district.surface,
        disposableIncome: district.disposable_income,
      }))
    } else {
      // Combine neighborhoods from all Barcelona districts
      // In a real API implementation, you would fetch this data from the API
      const neighborhoods = [...mockCiutatVellaNeighborhoodsResponse, ...mockEixampleNeighborhoodsResponse]
      return neighborhoods.map((neighborhood) => ({
        id: neighborhood.id,
        name: neighborhood.name,
        districtId: neighborhood.district_id,
        cityId: neighborhood.city_id,
        population: neighborhood.population,
        avgIncome: neighborhood.avg_income,
        surface: neighborhood.surface,
        disposableIncome: neighborhood.disposable_income,
      }))
    }
  } else if (cityId === 2) {
    // Madrid
    if (level === "district") {
      return mockMadridDistrictsResponse.map((district) => ({
        id: district.id,
        name: district.name,
        cityId: district.city_id,
        population: district.population,
        avgIncome: district.avg_income,
        surface: district.surface,
        disposableIncome: district.disposable_income,
      }))
    } else {
      // Combine neighborhoods from all Madrid districts
      // In a real API implementation, you would fetch this data from the API
      const neighborhoods = [...mockCentroNeighborhoodsResponse, ...mockArganzuelaNeighborhoodsResponse]
      return neighborhoods.map((neighborhood) => ({
        id: neighborhood.id,
        name: neighborhood.name,
        districtId: neighborhood.district_id,
        cityId: neighborhood.city_id,
        population: neighborhood.population,
        avgIncome: neighborhood.avg_income,
        surface: neighborhood.surface,
        disposableIncome: neighborhood.disposable_income,
      }))
    }
  }
  return []
}

// Function to get TopoJSON data based on city and granularity level
export const getTopoJSON = (cityId: number, level: string) => {
  if (cityId === 1) {
    // Barcelona
    return level === "district" ? mockBarcelonaDistrictsGeoJsonResponse : mockBarcelonaNeighborhoodsGeoJsonResponse
  } else if (cityId === 2) {
    // Madrid
    return level === "district" ? mockMadridDistrictsGeoJsonResponse : mockMadridNeighborhoodsGeoJsonResponse
  }
  return null
}

// Function to get indicator value for a specific area
export const getIndicatorValue = async (areaId: number, indicatorId: number, level: string) => {
  try {
    // In a real implementation, this would be an API call
    // For now, we'll simulate the behavior with the existing data
    const geoLevelId = level === "district" ? 2 : 3
    const endpoint = `/api/indicators?geoLevelId=${geoLevelId}&geoId=${areaId}&year=2023`

    // This is a simplified approach - in a real implementation, you would make an actual API call
    // and handle the response properly
    const indicators = await fetchAPI(endpoint).catch(() => [])
    const indicator = indicators.find((ind: any) => ind.indicator_def_id === indicatorId)

    return indicator ? indicator.value : null
  } catch (error) {
    console.error("Error fetching indicator value:", error)
    return null
  }
}

// Export point features in the format expected by the current application
export const pointFeatures = [
  ...mockBarcelonaPointFeaturesResponse.map((feature) => ({
    id: feature.id,
    geoId: feature.geo_id,
    name: feature.name,
    featureType: mockFeatureDefinitionsResponse.find((def) => def.id === feature.feature_definition_id)?.name || "",
    latitude: feature.latitude,
    longitude: feature.longitude,
    properties: feature.properties,
  })),
  ...mockMadridPointFeaturesResponse.map((feature) => ({
    id: feature.id,
    geoId: feature.geo_id,
    name: feature.name,
    featureType: mockFeatureDefinitionsResponse.find((def) => def.id === feature.feature_definition_id)?.name || "",
    latitude: feature.latitude,
    longitude: feature.longitude,
    properties: feature.properties,
  })),
]

// Import missing mock data from mock-api-responses.ts
import {
  mockCiutatVellaNeighborhoodsResponse,
  mockEixampleNeighborhoodsResponse,
  mockCentroNeighborhoodsResponse,
  mockArganzuelaNeighborhoodsResponse,
  mockFeatureDefinitionsResponse,
} from "./mock-api-responses"
