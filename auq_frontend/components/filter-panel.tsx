"use client"

import { useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { useMapContext } from "@/contexts/map-context"
import { RefreshCw } from "lucide-react"

export function FilterPanel() {
  const { filters, setFilters, filterRanges, resetFilters, triggerRefresh } = useMapContext()

  // Handle filter change for a specific filter
  const handleFilterChange = useCallback(
    (key: string, value: [number, number]) => {
      if (!Array.isArray(value) || value.length !== 2) return

      // Create a new filters object with the updated values
      const newFilters = { ...filters }

      // Update the specific filter values
      if (key === "population") {
        newFilters.populationMin = value[0]
        newFilters.populationMax = value[1]
      } else if (key === "income") {
        newFilters.incomeMin = value[0]
        newFilters.incomeMax = value[1]
      } else if (key === "surface") {
        newFilters.surfaceMin = value[0]
        newFilters.surfaceMax = value[1]
      } else if (key === "disposableIncome") {
        newFilters.disposableIncomeMin = value[0]
        newFilters.disposableIncomeMax = value[1]
      }

      // Update global state directly for reactive filtering
      setFilters(newFilters)
      triggerRefresh()
    },
    [filters, setFilters, triggerRefresh],
  )

  return (
    <Card className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">Filters</Label>
        <Button variant="outline" size="sm" onClick={resetFilters} className="flex items-center gap-1">
          <RefreshCw className="h-3 w-3" />
          Reset
        </Button>
      </div>

      {/* Population Filter */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-sm font-medium">Population</Label>
          <span className="text-xs text-muted-foreground">
            {Math.round(filters.populationMin).toLocaleString()} - {Math.round(filters.populationMax).toLocaleString()}
          </span>
        </div>
        <Slider
          min={filterRanges.population.min}
          max={filterRanges.population.max}
          value={[filters.populationMin, filters.populationMax]}
          step={1000}
          onValueChange={(value) => handleFilterChange("population", value as [number, number])}
          className="py-4"
        />
      </div>

      {/* Income Filter */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-sm font-medium">Average Income (€)</Label>
          <span className="text-xs text-muted-foreground">
            {Math.round(filters.incomeMin).toLocaleString()} - {Math.round(filters.incomeMax).toLocaleString()}
          </span>
        </div>
        <Slider
          min={filterRanges.income.min}
          max={filterRanges.income.max}
          value={[filters.incomeMin, filters.incomeMax]}
          step={500}
          onValueChange={(value) => handleFilterChange("income", value as [number, number])}
          className="py-4"
        />
      </div>

      {/* Surface Filter */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-sm font-medium">Surface Area (km²)</Label>
          <span className="text-xs text-muted-foreground">
            {filters.surfaceMin.toFixed(1)} - {filters.surfaceMax.toFixed(1)}
          </span>
        </div>
        <Slider
          min={filterRanges.surface.min}
          max={filterRanges.surface.max}
          value={[filters.surfaceMin, filters.surfaceMax]}
          step={0.1}
          onValueChange={(value) => handleFilterChange("surface", value as [number, number])}
          className="py-4"
        />
      </div>

      {/* Disposable Income Filter */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-sm font-medium">Disposable Income (€)</Label>
          <span className="text-xs text-muted-foreground">
            {Math.round(filters.disposableIncomeMin).toLocaleString()} -{" "}
            {Math.round(filters.disposableIncomeMax).toLocaleString()}
          </span>
        </div>
        <Slider
          min={filterRanges.disposableIncome.min}
          max={filterRanges.disposableIncome.max}
          value={[filters.disposableIncomeMin, filters.disposableIncomeMax]}
          step={500}
          onValueChange={(value) => handleFilterChange("disposableIncome", value as [number, number])}
          className="py-4"
        />
      </div>
    </Card>
  )
}
