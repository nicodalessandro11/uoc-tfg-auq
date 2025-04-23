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
  ImageIcon as Image,
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

// Update the PointFeatureType to include all feature types from the table
type PointFeatureType =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "library"
  | "cultural_center"
  | "auditorium"
  | "heritage_space"
  | "creation_factory"
  | "museum"
  | "cinema"
  | "exhibition_center"
  | "archive"
  | "live_music_venue"
  | "performing_arts_venue"
  | "municipal_market"
  | "park_garden"
  | "educational_center"

type PointFeaturesToggleProps = {
  onToggle: (types: Record<PointFeatureType, boolean>) => void
}

export function PointFeaturesToggle({ onToggle }: PointFeaturesToggleProps) {
  const { visiblePointTypes } = useMapContext()
  const [localVisibleTypes, setLocalVisibleTypes] = useState<Record<PointFeatureType, boolean>>(visiblePointTypes)
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

  const handleToggle = (type: PointFeatureType) => {
    const newVisibleTypes = {
      ...localVisibleTypes,
      [type]: !localVisibleTypes[type],
    }
    setLocalVisibleTypes(newVisibleTypes)

    // Only call onToggle if the value actually changed
    if (localVisibleTypes[type] !== newVisibleTypes[type]) {
      onToggle(newVisibleTypes)
    }
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
    "8": <Image className={`h-4 w-4 ${localVisibleTypes["8"] ? "text-primary" : "text-muted-foreground"}`} />,
    "9": <Archive className={`h-4 w-4 ${localVisibleTypes["9"] ? "text-primary" : "text-muted-foreground"}`} />,
    "10": <Mic className={`h-4 w-4 ${localVisibleTypes["10"] ? "text-primary" : "text-muted-foreground"}`} />,
    "11": <Theater className={`h-4 w-4 ${localVisibleTypes["11"] ? "text-primary" : "text-muted-foreground"}`} />,
    "12": <ShoppingBag className={`h-4 w-4 ${localVisibleTypes["12"] ? "text-primary" : "text-muted-foreground"}`} />,
    "13": <Tree className={`h-4 w-4 ${localVisibleTypes["13"] ? "text-primary" : "text-muted-foreground"}`} />,
    "14": <School className={`h-4 w-4 ${localVisibleTypes["14"] ? "text-primary" : "text-muted-foreground"}`} />,
    // Legacy mappings for backward compatibility
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
      <Image className={`h-4 w-4 ${localVisibleTypes.exhibition_center ? "text-primary" : "text-muted-foreground"}`} />
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

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 gap-4">
        {/* Render numeric feature types first */}
        {featureDefinitions.map((definition) => {
          const id = definition.id.toString()
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
              <Switch
                id={`toggle-${id}`}
                checked={!!localVisibleTypes[id]}
                onCheckedChange={() => handleToggle(id as PointFeatureType)}
              />
            </div>
          )
        })}

        {/* Render legacy feature types (if any) */}
        {Object.entries(localVisibleTypes)
          .filter(([type]) => isNaN(Number(type)) && type !== "undefined")
          .map(([type, isVisible]) => (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${isVisible ? "bg-primary/10" : "bg-muted"}`}>
                  {featureIcons[type as PointFeatureType] || <Landmark className="h-4 w-4" />}
                </div>
                <Label htmlFor={`toggle-${type}`} className="text-sm cursor-pointer">
                  {getFeatureName(type)}
                </Label>
              </div>
              <Switch
                id={`toggle-${type}`}
                checked={isVisible}
                onCheckedChange={() => handleToggle(type as PointFeatureType)}
              />
            </div>
          ))}
      </div>
    </Card>
  )
}
