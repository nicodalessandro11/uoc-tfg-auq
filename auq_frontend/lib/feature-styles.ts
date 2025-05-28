import type { FeatureDefinition } from "./api-types"

// Feature type styles
export const featureTypeStyles = {
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

// Leaflet-color-markers icon URLs
export const markerIconUrls = [
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png',
]

export const markerShadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'

// Helper functions
export const getFeatureTypeName = (definitions: FeatureDefinition[], id: number): string => {
  const definition = definitions.find(def => def.id === id)
  return definition ? definition.name.toLowerCase().replace(/\s+/g, '_') : 'unknown'
}

export const getFeatureStyle = (featureType: string) => {
  return featureTypeStyles[featureType] || {
    color: "#FF4444",
    icon: "📍"
  }
}

// Helper to assign a marker icon URL to each feature type by order of appearance
const featureTypeIconMap: Record<string, string> = {}
let iconIndex = 0
export const getIconUrlForFeatureType = (featureType: string): string => {
  if (!featureTypeIconMap[featureType]) {
    featureTypeIconMap[featureType] = markerIconUrls[iconIndex % markerIconUrls.length]
    iconIndex++
  }
  return featureTypeIconMap[featureType]
} 