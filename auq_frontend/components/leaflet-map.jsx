"use client"

import { useEffect, useRef, useState } from "react"
import { useMapContext } from "@/contexts/map-context"
import { mapTypes } from "@/components/map-type-selector"
import debounce from "lodash/debounce"

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
  const clusterGroupRef = useRef(null)
  const { setMapInitialized, loadGeoJSON, setSelectedArea, filters, dynamicFilters } = useMapContext()
  const mapInstanceRef = useRef(null)
  const [selectedAreaState, setSelectedAreaState] = useState(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [currentMapType, setCurrentMapType] = useState(mapType)
  const [renderedMarkers, setRenderedMarkers] = useState({})
  const [isClusterReady, setIsClusterReady] = useState(false)

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

    // Add MarkerCluster CSS
    const clusterLinkElement = document.createElement("link")
    clusterLinkElement.rel = "stylesheet"
    clusterLinkElement.href = "https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css"
    document.head.appendChild(clusterLinkElement)

    // Load Leaflet from CDN
    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    script.crossOrigin = ""
    script.onload = () => {
      // Load MarkerCluster after Leaflet
      const clusterScript = document.createElement("script")
      clusterScript.src = "https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js"
      clusterScript.onload = initializeMap
      document.head.appendChild(clusterScript)
    }
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

      // Create marker cluster group SOLO si MarkerClusterGroup está disponible
      if (L.MarkerClusterGroup) {
        clusterGroupRef.current = L.markerClusterGroup({
          maxClusterRadius: 50,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          disableClusteringAtZoom: 16,
        }).addTo(map)
        setIsClusterReady(true)
      } else {
        clusterGroupRef.current = null
        setIsClusterReady(false)
        console.warn("MarkerClusterGroup is not available yet.")
      }

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
          // Eliminar el cluster group del mapa antes de limpiar la referencia
          if (clusterGroupRef.current && clusterGroupRef.current._map) {
            try {
              clusterGroupRef.current.clearLayers()
              map.removeLayer(clusterGroupRef.current)
            } catch (error) {
              console.warn("Error removing cluster group during cleanup:", error)
            }
          }
          // Limpiar la referencia después de eliminarlo
          clusterGroupRef.current = null

          map.remove()
          mapInstanceRef.current = null
          geoJsonLayerRef.current = null
          markersLayerRef.current = null
          tileLayerRef.current = null
          setIsMapReady(false)
          setIsClusterReady(false)
        }
      }
    }

    return () => {
      if (linkElement.parentNode) {
        document.head.removeChild(linkElement)
      }
      if (clusterLinkElement.parentNode) {
        document.head.removeChild(clusterLinkElement)
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
          return false
        }

        // Check if coordinates are valid (not empty, not NaN)
        const coords = feature.geometry.coordinates
        if (!coords.length) {
          return false
        }

        // For polygons, check the first ring
        if (feature.geometry.type === "Polygon") {
          const ring = coords[0]
          if (!ring || !ring.length) {
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
            return false
          }
        }

        return true
      })

      if (validFeatures.length === 0) {
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
      }
    } catch (geoJsonError) {
      console.error("Error rendering GeoJSON:", geoJsonError)
      setDefaultCityView(map, selectedCity)
    }
  }, [currentGeoJSON, dynamicFilters, selectedCity, selectedGranularity, setSelectedArea, selectedAreaState, isMapReady])

  // Update markers when point features change (sin debounce)
  useEffect(() => {
    const map = mapInstanceRef.current
    const clusterGroup = clusterGroupRef.current

    if (!map || !isMapReady || !isClusterReady || !clusterGroup || !clusterGroup._map || !clusterGroup._map._loaded) {
      return
    }

    // Limpia los marcadores previos
    try { clusterGroup.clearLayers() } catch { }

    if (!pointFeatures || pointFeatures.length === 0) {
      return
    }

    try {
      const L = window.L
      const defaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
      pointFeatures.forEach((feature) => {
        try {
          const lat = Number.parseFloat(feature.latitude)
          const lng = Number.parseFloat(feature.longitude)
          if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return
          const featureTypeName = (feature.featureType || "Point of Interest")
            .replace(/_/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")

          // Limitar descripción solo para Madrid
          const MAX_DESCRIPTION_LENGTH = 100
          const tooltipContent = `
              <div class="modern-tooltip">
                <div class="modern-tooltip-title">${feature.name}</div>
                <div class="modern-tooltip-type">${featureTypeName}</div>
                ${Object.entries(feature.properties || {})
              .filter(([key]) => key !== "id" && key !== "city_id" && key !== "created_at" && key !== "updated_at")
              .map(([key, value]) => {
                let displayValue = value
                if (
                  selectedCity?.id === 2 &&
                  key === "description" &&
                  typeof value === "string" &&
                  value.length > MAX_DESCRIPTION_LENGTH
                ) {
                  displayValue = value.slice(0, MAX_DESCRIPTION_LENGTH) + "…"
                }
                return `
                      <div class="modern-tooltip-info">
                        <span class="modern-tooltip-label">${key.replace(/_/g, " ").charAt(0).toUpperCase() + key.replace(/_/g, " ").slice(1)}:</span>
                        <span class="modern-tooltip-value" title="${typeof value === 'string' ? value.replace(/\"/g, '&quot;') : value}">${displayValue}</span>
                      </div>
                    `
              })
              .join("")}
              </div>
            `

          const marker = L.marker([lat, lng], { icon: defaultIcon }).bindTooltip(tooltipContent, {
            direction: "top",
            offset: [0, -20],
            opacity: 1,
            permanent: false,
            interactive: true,
            className: "modern-tooltip",
          })
          marker.off("mouseover");
          marker.off("mouseout");
          marker.on("click", function () {
            marker.openTooltip();
          });
          if (clusterGroup && clusterGroup._map && clusterGroup._map._loaded) {
            clusterGroup.addLayer(marker)
          }
        } catch (error) {
          // Silenciar error de marker individual
        }
      })
    } catch (e) {
      // Silenciar error global
    }

    return () => {
      if (clusterGroup && clusterGroup._map && clusterGroup._map._loaded) {
        try { clusterGroup.clearLayers() } catch { }
      }
    }
  }, [pointFeatures, isMapReady, selectedCity, isClusterReady])

  return <div ref={mapRef} className="h-full w-full" />
}
