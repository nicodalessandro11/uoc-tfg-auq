"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { useMapContext } from "@/contexts/map-context"
import { Loader2 } from "lucide-react"
import { getCityPointFeatures } from "@/lib/api-service"
import dynamic from "next/dynamic"
import { MapTypeSelector } from "@/components/map-type-selector"

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
const DEBUG_MODE = true

// Add this function after the existing imports
function debugMadridPoints(points, visibleTypes) {
  console.group("🔍 Madrid Points Debug")
  console.log(`Total Madrid points: ${points.length}`)

  points.forEach((point) => {
    const featureType =
      point.featureType ||
      point.feature_type ||
      (point.feature_definition_id ? point.feature_definition_id.toString() : "unknown")

    const isVisible = visibleTypes[featureType] !== undefined ? visibleTypes[featureType] : true

    console.log(`Point: ${point.name}`)
    console.log(`  - Type: ${featureType}`)
    console.log(`  - Coordinates: [${point.latitude}, ${point.longitude}]`)
    console.log(`  - Visible: ${isVisible}`)
    console.log(`  - Feature Definition ID: ${point.feature_definition_id}`)
  })

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
  } = useMapContext()

  const mapContainerRef = useRef(null)
  const [pointFeatures, setPointFeatures] = useState([])
  const [isLoadingPoints, setIsLoadingPoints] = useState(false)
  const prevCityIdRef = useRef(null)

  // Load point features when city changes
  useEffect(() => {
    async function loadPointFeatures() {
      if (!selectedCity) return

      // If the city has changed, clear the cache for the previous city
      if (prevCityIdRef.current && prevCityIdRef.current !== selectedCity.id) {
        console.log(`City changed from ${prevCityIdRef.current} to ${selectedCity.id}, clearing cache`)
        clearPointFeaturesCache(prevCityIdRef.current)
      }

      prevCityIdRef.current = selectedCity.id

      setIsLoadingPoints(true)
      try {
        console.log(`Loading point features for city: ${selectedCity.name} (ID: ${selectedCity.id})`)
        const pointFeaturesData = await getCityPointFeatures(selectedCity.id)
        console.log(`Loaded ${pointFeaturesData.length} point features for ${selectedCity.name}`)

        // Special handling for Madrid (city ID 2)
        if (selectedCity.id === 2 && DEBUG_MODE) {
          console.log("Madrid point features:", pointFeaturesData)
        }

        setPointFeatures(pointFeaturesData)
      } catch (error) {
        console.error("Error loading point features:", error)
        setPointFeatures([])
      } finally {
        setIsLoadingPoints(false)
      }
    }

    loadPointFeatures()
  }, [selectedCity, clearPointFeaturesCache])

  // Filter point features based on visible types - IMPROVED FILTERING LOGIC
  // Memoize the filtered point features to avoid recalculating on every render
  const filteredPointFeatures = useMemo(() => {
    // Skip filtering if no features
    if (!pointFeatures.length) return []

    // Debug logging
    if (selectedCity?.id === 2 && DEBUG_MODE) {
      debugMadridPoints(pointFeatures, visiblePointTypes)
    }

    // Apply filtering
    return pointFeatures.filter((feature) => {
      // Get the feature type identifiers
      const numericId = feature.feature_definition_id ? feature.feature_definition_id.toString() : null
      const stringType = numericId ? featureTypeMap[numericId] : null
      const featureType = feature.featureType || feature.feature_type || stringType || numericId

      // If no feature type identifiers found, show by default
      if (!numericId && !stringType && !featureType) return true

      // Check both numeric ID and string type - if either is explicitly false, hide the feature
      if (numericId && visiblePointTypes[numericId] === false) {
        return false
      }

      if (stringType && visiblePointTypes[stringType] === false) {
        return false
      }

      if (featureType && visiblePointTypes[featureType] === false) {
        return false
      }

      // If we get here, the feature should be visible
      return true
    })
  }, [pointFeatures, visiblePointTypes, selectedCity?.id])

  // Debug Madrid points if selected
  if (selectedCity?.id === 2 && DEBUG_MODE) {
    debugMadridPoints(pointFeatures, visiblePointTypes)
    console.log(`Filtered ${filteredPointFeatures.length} out of ${pointFeatures.length} point features for Madrid`)
    console.log("Visible point types:", visiblePointTypes)
  }

  // Only log summary in normal mode
  console.log(
    `Filtered ${filteredPointFeatures.length} out of ${pointFeatures.length} point features for ${selectedCity?.name}`,
  )

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
