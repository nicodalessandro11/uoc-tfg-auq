// Types for API responses

export type City = {
  id: number
  name: string
}

export type GranularityLevel = {
  id: number
  name: string
  level: string
}

export type District = {
  id: number
  name: string
  district_code: number
  city_id: number
  population: number
  avg_income: number
  surface: number
  disposable_income: number
}

export type Neighborhood = {
  id: number
  name: string
  neighbourhood_code: number
  district_id: number
  city_id: number
  population: number
  avg_income: number
  surface: number
  disposable_income: number
}

export type IndicatorDefinition = {
  id: number
  name: string
  unit: string
  description: string
  category: string
}

export type Indicator = {
  id: number
  indicator_def_id: number
  geo_level_id: number
  geo_id: number
  year: number
  value: number
}

export type FeatureDefinition = {
  id: number
  name: string
  description: string
}

export type PointFeature = {
  id: number
  feature_definition_id: number
  name: string
  latitude: number
  longitude: number
  geo_level_id: number
  geo_id: number
  properties: Record<string, any>
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
  }
  area2: {
    id: number
    name: string
    indicators: Array<{
      id: number
      name: string
      value: number
      unit: string
    }>
  }
}

export type FilterResponse = Array<District | Neighborhood>
