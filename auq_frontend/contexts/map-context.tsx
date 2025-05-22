"use client"

import { createContext, useContext, useState, useCallback, useRef, type ReactNode, useEffect } from "react"

// Import cache clearing functions
import { clearCacheEntry as clearSupabaseCacheEntry } from "@/lib/supabase-client"
import { clearApiCacheEntry } from "@/lib/api-service"

// Import API service functions
import { getDistricts, getGeoJSON, getGeographicalLevels, getCityPointFeatures } from "@/lib/api-service"

// Import types
import type { City, District, Neighborhood, PointFeature } from "@/lib/api-types"

type Area = District | Neighborhood

type GranularityLevel = {
  id: number
  name: string
  level: string
}

// Update the PointFeatureType to include all feature types from the schema
type PointFeatureType = string

// Type for GeoJSON cache
type GeoJSONCache = {
  [key: string]: any // cityId_granularityLevel -> GeoJSON data
}

// Type for filters
type Filters = {
  populationMin: number
  populationMax: number
  incomeMin: number
  incomeMax: number
  surfaceMin: number
  surfaceMax: number
  disposableIncomeMin: number
  disposableIncomeMax: number
}

// Type for filter ranges
type FilterRanges = {
  population: { min: number; max: number }
  income: { min: number; max: number }
  surface: { min: number; max: number }
  disposableIncome: { min: number; max: number }
}

// Map type (for tile layer)
type MapType = "osm" | "satellite" | "grayscale" | "terrain" | "dark" | "watercolor"

// Nuevo tipo para filtros dinámicos
export type DynamicFilter = {
  key: string
  name: string
  unit?: string
  min: number
  max: number
  value: [number, number]
}

// Feature type mapping - consistent with database seed
const featureTypeMap: Record<string, string> = {
  "1": "library",
  "2": "cultural_center",
  "3": "auditorium",
  "4": "heritage_space",
  "5": "creation_factory",
  "6": "museum",
  "7": "cinema",
  "8": "exhibition_center",
  "9": "archive",
  "10": "live_music_venue",
  "11": "performing_arts_venue",
  "12": "municipal_market",
  "13": "park_garden",
  "14": "educational_center",
}

