"use client"

import { useEffect, useState } from "react"
import {
  Book,
  Building,
  Music,
  Landmark,
  Factory,
  LibraryIcon as Museum,
  Film,
  ImageIcon,
  Archive,
  Mic,
  Theater,
  ShoppingBag,
  TreesIcon as Tree,
  School,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useMapContext } from "@/contexts/map-context"
import { getFeatureDefinitions } from "@/lib/api-service"

// Feature type mapping - consistent with database seed
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

// Reverse mapping for lookups
const reverseFeatureTypeMap = Object.entries(featureTypeMap).reduce(
  (acc, [id, name]) => {
    acc[name] = id
    return acc
  },
  {} as Record<string, string>,
)

// Define marker colors based on feature type - MODERN, VIBRANT, WELL-DIFFERENTIATED
const markerColors = {
  library: "#3b82f6",             // Blue (vibrant)
  cultural_center: "#ef4444",     // Red (vibrant)
  auditorium: "#f97316",          // Orange
  heritage_space: "#10b981",      // Emerald
  creation_factory: "#8b5cf6",    // Purple
  museum: "#ec4899",              // Pink
  cinema: "#6366f1",              // Indigo
  exhibition_center: "#14b8a6",   // Teal
  archive: "#f59e0b",             // Amber
  live_music_venue: "#e11d48",    // Rose
  performing_arts_venue: "#06b6d4", // Cyan
  municipal_market: "#84cc16",    // Lime
  park_garden: "#22c55e",         // Green
  educational_center: "#eab308",  // Yellow

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
  park_gardens: "#22c55e",
  educational_centers: "#eab308",

  default: "#9ca3af", // Neutral Gray
}


// Add numeric IDs to the color map
Object.entries(featureTypeMap).forEach(([id, type]) => {
  markerColors[id] = markerColors[type] || markerColors.default
})

type PointFeaturesToggleProps = {
  onToggle: (types: Record<string, boolean>) => void
}

