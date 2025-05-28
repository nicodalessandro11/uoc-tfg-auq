"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useMapContext } from "@/contexts/map-context"
import { Badge } from "@/components/ui/badge"
import { GitCompare, ArrowLeft, Loader2, ChartBarBig } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getCities, getDistricts, getNeighborhoodsByCity, getIndicatorDefinitions, getCityIndicators, getGeoJSON } from "@/lib/api-service"
import { DistrictComparisonChart } from "@/components/district-comparison-chart"
import { MultiSelect } from "@/components/ui/multi-select"
import type { IndicatorDefinition, City, Area, Neighborhood, District } from "@/lib/api-types"
import { useSearchParams, useRouter } from "next/navigation"

export function CompareView() {
  const {
    selectedCity,
    setSelectedCity,
    selectedGranularity,
    selectedArea,
    setSelectedArea,
    comparisonArea,
    setComparisonArea,
    availableAreas,
    setSelectedGranularity,
    loadGeoJSON,
  } = useMapContext()

  const [isLoading, setIsLoading] = useState(false)
  const [localAvailableAreas, setLocalAvailableAreas] = useState<Area[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loadingCities, setLoadingCities] = useState(true)
  const [availableIndicators, setAvailableIndicators] = useState<IndicatorDefinition[]>([])
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([])
  const [showIndicatorLimit, setShowIndicatorLimit] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  // Track previous granularity to detect changes
  const prevGranularityRef = useRef<string | null>(null)

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  // Effect to reset area selection when level changes
  useEffect(() => {
    if (!selectedGranularity) return
    if (prevGranularityRef.current && prevGranularityRef.current !== selectedGranularity.level) {
      console.log('[CompareView] Granularity changed from', prevGranularityRef.current, 'to', selectedGranularity.level, '- resetting selected areas')
      setSelectedArea(null)
      setComparisonArea(null)
    }
    prevGranularityRef.current = selectedGranularity.level
  }, [selectedGranularity, setSelectedArea, setComparisonArea])

  // Load cities from Supabase
  useEffect(() => {
    async function loadCities() {
      setLoadingCities(true)
      try {
        const citiesData = await getCities()
        setCities(citiesData)
      } catch (error) {
        console.error("Error loading cities:", error)
      } finally {
        setLoadingCities(false)
      }
    }

    loadCities()
  }, [])

  // Load available indicators when city or granularity changes
  useEffect(() => {
    async function loadIndicators() {
      if (!selectedCity || !selectedGranularity) return

      setIsLoading(true)
      try {
        // Get all indicator definitions
        const definitions = await getIndicatorDefinitions()

        // Get indicators for the selected city and level
        const indicators = await getCityIndicators(selectedCity.id, selectedGranularity.level)

        // Filter definitions to only include those that have data
        const availableDefinitions = definitions.filter(def =>
          indicators.some(ind => ind.indicator_def_id === def.id)
        )

        // Add year information to each definition
        const definitionsWithYear = availableDefinitions.map(def => {
          const indicator = indicators.find(ind => ind.indicator_def_id === def.id)
          return {
            ...def,
            year: indicator?.year || 0
          }
        })

        setAvailableIndicators(definitionsWithYear)

        // Set default selected indicators (first 2 if available)
        if (definitionsWithYear.length > 0) {
          setSelectedIndicators(definitionsWithYear.slice(0, 2).map(def => `${def.name} (${def.year})`))
        }
      } catch (error) {
        console.error("Error loading indicators:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadIndicators()
  }, [selectedCity, selectedGranularity])

  // Load available areas when city or granularity changes
  useEffect(() => {
    async function loadAreas() {
      if (!selectedCity || !selectedGranularity) return

      // 1. Use cached data from context if available
      if (availableAreas && availableAreas.length > 0) {
        setLocalAvailableAreas(availableAreas)
        return
      }

      setIsLoading(true)
      try {
        // Load GeoJSON data to ensure it's available (will use cache if present)
        await loadGeoJSON(selectedCity.id, selectedGranularity.level)

        // Get areas from GeoJSON data
        const geoJsonData = await getGeoJSON(selectedCity.id, selectedGranularity.level)
        if (!geoJsonData || !geoJsonData.features) {
          throw new Error("No GeoJSON data available")
        }

        // Transform to expected format
        const formattedAreas: Area[] = geoJsonData.features.map((feature: any) => {
          // Ensure all numeric fields have a value, defaulting to 0 if undefined
          const population = typeof feature.properties.population === 'number' ? feature.properties.population : 0
          const avgIncome = typeof feature.properties.avg_income === 'number' ? feature.properties.avg_income : 0
          const surface = typeof feature.properties.surface === 'number' ? feature.properties.surface : 0
          const disposableIncome = typeof feature.properties.disposable_income === 'number' ? feature.properties.disposable_income : 0

          return {
            id: feature.properties.id,
            name: feature.properties.name,
            cityId: feature.properties.city_id,
            city_id: feature.properties.city_id,
            district_id: feature.properties.district_id,
            population,
            avgIncome,
            surface,
            disposableIncome,
          }
        })

        console.log(`[CompareView] Loaded ${formattedAreas.length} ${selectedGranularity.level}s for city ${selectedCity.id}`)
        setLocalAvailableAreas(formattedAreas.map(a => toFullArea(a)))
      } catch (error) {
        console.error("Error loading areas:", error)
        setLocalAvailableAreas([])
      } finally {
        setIsLoading(false)
      }
    }

    loadAreas()
  }, [selectedCity, selectedGranularity, loadGeoJSON, availableAreas])

  // Auto-select Area 1 from URL param if present
  useEffect(() => {
    // Only run this effect on the /compare route
    if (pathname !== "/compare") return;

    const areaParam = searchParams.get("area")
    if (areaParam) {
      if (localAvailableAreas && localAvailableAreas.length > 0) {
        const area = localAvailableAreas.find(a => a.id.toString() === areaParam)
        console.log('[CompareView] Sync from URL areaParam:', areaParam, 'found:', !!area, area)
        if (area) {
          setSelectedArea(toFullArea(area))
        } else {
          setSelectedArea(null)
          const params = new URLSearchParams(window.location.search)
          params.delete("area")
          console.trace("[CompareView] router.replace: removing area param")
          router.replace(`?${params.toString()}`)
        }
      }
      // If localAvailableAreas is empty, do nothing (wait for it to load)
    }
  }, [searchParams, localAvailableAreas, setSelectedArea, pathname])

  // 1. Clear comparisonArea when leaving CompareView (unmount)
  useEffect(() => {
    return () => {
      setComparisonArea(null)
    }
  }, [setComparisonArea])

  // Render comparison data
  const renderComparisonData = () => {
    if (!selectedArea || !comparisonArea) {
      return <div className="text-center py-12 text-muted-foreground">Please select two areas to compare</div>
    }

    return (
      <div className="space-y-6">
        <DistrictComparisonChart
          district1={selectedArea}
          district2={comparisonArea}
          granularity={selectedGranularity?.level || "district"}
          selectedIndicators={selectedIndicators}
          availableIndicators={availableIndicators}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 md:py-6 px-2 space-y-4">
      <div className="flex flex-col md:flex-row gap-6 md:items-stretch h-full">
        <Card className="w-full md:w-1/3 flex flex-col shadow-none md:sticky md:top-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-primary text-xl">
              <ChartBarBig className="h-5 w-5" />
              Compare Areas
            </CardTitle>
            <CardDescription className="text-s">
              Select two {selectedGranularity?.level === "district" ? "districts" : "neighborhoods"} to compare their indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium">City</Label>
              <Select
                value={selectedCity?.id.toString() || ""}
                onValueChange={(value) => {
                  const city = cities.find((c) => c.id === Number.parseInt(value))
                  if (city) {
                    setSelectedCity(city)
                  }
                }}
              >
                <SelectTrigger className="modern-input h-9 text-sm">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading || loadingCities ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Area 1</Label>
                  <Select
                    value={selectedArea?.id.toString() || ""}
                    onValueChange={(value) => {
                      const area = localAvailableAreas.find((a) => a.id === Number.parseInt(value))
                      if (area) {
                        setSelectedArea(toFullArea(area))
                        // Sync Area 1 to the URL
                        const params = new URLSearchParams(window.location.search)
                        params.set("area", area.id.toString())
                        console.trace("[CompareView] router.replace: setting area param")
                        router.replace(`?${params.toString()}`)
                      } else {
                        setSelectedArea(null)
                        // Remove area from URL if not found
                        const params = new URLSearchParams(window.location.search)
                        params.delete("area")
                        console.trace("[CompareView] router.replace: removing area param")
                        router.replace(`?${params.toString()}`)
                      }
                    }}
                    disabled={localAvailableAreas.length === 0}
                  >
                    <SelectTrigger className="modern-input h-9 text-sm bg-[rgba(37,99,235,0.08)]">
                      <SelectValue placeholder="Select first area" />
                    </SelectTrigger>
                    <SelectContent>
                      {localAvailableAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id.toString()}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium">Area 2</Label>
                  <Select
                    value={comparisonArea?.id.toString() || ""}
                    onValueChange={(value) => {
                      const area = localAvailableAreas.find((a) => a.id === Number.parseInt(value))
                      if (area) {
                        setComparisonArea(toFullArea(area))
                      }
                    }}
                    disabled={localAvailableAreas.length === 0}
                  >
                    <SelectTrigger className="modern-input h-9 text-sm bg-[rgba(16,185,129,0.08)]">
                      <SelectValue placeholder="Select second area" />
                    </SelectTrigger>
                    <SelectContent>
                      {localAvailableAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id.toString()}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium">Indicators to compare</Label>
                  <MultiSelect
                    options={availableIndicators.map(ind => ({
                      label: `${ind.name} (${ind.year})`,
                      value: `${ind.name} (${ind.year})`,
                      description: ind.description,
                      unit: ind.unit,
                      disabled: selectedIndicators.length >= 2 && !selectedIndicators.includes(`${ind.name} (${ind.year})`),
                    }))}
                    selected={selectedIndicators}
                    onChange={(newSelected) => {
                      if (newSelected.length > 2) {
                        setShowIndicatorLimit(true);
                        setTimeout(() => setShowIndicatorLimit(false), 2000);
                        return;
                      }
                      setSelectedIndicators(newSelected)
                    }}
                    placeholder="Select up to 2 indicators to compare..."
                    className="modern-input"
                  />
                </div>
                <div
                  className={`text-xs text-center mt-4 ${showIndicatorLimit ? "text-red-500" : "text-muted-foreground"}`}
                  style={{ minHeight: "1.25em" }}
                >
                  {showIndicatorLimit
                    ? "You can only compare up to 2 indicators."
                    : "Select up to 2 indicators to compare."}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="w-full md:w-2/3 flex flex-col">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : (
              renderComparisonData()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper to ensure all required fields for Area
function toFullArea(area: any): Area {
  return {
    // District
    id: area.id ?? 0,
    name: area.name ?? '',
    district_code: area.district_code ?? undefined,
    city_id: area.city_id ?? area.cityId ?? 0,
    population: area.population ?? 0,
    avg_income: area.avg_income ?? 0,
    surface: area.surface ?? 0,
    disposable_income: area.disposable_income ?? 0,
    created_at: area.created_at ?? undefined,
    // Neighborhood
    neighbourhood_code: area.neighbourhood_code ?? undefined,
    district_id: area.district_id ?? undefined,
    // Para compatibilidad con el resto del código
    cityId: area.cityId ?? area.city_id ?? 0,
    avgIncome: area.avgIncome ?? area.avg_income ?? 0,
    disposableIncome: area.disposableIncome ?? area.disposable_income ?? 0,
    districtId: area.districtId ?? area.district_id ?? undefined,
  } as Area
}