type MapContextType = {
  selectedCity: City | null
  setSelectedCity: (city: City | null) => void
  selectedGranularity: GranularityLevel | null
  setSelectedGranularity: (granularity: GranularityLevel | null) => void
  selectedArea: Area | null
  setSelectedArea: (area: Area | null) => void
  comparisonArea: Area | null
  setComparisonArea: (area: Area | null) => void
  availableAreas: Area[]
  filters: Filters
  setFilters: (filters: Filters) => void
  filterRanges: FilterRanges
  resetFilters: () => void
  visiblePointTypes: Record<string, boolean>
  setVisiblePointTypes: (types: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void
  currentGeoJSON: any
  setCurrentGeoJSON: (data: any) => void
  isLoadingGeoJSON: boolean
  loadGeoJSON: (cityId: number, granularityLevel: string) => Promise<void>
  mapInitialized: boolean
  setMapInitialized: (initialized: boolean) => void
  hasSelectedGranularity: boolean
  setHasSelectedGranularity: (value: boolean) => void
  forceRefresh: number
  triggerRefresh: () => void
  mapType: MapType
  setMapType: (type: MapType) => void
  clearPointFeaturesCache: (cityId?: number) => void
  dynamicFilters: DynamicFilter[]
  setDynamicFilters: (filters: DynamicFilter[]) => void
  dynamicPointTypes: string[]
  setDynamicPointTypes: (types: string[]) => void
  pointFeatures: PointFeature[]
  setPointFeatures: (features: PointFeature[]) => void
}

export const MapContext = createContext<MapContextType | undefined>(undefined)

// Create global variables to store state across page navigations
let globalSelectedCity: City | null = null
let globalSelectedGranularity: GranularityLevel | null = null
let globalVisiblePointTypes: Record<string, boolean> | null = null
let globalFilters: Filters | null = null
let globalHasSelectedGranularity = false
let globalMapType: MapType = "grayscale"

// Update the defaultVisiblePointTypes in map-context.tsx to ensure consistency

// Initialize default visible point types based on feature definitions from schema
const defaultVisiblePointTypes: Record<string, boolean> = {
  // String feature types
  library: true,
  cultural_center: true,
  auditorium: true,
  heritage_space: true,
  creation_factory: true,
  museum: true,
  cinema: true,
  exhibition_center: true,
  archive: true,
  live_music_venue: true,
  performing_arts_venue: true,
  municipal_market: true,
  park_garden: true,
  educational_center: true,
  // Numeric IDs for compatibility
  "1": true,
  "2": true,
  "3": true,
  "4": true,
  "5": true,
  "6": true,
  "7": true,
  "8": true,
  "9": true,
  "10": true,
  "11": true,
  "12": true,
  "13": true,
  "14": true,
}

const defaultFilters: Filters = {
  populationMin: 0,
  populationMax: 300000,
  incomeMin: 0,
  incomeMax: 60000,
  surfaceMin: 0,
  surfaceMax: 20,
  disposableIncomeMin: 0,
  disposableIncomeMax: 30000,
}

const defaultFilterRanges: FilterRanges = {
  population: { min: 0, max: 300000 },
  income: { min: 0, max: 60000 },
  surface: { min: 0, max: 20 },
  disposableIncome: { min: 0, max: 30000 },
}

export function MapProvider({ children }: { children: ReactNode }) {
  // Use the global variables as initial state
  const [selectedCity, _setSelectedCity] = useState<City | null>(globalSelectedCity)
  const [selectedGranularity, _setSelectedGranularity] = useState<GranularityLevel | null>(globalSelectedGranularity)
  const [selectedArea, setSelectedArea] = useState<Area | null>(null)
  const [comparisonArea, setComparisonArea] = useState<Area | null>(null)
  const [availableAreas, setAvailableAreas] = useState<Area[]>([])
  const [filters, _setFilters] = useState<Filters>(globalFilters || defaultFilters)
  const [filterRanges, setFilterRanges] = useState<FilterRanges>(defaultFilterRanges)
  const [visiblePointTypes, _setVisiblePointTypes] = useState<Record<string, boolean>>(
    globalVisiblePointTypes || defaultVisiblePointTypes,
  )
  const [hasSelectedGranularity, _setHasSelectedGranularity] = useState<boolean>(globalHasSelectedGranularity)
  const [mapType, _setMapType] = useState<MapType>(globalMapType)

  // States for optimized loading
  const [geoJSONCache, setGeoJSONCache] = useState<GeoJSONCache>({})
  const [currentGeoJSON, setCurrentGeoJSON] = useState<any>(null)
  const [isLoadingGeoJSON, setIsLoadingGeoJSON] = useState<boolean>(false)
  const [mapInitialized, setMapInitialized] = useState<boolean>(false)

  // Add a force refresh counter to trigger re-renders
  const [forceRefresh, setForceRefresh] = useState<number>(0)
  const triggerRefresh = useCallback(() => {
    setForceRefresh((prev) => prev + 1)
  }, [])

  // Reference to track the last load request
  const lastLoadRequestRef = useRef<string>("")
  const prevCityIdRef = useRef<number | null>(null)
  const prevGranularityLevelRef = useRef<string | null>(null)
  const filterRangesLoadedRef = useRef<boolean>(false)

  // Nuevo estado para filtros dinámicos
  const [dynamicFilters, setDynamicFilters] = useState<DynamicFilter[]>([])

  // Nuevo estado para dynamicPointTypes
  const [dynamicPointTypes, setDynamicPointTypes] = useState<string[]>([])

  // Nuevo estado para pointFeatures
  const [pointFeatures, setPointFeatures] = useState<PointFeature[]>([])

  // Load available point types when city changes
  useEffect(() => {
    async function loadAvailablePointTypes() {
      if (!selectedCity) {
        setDynamicPointTypes([])
        setVisiblePointTypes({})
        return
      }

      try {
        console.log(`[MapContext] Loading point features for city ${selectedCity.id}`)
        const features = await getCityPointFeatures(selectedCity.id)
        console.log(`[MapContext] Loaded ${features.length} point features`)

        // Get unique feature types
        const uniqueTypes = Array.from(
          new Set(
            features
              .map(f => f.featureType)
              .filter((type): type is string => type !== undefined)
          )
        )
        console.log(`[MapContext] Found ${uniqueTypes.length} unique feature types:`, uniqueTypes)

        // Initialize visibility state for each type
        const initialVisibility = uniqueTypes.reduce<Record<string, boolean>>((acc, type) => {
          acc[type] = true // All types visible by default
          return acc
        }, {})

        console.log("[MapContext] Initial visibility state:", initialVisibility)

        setDynamicPointTypes(uniqueTypes)
        setVisiblePointTypes(initialVisibility)
      } catch (error) {
        console.error("[MapContext] Error loading point types:", error)
        setDynamicPointTypes([])
        setVisiblePointTypes({})
      }
    }

    loadAvailablePointTypes()
  }, [selectedCity])

  // Update the loadAvailableAreas function to use direct Supabase data
  const loadAvailableAreas = useCallback(async (cityId: number, granularityLevel: string) => {
    if (!cityId || !granularityLevel) return

    try {
      let areas: Area[] = []

      if (granularityLevel === "district") {
        // For districts, we can still use the API service function since it's useful to have
        const districtsData = await getDistricts(cityId)

        // Ensure districtsData is an array before mapping
        let districtsArray = []
        if (Array.isArray(districtsData)) {
          districtsArray = districtsData
        } else if (districtsData && typeof districtsData === "object") {
          // Try to extract data if it's in a nested property
          if (Array.isArray(districtsData.data)) {
            districtsArray = districtsData.data
          }
        }

        // Transform API response to match the expected Area type
        areas = districtsArray.map((district) => ({
          id: district.id,
          name: district.name,
          cityId: district.city_id,
          population: district.population || 0,
          avgIncome: district.avg_income || 0,
          surface: district.surface || 0,
          disposableIncome: district.disposable_income || 0,
        }))

        console.log(`Loaded ${areas.length} districts for city ${cityId}`)
      } else if (granularityLevel === "neighbourhood" || granularityLevel === "neighborhood") {
        // For neighborhoods, use the GeoJSON data which contains all neighborhoods
        try {
          const geoJsonData = await getGeoJSON(cityId, "neighborhood")

          if (geoJsonData && geoJsonData.features) {
            areas = geoJsonData.features.map((feature) => ({
              id: feature.properties.id,
              name: feature.properties.name,
              districtId: feature.properties.district_id,
              cityId: feature.properties.city_id,
              population: feature.properties.population || 0,
              avgIncome: feature.properties.avg_income || 0,
              surface: feature.properties.surface || 0,
              disposableIncome: feature.properties.disposable_income || 0,
            }))
          }
        } catch (error) {
          console.error("Error fetching neighborhoods from GeoJSON:", error)
          throw error
        }
      }

      setAvailableAreas(areas)
    } catch (error) {
      console.error("Error loading available areas:", error)
      setAvailableAreas([])
    }
  }, [])

  // Function to load GeoJSON data with caching
  const loadGeoJSON = useCallback(
    async (cityId: number, granularityLevel: string) => {
      if (!cityId || !granularityLevel) {
        console.log("loadGeoJSON: Missing cityId or granularityLevel")
        return
      }

      console.log(`loadGeoJSON: Loading data for city ${cityId}, granularity ${granularityLevel}`)

      const cacheKey = `${cityId}_${granularityLevel}`

      // Save this request as the last one
      lastLoadRequestRef.current = cacheKey

      // If we already have the data in cache, use it
      if (geoJSONCache[cacheKey]) {
        console.log("Using GeoJSON data from cache:", cacheKey)
        setCurrentGeoJSON(geoJSONCache[cacheKey])

        // Even when using cached data, we should still load available areas
        // but we don't need to wait for it to complete
        loadAvailableAreas(cityId, granularityLevel).catch((error) =>
          console.error("Error loading available areas from cache:", error),
        )

        triggerRefresh() // Force refresh when using cached data
        return
      }

      // If not in cache, load it
      console.log("Loading GeoJSON data:", cacheKey)
      setIsLoadingGeoJSON(true)

      try {
        // Load GeoJSON data
        const data = await getGeoJSON(cityId, granularityLevel)

        // Check if this request is still the latest
        if (lastLoadRequestRef.current !== cacheKey) {
          console.log("Request cancelled, there's a more recent one:", cacheKey)
          setIsLoadingGeoJSON(false)
          return
        }

        if (!data) {
          console.error("Failed to get GeoJSON data for:", cacheKey)
          setIsLoadingGeoJSON(false)
          return
        }

        // Log the data structure to help with debugging
        console.log(
          `GeoJSON data structure for ${cacheKey}:`,
          data.type ? `Type: ${data.type}, Features: ${data.features?.length || 0}` : "Unexpected data format",
        )

        // Save to cache
        setGeoJSONCache((prevCache) => ({
          ...prevCache,
          [cacheKey]: data,
        }))

        // Update current state
        setCurrentGeoJSON(data)
        setIsLoadingGeoJSON(false)

        // Load available areas in parallel
        loadAvailableAreas(cityId, granularityLevel).catch((error) =>
          console.error("Error loading available areas:", error),
        )

        triggerRefresh() // Force refresh when loading new data

        console.log("GeoJSON data loaded and saved to cache:", cacheKey)
      } catch (error) {
        console.error("Error loading GeoJSON data:", error)
        setIsLoadingGeoJSON(false)
      }
    },
    [geoJSONCache, triggerRefresh, loadAvailableAreas],
  )

  // Function to load filter ranges based on available data
  const loadFilterRanges = useCallback(async (cityId: number, granularityLevel: string) => {
    if (!cityId || !granularityLevel) return

    const cityChanged = cityId !== prevCityIdRef.current
    const granularityChanged = granularityLevel !== prevGranularityLevelRef.current

    if (!cityChanged && !granularityChanged && filterRangesLoadedRef.current) {
      return
    }

    console.log(`Loading filter ranges for: ${cityId}_${granularityLevel}`)

    try {
      let areas: any[] = []

      if (granularityLevel === "district") {
        // Fetch districts for the selected city using the service function
        const districtsData = await getDistricts(cityId)
        areas = districtsData
      } else if (granularityLevel === "neighbourhood" || granularityLevel === "neighborhood") {
        // For neighborhoods, use the GeoJSON data which contains all neighborhoods
        try {
          const geoJsonData = await getGeoJSON(cityId, "neighborhood")

          if (geoJsonData && geoJsonData.features) {
            areas = geoJsonData.features.map((feature: any) => ({
              population: feature.properties.population,
              avg_income: feature.properties.avg_income,
              surface: feature.properties.surface,
              disposable_income: feature.properties.disposable_income,
            }))
          }
        } catch (error) {
          console.error("Error fetching neighborhoods from GeoJSON:", error)
          throw error // Re-throw to be caught by the outer try-catch
        }
      }

      if (areas.length > 0) {
        // Extract values, handling both snake_case and camelCase property names
        const populationValues = areas.map((area) => area.population).filter(Boolean)
        const incomeValues = areas.map((area) => area.avg_income || area.avgIncome).filter(Boolean)
        const surfaceValues = areas.map((area) => area.surface || 0).filter(Boolean)
        const disposableIncomeValues = areas
          .map((area) => area.disposable_income || area.disposableIncome || 0)
          .filter(Boolean)

        // Calculate min and max values with fallbacks
        const populationMin = populationValues.length > 0 ? Math.min(...populationValues) : 0
        const populationMax = populationValues.length > 0 ? Math.max(...populationValues) : 300000
        const incomeMin = incomeValues.length > 0 ? Math.min(...incomeValues) : 0
        const incomeMax = incomeValues.length > 0 ? Math.max(...incomeValues) : 60000
        const surfaceMin = surfaceValues.length > 0 ? Math.min(...surfaceValues) : 0
        const surfaceMax = surfaceValues.length > 0 ? Math.max(...surfaceValues) : 20
        const disposableIncomeMin = disposableIncomeValues.length > 0 ? Math.min(...disposableIncomeValues) : 0
        const disposableIncomeMax = disposableIncomeValues.length > 0 ? Math.max(...disposableIncomeValues) : 30000

        // Update filter ranges
        const newRanges = {
          population: { min: populationMin, max: populationMax },
          income: { min: incomeMin, max: incomeMax },
          surface: { min: surfaceMin, max: surfaceMax },
          disposableIncome: { min: disposableIncomeMin, max: disposableIncomeMax },
        }

        console.log("Setting new filter ranges:", newRanges)
        setFilterRanges(newRanges)

        // Reset filters to full range when city or granularity changes
        if (cityChanged || granularityChanged || !filterRangesLoadedRef.current) {
          const newFilters = {
            populationMin,
            populationMax,
            incomeMin,
            incomeMax,
            surfaceMin,
            surfaceMax,
            disposableIncomeMin,
            disposableIncomeMax,
          }
          console.log("Resetting filters to full range:", newFilters)
          _setFilters(newFilters)
        }

        // Update refs
        prevCityIdRef.current = cityId
        prevGranularityLevelRef.current = granularityLevel
        filterRangesLoadedRef.current = true
      }
    } catch (error) {
      console.error("Error loading filter ranges:", error)
    }
  }, [])

  // Reset filters to their full range
  const resetFilters = useCallback(() => {
    if (!filterRanges) return

    const newFilters = {
      populationMin: filterRanges.population.min,
      populationMax: filterRanges.population.max,
      incomeMin: filterRanges.income.min,
      incomeMax: filterRanges.income.max,
      surfaceMin: filterRanges.surface.min,
      surfaceMax: filterRanges.surface.max,
      disposableIncomeMin: filterRanges.disposableIncome.min,
      disposableIncomeMax: filterRanges.disposableIncome.max,
    }

    console.log("Manually resetting filters to full range:", newFilters)
    _setFilters(newFilters)
    triggerRefresh()
  }, [filterRanges, triggerRefresh])

  // Function to clear point features cache
  const clearPointFeaturesCache = useCallback((cityId?: number) => {
    console.log(`Clearing point features cache${cityId ? ` for city ${cityId}` : ""}`)
    if (cityId) {
      clearApiCacheEntry("pointFeatures", cityId)
      clearSupabaseCacheEntry("pointFeatures", cityId)
    } else {
      clearApiCacheEntry("pointFeatures")
      clearSupabaseCacheEntry("pointFeatures")
    }
  }, [])

  // Custom setter for selectedCity that also updates the global variable
  const setSelectedCity = useCallback(
    (city: City | null) => {
      // Only update if the value actually changed
      if (city?.id !== selectedCity?.id) {
        globalSelectedCity = city
        // Clear point features cache for the previous city
        if (selectedCity && city && selectedCity.id !== city.id) {
          clearPointFeaturesCache(selectedCity.id)
        }
        _setSelectedCity(city)

        // Reset selected areas
        setSelectedArea(null)
        setComparisonArea(null)

        // Reset filter ranges loaded flag
        filterRangesLoadedRef.current = false

        // If a city is selected and we already have a granularity level, load the data
        if (city && selectedGranularity && hasSelectedGranularity && mapInitialized) {
          console.log("City changed, loading data with existing granularity:", selectedGranularity.level)
          // Use setTimeout to ensure state updates have propagated
          setTimeout(() => {
            loadGeoJSON(city.id, selectedGranularity.level)
            loadAvailableAreas(city.id, selectedGranularity.level)
            loadFilterRanges(city.id, selectedGranularity.level)
          }, 0)
        } else if (city) {
          // If no granularity has been selected yet, clear the current GeoJSON
          setCurrentGeoJSON(null)
        }
      }
    },
    [
      selectedCity,
      selectedGranularity,
      hasSelectedGranularity,
      mapInitialized,
      loadGeoJSON,
      loadAvailableAreas,
      loadFilterRanges,
      clearPointFeaturesCache,
    ],
  )

  // Custom setter for selectedGranularity that also updates the global variable
  const setSelectedGranularity = useCallback(
    (granularity: GranularityLevel | null) => {
      // Only update if the value actually changed
      if (granularity?.level !== selectedGranularity?.level) {
        globalSelectedGranularity = granularity
        _setSelectedGranularity(granularity)

        // Reset filter ranges loaded flag
        filterRangesLoadedRef.current = false

        // If this is the first time selecting a granularity, mark it
        if (granularity && !hasSelectedGranularity) {
          setHasSelectedGranularity(true)
        }

        // If we have both city and granularity, load the data immediately
        if (selectedCity && granularity && mapInitialized) {
          console.log("Granularity changed, loading data:", granularity.level)
          loadGeoJSON(selectedCity.id, granularity.level)
          loadAvailableAreas(selectedCity.id, granularity.level)
          loadFilterRanges(selectedCity.id, granularity.level)
        }
      }
    },
    [
      selectedCity,
      selectedGranularity,
      hasSelectedGranularity,
      mapInitialized,
      loadGeoJSON,
      loadAvailableAreas,
      loadFilterRanges,
    ],
  )

  // Custom setter for hasSelectedGranularity that also updates the global variable
  const setHasSelectedGranularity = useCallback(
    (value: boolean) => {
      if (value !== hasSelectedGranularity) {
        globalHasSelectedGranularity = value
        _setHasSelectedGranularity(value)
      }
    },
    [hasSelectedGranularity],
  )

  // Custom setter for filters that also updates the global variable
  const setFilters = useCallback(
    (newFilters: Filters) => {
      // Only update if values actually changed
      if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
        globalFilters = newFilters
        _setFilters(newFilters)
      }
    },
    [filters],
  )

  // Custom setter for visiblePointTypes that also updates the global variable
  const setVisiblePointTypes = useCallback(
    (typesOrUpdater: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => {
      _setVisiblePointTypes(prev => {
        const types = typeof typesOrUpdater === 'function' ? typesOrUpdater(prev) : typesOrUpdater
        const hasChanged = Object.keys(types).some((key) => types[key] !== globalVisiblePointTypes?.[key])
        if (hasChanged) {
          globalVisiblePointTypes = types
          // triggerRefresh() eliminado para evitar doble render y desfase
        }
        return types
      })
    },
    [triggerRefresh],
  )

  // Custom setter for mapType that also updates the global variable
  const setMapType = useCallback(
    (type: MapType) => {
      if (type !== mapType) {
        console.log(`Setting map type from ${mapType} to ${type}`)
        globalMapType = type
        _setMapType(type)
        // Force a refresh after changing the map type
        setTimeout(() => {
          triggerRefresh()
        }, 0)
      }
    },
    [mapType, triggerRefresh],
  )

  // Effect to load data when map is initialized and we have both city and granularity
  useEffect(() => {
    if (mapInitialized && selectedCity && selectedGranularity) {
      console.log("Map initialized and we have city and granularity, loading data")
      loadGeoJSON(selectedCity.id, selectedGranularity.level)
      loadAvailableAreas(selectedCity.id, selectedGranularity.level)
      loadFilterRanges(selectedCity.id, selectedGranularity.level)
    }
  }, [mapInitialized, selectedCity, selectedGranularity, loadGeoJSON, loadAvailableAreas, loadFilterRanges])

  // Load granularity levels on mount
  useEffect(() => {
    async function loadGranularityLevels() {
      try {
        const levels = await getGeographicalLevels()
        if (levels && levels.length > 0 && !selectedGranularity) {
          // Set default granularity to "district" if available
          const districtLevel = levels.find((level) => level.level === "district")
          if (districtLevel) {
            setSelectedGranularity(districtLevel)
          }
        }
      } catch (error) {
        console.error("Error loading granularity levels:", error)
      }
    }

    loadGranularityLevels()
  }, [selectedGranularity, setSelectedGranularity])

  // Detectar indicadores y rangos dinámicamente al cargar el GeoJSON
  useEffect(() => {
    if (!currentGeoJSON || !currentGeoJSON.features || currentGeoJSON.features.length === 0) {
      setDynamicFilters([])
      return
    }
    // Tomar todas las keys numéricas de las propiedades del primer feature
    const sampleProps = currentGeoJSON.features[0].properties
    const indicatorKeys = Object.keys(sampleProps).filter(
      (key) => typeof sampleProps[key] === 'number' && key !== 'id' && key !== 'district_code' && key !== 'city_id' && key !== 'neighbourhood_code' && key !== 'district_id'
    )
    // Para cada indicador, calcular min y max
    const filters: DynamicFilter[] = indicatorKeys.map((key) => {
      const values = currentGeoJSON.features.map(f => f.properties[key]).filter(v => typeof v === 'number')
      const min = Math.min(...values)
      const max = Math.max(...values)
      return {
        key,
        name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        min,
        max,
        value: [min, max],
      }
    })
    setDynamicFilters(filters)
  }, [currentGeoJSON])

  // Actualizar dynamicPointTypes cuando cambian los pointFeatures
  useEffect(() => {
    if (!pointFeatures || pointFeatures.length === 0) {
      setDynamicPointTypes([])
      return
    }
    const types = Array.from(new Set(pointFeatures.map(f => f.featureType).filter(Boolean)))
    setDynamicPointTypes(types)
  }, [pointFeatures])

  // Sincroniza visiblePointTypes con dynamicPointTypes
  useEffect(() => {
    if (!dynamicPointTypes.length) return
    _setVisiblePointTypes(prev => {
      // Si el estado está vacío, activa todos los tipos por defecto
      if (Object.keys(prev).length === 0) {
        const allActive = Object.fromEntries(dynamicPointTypes.map(type => [type, true]))
        return allActive
      }
      // Activa por defecto todos los tipos nuevos que no estén en el estado actual
      const updated = { ...prev }
      let changed = false
      dynamicPointTypes.forEach(type => {
        if (!(type in updated)) {
          updated[type] = true
          changed = true
        }
      })
      // Elimina tipos que ya no existen en dynamicPointTypes
      Object.keys(updated).forEach(type => {
        if (!dynamicPointTypes.includes(type)) {
          delete updated[type]
          changed = true
        }
      })
      return changed ? updated : prev
    })
  }, [dynamicPointTypes])

  return (
    <MapContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        selectedGranularity,
        setSelectedGranularity,
        selectedArea,
        setSelectedArea,
        comparisonArea,
        setComparisonArea,
        availableAreas,
        filters,
        setFilters,
        filterRanges,
        resetFilters,
        visiblePointTypes,
        setVisiblePointTypes,
        currentGeoJSON,
        setCurrentGeoJSON,
        isLoadingGeoJSON,
        loadGeoJSON,
        mapInitialized,
        setMapInitialized,
        hasSelectedGranularity,
        setHasSelectedGranularity,
        forceRefresh,
        triggerRefresh,
        mapType,
        setMapType,
        clearPointFeaturesCache,
        dynamicFilters,
        setDynamicFilters,
        dynamicPointTypes,
        setDynamicPointTypes,
        pointFeatures,
        setPointFeatures,
      }}
    >
      {children}
    </MapContext.Provider>
  )
}

export function useMapContext() {
  const context = useContext(MapContext)
  if (context === undefined) {
    throw new Error("useMapContext must be used within a MapProvider")
  }
  return context
}