export function PointFeaturesToggle({ onToggle }: PointFeaturesToggleProps) {
  const { visiblePointTypes, triggerRefresh } = useMapContext()
  const [localVisibleTypes, setLocalVisibleTypes] = useState<Record<string, boolean>>(visiblePointTypes)
  const [featureDefinitions, setFeatureDefinitions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch feature definitions
  useEffect(() => {
    async function loadFeatureDefinitions() {
      try {
        const definitions = await getFeatureDefinitions()
        setFeatureDefinitions(definitions)
      } catch (error) {
        console.error("Error loading feature definitions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFeatureDefinitions()
  }, [])

  // Update local state when context changes, but only when the reference changes
  useEffect(() => {
    setLocalVisibleTypes(visiblePointTypes)
  }, [visiblePointTypes])

  // Improve the toggle handler to ensure changes are properly propagated
  const handleToggle = (type: string) => {
    // Create a new copy of the visible types
    const newVisibleTypes = { ...localVisibleTypes }

    // Toggle the selected type
    newVisibleTypes[type] = !localVisibleTypes[type]

    // If this is a string type, also toggle the corresponding numeric ID
    if (isNaN(Number(type))) {
      const numericId = reverseFeatureTypeMap[type]
      if (numericId) {
        newVisibleTypes[numericId] = newVisibleTypes[type]
        console.log(`Toggling numeric ID ${numericId} to ${newVisibleTypes[numericId]}`)
      }
    }
    // If this is a numeric ID, also toggle the corresponding string type
    else {
      const stringType = featureTypeMap[type]
      if (stringType) {
        newVisibleTypes[stringType] = newVisibleTypes[type]
        console.log(`Toggling string type ${stringType} to ${newVisibleTypes[stringType]}`)
      }
    }

    console.log(`Toggle ${type} to ${newVisibleTypes[type]}`)

    // Update local state
    setLocalVisibleTypes(newVisibleTypes)

    // Notify parent component with the complete updated state
    onToggle(newVisibleTypes)

    // No need for triggerRefresh here - removed the setTimeout call
  }

  // Map feature IDs to icons with matching colors
  const featureIcons = {}

  // Helper function to get the color for a feature type
  const getFeatureColor = (type) => {
    return markerColors[type] || markerColors.default
  }

  // Generate icons for all feature types
  Object.entries(featureTypeMap).forEach(([id, type]) => {
    const color = getFeatureColor(id)

    // Numeric ID icons
    featureIcons[id] = (
      <div
        className={`h-4 w-4 ${localVisibleTypes[id] ? "" : "opacity-50"}`}
        style={{ color: localVisibleTypes[id] ? color : "var(--muted-foreground)" }}
      >
        {(() => {
          switch (type) {
            case "library":
              return <Book className="h-4 w-4" />
            case "cultural_center":
              return <Building className="h-4 w-4" />
            case "auditorium":
              return <Music className="h-4 w-4" />
            case "heritage_space":
              return <Landmark className="h-4 w-4" />
            case "creation_factory":
              return <Factory className="h-4 w-4" />
            case "museum":
              return <Museum className="h-4 w-4" />
            case "cinema":
              return <Film className="h-4 w-4" />
            case "exhibition_center":
              return <ImageIcon className="h-4 w-4" />
            case "archive":
              return <Archive className="h-4 w-4" />
            case "live_music_venue":
              return <Mic className="h-4 w-4" />
            case "performing_arts_venue":
              return <Theater className="h-4 w-4" />
            case "municipal_market":
              return <ShoppingBag className="h-4 w-4" />
            case "park_garden":
              return <Tree className="h-4 w-4" />
            case "educational_center":
              return <School className="h-4 w-4" />
            default:
              return <Landmark className="h-4 w-4" />
          }
        })()}
      </div>
    )

    // String type icons
    featureIcons[type] = (
      <div
        className={`h-4 w-4 ${localVisibleTypes[type] ? "" : "opacity-50"}`}
        style={{ color: localVisibleTypes[type] ? color : "var(--muted-foreground)" }}
      >
        {(() => {
          switch (type) {
            case "library":
              return <Book className="h-4 w-4" />
            case "cultural_center":
              return <Building className="h-4 w-4" />
            case "auditorium":
              return <Music className="h-4 w-4" />
            case "heritage_space":
              return <Landmark className="h-4 w-4" />
            case "creation_factory":
              return <Factory className="h-4 w-4" />
            case "museum":
              return <Museum className="h-4 w-4" />
            case "cinema":
              return <Film className="h-4 w-4" />
            case "exhibition_center":
              return <ImageIcon className="h-4 w-4" />
            case "archive":
              return <Archive className="h-4 w-4" />
            case "live_music_venue":
              return <Mic className="h-4 w-4" />
            case "performing_arts_venue":
              return <Theater className="h-4 w-4" />
            case "municipal_market":
              return <ShoppingBag className="h-4 w-4" />
            case "park_garden":
              return <Tree className="h-4 w-4" />
            case "educational_center":
              return <School className="h-4 w-4" />
            default:
              return <Landmark className="h-4 w-4" />
          }
        })()}
      </div>
    )
  })

  // Get feature name from ID
  const getFeatureName = (id: string) => {
    // Try to find the feature definition by ID
    const definition = featureDefinitions.find((def) => def.id.toString() === id)
    if (definition) {
      return definition.name
    }

    // If not found, format the string ID (for backward compatibility)
    return id
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="text-center py-4">Loading feature types...</div>
      </Card>
    )
  }

  // Create a map to track which feature types we've already rendered
  // to avoid duplicates between numeric IDs and string names
  const renderedFeatures = new Set<string>()

  return (
    <Card className="p-4">
      <p className="caption mb-4">Customize what is displayed on the map</p>
      <p className="text-xs text-muted-foreground mb-4">The icons below are also used as markers on the map</p>
      <div className="grid grid-cols-1 gap-4">
        {/* Render feature types from the database definitions */}
        {featureDefinitions.map((definition) => {
          const id = definition.id.toString()
          const stringType = featureTypeMap[id]

          // Skip if we've already rendered this feature type
          if (renderedFeatures.has(id) || (stringType && renderedFeatures.has(stringType))) {
            return null
          }

          // Mark this feature as rendered
          renderedFeatures.add(id)
          if (stringType) renderedFeatures.add(stringType)

          return (
            <div key={id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-md ${localVisibleTypes[id] ? "bg-opacity-20" : "bg-muted"}`}
                  style={{ backgroundColor: localVisibleTypes[id] ? `${getFeatureColor(id)}20` : undefined }}
                >
                  {featureIcons[id] || <Landmark className="h-4 w-4" />}
                </div>
                <Label htmlFor={`toggle-${id}`} className="text-sm cursor-pointer">
                  {definition.name}
                </Label>
              </div>
              <Switch id={`toggle-${id}`} checked={!!localVisibleTypes[id]} onCheckedChange={() => handleToggle(id)} />
            </div>
          )
        })}
      </div>
    </Card>
  )
}
