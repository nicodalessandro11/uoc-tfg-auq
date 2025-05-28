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
import type { FeatureDefinition } from "@/lib/api-types"

type VisiblePointTypes = Record<string, boolean>

// Color palette for markers - matching Leaflet marker colors
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

// Map feature names to icons
const featureNameToIcon: Record<string, React.ComponentType> = {
  'library': Book,
  'cultural center': Building,
  'auditorium': Music,
  'heritage space': Landmark,
  'creation factory': Factory,
  'museum': Museum,
  'cinema': Film,
  'exhibition center': ImageIcon,
  'archive': Archive,
  'live music venue': Mic,
  'performing arts venue': Theater,
  'municipal market': ShoppingBag,
  'park garden': Tree,
  'educational center': School,
}

// Helper to get a color for a feature type
const getColorForFeatureType = (() => {
  const colorMap: Record<string, string> = {}
  let colorIndex = 0

  return (featureType: string) => {
    if (!colorMap[featureType]) {
      colorMap[featureType] = markerIconColors[colorIndex % markerIconColors.length]
      colorIndex++
    }
    return colorMap[featureType]
  }
})()

// Helper to format feature labels
const getFeatureLabel = (type: string) =>
  type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())

export function PointFeaturesToggle() {
  const {
    selectedCity,
    visiblePointTypes,
    setVisiblePointTypes,
    dynamicPointTypes
  } = useMapContext()
  const [localVisibleTypes, setLocalVisibleTypes] = useState<Record<string, boolean>>({})
  const [featureDefinitions, setFeatureDefinitions] = useState<FeatureDefinition[]>([])

  // Load feature definitions
  useEffect(() => {
    async function loadFeatureDefinitions() {
      try {
        const defs = await getFeatureDefinitions()
        setFeatureDefinitions(defs)
      } catch (error) {
        console.error("[PointFeaturesToggle] Error loading feature definitions:", error)
      }
    }
    loadFeatureDefinitions()
  }, [])

  // Initialize local state from context
  useEffect(() => {
    setLocalVisibleTypes(visiblePointTypes)
  }, [visiblePointTypes])

  // Handle toggle changes
  const handleToggleChange = useCallback((type: string, checked: boolean) => {
    const newState = { ...localVisibleTypes, [type]: checked }
    setLocalVisibleTypes(newState)
    setVisiblePointTypes(newState)
  }, [localVisibleTypes, setVisiblePointTypes])

  // Reset visibility only when city actually changes
  useEffect(() => {
    if (selectedCity) {
      // Try to load saved state from localStorage
      const savedVisibility = localStorage.getItem(`visiblePointTypes_${selectedCity.id}`)
      if (savedVisibility) {
        try {
          const parsedVisibility = JSON.parse(savedVisibility)
          setLocalVisibleTypes(parsedVisibility)
          setVisiblePointTypes(parsedVisibility)
        } catch (error) {
          console.error("[PointFeaturesToggle] Error parsing saved visibility state:", error)
          // If there's an error, initialize all to false
          const newState = Object.fromEntries(
            dynamicPointTypes.map(type => [type, false])
          )
          setLocalVisibleTypes(newState)
          setVisiblePointTypes(newState)
        }
      } else {
        // If no saved state, initialize all to false
        const newState = Object.fromEntries(
          dynamicPointTypes.map(type => [type, false])
        )
        setLocalVisibleTypes(newState)
        setVisiblePointTypes(newState)
      }
    }
  }, [selectedCity?.id, dynamicPointTypes, setVisiblePointTypes])

  // Get icon for feature type
  const getIconForFeatureType = (type: string) => {
    const definition = featureDefinitions.find(def =>
      def.name.toLowerCase().replace(/\s+/g, '_') === type
    )
    if (definition) {
      return featureNameToIcon[definition.name.toLowerCase()] || Book
    }
    return Book
  }

  if (!dynamicPointTypes.length) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No point features available</p>
      </div>
    )
  }

  return (
    <Card className="p-4">
      {dynamicPointTypes.length > 0 ? (
        <>
          <div className="flex flex-col gap-2">
            {dynamicPointTypes.map((type) => {
              const isVisible = localVisibleTypes[type] ?? false // Default to false
              const color = getColorForFeatureType(type)
              const Icon = getIconForFeatureType(type)

              return (
                <div key={type} className="flex items-center gap-2">
                  <Switch
                    checked={isVisible}
                    onCheckedChange={(checked) => handleToggleChange(type, checked)}
                    style={{
                      '--switch-checked-bg': color,
                      backgroundColor: isVisible ? color : undefined,
                      borderColor: isVisible ? color : undefined,
                    } as React.CSSProperties}
                  />
                  <Icon
                    className={`h-4 w-4 ${isVisible ? "text-primary" : "text-muted-foreground"}`}
                    style={{ color: isVisible ? color : undefined }}
                  />
                  <span className="capitalize text-xs">{getFeatureLabel(type)}</span>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {selectedCity
            ? "No points available for this city/level"
            : "Select a city to see available points"}
        </div>
      )}
    </Card>
  )
}
