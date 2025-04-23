// Function to convert TopoJSON to GeoJSON
export function topoToGeo(topoData: any) {
  if (!topoData || !topoData.objects || !topoData.objects.areas) {
    console.error("Invalid TopoJSON data:", topoData)
    return null
  }

  try {
    // Create a GeoJSON FeatureCollection
    const geoJSON = {
      type: "FeatureCollection",
      features: [],
    }

    // Extract features from TopoJSON
    const geometries = topoData.objects.areas.geometries
    const arcs = topoData.arcs

    // Convert each geometry to a GeoJSON feature
    geometries.forEach((geometry: any) => {
      const arcIndices = geometry.arcs[0]
      const coordinates = [arcs[arcIndices].map((point: any) => [point[0], point[1]])]

      const feature = {
        type: "Feature",
        properties: { ...geometry.properties },
        geometry: {
          type: "Polygon",
          coordinates: coordinates,
        },
      }

      geoJSON.features.push(feature)
    })

    return geoJSON
  } catch (error) {
    console.error("Error converting TopoJSON to GeoJSON:", error)
    return null
  }
}

// Function to generate a color from a palette based on index
export function getColorFromPalette(index: number, total: number) {
  // Define a color palette
  const palette = [
    "#60a5fa", // blue-400
    "#34d399", // emerald-400
    "#a78bfa", // violet-400
    "#f87171", // red-400
    "#fbbf24", // amber-400
    "#38bdf8", // sky-400
    "#fb7185", // rose-400
    "#4ade80", // green-400
    "#c084fc", // purple-400
    "#f472b6", // pink-400
  ]

  // Use modulo to cycle through colors if there are more areas than colors
  return palette[index % palette.length]
}
