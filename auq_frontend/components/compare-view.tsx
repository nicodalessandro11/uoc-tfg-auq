"use client"

import { useEffect, useState, useRef, useCallback, useMemo, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useMapContext } from "@/contexts/map-context"
import { Badge } from "@/components/ui/badge"
import { GitCompare, ArrowLeft, Loader2, ChartBarBig } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getIndicatorDefinitions, getCityIndicators, getGeoJSON } from "@/lib/api-service"
import { DistrictComparisonChart } from "@/components/district-comparison-chart"
import { MultiSelect } from "@/components/ui/multi-select"
import type { IndicatorDefinition, Area } from "@/lib/api-types"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

// Separate loading component for better code splitting
function LoadingSpinner() {
  return (
    <div className="flex justify-center py-6">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
    </div>
  )
}

// Separate component for the comparison chart to enable code splitting
function ComparisonChartWrapper({
  selectedArea,
  comparisonArea,
  selectedGranularity,
  selectedIndicators,
  availableIndicators
}: {
  selectedArea: Area | null
  comparisonArea: Area | null
  selectedGranularity: { level: string } | null
  selectedIndicators: string[]
  availableIndicators: IndicatorDefinition[]
}) {
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

export function CompareView() {
  const {
    selectedCity,
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
  const [availableIndicators, setAvailableIndicators] = useState<IndicatorDefinition[]>([])
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([])
  const [showIndicatorLimit, setShowIndicatorLimit] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Track previous granularity to detect changes
  const prevGranularityRef = useRef<string | null>(null)
  const isMounted = useRef(false)

  // Initialize component
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // Memoize the area options to prevent unnecessary re-renders
  const areaOptions = useMemo(() =>
    localAvailableAreas.map(area => ({
      value: area.id.toString(),
      label: area.name
    })), [localAvailableAreas])

  // Memoize indicator options
  const indicatorOptions = useMemo(() =>
    availableIndicators.map(ind => ({
      label: `${ind.name} (${ind.year})`,
      value: `${ind.name} (${ind.year})`,
      description: ind.description,
      unit: ind.unit,
      disabled: selectedIndicators.length >= 2 && !selectedIndicators.includes(`${ind.name} (${ind.year})`),
    })), [availableIndicators, selectedIndicators])

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

  // Load available indicators when city or granularity changes
  const loadIndicators = useCallback(async () => {
    if (!selectedCity || !selectedGranularity || !isMounted.current) return

    setIsLoading(true)
    try {
      const [definitions, indicators] = await Promise.all([
        getIndicatorDefinitions(),
        getCityIndicators(selectedCity.id, selectedGranularity.level)
      ])

      if (!isMounted.current) return

      const availableDefinitions = definitions.filter(def =>
        indicators.some(ind => ind.indicator_def_id === def.id)
      )

      const definitionsWithYear = availableDefinitions.map(def => {
        const indicator = indicators.find(ind => ind.indicator_def_id === def.id)
        return {
          ...def,
          year: indicator?.year || 0
        }
      })

      setAvailableIndicators(definitionsWithYear)

      if (definitionsWithYear.length > 0) {
        setSelectedIndicators(definitionsWithYear.slice(0, 2).map(def => `${def.name} (${def.year})`))
      }
    } catch (error) {
      console.error("Error loading indicators:", error)
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }, [selectedCity, selectedGranularity])

  useEffect(() => {
    loadIndicators()
  }, [loadIndicators])

  // Load available areas when city or granularity changes
  const loadAreas = useCallback(async () => {
    if (!selectedCity || !selectedGranularity || !isMounted.current) return

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
      if (isMounted.current) {
        setLocalAvailableAreas(formattedAreas.map(a => toFullArea(a)))
      }
    } catch (error) {
      console.error("Error loading areas:", error)
      if (isMounted.current) {
        setLocalAvailableAreas([])
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }, [selectedCity, selectedGranularity, loadGeoJSON, availableAreas])

  useEffect(() => {
    loadAreas()
  }, [loadAreas])

  // Auto-select Area 1 from URL param if present
  useEffect(() => {
    if (pathname !== "/compare" || !searchParams || !isMounted.current) return;

    const areaParam = searchParams.get("area")
    const levelParam = searchParams.get("level")

    // Always clear selectedArea if areaParam is null
    if (!areaParam && selectedArea) {
      setSelectedArea(null)
      return
    }

    // Only set area if:
    // - areaParam exists
    // - levelParam matches current granularity
    // - area is valid for the current availableAreas
    if (
      areaParam &&
      levelParam === selectedGranularity?.level &&
      localAvailableAreas &&
      localAvailableAreas.length > 0
    ) {
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
  }, [searchParams, localAvailableAreas, setSelectedArea, pathname, selectedGranularity, selectedArea])

  // Sync Area 1 selection to URL
  useEffect(() => {
    if (pathname !== "/compare") return;

    const params = new URLSearchParams(window.location.search)
    if (selectedArea) {
      params.set("area", selectedArea.id.toString())
      if (selectedGranularity) {
        params.set("level", selectedGranularity.level)
      }
    } else {
      params.delete("area")
    }
    router.replace(`?${params.toString()}`)
  }, [selectedArea, selectedGranularity, pathname, router])

  // 1. Clear comparisonArea when leaving CompareView (unmount)
  useEffect(() => {
    return () => {
      if (isMounted.current) {
        setComparisonArea(null)
      }
    }
  }, [setComparisonArea])

  // Handle area selection with debounced URL update
  const handleAreaChange = useCallback((value: string, isArea1: boolean) => {
    const area = localAvailableAreas.find((a) => a.id === Number.parseInt(value))
    if (area) {
      const fullArea = toFullArea(area)
      if (isArea1) {
        setSelectedArea(fullArea)
        const params = new URLSearchParams(window.location.search)
        params.set("area", area.id.toString())
        router.replace(`?${params.toString()}`, { scroll: false })
      } else {
        setComparisonArea(fullArea)
      }
    } else {
      if (isArea1) {
        setSelectedArea(null)
        const params = new URLSearchParams(window.location.search)
        params.delete("area")
        router.replace(`?${params.toString()}`, { scroll: false })
      } else {
        setComparisonArea(null)
      }
    }
  }, [localAvailableAreas, router, setSelectedArea, setComparisonArea])

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
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Area 1</Label>
                  <Select
                    value={selectedArea?.id.toString() || ""}
                    onValueChange={(value) => handleAreaChange(value, true)}
                    disabled={localAvailableAreas.length === 0}
                  >
                    <SelectTrigger className="modern-input h-9 text-sm bg-[rgba(37,99,235,0.08)]">
                      <SelectValue placeholder="Select first area" />
                    </SelectTrigger>
                    <SelectContent>
                      {areaOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium">Area 2</Label>
                  <Select
                    value={comparisonArea?.id.toString() || ""}
                    onValueChange={(value) => handleAreaChange(value, false)}
                    disabled={localAvailableAreas.length === 0}
                  >
                    <SelectTrigger className="modern-input h-9 text-sm bg-[rgba(16,185,129,0.08)]">
                      <SelectValue placeholder="Select second area" />
                    </SelectTrigger>
                    <SelectContent>
                      {areaOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium">Indicators to compare</Label>
                  <MultiSelect
                    options={indicatorOptions}
                    selected={selectedIndicators}
                    onChange={(newSelected) => {
                      if (newSelected.length > 2) {
                        setShowIndicatorLimit(true)
                        setTimeout(() => setShowIndicatorLimit(false), 2000)
                        return
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
              <LoadingSpinner />
            ) : (
              <Suspense fallback={<LoadingSpinner />}>
                <ComparisonChartWrapper
                  selectedArea={selectedArea}
                  comparisonArea={comparisonArea}
                  selectedGranularity={selectedGranularity}
                  selectedIndicators={selectedIndicators}
                  availableIndicators={availableIndicators}
                />
              </Suspense>
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
