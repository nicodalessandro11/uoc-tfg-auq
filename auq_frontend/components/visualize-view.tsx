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
import { getDistricts, getCityIndicators, getIndicatorDefinitions } from "@/lib/api-service"
import type { IndicatorDefinition, District, Area } from "@/lib/api-types"

export function VisualizeView() {
  const { selectedCity, setSelectedCity, selectedGranularity, setSelectedGranularity, loadGeoJSON } = useMapContext()
  const [selectedIndicator, setSelectedIndicator] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [localAvailableAreas, setLocalAvailableAreas] = useState<Area[]>([])
  const [availableIndicators, setAvailableIndicators] = useState<IndicatorDefinition[]>([])

  console.log('VisualizeView rendered with:', {
    selectedCity,
    selectedGranularity,
    availableIndicators: availableIndicators.length
  })

  // Set default granularity to "district" if not already set
  useEffect(() => {
    console.log('Checking default granularity:', { selectedGranularity, selectedCity })
    if (!selectedGranularity && selectedCity) {
      const defaultGranularity = { id: 1, name: "Districts", level: "district" }
      console.log('Setting default granularity:', defaultGranularity)
      setSelectedGranularity(defaultGranularity)
    }
  }, [selectedGranularity, selectedCity, setSelectedGranularity])

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

        // Fetch districts directly
        const areas = await getDistricts(selectedCity.id)

        // Transform to expected format
        const formattedAreas: Area[] = areas.map((area: District) => {
          // Ensure all numeric fields have a value, defaulting to 0 if undefined
          const population = typeof area.population === 'number' ? area.population : 0
          const avgIncome = typeof area.avg_income === 'number' ? area.avg_income : 0
          const surface = typeof area.surface === 'number' ? area.surface : 0
          const disposableIncome = typeof area.disposable_income === 'number' ? area.disposable_income : 0

          return {
            id: area.id,
            name: area.name,
            cityId: area.city_id,
            population,
            avgIncome,
            surface,
            disposableIncome,
          }
        })

        setLocalAvailableAreas(formattedAreas)
      } catch (error) {
        console.error("Error loading areas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAreas()
  }, [selectedCity, selectedGranularity, loadGeoJSON])

  // Render the appropriate chart based on the selected indicator
  const renderChart = () => {
    if (!selectedIndicator) {
      return (
        <Card>
          <CardContent className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Please select an indicator to visualize</p>
          </CardContent>
        </Card>
      )
    }

    if (isLoading) {
      return (
        <Card>
          <CardContent className="h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading data...</p>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (localAvailableAreas.length === 0) {
      return (
        <Card>
          <CardContent className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">No data available. Please select a city and level.</p>
          </CardContent>
        </Card>
      )
    }

    // Find the selected indicator definition
    const selectedDefinition = availableIndicators.find(def => def.name === selectedIndicator)

    if (!selectedDefinition) {
      return (
        <Card>
          <CardContent className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">No visualization available for this indicator</p>
          </CardContent>
        </Card>
      )
    }

    // Use a generic chart component that can handle any indicator
    return (
      <Card>
        <CardHeader>
          <CardTitle>{selectedDefinition.name}</CardTitle>
          <CardDescription>
            {selectedDefinition.description || `Data for ${selectedDefinition.name}`}
            {selectedDefinition.unit && ` (${selectedDefinition.unit})`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <BarChart2 className="h-full w-full text-muted-foreground" />
            <div className="mt-4">
              {localAvailableAreas.map(area => (
                <div key={area.id} className="flex justify-between items-center py-2 border-b">
                  <span>{area.name}</span>
                  <span className="font-medium">
                    {area[selectedDefinition.name.toLowerCase().replace(/\s+/g, '_') as keyof Area] || 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="grid gap-6">
        <Card>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">Select Indicator</Label>
              <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                <SelectTrigger className="modern-input">
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

            <div className="modern-card bg-primary/5">
              <h3 className="text-sm font-medium mb-2">About this data</h3>
              <p className="text-sm text-muted-foreground">
                {selectedIndicator
                  ? `This visualization shows ${selectedIndicator} data for all areas in ${selectedCity?.name || "the selected city"}. Select an indicator from the dropdown above to explore different metrics.`
                  : `Select an indicator from the dropdown above to visualize data for ${selectedCity?.name || "the selected city"}.`}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">{renderChart()}</div>
      </div>
    </div>
  )
}

// Helper function to get a human-readable name for the indicator
function getIndicatorName(indicator: string): string {
  return indicator.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}
