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

  // Map feature IDs to icons
  const featureIcons = {
    "1": <Book className={`h-4 w-4 ${localVisibleTypes["1"] ? "text-primary" : "text-muted-foreground"}`} />,
    "2": <Building className={`h-4 w-4 ${localVisibleTypes["2"] ? "text-primary" : "text-muted-foreground"}`} />,
    "3": <Music className={`h-4 w-4 ${localVisibleTypes["3"] ? "text-primary" : "text-muted-foreground"}`} />,
    "4": <Landmark className={`h-4 w-4 ${localVisibleTypes["4"] ? "text-primary" : "text-muted-foreground"}`} />,
    "5": <Factory className={`h-4 w-4 ${localVisibleTypes["5"] ? "text-primary" : "text-muted-foreground"}`} />,
    "6": <Museum className={`h-4 w-4 ${localVisibleTypes["6"] ? "text-primary" : "text-muted-foreground"}`} />,
    "7": <Film className={`h-4 w-4 ${localVisibleTypes["7"] ? "text-primary" : "text-muted-foreground"}`} />,
    "8": <ImageIcon className={`h-4 w-4 ${localVisibleTypes["8"] ? "text-primary" : "text-muted-foreground"}`} />,
    "9": <Archive className={`h-4 w-4 ${localVisibleTypes["9"] ? "text-primary" : "text-muted-foreground"}`} />,
    "10": <Mic className={`h-4 w-4 ${localVisibleTypes["10"] ? "text-primary" : "text-muted-foreground"}`} />,
    "11": <Theater className={`h-4 w-4 ${localVisibleTypes["11"] ? "text-primary" : "text-muted-foreground"}`} />,
    "12": <ShoppingBag className={`h-4 w-4 ${localVisibleTypes["12"] ? "text-primary" : "text-muted-foreground"}`} />,
    "13": <Tree className={`h-4 w-4 ${localVisibleTypes["13"] ? "text-primary" : "text-muted-foreground"}`} />,
    "14": <School className={`h-4 w-4 ${localVisibleTypes["14"] ? "text-primary" : "text-muted-foreground"}`} />,
    library: <Book className={`h-4 w-4 ${localVisibleTypes.library ? "text-primary" : "text-muted-foreground"}`} />,
    cultural_center: (
      <Building className={`h-4 w-4 ${localVisibleTypes.cultural_center ? "text-primary" : "text-muted-foreground"}`} />
    ),
    auditorium: (
      <Music className={`h-4 w-4 ${localVisibleTypes.auditorium ? "text-primary" : "text-muted-foreground"}`} />
    ),
    heritage_space: (
      <Landmark className={`h-4 w-4 ${localVisibleTypes.heritage_space ? "text-primary" : "text-muted-foreground"}`} />
    ),
    creation_factory: (
      <Factory className={`h-4 w-4 ${localVisibleTypes.creation_factory ? "text-primary" : "text-muted-foreground"}`} />
    ),
    museum: <Museum className={`h-4 w-4 ${localVisibleTypes.museum ? "text-primary" : "text-muted-foreground"}`} />,
    cinema: <Film className={`h-4 w-4 ${localVisibleTypes.cinema ? "text-primary" : "text-muted-foreground"}`} />,
    exhibition_center: (
      <ImageIcon
        className={`h-4 w-4 ${localVisibleTypes.exhibition_center ? "text-primary" : "text-muted-foreground"}`}
      />
    ),
    archive: <Archive className={`h-4 w-4 ${localVisibleTypes.archive ? "text-primary" : "text-muted-foreground"}`} />,
    live_music_venue: (
      <Mic className={`h-4 w-4 ${localVisibleTypes.live_music_venue ? "text-primary" : "text-muted-foreground"}`} />
    ),
    performing_arts_venue: (
      <Theater
        className={`h-4 w-4 ${localVisibleTypes.performing_arts_venue ? "text-primary" : "text-muted-foreground"}`}
      />
    ),
    municipal_market: (
      <ShoppingBag
        className={`h-4 w-4 ${localVisibleTypes.municipal_market ? "text-primary" : "text-muted-foreground"}`}
      />
    ),
    park_garden: (
      <Tree className={`h-4 w-4 ${localVisibleTypes.park_garden ? "text-primary" : "text-muted-foreground"}`} />
    ),
    educational_center: (
      <School
        className={`h-4 w-4 ${localVisibleTypes.educational_center ? "text-primary" : "text-muted-foreground"}`}
      />
    ),
  }

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
                <div className={`p-1.5 rounded-md ${localVisibleTypes[id] ? "bg-primary/10" : "bg-muted"}`}>
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
