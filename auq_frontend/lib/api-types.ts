// Types for API responses based on the database schema

export type City = {
  id: number
  name: string
  country?: string
  created_at?: string
}

export type GranularityLevel = {
  id: number
  name: string
  level: string
}

export type District = {
  id: number
  name: string
  district_code?: number
  city_id: number
  population?: number
  avg_income?: number
  surface?: number
  disposable_income?: number
  created_at?: string
}

export type Neighborhood = {
  id: number
  name: string
  neighbourhood_code?: number
  district_id: number
  city_id: number
  population?: number
  avg_income?: number
  surface?: number
  disposable_income?: number
  created_at?: string
}

export type IndicatorDefinition = {
  id: number
  name: string
  unit?: string
  description?: string
  category?: string
  created_at?: string
  year?: number
}

export type Indicator = {
  id: number
  indicator_def_id: number
  geo_level_id: number
  geo_id: number
  year: number
  value: number
  created_at?: string
}

export type FeatureDefinition = {
  id: number
  name: string
  description?: string
  created_at?: string
}

export type PointFeature = {
  id: number
  feature_definition_id: number
  name: string
  latitude: number
  longitude: number
  geo_level_id: number
  geo_id: number
  city_id?: number
  properties?: Record<string, any>
  created_at?: string
  // For client-side use
  featureType?: string
  geoId?: number
}

export type GeoJSONFeature = {
  type: "Feature"
  properties: {
    id: number
    name: string
    [key: string]: any
  }
  geometry: {
    type: string
    coordinates: any[]
  }
}

export type GeoJSONResponse = {
  type: "FeatureCollection"
  features: GeoJSONFeature[]
}

export type ComparisonResponse = {
  area1: {
    id: number
    name: string
    indicators: Array<{
      id: number
      name: string
      value: number
      unit: string
    }>
  } | null
  area2: {
    id: number
    name: string
    indicators: Array<{
      id: number
      name: string
      value: number
      unit: string
    }>
  } | null
}

export type FilterResponse = Array<District | Neighborhood>

export type Area = District & Neighborhood
