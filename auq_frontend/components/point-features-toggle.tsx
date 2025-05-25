"use client"

import { useEffect, useState, useCallback } from "react"
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
import { Button } from "@/components/ui/button"

// Paleta de colores igual que en leaflet-map.jsx
const markerIconColors = [
  '#2A81CB', // blue
  '#D41159', // red
  '#3CB44B', // green
  '#FF8800', // orange
  '#FFD700', // yellow
  '#911EB4', // violet
  '#808080', // grey
  '#000000', // black
]
// Mapeo de tipo a color por orden de aparición
const featureTypeColorMap: Record<string, string> = {}
let colorIndex = 0
const getColorForFeatureType = (featureType: string) => {
  if (!featureTypeColorMap[featureType]) {
    featureTypeColorMap[featureType] = markerIconColors[colorIndex % markerIconColors.length]
    colorIndex++
  }
  return featureTypeColorMap[featureType]
}

// Helper para mostrar nombres bonitos
const getFeatureLabel = (type: string) =>
  type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())

export function PointFeaturesToggle() {
  const { visiblePointTypes, setVisiblePointTypes, dynamicPointTypes } = useMapContext()
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

  // Optimizado: handler memoizado
  const handleToggle = useCallback((type: string) => {
    setVisiblePointTypes(prev => {
      const newState = { ...prev }
      if (!(type in newState)) {
        newState[type] = true
      }
      newState[type] = !newState[type]
      return newState
    })
  }, [setVisiblePointTypes])

  // Button for toggling all types
  const allOn = dynamicPointTypes.every(type => visiblePointTypes[type])
  const handleToggleAll = () => {
    setVisiblePointTypes(prev => {
      const newState = { ...prev }
      dynamicPointTypes.forEach(type => {
        newState[type] = !allOn
      })
      return newState
    })
  }

  // Map feature IDs to icons
  const featureIcons = {
    "1": <Book className={`h-4 w-4 ${visiblePointTypes["1"] ? "text-primary" : "text-muted-foreground"}`} />,
    "2": <Building className={`h-4 w-4 ${visiblePointTypes["2"] ? "text-primary" : "text-muted-foreground"}`} />,
    "3": <Music className={`h-4 w-4 ${visiblePointTypes["3"] ? "text-primary" : "text-muted-foreground"}`} />,
    "4": <Landmark className={`h-4 w-4 ${visiblePointTypes["4"] ? "text-primary" : "text-muted-foreground"}`} />,
    "5": <Factory className={`h-4 w-4 ${visiblePointTypes["5"] ? "text-primary" : "text-muted-foreground"}`} />,
    "6": <Museum className={`h-4 w-4 ${visiblePointTypes["6"] ? "text-primary" : "text-muted-foreground"}`} />,
    "7": <Film className={`h-4 w-4 ${visiblePointTypes["7"] ? "text-primary" : "text-muted-foreground"}`} />,
    "8": <ImageIcon className={`h-4 w-4 ${visiblePointTypes["8"] ? "text-primary" : "text-muted-foreground"}`} />,
    "9": <Archive className={`h-4 w-4 ${visiblePointTypes["9"] ? "text-primary" : "text-muted-foreground"}`} />,
    "10": <Mic className={`h-4 w-4 ${visiblePointTypes["10"] ? "text-primary" : "text-muted-foreground"}`} />,
    "11": <Theater className={`h-4 w-4 ${visiblePointTypes["11"] ? "text-primary" : "text-muted-foreground"}`} />,
    "12": <ShoppingBag className={`h-4 w-4 ${visiblePointTypes["12"] ? "text-primary" : "text-muted-foreground"}`} />,
    "13": <Tree className={`h-4 w-4 ${visiblePointTypes["13"] ? "text-primary" : "text-muted-foreground"}`} />,
    "14": <School className={`h-4 w-4 ${visiblePointTypes["14"] ? "text-primary" : "text-muted-foreground"}`} />,
    library: <Book className={`h-4 w-4 ${visiblePointTypes.library ? "text-primary" : "text-muted-foreground"}`} />,
    cultural_center: (
      <Building className={`h-4 w-4 ${visiblePointTypes.cultural_center ? "text-primary" : "text-muted-foreground"}`} />
    ),
    auditorium: (
      <Music className={`h-4 w-4 ${visiblePointTypes.auditorium ? "text-primary" : "text-muted-foreground"}`} />
    ),
    heritage_space: (
      <Landmark className={`h-4 w-4 ${visiblePointTypes.heritage_space ? "text-primary" : "text-muted-foreground"}`} />
    ),
    creation_factory: (
      <Factory className={`h-4 w-4 ${visiblePointTypes.creation_factory ? "text-primary" : "text-muted-foreground"}`} />
    ),
    museum: <Museum className={`h-4 w-4 ${visiblePointTypes.museum ? "text-primary" : "text-muted-foreground"}`} />,
    cinema: <Film className={`h-4 w-4 ${visiblePointTypes.cinema ? "text-primary" : "text-muted-foreground"}`} />,
    exhibition_center: (
      <ImageIcon
        className={`h-4 w-4 ${visiblePointTypes.exhibition_center ? "text-primary" : "text-muted-foreground"}`}
      />
    ),
    archive: <Archive className={`h-4 w-4 ${visiblePointTypes.archive ? "text-primary" : "text-muted-foreground"}`} />,
    live_music_venue: (
      <Mic className={`h-4 w-4 ${visiblePointTypes.live_music_venue ? "text-primary" : "text-muted-foreground"}`} />
    ),
    performing_arts_venue: (
      <Theater
        className={`h-4 w-4 ${visiblePointTypes.performing_arts_venue ? "text-primary" : "text-muted-foreground"}`}
      />
    ),
    municipal_market: (
      <ShoppingBag
        className={`h-4 w-4 ${visiblePointTypes.municipal_market ? "text-primary" : "text-muted-foreground"}`}
      />
    ),
    park_garden: (
      <Tree className={`h-4 w-4 ${visiblePointTypes.park_garden ? "text-primary" : "text-muted-foreground"}`} />
    ),
    educational_center: (
      <School
        className={`h-4 w-4 ${visiblePointTypes.educational_center ? "text-primary" : "text-muted-foreground"}`}
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
      <div className="flex justify-end items-center gap-2 my-2">
        <Button
          variant={allOn ? "default" : "outline"}
          className="h-8 px-4 text-xs font-semibold"
          onClick={handleToggleAll}
        >
          {allOn ? "Hide all" : "Show all"}
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {dynamicPointTypes.map((type) => {
          const isVisible = visiblePointTypes[type] ?? true
          const color = getColorForFeatureType(type)
          return (
            <div key={type} className="flex items-center gap-2">
              <Switch
                checked={isVisible}
                onCheckedChange={() => handleToggle(type)}
                style={{
                  '--switch-checked-bg': isVisible ? color : undefined,
                  backgroundColor: isVisible ? color : undefined,
                  borderColor: isVisible ? color : undefined,
                } as React.CSSProperties}
              />
              <span className="capitalize text-xs">{getFeatureLabel(type)}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
