"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useMapContext } from "@/contexts/map-context"
import { Badge } from "@/components/ui/badge"
import { GitCompare, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cities } from "@/lib/mock-data"
import { DistrictComparisonChart } from "@/components/district-comparison-chart"
import { getDistricts } from "@/lib/api-service"

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
  const [localAvailableAreas, setLocalAvailableAreas] = useState([])

  // Set default city if not already set
  useEffect(() => {
    if (!selectedCity) {
      setSelectedCity(cities[0])
    }
  }, [selectedCity, setSelectedCity])

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

        // Reset selections when areas change
        setSelectedArea(null)
        setComparisonArea(null)
      } catch (error) {
        console.error("Error loading areas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAreas()
  }, [selectedCity, selectedGranularity, loadGeoJSON, setSelectedArea, setComparisonArea])

  // Render comparison data
  const renderComparisonData = () => {
    if (!selectedArea || !comparisonArea) {
      return <div className="text-center py-12 text-muted-foreground">Please select two areas to compare</div>
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="modern-card">
            <h3 className="font-bold text-lg flex items-center justify-center gap-2">
              {selectedArea.name}
              <Badge variant="outline" className="font-normal">
                Area 1
              </Badge>
            </h3>
            <div className="mt-2 text-3xl font-bold text-center">{selectedArea.population.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground text-center">Population</div>
          </div>
          <div className="modern-card">
            <h3 className="font-bold text-lg flex items-center justify-center gap-2">
              {comparisonArea.name}
              <Badge variant="outline" className="font-normal">
                Area 2
              </Badge>
            </h3>
            <div className="mt-2 text-3xl font-bold text-center">{comparisonArea.population.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground text-center">Population</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="modern-card">
            <div className="mt-2 text-3xl font-bold text-center">{selectedArea.avgIncome.toLocaleString()} €</div>
            <div className="text-sm text-muted-foreground text-center">Average Income</div>
          </div>
          <div className="modern-card">
            <div className="mt-2 text-3xl font-bold text-center">{comparisonArea.avgIncome.toLocaleString()} €</div>
            <div className="text-sm text-muted-foreground text-center">Average Income</div>
          </div>
        </div>

        <DistrictComparisonChart
          district1={selectedArea}
          district2={comparisonArea}
          granularity={selectedGranularity?.level || "district"}
        />
      </div>
    )
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
        <h1 className="text-xl md:text-2xl font-bold">Compare Areas</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <GitCompare className="h-5 w-5" />
              Compare Areas
            </CardTitle>
            <CardDescription>
              Select two {selectedGranularity?.level === "district" ? "districts" : "neighborhoods"} to compare their
              indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">City</Label>
              <Select
                value={selectedCity?.id.toString() || ""}
                onValueChange={(value) => {
                  const city = cities.find((c) => c.id === Number.parseInt(value))
                  if (city) {
                    setSelectedCity(city)
                  }
                }}
              >
                <SelectTrigger className="modern-input">
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

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <Label className="text-base font-medium">Area 1</Label>
                  <Select
                    value={selectedArea?.id.toString() || ""}
                    onValueChange={(value) => {
                      const area = localAvailableAreas.find((a) => a.id === Number.parseInt(value))
                      if (area) {
                        setSelectedArea(area)
                      }
                    }}
                    disabled={localAvailableAreas.length === 0}
                  >
                    <SelectTrigger className="modern-input">
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

                <div className="space-y-3">
                  <Label className="text-base font-medium">Area 2</Label>
                  <Select
                    value={comparisonArea?.id.toString() || ""}
                    onValueChange={(value) => {
                      const area = localAvailableAreas.find((a) => a.id === Number.parseInt(value))
                      if (area) {
                        setComparisonArea(area)
                      }
                    }}
                    disabled={localAvailableAreas.length === 0}
                  >
                    <SelectTrigger className="modern-input">
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
              </>
            )}
          </CardContent>
        </Card>

        <Card className="w-full md:w-2/3">
          <CardHeader>
            <CardTitle className="text-primary">Comparison Results</CardTitle>
            <CardDescription>
              {selectedArea && comparisonArea
                ? `Comparing ${selectedArea.name} with ${comparisonArea.name}`
                : `Select two ${selectedGranularity?.level === "district" ? "districts" : "neighborhoods"} to see the comparison`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
