"use client"

import { useEffect, useRef, useState } from "react"
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

export default function MapComponent() {
  const {
    selectedCity,
    selectedGranularity,
    currentGeoJSON,
    visiblePointTypes,
    isLoadingGeoJSON,
    hasSelectedGranularity,
    mapType,
  } = useMapContext()

  const mapContainerRef = useRef(null)
  const [pointFeatures, setPointFeatures] = useState([])
  const [isLoadingPoints, setIsLoadingPoints] = useState(false)

  // Load point features when city changes
  useEffect(() => {
    async function loadPointFeatures() {
      if (!selectedCity) return

      setIsLoadingPoints(true)
      try {
        console.log(`Loading point features for city: ${selectedCity.name} (ID: ${selectedCity.id})`)
        const pointFeaturesData = await getCityPointFeatures(selectedCity.id)
        console.log("Loaded point features:", pointFeaturesData)
        setPointFeatures(pointFeaturesData)
      } catch (error) {
        console.error("Error loading point features:", error)
        setPointFeatures([])
      } finally {
        setIsLoadingPoints(false)
      }
    }

    loadPointFeatures()
  }, [selectedCity])

  // Filter point features based on visible types
  const filteredPointFeatures = pointFeatures.filter((feature) => {
    // Get the feature type, handling different property names
    const featureType =
      feature.featureType ||
      feature.feature_type ||
      (feature.feature_definition_id ? feature.feature_definition_id.toString() : null)

    // Log the feature type for debugging
    if (feature.name && feature.name.includes("Madrid")) {
      console.log(`Madrid feature: ${feature.name}, type: ${featureType}`)
    }

    // If we have a feature type, check if it's visible
    if (featureType) {
      // For types not explicitly defined in visiblePointTypes, show them by default
      return visiblePointTypes[featureType] !== undefined ? visiblePointTypes[featureType] : true
    }

    // If no feature type, show by default
    return true
  })

  return (
    <div className="h-full w-full relative" ref={mapContainerRef}>
      <MapWithNoSSR
        selectedCity={selectedCity}
        selectedGranularity={selectedGranularity}
        currentGeoJSON={currentGeoJSON}
        pointFeatures={filteredPointFeatures}
        hasSelectedGranularity={hasSelectedGranularity}
        mapType={mapType}
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
