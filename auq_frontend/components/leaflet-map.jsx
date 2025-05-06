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
  const { setMapInitialized, loadGeoJSON, setSelectedArea } = useMapContext()
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

  // Add this helper function after the getColorFromPalette function
  const bringMarkersToFront = () => {
    const markersLayer = markersLayerRef.current
    if (!markersLayer || !markersLayer.getLayers || !mapInstanceRef.current || !mapInstanceRef.current.getZoom) {
      console.log("No se pueden traer los marcadores al frente: mapa o capa no inicializados")
      return
    }

    try {
      // For LayerGroups, we need to bring each individual marker to front
      const layers = markersLayer.getLayers()
      layers.forEach((layer) => {
        if (layer.bringToFront) {
          layer.bringToFront()
        }
      })

      // Also bring the entire markers layer to front
      if (markersLayer.bringToFront) {
        markersLayer.bringToFront()
      }

      console.log("Markers brought to front")
    } catch (error) {
      console.warn("Error bringing markers to front:", error)
    }
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

      // Add event to keep markers on top after zoom/pan
      map.on("zoomend moveend", () => {
        bringMarkersToFront()
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
    if (
      !currentGeoJSON ||
      !currentGeoJSON.features ||
      !Array.isArray(currentGeoJSON.features) ||
      currentGeoJSON.features.length === 0
    ) {
      console.log("No valid GeoJSON data to render")
      return
    }

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
      const validFeatures = currentGeoJSON.features.filter((feature) => {
        // First check if feature exists
        if (!feature) {
          console.warn("Feature is undefined or null")
          return false
        }

        // Check if feature has valid properties
        if (!feature.properties) {
          console.warn("Feature missing properties:", feature)
          return false
        }

        // Check if feature has valid geometry or coordinates
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
          if (!feature || !feature.properties) {
            console.warn("Invalid feature or missing properties:", feature)
            return
          }

          layer.on({
            click: (e) => {
              // Stop propagation to prevent the map click handler from firing
              L.DomEvent.stopPropagation(e)

              const areaId = feature.properties.id
              const areaName = feature.properties.name

              if (areaId === undefined || areaName === undefined) {
                console.warn("Feature missing required properties:", feature.properties)
                return
              }

              // Create area object with all necessary properties
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

              console.log("Area selected:", area)
              setSelectedAreaState(area)
              setSelectedArea(area)

              // Update the style of the clicked feature
              const layers = geoJsonLayer._layers
              Object.values(layers).forEach((l) => {
                if (l && l.setStyle) {
                  if (l === layer) {
                    l.setStyle({
                      fillColor: "#3b82f6",
                      weight: 2,
                      opacity: 1,
                      color: "#1d4ed8",
                      fillOpacity: 0.7,
                    })
                  } else {
                    const idx = l.feature?.properties?.index || 0
                    const total = currentGeoJSON?.features ? currentGeoJSON.features.length : 0
                    l.setStyle({
                      fillColor: getColorFromPalette(idx, total),
                      weight: 1,
                      opacity: 1,
                      color: "#60a5fa",
                      fillOpacity: 0.6,
                    })
                  }
                }
              })

              // Use setTimeout to ensure markers are brought to front after the area selection is complete
              setTimeout(() => {
                bringMarkersToFront()
              }, 50)
            },
          })

          // Only bind tooltip if name exists
          if (feature.properties.name) {
            layer.bindTooltip(feature.properties.name)
          }
        },
      })

      // Only add to layer if it was created successfully
      if (geoJson) {
        geoJson.addTo(geoJsonLayer)

        // Add click handler on map background to deselect area
        map.on("click", (e) => {
          // Check if geoJsonLayer exists and has _layers
          if (!geoJsonLayer || !geoJsonLayer._layers) {
            return
          }

          // Check if the click was directly on the map (not on a feature)
          const clickedOnFeature = Object.values(geoJsonLayer._layers).some((layer) => {
            if (layer && layer.contains && layer.contains(e.latlng)) {
              return true
            }
            return false
          })

          // If clicked outside any feature, deselect the area
          if (!clickedOnFeature) {
            setSelectedAreaState(null)
            setSelectedArea(null)

            // Redraw all features with non-selected style
            Object.values(geoJsonLayer._layers).forEach((layer) => {
              if (layer && layer.setStyle && layer.feature) {
                layer.setStyle({
                  fillColor: getColorFromPalette(
                    layer.feature.properties?.index || 0,
                    currentGeoJSON?.features ? currentGeoJSON.features.length : 0,
                  ),
                  weight: 1,
                  opacity: 1,
                  color: "#60a5fa",
                  fillOpacity: 0.6,
                })
              }
            })

            // Ensure markers stay on top
            bringMarkersToFront()
          }
        })
      }
    } catch (geoJsonError) {
      console.error("Error rendering GeoJSON:", geoJsonError)
      setDefaultCityView(map, selectedCity)
    }

    // At the end of the effect, add:
    // Ensure markers stay on top after GeoJSON is updated
    setTimeout(() => {
      bringMarkersToFront()
    }, 300)
  }, [currentGeoJSON, selectedCity, selectedGranularity, setSelectedArea, selectedAreaState, isMapReady])

  // Update markers when point features change
  useEffect(() => {
    const map = mapInstanceRef.current
    const markersLayer = markersLayerRef.current
    if (!map || !markersLayer || !isMapReady || !map.getZoom) {
      console.log("Mapa no inicializado completamente, posponiendo la adición de marcadores")
      return
    }

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

    // Define marker colors based on feature type - MODERN, VIBRANT, WELL-DIFFERENTIATED
    const markerColors = {
      library: "#3b82f6", // Blue (vibrant)
      cultural_center: "#ef4444", // Red (vibrant)
      auditorium: "#f97316", // Orange
      heritage_space: "#10b981", // Emerald
      creation_factory: "#8b5cf6", // Purple
      museum: "#ec4899", // Pink
      cinema: "#6366f1", // Indigo
      exhibition_center: "#14b8a6", // Teal
      archive: "#f59e0b", // Amber
      live_music_venue: "#e11d48", // Rose
      performing_arts_venue: "#06b6d4", // Cyan
      municipal_market: "#84cc16", // Lime
      park_and_garden: "#22c55e", // Green
      educational_center: "#eab308", // Yellow

      // Plural aliases
      libraries: "#3b82f6",
      cultural_centers: "#ef4444",
      auditoriums: "#f97316",
      heritage_spaces: "#10b981",
      creation_factories: "#8b5cf6",
      museums: "#ec4899",
      cinemas: "#6366f1",
      exhibition_centers: "#14b8a6",
      archives: "#f59e0b",
      live_music_venues: "#e11d48",
      performing_arts_venues: "#06b6d4",
      municipal_markets: "#84cc16",
      parks_and_gardens: "#22c55e",
      educational_centers: "#eab308",

      default: "#9ca3af", // Neutral Gray
    }

    // Add numeric IDs to the color map
    Object.entries(featureTypeMap).forEach(([id, type]) => {
      markerColors[id] = markerColors[type] || markerColors.default
    })

    // Debug log all marker colors
    console.log("Marker colors mapping:", markerColors)

    // Add markers
    let markersAdded = 0
    const madridMarkersAdded = 0
    const newRenderedMarkers = {}

    pointFeatures.forEach((feature) => {
      if (feature.latitude && feature.longitude) {
        try {
          // Validación más estricta de coordenadas
          const lat = Number.parseFloat(feature.latitude)
          const lng = Number.parseFloat(feature.longitude)

          // Verificar que las coordenadas son números válidos y están dentro de rangos razonables
          if (
            isNaN(lat) ||
            isNaN(lng) ||
            !isFinite(lat) ||
            !isFinite(lng) ||
            lat < -90 ||
            lat > 90 ||
            lng < -180 ||
            lng > 180
          ) {
            console.warn(`Coordenadas inválidas para el punto ${feature.name}: [${lat}, ${lng}]`)
            return // Saltar este punto
          }

          // Special logging for Madrid features
          const isMadridFeature = selectedCity?.id === 2

          if (isMadridFeature) {
            console.log(`Creating Madrid marker: ${feature.name}, coords: [${lat}, ${lng}]`)
          }

          if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            console.warn(`Invalid coordinates for feature ${feature.name}: [${lat}, ${lng}]`)
            return
          }

          // Determine the feature type with detailed logging
          let featureType = null

          // Try to get feature type from the featureType property
          if (feature.featureType) {
            featureType = feature.featureType
            console.log(`Feature ${feature.name} has explicit featureType: ${featureType}`)
          }
          // Try to get feature type from feature_definition_id
          else if (feature.feature_definition_id) {
            const id = feature.feature_definition_id.toString()
            featureType = featureTypeMap[id] || id
            console.log(`Feature ${feature.name} has feature_definition_id: ${id}, mapped to: ${featureType}`)
          }
          // Default to "default" if no type found
          else {
            featureType = "default"
            console.log(`Feature ${feature.name} has no type information, using default`)
          }

          // Get color for this feature type with logging
          // First try the exact feature type, then try singular/plural variants
          let markerColor = markerColors[featureType]

          // If no color found, try removing trailing 's' if it exists (singular form)
          if (!markerColor && featureType.endsWith("s")) {
            const singularType = featureType.slice(0, -1)
            markerColor = markerColors[singularType]
            console.log(`Trying singular form: ${singularType}, color: ${markerColor || "not found"}`)
          }

          // If still no color, try adding 's' (plural form)
          if (!markerColor && !featureType.endsWith("s")) {
            const pluralType = featureType + "s"
            markerColor = markerColors[pluralType]
            console.log(`Trying plural form: ${pluralType}, color: ${markerColor || "not found"}`)
          }

          // Fall back to default if still no color
          if (!markerColor) {
            markerColor = markerColors.default
          }

          console.log(`Feature ${feature.name} (type: ${featureType}) gets color: ${markerColor}`)

          // Format feature type for display
          const featureTypeName = (featureType || "Point of Interest")
            .replace(/_/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")

          // Create modern tooltip content with proper text wrapping
          const tooltipContent = `
  <div style="width: 200px; white-space: normal; word-wrap: break-word;">
    <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">${feature.name}</div>
    <div style="font-size: 14px; color: #3b82f6; margin-bottom: 8px; font-weight: 500;">${featureTypeName}</div>
    ${Object.entries(feature.properties || {})
              .map(
                ([key, value]) => `
        <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px; display: flex; flex-wrap: wrap;">
          <span style="font-weight: 500; margin-right: 4px;">${key.replace(/_/g, " ").charAt(0).toUpperCase() + key.replace(/_/g, " ").slice(1)}:</span>
          <span style="word-break: break-all;">${value}</span>
        </div>
      `,
              )
              .join("")}
  </div>
`

          // Crear el marcador con un try/catch adicional
          let marker = null
          try {
            marker = L.circleMarker([lat, lng], {
              radius: 8,
              fillColor: markerColor,
              color: "#ffffff",
              weight: 2,
              opacity: 1,
              fillOpacity: 1,
            })
          } catch (markerError) {
            console.error(`Error al crear el marcador para ${feature.name}:`, markerError)
            return // Saltar este punto si hay error al crear el marcador
          }

          // Añadir tooltip solo si el marcador se creó correctamente
          if (marker) {
            try {
              marker.bindTooltip(tooltipContent, {
                direction: "top",
                offset: [0, -8],
                opacity: 1,
                permanent: false,
                interactive: true,
                className: "modern-tooltip",
              })
            } catch (tooltipError) {
              console.warn(`Error al añadir tooltip para ${feature.name}:`, tooltipError)
              // Continuar incluso si el tooltip falla
            }

            // Solo añadir al mapa si todo lo anterior fue exitoso
            try {
              marker.addTo(markersLayer)
              markersAdded++
              newRenderedMarkers[feature.id] = true
            } catch (addError) {
              console.error(`Error al añadir marcador al mapa para ${feature.name}:`, addError)
            }
          }
        } catch (error) {
          console.error(`Error general al procesar el punto ${feature.name}:`, error)
        }
      } else {
        console.warn(`Missing coordinates for feature: ${feature.name}`)
      }
    })

    // Update rendered markers state
    setRenderedMarkers(newRenderedMarkers)

    // Custom tooltip class for modern styling
    if (!document.getElementById("modern-tooltip-styles")) {
      const styleElement = document.createElement("style")
      styleElement.id = "modern-tooltip-styles"
      styleElement.textContent = `
  .leaflet-tooltip {
    white-space: normal !important;
    width: auto !important;
    min-width: 200px !important;
    max-width: 300px !important;
  }
  .modern-tooltip {
    background-color: rgba(255, 255, 255, 0.95) !important;
    border: none !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
    padding: 12px !important;
    font-family: var(--font-manrope), sans-serif !important;
    display: block !important;
    white-space: normal !important;
  }
  .leaflet-tooltip-top:before, 
  .leaflet-tooltip-bottom:before, 
  .leaflet-tooltip-left:before, 
  .leaflet-tooltip-right:before {
    border: none !important;
  }
`
      document.head.appendChild(styleElement)
    }

    // Always ensure markers are on top
    if (markersLayer && geoJsonLayerRef.current) {
      bringMarkersToFront()
    }

    // Force the markers layer to be visible and on top
    if (markersLayer && markersLayer.getLayers) {
      bringMarkersToFront()

      // Also ensure the markers layer is the last one added to the map
      if (map && markersLayer._map) {
        try {
          // Remove and re-add to ensure it's on top
          markersLayer.remove()
          markersLayer.addTo(map)
          bringMarkersToFront()
        } catch (e) {
          console.warn("Error re-adding markers layer:", e)
        }
      }
    }
  }, [pointFeatures, isMapReady, selectedCity])

  // Add this new effect to ensure markers stay on top whenever selectedAreaState changes
  useEffect(() => {
    // When selected area changes, ensure markers stay on top
    if (isMapReady && markersLayerRef.current) {
      // Use setTimeout to ensure this runs after the area selection styling is complete
      setTimeout(() => {
        bringMarkersToFront()
      }, 100)
    }
  }, [selectedAreaState, isMapReady])

  // Add an effect to ensure markers stay on top when granularity changes
  useEffect(() => {
    // When granularity changes, ensure markers stay on top
    if (isMapReady && markersLayerRef.current) {
      // Use setTimeout to ensure this runs after the GeoJSON layer is updated
      setTimeout(() => {
        bringMarkersToFront()
      }, 300)
    }
  }, [selectedGranularity, isMapReady])

  return <div ref={mapRef} className="h-full w-full" />
}
