"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { useMapContext } from "@/contexts/map-context"
import { Loader2 } from "lucide-react"
import { getCityPointFeatures } from "@/lib/api-service"
import dynamic from "next/dynamic"
import { MapTypeSelector } from "@/components/map-type-selector"
import type { PointFeature } from "@/lib/api-types"

// Create a client-side only component for the map
const MapWithNoSSR = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Loading map...</span>
    </div>
  ),
})

// Debug flag to control verbose logging
const DEBUG_MODE = false

// Add this function after the existing imports
function debugMadridPoints(points: PointFeature[], visibleTypes: Record<string, boolean>) {
  if (!DEBUG_MODE) return;

  console.group("🔍 Madrid Points Debug")
  console.log(`Total Madrid points: ${points.length}`)
  console.groupEnd()
}

// Feature type mapping
const featureTypeMap = {
  "1": "library",
  "2": "cultural_center",
  "3": "auditorium",
  "4": "heritage_space",
  "5": "creation_factory",
  "6": "museum",
  "7": "cinema",
  "8": "exhibition_center",
  "9": "archive",
  "10": "live_music_venue",
  "11": "performing_arts_venue",
  "12": "municipal_market",
  "13": "park_garden",
  "14": "educational_center",
}

export default function MapComponent() {
  const {
    selectedCity,
    selectedGranularity,
    currentGeoJSON,
    visiblePointTypes,
    isLoadingGeoJSON,
    hasSelectedGranularity,
    mapType,
    clearPointFeaturesCache,
    setPointFeatures,
    pointFeatures,
  } = useMapContext()

  const mapContainerRef = useRef(null)
  const [isLoadingPoints, setIsLoadingPoints] = useState(false)
  const prevCityIdRef = useRef<number | null>(null)

  // Load point features when city changes
  useEffect(() => {
    async function loadPointFeatures() {
      if (!selectedCity) return

      // If the city has changed, clear the cache for the previous city
      if (prevCityIdRef.current && prevCityIdRef.current !== selectedCity.id) {
        clearPointFeaturesCache(prevCityIdRef.current)
      }

      prevCityIdRef.current = selectedCity.id

      setIsLoadingPoints(true)
      try {
        const pointFeaturesData = await getCityPointFeatures(selectedCity.id)
        setPointFeatures(pointFeaturesData)
      } catch (error) {
        console.error("Error loading point features:", error)
        setPointFeatures([])
      } finally {
        setIsLoadingPoints(false)
      }
    }

    loadPointFeatures()
  }, [selectedCity, clearPointFeaturesCache, setPointFeatures])

  // Filter point features based on visible types
  const filteredPointFeatures = useMemo(() => {
    console.log("[Map] Starting to filter point features")
    console.log(`[Map] Total point features before filtering: ${pointFeatures.length}`)
    console.log("[Map] Visible point types:", visiblePointTypes)

    if (!pointFeatures || pointFeatures.length === 0) {
      console.log("[Map] No point features to filter")
      return []
    }

    const filtered = pointFeatures.filter((feature) => {
      if (!feature.featureType) {
        console.warn(`[Map] Feature ${feature.id} has no feature type`)
        return false
      }

      const isVisible = visiblePointTypes[feature.featureType]
      if (isVisible === undefined) {
        console.warn(`[Map] Feature type ${feature.featureType} not found in visiblePointTypes`)
        return false
      }

      return isVisible
    })

    console.log(`[Map] Total point features after filtering: ${filtered.length}`)
    console.log("[Map] Feature types distribution after filtering:",
      Object.entries(
        filtered.reduce<Record<string, number>>((acc, f) => {
          acc[f.featureType] = (acc[f.featureType] || 0) + 1
          return acc
        }, {})
      )
    )

    return filtered
  }, [pointFeatures, visiblePointTypes])

  // Debug Madrid points if selected
  if (selectedCity?.id === 2 && DEBUG_MODE) {
    debugMadridPoints(pointFeatures, visiblePointTypes)
  }

  return (
    <div className="h-full w-full relative" ref={mapContainerRef}>
      <MapWithNoSSR
        selectedCity={selectedCity}
        selectedGranularity={selectedGranularity}
        currentGeoJSON={currentGeoJSON}
        pointFeatures={filteredPointFeatures}
        hasSelectedGranularity={hasSelectedGranularity}
        mapType={mapType}
        visiblePointTypes={visiblePointTypes}
      />

      {/* Map Type Selector */}
      <MapTypeSelector />

      {/* Loading indicator */}
      {(isLoadingGeoJSON || isLoadingPoints) && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-80 p-4 rounded-lg shadow-lg z-[1000] flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Loading data...</span>
        </div>
      )}

      {/* Message to select city */}
      {!selectedCity && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 p-6 rounded-lg shadow-lg z-[900] text-center max-w-md">
          <h3 className="text-lg font-semibold mb-2">Welcome to Are U Query-ous</h3>
          <p className="text-muted-foreground mb-4">
            Select a city from the top menu to start exploring geospatial data.
          </p>
        </div>
      )}

      {/* Message to select level after city is selected - only shown if no level has ever been selected */}
      {selectedCity && !currentGeoJSON && !hasSelectedGranularity && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 p-6 rounded-lg shadow-lg z-[900] text-center max-w-md">
          <h3 className="text-lg font-semibold mb-2">Great! You've selected {selectedCity.name}</h3>
          <p className="text-muted-foreground mb-4">
            Now select the level of detail you want to see using the "Level" selector in the top menu.
          </p>
          <p className="text-sm text-muted-foreground">
            You can switch between Districts and Neighborhoods at any time.
          </p>
        </div>
      )}
    </div>
  )
}
