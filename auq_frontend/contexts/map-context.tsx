"use client"

import { createContext, useContext, useState, useCallback, useRef, type ReactNode, useEffect, type Dispatch, type SetStateAction } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { analyticsLogger } from "@/lib/analytics/logger"
import { URL_PARAMS, STORAGE_KEYS } from "@/lib/constants"

// Import cache clearing functions
import { clearCacheEntry as clearSupabaseCacheEntry } from "@/lib/supabase-client"
import { clearApiCacheEntry } from "@/lib/api-service"

// Import API service functions
import { getDistricts, getGeoJSON, getGeographicalLevels, getCityPointFeatures } from "@/lib/api-service"

// Import types
import type { City, District, Neighborhood, PointFeature, Area, DynamicFilter, GeoJSONResponse } from "@/lib/api-types"

// Update GranularityLevel type to match what we're using
type GranularityLevel = {
  level: string
  name: string
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

interface MapContextType {
  selectedCity: City | null
  setSelectedCity: (city: City | null) => void
  selectedArea: Area | null
  setSelectedArea: (area: Area | null) => void
  selectedGranularity: GranularityLevel | null
  setSelectedGranularity: (granularity: GranularityLevel | null) => void
  currentGeoJSON: GeoJSONResponse | null
  setCurrentGeoJSON: (geoJSON: GeoJSONResponse | null) => void
  visiblePointTypes: Record<string, boolean>
  setVisiblePointTypes: (types: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void
  dynamicPointTypes: string[]
  setDynamicPointTypes: (types: string[]) => void
  dynamicFilters: DynamicFilter[]
  setDynamicFilters: (filters: DynamicFilter[]) => void
  isLoadingGeoJSON: boolean
  setIsLoadingGeoJSON: (loading: boolean) => void
  hasSelectedGranularity: boolean
  mapType: MapType
  setMapType: (type: MapType) => void
  pointFeatures: PointFeature[]
  setPointFeatures: (features: PointFeature[]) => void
  resetFilters: () => void
  triggerRefresh: () => void
  mapInitialized: boolean
  setMapInitialized: (initialized: boolean) => void
  comparisonArea: Area | null
  setComparisonArea: (area: Area | null) => void
  availableAreas: Area[]
  loadGeoJSON: (cityId: number, granularityLevel: string) => Promise<void>
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export function MapProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedCity, setSelectedCityState] = useState<City | null>(null)
  const [selectedArea, setSelectedAreaState] = useState<Area | null>(null)
  const [selectedGranularity, setSelectedGranularityState] = useState<GranularityLevel | null>(null)
  const [comparisonArea, setComparisonArea] = useState<Area | null>(null)
  const [availableAreas, setAvailableAreas] = useState<Area[]>([])

  // Default filters
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

  const [filters, _setFilters] = useState<Filters>(defaultFilters)
  const [filterRanges, setFilterRanges] = useState<FilterRanges>({
    population: { min: 0, max: 300000 },
    income: { min: 0, max: 60000 },
    surface: { min: 0, max: 20 },
    disposableIncome: { min: 0, max: 30000 },
  })
  const [visiblePointTypes, setVisiblePointTypesState] = useState<Record<string, boolean>>({})
  const [hasSelectedGranularity, _setHasSelectedGranularity] = useState<boolean>(false)
  const [mapType, setMapTypeState] = useState<MapType>("grayscale")
  const [currentGeoJSON, setCurrentGeoJSONState] = useState<GeoJSONResponse | null>(null)
  const [isLoadingGeoJSON, setIsLoadingGeoJSONState] = useState<boolean>(false)
  const [mapInitialized, setMapInitialized] = useState<boolean>(false)
  const [forceRefresh, setForceRefresh] = useState<number>(0)
  const [dynamicFilters, setDynamicFiltersState] = useState<DynamicFilter[]>([])
  const [dynamicPointTypes, setDynamicPointTypesState] = useState<string[]>([])
  const [pointFeatures, setPointFeaturesState] = useState<PointFeature[]>([])
  const [pointFeaturesCache, setPointFeaturesCache] = useState<Record<number, GeoJSONResponse>>({})

  // Reference to track the last load request
  const lastLoadRequestRef = useRef<string>("")
  const prevCityIdRef = useRef<number | null>(null)
  const prevGranularityLevelRef = useRef<string | null>(null)
  const filterRangesLoadedRef = useRef<boolean>(false)

  // Trigger map refresh - moved to the top
  const triggerRefresh = useCallback(() => {
    // Force a re-render of the map
    setCurrentGeoJSONState(prev => prev ? { ...prev } : null)
  }, [])

  // Initialize city from URL or localStorage
  useEffect(() => {
    if (!searchParams) return;

    const cityId = searchParams.get(URL_PARAMS.CITY);
    if (cityId) {
      // Only set the city if it's different from the current one
      if (!selectedCity || selectedCity.id.toString() !== cityId) {
        const savedCity = localStorage.getItem(STORAGE_KEYS.SELECTED_CITY);
        if (savedCity) {
          try {
            const parsedCity = JSON.parse(savedCity);
            if (parsedCity.id.toString() === cityId) {
              setSelectedCityState(parsedCity);
            }
          } catch (error) {
            console.error("Error parsing saved city:", error);
          }
        }
      }
    }
  }, [searchParams, selectedCity]);

  // Sync selectedGranularity with the ?level= param in the URL
  useEffect(() => {
    if (!searchParams) return;

    const levelParam = searchParams.get("level");
    if (levelParam && (!selectedGranularity || selectedGranularity.level !== levelParam)) {
      // Try to find a matching granularity level
      const granularityLevels = [
        { id: 2, name: "Districts", level: "district" },
        { id: 3, name: "Neighborhoods", level: "neighborhood" },
      ];
      const found = granularityLevels.find(g => g.level === levelParam);
      if (found) {
        setSelectedGranularityState(found);
        _setHasSelectedGranularity(true);
      }
    }
  }, [searchParams, selectedGranularity]);

  // Load available point types when city changes
  useEffect(() => {
    async function loadAvailablePointTypes() {
      if (!selectedCity) {
        setDynamicPointTypesState([])
        setVisiblePointTypesState({})
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

        // Try to load saved visibility state from localStorage
        const savedVisibility = localStorage.getItem(`visiblePointTypes_${selectedCity.id}`)
        let initialVisibility: Record<string, boolean>

        if (savedVisibility) {
          try {
            initialVisibility = JSON.parse(savedVisibility)
            // Ensure all current types are in the saved state
            uniqueTypes.forEach(type => {
              if (!(type in initialVisibility)) {
                initialVisibility[type] = false
              }
            })
            // Remove any types that no longer exist
            Object.keys(initialVisibility).forEach(type => {
              if (!uniqueTypes.includes(type)) {
                delete initialVisibility[type]
              }
            })
          } catch (error) {
            console.error("[MapContext] Error parsing saved visibility state:", error)
            initialVisibility = uniqueTypes.reduce<Record<string, boolean>>((acc, type) => {
              acc[type] = false
              return acc
            }, {})
          }
        } else {
          // Initialize all types as hidden if no saved state exists
          initialVisibility = uniqueTypes.reduce<Record<string, boolean>>((acc, type) => {
            acc[type] = false
            return acc
          }, {})
        }

        console.log("[MapContext] Initial visibility state:", initialVisibility)

        setDynamicPointTypesState(uniqueTypes)
        setVisiblePointTypesState(initialVisibility)
      } catch (error) {
        console.error("[MapContext] Error loading point types:", error)
        setDynamicPointTypesState([])
        setVisiblePointTypesState({})
      }
    }

    loadAvailablePointTypes()
  }, [selectedCity])

  // Add effect to restore visibility state when navigating to root
  useEffect(() => {
    if (selectedCity) {
      const savedVisibility = localStorage.getItem(`visiblePointTypes_${selectedCity.id}`)
      if (savedVisibility) {
        try {
          const parsedVisibility = JSON.parse(savedVisibility)
          setVisiblePointTypesState(parsedVisibility)
        } catch (error) {
          console.error("[MapContext] Error restoring visibility state:", error)
        }
      }
    }
  }, [selectedCity])

  // Update the loadAvailableAreas function to use direct Supabase data
  const loadAvailableAreas = useCallback(async (cityId: number, granularityLevel: string) => {
    if (!cityId || !granularityLevel) return

    // Only load areas if we have a selected area or if we're changing granularity
    if (!selectedArea && !prevGranularityLevelRef.current) return

    try {
      let areas: any[] = []

      if (granularityLevel === "district") {
        const districtsData = await getDistricts(cityId)
        areas = districtsData
      } else if (granularityLevel === "neighborhood" || granularityLevel === "neighbourhood") {
        try {
          const geoJsonData = await getGeoJSON(cityId, "neighborhood")
          if (geoJsonData && geoJsonData.features) {
            areas = geoJsonData.features.map((feature: any) => {
              const properties = feature.properties || {}
              return {
                id: properties.id,
                name: properties.name,
                districtId: properties.district_id,
                cityId: properties.city_id,
                district_id: properties.district_id,
                city_id: properties.city_id,
                population: properties.population || 0,
                avgIncome: properties.avg_income || 0,
                surface: properties.surface || 0,
                disposableIncome: properties.disposable_income || 0,
              }
            }).filter(area => area.id && area.name)
          }
        } catch (error) {
          throw error
        }
      }

      setAvailableAreas(areas)
    } catch (error) {
      setAvailableAreas([])
    }
  }, [selectedArea])

  // Function to load GeoJSON data with caching
  const loadGeoJSON = useCallback(
    async (cityId: number, granularityLevel: string) => {
      if (!cityId || !granularityLevel) {
        return
      }

      const cacheKey = `${cityId}_${granularityLevel}`

      // If we're already loading this exact data, don't start another load
      if (lastLoadRequestRef.current === cacheKey && isLoadingGeoJSON) {
        return
      }

      // Save this request as the last one
      lastLoadRequestRef.current = cacheKey

      // If we already have the data in cache, use it
      if (pointFeaturesCache[cityId]) {
        setCurrentGeoJSONState(pointFeaturesCache[cityId])

        // Even when using cached data, we should still load available areas
        // but we don't need to wait for it to complete
        loadAvailableAreas(cityId, granularityLevel)

        setForceRefresh((prev) => prev + 1)
        return
      }

      // If not in cache, load it
      setIsLoadingGeoJSONState(true)

      try {
        // Load GeoJSON data
        const data = await getGeoJSON(cityId, granularityLevel)

        // Check if this request is still the latest
        if (lastLoadRequestRef.current !== cacheKey) {
          setIsLoadingGeoJSONState(false)
          return
        }

        if (!data) {
          setIsLoadingGeoJSONState(false)
          return
        }

        // Save to cache
        setPointFeaturesCache((prevCache) => ({
          ...prevCache,
          [cityId]: data,
        }))

        // Update current state
        setCurrentGeoJSONState(data)
        setIsLoadingGeoJSONState(false)

        // Load available areas in parallel
        loadAvailableAreas(cityId, granularityLevel)

        setForceRefresh((prev) => prev + 1)
      } catch (error) {
        setIsLoadingGeoJSONState(false)
      }
    },
    [pointFeaturesCache, loadAvailableAreas, isLoadingGeoJSON],
  )

  // Function to load filter ranges based on available data
  const loadFilterRanges = useCallback(async (cityId: number, granularityLevel: string) => {
    if (!cityId || !granularityLevel) return

    // Only load filter ranges if we have a selected area or if we're changing granularity
    if (!selectedArea && !prevGranularityLevelRef.current) return

    try {
      let areas: any[] = []

      if (granularityLevel === "district") {
        const districtsData = await getDistricts(cityId)
        areas = districtsData
      } else if (granularityLevel === "neighbourhood" || granularityLevel === "neighborhood") {
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
          throw error
        }
      }

      // Calculate filter ranges from areas data
      const ranges = {
        population: calculateRange(areas, "population"),
        avgIncome: calculateRange(areas, "avg_income"),
        surface: calculateRange(areas, "surface"),
        disposableIncome: calculateRange(areas, "disposable_income"),
      }

      setFilterRanges(ranges)
      filterRangesLoadedRef.current = true
    } catch (error) {
      setFilterRanges(null)
      filterRangesLoadedRef.current = false
    }
  }, [selectedArea])

  // Reset filters to their full range
  const resetFilters = useCallback(() => {
    if (!filterRanges) return;

    // Reset classic filters
    const newFilters = {
      populationMin: filterRanges.population.min,
      populationMax: filterRanges.population.max,
      incomeMin: filterRanges.income.min,
      incomeMax: filterRanges.income.max,
      surfaceMin: filterRanges.surface.min,
      surfaceMax: filterRanges.surface.max,
      disposableIncomeMin: filterRanges.disposableIncome.min,
      disposableIncomeMax: filterRanges.disposableIncome.max,
    };
    _setFilters(newFilters);

    // Reset dynamic filters (sliders)
    setDynamicFiltersState((prev) =>
      prev.map((f) => ({
        ...f,
        value: [f.min, f.max],
      }))
    );

    setForceRefresh((prev) => prev + 1);
  }, [filterRanges, _setFilters]);

  // Custom setter for selectedCity that also updates the global variable
  const setSelectedCity = useCallback((city: City | null) => {
    // Prevent unnecessary updates
    if (selectedCity?.id === city?.id) {
      return;
    }

    // Log city selection
    if (user && city) {
      analyticsLogger.logEvent({
        user_id: user.id,
        event_type: 'map.view',
        event_details: {
          city: city.name,
          city_id: city.id
        }
      });
    }

    // Update the URL using router
    const params = new URLSearchParams(window.location.search);
    if (city?.id) {
      params.set("city", city.id.toString());
    } else {
      params.delete("city");
    }
    params.delete("area"); // Always clear area on city change

    // Use replace instead of push to prevent adding to history
    router.replace(`?${params.toString()}`, { scroll: false });

    // Clear only the necessary state
    setCurrentGeoJSONState(null);
    setAvailableAreas([]);
    setSelectedAreaState(null);
    setDynamicFiltersState([]);
    _setFilters(defaultFilters);

    // Update the city state
    setSelectedCityState(city);

    // Force a refresh to ensure all components update
    triggerRefresh();

    // If we have a city and granularity, load the data immediately
    if (city && selectedGranularity) {
      Promise.all([
        loadGeoJSON(city.id, selectedGranularity.level),
        loadAvailableAreas(city.id, selectedGranularity.level),
        loadFilterRanges(city.id, selectedGranularity.level)
      ]).catch(error => {
        console.error("Error loading data for new city:", error);
      });
    }
  }, [selectedCity, selectedGranularity, loadGeoJSON, loadAvailableAreas, loadFilterRanges, triggerRefresh, user, router]);

  // Custom setter for selectedGranularity
  const setSelectedGranularity = useCallback(
    (granularity: GranularityLevel | null) => {
      // Only update if the value actually changed
      if (granularity?.level !== selectedGranularity?.level) {
        // Clear area selection and remove from URL BEFORE changing granularity
        setSelectedAreaState(null);
        const params = new URLSearchParams(window.location.search);
        if (params.has("area")) {
          params.delete("area");
          window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
        }

        setSelectedGranularityState(granularity);

        // Reset filter ranges loaded flag
        filterRangesLoadedRef.current = false;

        // If this is the first time selecting a granularity, mark it
        if (granularity && !hasSelectedGranularity) {
          _setHasSelectedGranularity(true);
        }

        // If we have both city and granularity, load the data immediately
        if (selectedCity && granularity && mapInitialized) {
          loadGeoJSON(selectedCity.id, granularity.level);
          loadAvailableAreas(selectedCity.id, granularity.level);
          loadFilterRanges(selectedCity.id, granularity.level);
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

  // Custom setter for visiblePointTypes
  const setVisiblePointTypes = useCallback(
    (typesOrUpdater: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => {
      setVisiblePointTypesState(prev => {
        const types = typeof typesOrUpdater === 'function' ? typesOrUpdater(prev) : typesOrUpdater
        // Save to localStorage when the state changes
        if (selectedCity) {
          localStorage.setItem(`visiblePointTypes_${selectedCity.id}`, JSON.stringify(types))
        }
        return types
      })
    },
    [selectedCity],
  )

  // Custom setter for mapType
  const setMapType = useCallback(
    (type: MapType) => {
      if (type !== mapType) {
        setMapTypeState(type)
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
      // console.log("Map initialized and we have city and granularity, loading data")
      loadGeoJSON(selectedCity.id, selectedGranularity.level)
      loadAvailableAreas(selectedCity.id, selectedGranularity.level)
      loadFilterRanges(selectedCity.id, selectedGranularity.level)
    }
    // If no granularity, do not load anything
  }, [mapInitialized, selectedCity, selectedGranularity, loadGeoJSON, loadAvailableAreas, loadFilterRanges])

  // Detectar indicadores y rangos dinámicamente al cargar el GeoJSON
  useEffect(() => {
    if (!currentGeoJSON || !currentGeoJSON.features || currentGeoJSON.features.length === 0) {
      setDynamicFiltersState([])
      return
    }
    // Tomar todas las keys numéricas de las propiedades del primer feature
    const sampleProps = currentGeoJSON.features[0].properties
    const indicatorKeys = Object.keys(sampleProps).filter(
      (key) => typeof sampleProps[key] === 'number' && key !== 'id' && key !== 'district_code' && key !== 'city_id' && key !== 'neighbourhood_code' && key !== 'district_id'
    )
    // Para cada indicador, calcular min y max
    const filters: DynamicFilter[] = indicatorKeys.map((key) => {
      const values = currentGeoJSON.features.map((f: any) => f.properties[key]).filter((v: any) => typeof v === 'number')
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
    setDynamicFiltersState(filters)
  }, [currentGeoJSON])

  // Actualizar dynamicPointTypes cuando cambian los pointFeatures
  useEffect(() => {
    if (!pointFeatures || pointFeatures.length === 0) {
      setDynamicPointTypesState([])
      return
    }
    const types = Array.from(new Set(pointFeatures.map(f => f.featureType).filter(Boolean))) as string[]
    setDynamicPointTypesState(types)
  }, [pointFeatures])

  // Ensure hasSelectedGranularity always reflects selectedGranularity
  useEffect(() => {
    _setHasSelectedGranularity(!!selectedGranularity)
  }, [selectedGranularity])

  // Custom setter for selectedArea
  const setSelectedArea = useCallback((area: Area | null) => {
    if (area && user) {
      analyticsLogger.logEvent({
        user_id: user.id,
        event_type: 'area.select',
        event_details: {
          area_id: area.id,
          area_name: area.name,
          city: selectedCity?.name,
          city_id: selectedCity?.id,
          granularity: selectedGranularity?.level
        }
      })
    }
    setSelectedAreaState(area);
  }, [selectedCity, selectedGranularity, user]);

  const value: MapContextType = {
    selectedCity,
    setSelectedCity,
    selectedArea,
    setSelectedArea,
    selectedGranularity,
    setSelectedGranularity,
    currentGeoJSON,
    setCurrentGeoJSON: setCurrentGeoJSONState,
    visiblePointTypes,
    setVisiblePointTypes,
    dynamicPointTypes,
    setDynamicPointTypes: setDynamicPointTypesState,
    dynamicFilters,
    setDynamicFilters: setDynamicFiltersState,
    isLoadingGeoJSON,
    setIsLoadingGeoJSON: setIsLoadingGeoJSONState,
    hasSelectedGranularity,
    mapType,
    setMapType,
    pointFeatures,
    setPointFeatures: setPointFeaturesState,
    resetFilters,
    triggerRefresh,
    mapInitialized,
    setMapInitialized,
    comparisonArea,
    setComparisonArea,
    availableAreas,
    loadGeoJSON,
  }

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>
}

export function useMapContext() {
  const context = useContext(MapContext)
  if (context === undefined) {
    throw new Error("useMapContext must be used within a MapProvider")
  }
  return context
}
