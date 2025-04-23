"use client"

import { useMapContext } from "@/contexts/map-context"
import { granularityLevels } from "@/lib/api-adapter" // Still using adapter for granularity levels
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Layers } from "lucide-react"

export function GranularitySelector() {
  const {
    selectedCity,
    selectedGranularity,
    setSelectedGranularity,
    hasSelectedGranularity,
    loadGeoJSON,
    triggerRefresh,
  } = useMapContext()

  const handleGranularityChange = (value: string) => {
    if (!value || !selectedCity) return // Prevent empty selection or if no city selected

    const granularity = granularityLevels.find((g) => g.level === value)
    if (granularity && (!selectedGranularity || granularity.level !== selectedGranularity.level)) {
      console.log("Changing granularity to:", granularity.name)

      // Set the new granularity
      setSelectedGranularity(granularity)

      // Explicitly load the data for the new granularity
      if (selectedCity) {
        console.log("Explicitly loading data for new granularity:", granularity.level)
        setTimeout(() => {
          loadGeoJSON(selectedCity.id, granularity.level)
          triggerRefresh() // Force a refresh after loading
        }, 0)
      }
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-2 text-sm font-medium ${
          !selectedCity ? "text-muted-foreground" : !hasSelectedGranularity ? "text-primary animate-pulse" : ""
        }`}
      >
        <Layers className={`h-4 w-4 ${!hasSelectedGranularity && selectedCity ? "animate-bounce" : ""}`} />
        <span>Level:</span>
      </div>
      <ToggleGroup
        type="single"
        value={selectedGranularity?.level}
        onValueChange={handleGranularityChange}
        disabled={!selectedCity}
        className={selectedCity && !hasSelectedGranularity ? "ring-2 ring-primary ring-offset-2" : ""}
      >
        {granularityLevels.map((granularity) => (
          <ToggleGroupItem
            key={granularity.id}
            value={granularity.level}
            aria-label={granularity.name}
            className="text-xs px-3"
            disabled={!selectedCity}
          >
            {granularity.name}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
