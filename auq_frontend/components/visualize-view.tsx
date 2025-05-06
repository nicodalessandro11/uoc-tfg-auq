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
import { getDistricts } from "@/lib/api-service"

export function VisualizeView() {
  const { selectedCity, setSelectedCity, selectedGranularity, setSelectedGranularity, loadGeoJSON } = useMapContext()
  const [selectedIndicator, setSelectedIndicator] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [localAvailableAreas, setLocalAvailableAreas] = useState([])

  // Set default granularity to "district" if not already set
  useEffect(() => {
    if (!selectedGranularity && selectedCity) {
      const defaultGranularity = { id: 1, name: "Districts", level: "district" }
      setSelectedGranularity(defaultGranularity)
    }
  }, [selectedGranularity, selectedCity, setSelectedGranularity])

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
        const formattedAreas = areas.map((area) => ({
          id: area.id,
          name: area.name,
          cityId: area.city_id,
          population: area.population,
          avgIncome: area.avg_income,
          surface: area.surface,
          disposableIncome: area.disposable_income,
        }))

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

    switch (selectedIndicator) {
      case "population":
        return <PopulationChart areas={localAvailableAreas} />
      case "income":
        return <IncomeChart areas={localAvailableAreas} />
      case "density":
        return <PopulationDensityChart areas={localAvailableAreas} />
      case "education":
        return <EducationChart areas={localAvailableAreas} />
      case "unemployment":
        return <UnemploymentChart areas={localAvailableAreas} />
      default:
        return <PopulationChart areas={localAvailableAreas} />
    }
  }

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="md:hidden">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-xl md:text-2xl font-bold">Data Visualization</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <BarChart2 className="h-5 w-5" />
              Visualization Options
            </CardTitle>
            <CardDescription>Select an indicator to visualize</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">Select Indicator</Label>
              <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                <SelectTrigger className="modern-input">
                  <SelectValue placeholder="Select indicator to visualize..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="population">Population</SelectItem>
                  <SelectItem value="income">Average Income</SelectItem>
                  <SelectItem value="density">Population Density</SelectItem>
                  <SelectItem value="education">Education Level</SelectItem>
                  <SelectItem value="unemployment">Unemployment Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="modern-card bg-primary/5">
              <h3 className="text-sm font-medium mb-2">About this data</h3>
              <p className="text-sm text-muted-foreground">
                {selectedIndicator
                  ? `This visualization shows ${getIndicatorName(selectedIndicator)} data for all areas in ${selectedCity?.name || "the selected city"}. Select an indicator from the dropdown above to explore different metrics.`
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
  switch (indicator) {
    case "population":
      return "population"
    case "income":
      return "average income"
    case "density":
      return "population density"
    case "education":
      return "education level"
    case "unemployment":
      return "unemployment rate"
    default:
      return indicator
  }
}
