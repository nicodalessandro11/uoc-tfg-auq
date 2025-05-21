"use client"

import { useEffect, useRef, useState } from "react"
import { useMapContext } from "@/contexts/map-context"
import { mapTypes } from "@/components/map-type-selector"

// Feature type mapping
const featureTypeMap = {
  1: "library",
  2: "cultural_center",
  3: "auditorium",
  4: "heritage_space",
  5: "creation_factory",
  6: "museum",
  7: "cinema",
  8: "exhibition_center",
  9: "archive",
  10: "live_music_venue",
  11: "performing_arts_venue",
  12: "municipal_market",
  13: "park_garden",
  14: "educational_center",
}

// This component will only be loaded on the client side
export default function LeafletMap({
  selectedCity,
  selectedGranularity,
  currentGeoJSON,
  pointFeatures, // This is already filtered by map-component.tsx
  hasSelectedGranularity,
  mapType,
  visiblePointTypes,
}) {
  const mapRef = useRef(null)
  const geoJsonLayerRef = useRef(null)
  const markersLayerRef = useRef(null)
  const tileLayerRef = useRef(null)
  const { setMapInitialized, loadGeoJSON, setSelectedArea, filters, dynamicFilters } = useMapContext()
  const mapInstanceRef = useRef(null)
  const [selectedAreaState, setSelectedAreaState] = useState(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [currentMapType, setCurrentMapType] = useState(mapType)
  const [renderedMarkers, setRenderedMarkers] = useState({})

  // Function to generate a color from a simple palette based on the index
  const getColorFromPalette = (index, total) => {
    const colors = ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3"]
    return colors[index % colors.length]
  }

  // Initialize the map
  useEffect(() => {
    // Add Leaflet CSS
    const linkElement = document.createElement("link")
    linkElement.rel = "stylesheet"
    linkElement.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    document.head.appendChild(linkElement)

    // Load Leaflet from CDN
    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    script.crossOrigin = ""
    script.onload = initializeMap
    document.head.appendChild(script)

    function initializeMap() {
      if (!mapRef.current || mapInstanceRef.current) return

      const L = window.L
      if (!L) {
        console.error("Leaflet not loaded")
        return
      }

      // Create map instance
      const map = L.map(mapRef.current, {
        center: [40, -4], // Initial view of Spain
        zoom: 5,
        zoomControl: false,
      })

      // Get the initial map type configuration
      const initialMapType = mapTypes[mapType] || mapTypes.osm

      // Add tile layer
      tileLayerRef.current = L.tileLayer(initialMapType.url, {
        attribution: initialMapType.attribution,
        maxZoom: 19,
      }).addTo(map)

      // Add zoom control
      L.control.zoom({ position: "bottomright" }).addTo(map)

      // Create layers for GeoJSON and markers
      geoJsonLayerRef.current = L.layerGroup().addTo(map)
      markersLayerRef.current = L.layerGroup().addTo(map)

      // Store map instance
      mapInstanceRef.current = map

      // Mark map as ready
      setIsMapReady(true)

      // Notify that map is initialized
      setMapInitialized(true)

      // Handle resize events
      const handleResize = () => {
        if (map) {
          map.invalidateSize()
        }
      }

      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
        if (map) {
          map.remove()
          mapInstanceRef.current = null
          geoJsonLayerRef.current = null
          markersLayerRef.current = null
          tileLayerRef.current = null
          setIsMapReady(false)
        }
      }
    }

    return () => {
      if (linkElement.parentNode) {
        document.head.removeChild(linkElement)
      }
      if (script.parentNode) {
        document.head.removeChild(script)
      }
    }
  }, [setMapInitialized, mapType])

  // Update map when city or granularity changes
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !isMapReady) return

    // Track the previous city ID to detect city changes
    const prevCityId = map.prevCityId

    if (selectedCity) {
      // Only set the view when the city changes
      if (!prevCityId || prevCityId !== selectedCity.id) {
        console.log(`City changed to ${selectedCity.name}, updating map view`)
        setDefaultCityView(map, selectedCity)
        // Store the current city ID for future comparison
        map.prevCityId = selectedCity.id
      }

      // Load GeoJSON if we have granularity
      if (selectedGranularity && hasSelectedGranularity) {
        loadGeoJSON(selectedCity.id, selectedGranularity.level)
      }
    } else {
      // Reset to initial view if no city is selected
      map.setView([40, -4], 5)
      map.prevCityId = null
    }
  }, [selectedCity, selectedGranularity, hasSelectedGranularity, loadGeoJSON, isMapReady])

  // Helper function to set default city view
  const setDefaultCityView = (map, selectedCity) => {
    if (!map || !selectedCity) return

    try {
      console.log(`Setting default view for city: ${selectedCity.name} (ID: ${selectedCity.id})`)

      if (selectedCity.id === 1) {
        // Barcelona
        map.setView([41.3851, 2.1734], 12)
      } else if (selectedCity.id === 2) {
        // Madrid
        map.setView([40.4168, -3.7038], 12)
      } else {
        // Default view of Spain
        map.setView([40, -4], 5)
      }

      console.log(`Map view updated successfully for ${selectedCity.name}`)
    } catch (error) {
      console.error(`Error setting default view for city ${selectedCity.name}:`, error)
      // Fallback to a safe default
      try {
        map.setView([40, -4], 5)
      } catch (fallbackError) {
        console.error("Error setting fallback view:", fallbackError)
      }
    }
  }

  // Update the tile layer when map type changes
  useEffect(() => {
    // Only update if the map type has actually changed
    if (mapType === currentMapType) return

    setCurrentMapType(mapType)

    const map = mapInstanceRef.current
    if (!map || !isMapReady) return

    const L = window.L
    if (!L) return

    console.log("Updating map type to:", mapType)

    try {
      // Get the selected map type configuration
      const selectedMapType = mapTypes[mapType] || mapTypes.osm

      // Remove the current tile layer if it exists
      if (tileLayerRef.current) {
        try {
          map.removeLayer(tileLayerRef.current)
        } catch (error) {
          console.warn("Error removing tile layer:", error)
        }
      }

      // Add the new tile layer
      tileLayerRef.current = L.tileLayer(selectedMapType.url, {
        attribution: selectedMapType.attribution,
        maxZoom: 19,
      }).addTo(map)

      // Ensure the tile layer is at the bottom
      if (tileLayerRef.current) {
        tileLayerRef.current.bringToBack()
      }
    } catch (error) {
      console.error("Error updating map type:", error)
      // Fallback to OSM if there's an error
      try {
        tileLayerRef.current = L.tileLayer(mapTypes.osm.url, {
          attribution: mapTypes.osm.attribution,
          maxZoom: 19,
        }).addTo(map)
      } catch (fallbackError) {
        console.error("Error applying fallback map type:", fallbackError)
      }
    }
  }, [mapType, isMapReady, currentMapType])

  // Update GeoJSON layer when data changes
  useEffect(() => {
    const map = mapInstanceRef.current
    const geoJsonLayer = geoJsonLayerRef.current
    if (!map || !geoJsonLayer || !isMapReady) return

    // Clear previous GeoJSON
    try {
      geoJsonLayer.clearLayers()
    } catch (error) {
      console.warn("Error clearing GeoJSON layers:", error)
    }

    // Get Leaflet from window
    const L = window.L
    if (!L) return

    // Check if we have valid GeoJSON data
    if (!currentGeoJSON || !currentGeoJSON.features || currentGeoJSON.features.length === 0) {
      console.log("No valid GeoJSON data to render")
      return
    }

    // === FILTRADO DE FEATURES SEGÚN LOS SLIDERS DINÁMICOS ===
    const filteredFeatures = currentGeoJSON.features.filter((feature) => {
      const props = feature.properties
      // Para cada filtro dinámico, verifica que el valor esté dentro del rango
      for (const filter of dynamicFilters) {
        const value = props[filter.key]
        if (typeof value !== 'number') return false
        if (value < filter.value[0] || value > filter.value[1]) return false
      }
      return true
    })

    // Style function for GeoJSON
    const getAreaStyle = (feature) => {
      const isSelected = selectedAreaState?.id === feature.properties.id

      // Get property values, handling both Supabase and API formats
      const population = feature.properties.population || 0
      const avgIncome = feature.properties.avg_income || feature.properties.avgIncome || 0

      if (isSelected) {
        return {
          fillColor: "#3b82f6", // Primary blue
          weight: 2,
          opacity: 1,
          color: "#1d4ed8",
          fillOpacity: 0.7,
        }
      } else {
        // Use the color palette function to get a unique color
        const color = getColorFromPalette(
          feature.properties.index || 0,
          currentGeoJSON.features ? currentGeoJSON.features.length : 0,
        )
        return {
          fillColor: color,
          weight: 1,
          opacity: 1,
          color: "#60a5fa",
          fillOpacity: 0.6,
        }
      }
    }

    try {
      // Validate GeoJSON data before rendering
      const validFeatures = filteredFeatures.filter((feature) => {
        // Check if feature has valid geometry
        if (!feature.geometry || !feature.geometry.coordinates) {
          console.warn("Feature missing geometry or coordinates:", feature)
          return false
        }

        // Check if coordinates are valid (not empty, not NaN)
        const coords = feature.geometry.coordinates
        if (!coords.length) {
          console.warn("Feature has empty coordinates:", feature)
          return false
        }

        // For polygons, check the first ring
        if (feature.geometry.type === "Polygon") {
          const ring = coords[0]
          if (!ring || !ring.length) {
            console.warn("Polygon has empty ring:", feature)
            return false
          }

          // Check if coordinates contain valid numbers
          const hasInvalidCoords = ring.some(
            (point) =>
              point.length < 2 ||
              typeof point[0] !== "number" ||
              typeof point[1] !== "number" ||
              isNaN(point[0]) ||
              isNaN(point[1]),
          )

          if (hasInvalidCoords) {
            console.warn("Polygon has invalid coordinates:", feature)
            return false
          }
        }

        return true
      })

      if (validFeatures.length === 0) {
        console.warn("No valid features found in GeoJSON data")
        return
      }

      // Create a valid GeoJSON object with only valid features
      const validGeoJSON = {
        type: "FeatureCollection",
        features: validFeatures,
      }

      // Add GeoJSON to map
      const geoJson = L.geoJSON(validGeoJSON, {
        style: getAreaStyle,
        onEachFeature: (feature, layer) => {
          layer.on({
            click: (e) => {
              const areaId = feature.properties.id
              const areaName = feature.properties.name
              const area = {
                id: areaId,
                name: areaName,
                cityId: feature.properties.city_id || selectedCity?.id || 0,
                population: feature.properties.population || 0,
                avgIncome: feature.properties.avg_income || feature.properties.avgIncome || 0,
                surface: feature.properties.surface || 0,
                disposableIncome: feature.properties.disposable_income || feature.properties.disposableIncome || 0,
                ...(selectedGranularity?.level === "neighborhood" && {
                  districtId: feature.properties.district_id || feature.properties.districtId || 0,
                }),
              }
              setSelectedAreaState(area)
              setSelectedArea(area)
            },
          })
          layer.bindTooltip(feature.properties.name)
        },
      })

      // Only add to layer if it was created successfully
      if (geoJson) {
        geoJson.addTo(geoJsonLayer)

        // We don't need to fit bounds every time GeoJSON changes
        // The map view is already set when the city changes
        // This prevents unnecessary errors and map jumps
      }
    } catch (geoJsonError) {
      console.error("Error rendering GeoJSON:", geoJsonError)
      setDefaultCityView(map, selectedCity)
    }
  }, [currentGeoJSON, dynamicFilters, selectedCity, selectedGranularity, setSelectedArea, selectedAreaState, isMapReady])

  // Update markers when point features change
  useEffect(() => {
    const map = mapInstanceRef.current
    const markersLayer = markersLayerRef.current
    if (!map || !markersLayer || !isMapReady) return

    // Clear previous markers
    try {
      markersLayer.clearLayers()
      setRenderedMarkers({})
    } catch (error) {
      console.warn("Error clearing marker layers:", error)
    }

    // Get Leaflet from window
    const L = window.L
    if (!L) return

    // Only proceed if we have point features
    if (!pointFeatures || pointFeatures.length === 0) {
      console.log(`No point features to render for ${selectedCity?.name || "unknown city"}`)
      return
    }

    console.log(`Rendering ${pointFeatures.length} markers for ${selectedCity?.name}`)

    // Special logging for Madrid
    if (selectedCity?.id === 2) {
      console.group("🗺️ Madrid Markers Creation")
      console.log(`Attempting to render ${pointFeatures.length} Madrid markers`)
      console.table(
        pointFeatures.map((f) => ({
          name: f.name,
          lat: f.latitude,
          lng: f.longitude,
          type: f.featureType || f.feature_definition_id,
        })),
      )
      console.groupEnd()
    }

    // Create icon - Fix for marker icon issue
    const defaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })

    // Custom tooltip class for modern styling
    L.Tooltip.prototype.options.className = "modern-tooltip"

    // Add custom tooltip styles to the document
    if (!document.getElementById("modern-tooltip-styles")) {
      const styleElement = document.createElement("style")
      styleElement.id = "modern-tooltip-styles"
      styleElement.textContent = `
        .modern-tooltip {
          background-color: rgba(255, 255, 255, 0.95);
          border: none;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 12px;
          font-family: var(--font-manrope), sans-serif;
          max-width: 300px;
          backdrop-filter: blur(4px);
        }
        .modern-tooltip .leaflet-tooltip-content {
          padding: 0;
        }
        .modern-tooltip-title {
          font-weight: 600;
          font-size: 16px;
          color: hsl(var(--foreground));
          margin-bottom: 8px;
          border-bottom: 1px solid hsl(var(--border));
          padding-bottom: 6px;
        }
        .modern-tooltip-type {
          font-size: 14px;
          color: hsl(var(--primary));
          margin-bottom: 8px;
          font-weight: 500;
        }
        .modern-tooltip-info {
          font-size: 13px;
          color: hsl(var(--muted-foreground));
          margin-bottom: 4px;
          display: flex;
        }
        .modern-tooltip-label {
          font-weight: 500;
          margin-right: 4px;
        }
        .modern-tooltip-value {
          flex: 1;
        }
        .leaflet-tooltip-pane {
          z-index: 1000;
        }
        .leaflet-tooltip.modern-tooltip::before {
          border-right-color: rgba(255, 255, 255, 0.95);
        }
        .leaflet-tooltip-left.modern-tooltip::before {
          border-left-color: rgba(255, 255, 255, 0.95);
        }
      `
      document.head.appendChild(styleElement)
    }

    // Add markers
    let markersAdded = 0
    let madridMarkersAdded = 0
    const newRenderedMarkers = {}

    pointFeatures.forEach((feature) => {
      if (feature.latitude && feature.longitude) {
        try {
          // Validate coordinates
          const lat = Number.parseFloat(feature.latitude)
          const lng = Number.parseFloat(feature.longitude)

          // Special logging for Madrid features
          const isMadridFeature = selectedCity?.id === 2

          if (isMadridFeature) {
            console.log(`Creating Madrid marker: ${feature.name}, coords: [${lat}, ${lng}]`)
          }

          if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            console.warn(`Invalid coordinates for feature ${feature.name}: [${lat}, ${lng}]`)
            return
          }

          // Format feature type for display
          const featureTypeName = (feature.featureType || "Point of Interest")
            .replace(/_/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")

          // Create modern tooltip content
          const tooltipContent = `
            <div>
              <div class="modern-tooltip-title">${feature.name}</div>
              <div class="modern-tooltip-type">${featureTypeName}</div>
              ${Object.entries(feature.properties || {})
              .map(
                ([key, value]) => `
                  <div class="modern-tooltip-info">
                    <span class="modern-tooltip-label">${key.replace(/_/g, " ").charAt(0).toUpperCase() + key.replace(/_/g, " ").slice(1)}:</span>
                    <span class="modern-tooltip-value">${value}</span>
                  </div>
                `,
              )
              .join("")}
            </div>
          `

          // Create marker with tooltip
          const marker = L.marker([lat, lng], { icon: defaultIcon }).bindTooltip(tooltipContent, {
            direction: "top",
            offset: [0, -20],
            opacity: 1,
            permanent: false,
            interactive: true,
            className: "modern-tooltip",
          })

          // Only add to layer if it was created successfully
          if (marker) {
            marker.addTo(markersLayer)
            markersAdded++

            // Track rendered markers by ID
            newRenderedMarkers[feature.id] = true

            if (isMadridFeature) {
              madridMarkersAdded++
            }
          }
        } catch (error) {
          console.error(`Error adding marker for ${feature.name}:`, error)
        }
      } else {
        console.warn(`Missing coordinates for feature: ${feature.name}`)
      }
    })

    // Update rendered markers state
    setRenderedMarkers(newRenderedMarkers)

    // Add a summary log specifically for Madrid
    if (selectedCity?.id === 2) {
      console.log(`Madrid summary: Added ${madridMarkersAdded} out of ${pointFeatures.length} markers`)

      // Force the markers layer to be visible and on top
      if (markersLayer && markersLayer.getLayers) {
        // For LayerGroups, we need to bring each individual marker to front
        const layers = markersLayer.getLayers()
        layers.forEach((layer) => {
          if (layer.bringToFront) {
            layer.bringToFront()
          }
        })

        // Also ensure the markers layer is the last one added to the map
        if (map && markersLayer._map) {
          try {
            // Remove and re-add to ensure it's on top
            markersLayer.remove()
            markersLayer.addTo(map)
          } catch (e) {
            console.warn("Error re-adding markers layer:", e)
          }
        }
      }

      // Check if markers were added but not visible
      if (madridMarkersAdded > 0) {
        console.log("Madrid markers were added. If they're not visible, check:")
        console.log("1. Is the map centered on Madrid? Current center:", map.getCenter())
        console.log("2. Is the markers layer visible?", markersLayer._map ? "Yes" : "No")
        console.log("3. Current zoom level:", map.getZoom())
      }
    }
  }, [pointFeatures, isMapReady, selectedCity])

  return <div ref={mapRef} className="h-full w-full" />
}
