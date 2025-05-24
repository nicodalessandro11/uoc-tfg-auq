"use client"

import { useEffect, useRef, useState } from "react"
import { useMapContext } from "@/contexts/map-context"
import { mapTypes } from "@/components/map-type-selector"
import debounce from "lodash/debounce"
import { useTheme } from "next-themes"
import { useRouter, useSearchParams } from "next/navigation"

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

// Feature type mapping with styles
const featureTypeStyles = {
  library: {
    color: "#4CAF50", // Verde
    icon: "📚"
  },
  cultural_center: {
    color: "#2196F3", // Azul
    icon: "🎭"
  },
  auditorium: {
    color: "#9C27B0", // Púrpura
    icon: "🎪"
  },
  heritage_space: {
    color: "#FF9800", // Naranja
    icon: "🏛️"
  },
  creation_factory: {
    color: "#E91E63", // Rosa
    icon: "🏭"
  },
  museum: {
    color: "#795548", // Marrón
    icon: "🏛️"
  },
  cinema: {
    color: "#607D8B", // Gris azulado
    icon: "🎬"
  },
  exhibition_center: {
    color: "#00BCD4", // Cyan
    icon: "🖼️"
  },
  archive: {
    color: "#673AB7", // Púrpura oscuro
    icon: "📜"
  },
  live_music_venue: {
    color: "#FFC107", // Amarillo
    icon: "🎵"
  },
  performing_arts_venue: {
    color: "#F44336", // Rojo
    icon: "🎭"
  },
  municipal_market: {
    color: "#8BC34A", // Verde claro
    icon: "🛒"
  },
  park_garden: {
    color: "#009688", // Verde azulado
    icon: "🌳"
  },
  educational_center: {
    color: "#3F51B5", // Índigo
    icon: "🎓"
  }
}

// Color palette for dynamic assignment
const colorPalette = [
  '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6',
  '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3',
  '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000'
]

// Helper to assign a color to each feature type by order of appearance
const featureTypeColorMap = {}
let colorIndex = 0
const getColorForFeatureType = (featureType) => {
  if (!featureTypeColorMap[featureType]) {
    featureTypeColorMap[featureType] = colorPalette[colorIndex % colorPalette.length]
    colorIndex++
  }
  return featureTypeColorMap[featureType]
}

// Leaflet-color-markers icon URLs
const markerIconUrls = [
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png',
]
const markerShadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'

