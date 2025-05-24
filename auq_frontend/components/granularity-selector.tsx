"use client"

import { useEffect, useState } from "react"
import { useMapContext } from "@/contexts/map-context"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Layers } from "lucide-react"
import { getGeographicalLevels } from "@/lib/supabase-client"
import { useRouter, useSearchParams } from "next/navigation"

// Define the GranularityLevel type
type GranularityLevel = {
  id: number
  name: string
  level: string
}

export function GranularitySelector() {
  const {
    selectedCity,
    selectedGranularity,
    setSelectedGranularity,
    hasSelectedGranularity,
    loadGeoJSON,
    triggerRefresh,
  } = useMapContext()

  const [granularityLevels, setGranularityLevels] = useState<GranularityLevel[]>([
    { id: 2, name: "Districts", level: "district" },
    { id: 3, name: "Neighborhoods", level: "neighbourhood" },
  ])
  const router = useRouter()
  const searchParams = useSearchParams()

  // Fetch granularity levels on component mount
  useEffect(() => {
    async function loadGranularityLevels() {
      try {
        const levels = await getGeographicalLevels()
        // Filter out the "city" level as it's not used for map visualization
        const filteredLevels = levels.filter((level) => level.level !== "city")
        setGranularityLevels(filteredLevels)
        // On mount, if level param exists, set it
        const levelParam = searchParams.get("level")
        if (levelParam) {
          const found = filteredLevels.find((g) => g.level === levelParam)
          if (found) setSelectedGranularity(found)
        }
      } catch (error) {
        console.error("Error loading granularity levels:", error)
      }
    }

    loadGranularityLevels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update URL when granularity changes
  useEffect(() => {
    if (selectedGranularity) {
      const params = new URLSearchParams(window.location.search)
      params.set("level", selectedGranularity.level)
      router.replace(`?${params.toString()}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGranularity])

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
        className={`flex items-center gap-2 text-sm font-medium ${!selectedCity ? "text-muted-foreground" : !hasSelectedGranularity ? "text-primary animate-pulse" : ""
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
