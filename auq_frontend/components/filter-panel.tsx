"use client"

import { useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { useMapContext } from "@/contexts/map-context"
import { RefreshCw } from "lucide-react"

export function FilterPanel() {
  const { dynamicFilters, setDynamicFilters, resetFilters, triggerRefresh } = useMapContext()

  // Handle filter change for a specific dynamic filter
  const handleDynamicFilterChange = (key: string, value: [number, number]) => {
    setDynamicFilters((prev) =>
      prev.map((f) => (f.key === key ? { ...f, value } : f))
    )
    triggerRefresh()
  }

  return (
    <Card className="p-4 space-y-6">
      <div className="flex justify-end items-center">
        <Button variant="outline" size="sm" onClick={resetFilters} className="flex items-center gap-1">
          Reset
        </Button>
      </div>

      {/* Render dynamic sliders */}
      {dynamicFilters.length === 0 && (
        <div className="text-muted-foreground text-center py-8">No filters available for this city/level.</div>
      )}
      {dynamicFilters.map((filter) => (
        <div className="space-y-2" key={filter.key}>
          <div className="flex justify-between">
            <Label className="text-sm font-medium">{filter.name}{filter.unit ? ` (${filter.unit})` : ""}</Label>
            <span className="text-xs text-muted-foreground">
              {Math.round(filter.value[0]).toLocaleString()} - {Math.round(filter.value[1]).toLocaleString()}
            </span>
          </div>
          <Slider
            min={filter.min}
            max={filter.max}
            value={filter.value}
            step={(filter.max - filter.min) / 100 || 1}
            onValueChange={(value) => handleDynamicFilterChange(filter.key, value as [number, number])}
            className="py-4"
          />
        </div>
      ))}
    </Card>
  )
}
