"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useMapContext } from "@/contexts/map-context"
import { Badge } from "@/components/ui/badge"
import { GitCompare, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getCities, getDistricts, getNeighborhoodsByCity, getIndicatorDefinitions, getCityIndicators, getGeoJSON } from "@/lib/api-service"
import { DistrictComparisonChart } from "@/components/district-comparison-chart"
import { MultiSelect } from "@/components/ui/multi-select"
import type { IndicatorDefinition, City, Area, Neighborhood, District } from "@/lib/api-types"
import { useSearchParams } from "next/navigation"

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
  const searchParams = useSearchParams()

  // Track previous granularity to detect changes
  const prevGranularityRef = useRef<string | null>(null)

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

  // Set default city if not already set
  useEffect(() => {
    if (!selectedCity && cities.length > 0) {
      setSelectedCity(cities[0])
    }
  }, [selectedCity, cities, setSelectedCity])

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

        setAvailableIndicators(availableDefinitions)

        // Set default selected indicators (first 2 if available)
        if (availableDefinitions.length > 0) {
          setSelectedIndicators(availableDefinitions.slice(0, 2).map(def => def.name))
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

      setIsLoading(true)
      try {
        // Load GeoJSON data to ensure it's available
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
        setLocalAvailableAreas(formattedAreas)
      } catch (error) {
        console.error("Error loading areas:", error)
        setLocalAvailableAreas([])
      } finally {
        setIsLoading(false)
      }
    }

    loadAreas()
  }, [selectedCity, selectedGranularity, loadGeoJSON])

  // Auto-select Area 1 from URL param if present
  useEffect(() => {
    const areaParam = searchParams.get("area")
    if (areaParam && localAvailableAreas && localAvailableAreas.length > 0) {
      const area = localAvailableAreas.find(a => a.id.toString() === areaParam)
      console.log('[CompareView] Sync from URL areaParam:', areaParam, 'found:', !!area, area)
      if (area) {
        setSelectedArea(toFullArea(area))
      }
    }
  }, [searchParams, localAvailableAreas, setSelectedArea])

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
      <div className="flex items-center gap-3 mb-4">
        <Link href="/" className="md:hidden">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-lg md:text-xl font-bold">Compare Areas</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <Card className="w-full md:w-1/3">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-primary text-base">
              <GitCompare className="h-5 w-5" />
              Compare Areas
            </CardTitle>
            <CardDescription className="text-xs">
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
                  <Label className="text-sm font-medium">Indicators to Compare (max 2)</Label>
                  <MultiSelect
                    options={availableIndicators.map(ind => ({
                      label: ind.name,
                      value: ind.name,
                      description: ind.description,
                      unit: ind.unit
                    }))}
                    selected={selectedIndicators}
                    onChange={(newSelected) => {
                      // Limit to 2 selections
                      if (newSelected.length <= 2) {
                        setSelectedIndicators(newSelected)
                      }
                    }}
                    placeholder="Select up to 2 indicators to compare..."
                    className="modern-input"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="w-full md:w-2/3">
          <CardHeader className="pb-2">
            <CardTitle className="text-primary text-base">Comparison Results</CardTitle>
            <CardDescription className="text-xs">
              {selectedArea && comparisonArea
                ? `Comparing ${selectedArea.name} with ${comparisonArea.name}`
                : `Select two ${selectedGranularity?.level === "district" ? "districts" : "neighborhoods"} to see the comparison`}
            </CardDescription>
          </CardHeader>
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
    id: area.id ?? 0,
    name: area.name ?? '',
    cityId: area.cityId ?? area.city_id ?? 0,
    city_id: area.city_id ?? area.cityId ?? 0,
    avgIncome: area.avgIncome ?? area.avg_income ?? 0,
    avg_income: area.avg_income ?? area.avgIncome ?? 0,
    disposableIncome: area.disposableIncome ?? area.disposable_income ?? 0,
    disposable_income: area.disposable_income ?? area.disposableIncome ?? 0,
    population: area.population ?? 0,
    surface: area.surface ?? 0,
    districtId: area.districtId ?? area.district_id ?? undefined,
    district_id: area.district_id ?? area.districtId ?? undefined,
    neighbourhood_code: area.neighbourhood_code ?? undefined,
    district_code: area.district_code ?? undefined,
  } as Area
}