// Helper to assign a marker icon URL to each feature type by order of appearance
const featureTypeIconMap = {}
let iconIndex = 0
const getIconUrlForFeatureType = (featureType) => {
  if (!featureTypeIconMap[featureType]) {
    featureTypeIconMap[featureType] = markerIconUrls[iconIndex % markerIconUrls.length]
    iconIndex++
  }
  return featureTypeIconMap[featureType]
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
  const { setMapInitialized, loadGeoJSON, setSelectedArea, filters, dynamicFilters, setMapType, selectedArea } = useMapContext()
  const mapInstanceRef = useRef(null)
  const [selectedAreaState, setSelectedAreaState] = useState(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [currentMapType, setCurrentMapType] = useState(mapType)
  const [renderedMarkers, setRenderedMarkers] = useState({})
  const [isClusterReady, setIsClusterReady] = useState(false)
  const markersRef = useRef([])
  const { theme } = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  // Track if the last click was on a polygon
  const lastPolygonClickRef = useRef(false)

  // Function to generate a color from a simple palette based on the index
  const getColorFromPalette = (index, total) => {
    const colors = ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3"]
    return colors[index % colors.length]
  }

  // Helper function to get marker style
  const getMarkerStyle = (featureType) => {
    return featureTypeStyles[featureType] || {
      color: "#FF4444",
      icon: "📍"
    }
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
          maxClusterRadius: 80,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          disableClusteringAtZoom: 15,
          chunkedLoading: true,
          chunkInterval: 200,
          chunkDelay: 50,
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

      // Deselect area when clicking on map background
      map.on('click', function (e) {
        if (lastPolygonClickRef.current) {
          lastPolygonClickRef.current = false
          return
        }
        setSelectedArea(null)
      })

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
        map.setView([40.4168, -3.7038], 11)
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
              lastPolygonClickRef.current = true
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
              // Update area param in URL
              const params = new URLSearchParams(window.location.search)
              params.set("area", areaId)
              router.push(`?${params.toString()}`, { scroll: false })
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
  }, [currentGeoJSON, dynamicFilters, selectedCity, selectedGranularity, setSelectedArea, selectedAreaState, isMapReady, router])

  // Update markers when point features change
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !pointFeatures || pointFeatures.length === 0) {
      console.log("[Map] No map or no point features to render")
      return
    }

    console.log(`[Map] Rendering ${pointFeatures.length} point features`)

    // Clear previous markers
    if (markersRef.current) {
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
    }

    // Process markers in chunks for better performance
    const chunkSize = 100
    const chunks = []
    for (let i = 0; i < pointFeatures.length; i += chunkSize) {
      chunks.push(pointFeatures.slice(i, i + chunkSize))
    }

    console.log(`[Map] Split ${pointFeatures.length} markers into ${chunks.length} chunks`)

    let totalMarkers = 0
    let invalidMarkers = 0

    chunks.forEach((chunk, chunkIndex) => {
      setTimeout(() => {
        chunk.forEach((feature) => {
          try {
            const lat = Number.parseFloat(feature.latitude)
            const lng = Number.parseFloat(feature.longitude)
            if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
              console.warn(`[Map] Invalid coordinates for feature ${feature.id}: lat=${lat}, lng=${lng}`)
              invalidMarkers++
              return
            }

            const featureTypeName = (feature.featureType || "Point of Interest")
              .replace(/_/g, " ")
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")

            const iconUrl = getIconUrlForFeatureType(feature.featureType)
            const marker = L.marker([lat, lng], {
              icon: L.icon({
                iconUrl,
                shadowUrl: markerShadowUrl,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
              }),
            })

            // Add popup with feature information (instead of tooltip)
            let propertiesHtml = ''
            if (feature.properties && typeof feature.properties === 'object') {
              const capitalize = (str) =>
                str
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase());

              const entries = Object.entries(feature.properties)
                .filter(([k, v]) =>
                  v !== null &&
                  v !== undefined &&
                  (typeof v !== 'string' || v.trim() !== '') &&
                  k !== 'id' &&
                  k !== 'name'
                )
                .map(([k, v]) => {
                  let value = v;
                  if (k === 'description' && typeof v === 'string' && v.length > 180) {
                    value = v.slice(0, 180) + '...';
                  }
                  return `<li><strong>${capitalize(k)}:</strong> ${value}</li>`;
                });
              if (entries.length > 0) {
                propertiesHtml = `<ul style=\"margin: 0; padding-left: 18px; font-size: 12px;\">${entries.join('')}</ul>`
              }
            }
            const popupContent = `
              <div class=\"marker-tooltip\" style=\"
                background: white;
                padding: 10px 12px;
                border-radius: 6px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.18);
                max-width: 260px;
                min-width: 160px;
              \">
                <h3 style=\"margin: 0 0 6px 0; font-size: 15px; font-weight: bold;\">${feature.name || featureTypeName}</h3>
                <div style=\"margin-bottom: 6px; font-size: 13px;\">
                  <span style=\"color: ${getColorForFeatureType(feature.featureType)}; font-weight: bold;\">${featureTypeName}</span>
                </div>
                ${propertiesHtml}
              </div>
            `
            marker.bindPopup(popupContent, { autoPan: true, closeButton: true, className: 'custom-popup' })

            marker.addTo(map)
            markersRef.current.push(marker)
            totalMarkers++
          } catch (error) {
            console.error(`[Map] Error creating marker for feature ${feature.id}:`, error)
            invalidMarkers++
          }
        })

        console.log(`[Map] Processed chunk ${chunkIndex + 1}/${chunks.length}`)
      }, chunkIndex * 100) // Process each chunk with a delay
    })

    console.log(`[Map] Total markers rendered: ${totalMarkers}`)
    console.log(`[Map] Invalid markers: ${invalidMarkers}`)

    return () => {
      if (markersRef.current) {
        markersRef.current.forEach(marker => marker.remove())
        markersRef.current = []
      }
    }
  }, [pointFeatures])

  // Switch map type based on theme
  useEffect(() => {
    if (!theme) return;
    if (theme === "dark") {
      setMapType && setMapType("dark")
    } else if (theme === "light") {
      setMapType && setMapType("grayscale")
    }
  }, [theme, setMapType])

  // Sync polygon highlight with selectedArea from context
  useEffect(() => {
    if (selectedArea) {
      setSelectedAreaState(selectedArea)
    } else {
      setSelectedAreaState(null)
    }
  }, [selectedArea])

  return <div ref={mapRef} className="h-full w-full" />
}
