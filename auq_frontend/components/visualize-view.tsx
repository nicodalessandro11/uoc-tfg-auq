"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useMapContext } from "@/contexts/map-context"
import { PopulationChart } from "@/components/population-chart"
import { IncomeChart } from "@/components/income-chart"
import { EducationChart } from "@/components/education-chart"
import { UnemploymentChart } from "@/components/unemployment-chart"
import { PopulationDensityChart } from "@/components/population-density-chart"
import { ArrowLeft, BarChart2, Loader2 } from "lucide-react"
import Link from "next/link"
import { getDistricts, getCityIndicators, getIndicatorDefinitions, getGeoJSON } from "@/lib/api-service"
import type { IndicatorDefinition, District, Area } from "@/lib/api-types"
import { VisualizeChart } from "@/components/visualize-chart"

export function VisualizeView() {
  const { selectedCity, setSelectedCity, selectedGranularity, setSelectedGranularity, loadGeoJSON } = useMapContext()
  const [selectedIndicator, setSelectedIndicator] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [localAvailableAreas, setLocalAvailableAreas] = useState<Area[]>([])
  const [availableIndicators, setAvailableIndicators] = useState<IndicatorDefinition[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [indicatorValues, setIndicatorValues] = useState<Record<number, number>>({})
  const [topN, setTopN] = useState(5)

  console.log('VisualizeView rendered with:', {
    selectedCity,
    selectedGranularity,
    availableIndicators: availableIndicators.length
  })

  // Load available indicators when city or granularity changes
  useEffect(() => {
    console.log('Effect triggered for loading indicators:', {
      hasCity: !!selectedCity,
      hasGranularity: !!selectedGranularity,
      cityName: selectedCity?.name,
      granularityLevel: selectedGranularity?.level
    })

    async function loadIndicators() {
      if (!selectedCity || !selectedGranularity) {
        console.log('Missing required data for loading indicators:', {
          selectedCity,
          selectedGranularity
        })
        return
      }

      setIsLoading(true)
      try {
        console.log('Loading indicators for:', {
          city: selectedCity.name,
          level: selectedGranularity.level
        })

        // Get all indicator definitions
        const definitions = await getIndicatorDefinitions()
        console.log('Loaded indicator definitions:', definitions)

        // Get indicators for the selected city and level
        const indicators = await getCityIndicators(selectedCity.id, selectedGranularity.level)
        console.log('Loaded indicators:', indicators)

        // Filter definitions to only include those that have data
        const availableDefinitions = definitions.filter(def =>
          indicators.some(ind => ind.indicator_def_id === def.id)
        )
        console.log('Available indicator definitions:', availableDefinitions)

        setAvailableIndicators(availableDefinitions)

        // Reset selected indicator if it's no longer available
        if (selectedIndicator && !availableDefinitions.some(def => def.name === selectedIndicator)) {
          setSelectedIndicator('')
        }
      } catch (error) {
        console.error('Error loading indicators:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadIndicators()
  }, [selectedCity, selectedGranularity, selectedIndicator])

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

        console.log(`Loaded ${formattedAreas.length} ${selectedGranularity.level}s for city ${selectedCity.id}`)
        setLocalAvailableAreas(formattedAreas)
        setAreas(formattedAreas)
      } catch (error) {
        console.error("Error loading areas:", error)
        setLocalAvailableAreas([])
        setAreas([])
      } finally {
        setIsLoading(false)
      }
    }

    loadAreas()
  }, [selectedCity, selectedGranularity, loadGeoJSON])

  // Load values for the selected indicator
  useEffect(() => {
    async function loadValues() {
      if (!selectedCity || !selectedGranularity || !selectedIndicator) return
      setIsLoading(true)
      try {
        const definitions = await getIndicatorDefinitions()
        const indicatorDef = definitions.find(def => def.name === selectedIndicator)
        if (!indicatorDef) return
        const indicators = await getCityIndicators(selectedCity.id, selectedGranularity.level)
        const values: Record<number, number> = {}
        indicators.forEach(ind => {
          if (ind.indicator_def_id === indicatorDef.id) {
            values[ind.geo_id] = ind.value
          }
        })
        setIndicatorValues(values)
      } catch (error) {
        console.error("Error loading indicator values:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadValues()
  }, [selectedCity, selectedGranularity, selectedIndicator])

  // Opciones de Top N dinámicas
  const topOptions = [3, 5, 10, 15, 20].filter(n => n <= areas.length)
  if (!topOptions.includes(topN) && topOptions.length > 0) {
    setTopN(topOptions[topOptions.length - 1])
  }

  const indicatorDef = availableIndicators.find(def => def.name === selectedIndicator)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="grid gap-6">
        <Card>
          <CardContent className="space-y-6 p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-sm font-medium text-primary">Select Indicator</Label>
                <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                  <SelectTrigger className="modern-input border-primary text-black dark:text-white focus:ring-primary focus:border-primary h-10 text-sm">
                    <SelectValue placeholder="Select indicator to visualize..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableIndicators.map((indicator) => (
                      <SelectItem key={indicator.id} value={indicator.name}>
                        {indicator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32 space-y-1">
                <Label className="text-sm font-medium text-primary">Top N</Label>
                <Select value={topN.toString()} onValueChange={v => setTopN(Number(v))}>
                  <SelectTrigger className="modern-input border-primary text-black dark:text-white focus:ring-primary focus:border-primary h-10 text-sm">
                    <SelectValue placeholder="Top N" />
                  </SelectTrigger>
                  <SelectContent>
                    {topOptions.map(n => (
                      <SelectItem key={n} value={n.toString()}>
                        Top {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="modern-card bg-primary/5 p-3">
              <p className="text-sm text-muted-foreground leading-snug">
                {indicatorDef?.description
                  ? indicatorDef.description
                  : selectedIndicator
                    ? `This visualization shows ${selectedIndicator} data for all areas in ${selectedCity?.name || "the selected city"}. Select an indicator from the dropdown above to explore different metrics.`
                    : `Select an indicator from the dropdown above to visualize data for ${selectedCity?.name || "the selected city"}.`}
              </p>
            </div>
          </CardContent>
        </Card>

        {isLoading && selectedIndicator ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !selectedIndicator ? (
          <Card>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Please select an indicator to visualize.</p>
            </CardContent>
          </Card>
        ) : (
          <VisualizeChart
            areas={areas}
            indicator={indicatorDef}
            indicatorValues={indicatorValues}
            topN={topN}
          />
        )}
      </div>
    </div>
  )
}

// Helper function to get a human-readable name for the indicator
function getIndicatorName(indicator: string): string {
  return indicator.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}
