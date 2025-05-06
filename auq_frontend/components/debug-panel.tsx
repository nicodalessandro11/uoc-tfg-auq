"use client"

import { useState, useContext } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { X, Bug, Trash2, RefreshCw } from "lucide-react"
import { MapContext } from "@/contexts/map-context"
import { clearCache as clearSupabaseCache } from "@/lib/supabase-client"
import { clearApiCache } from "@/lib/api-service"

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [debugMode, setDebugMode] = useState(false)

  // Always call the MapContext hook
  const mapContext = useContext(MapContext)

  const handleClearPointFeaturesCache = () => {
    if (!mapContext) {
      console.log("Map context not available")
      return
    }

    const { clearPointFeaturesCache, triggerRefresh, selectedCity } = mapContext

    if (selectedCity) {
      clearPointFeaturesCache(selectedCity.id)
      console.log(`Cleared point features cache for ${selectedCity.name}`)
    } else {
      clearPointFeaturesCache()
      console.log("Cleared all point features cache")
    }
    triggerRefresh()
  }

  const handleClearAllCaches = () => {
    clearApiCache()
    clearSupabaseCache()
    console.log("Cleared all caches")

    if (mapContext?.triggerRefresh) {
      mapContext.triggerRefresh()
    }
  }

  const toggleDebugMode = () => {
    const newMode = !debugMode
    setDebugMode(newMode)
    // Set a global flag for debug mode
    window.DEBUG_MODE = newMode
    console.log(`Debug mode ${newMode ? "enabled" : "disabled"}`)
  }

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-4 left-4 z-50 bg-primary text-primary-foreground"
        onClick={() => setIsOpen(true)}
        size="sm"
      >
        <Bug className="h-4 w-4 mr-2" />
        Debug
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-80 shadow-lg">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Bug className="h-4 w-4 text-primary" />
          Debug Panel
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="debug-mode" className="cursor-pointer">
            Enable Verbose Logging
          </Label>
          <Switch id="debug-mode" checked={debugMode} onCheckedChange={toggleDebugMode} />
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleClearPointFeaturesCache}
            disabled={!mapContext}
          >
            <Trash2 className="h-4 w-4" />
            Clear Point Features Cache
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-2 mt-2"
            onClick={() => {
              if (mapContext?.selectedCity?.id === 2) {
                console.group("🔍 Madrid Points Debug")

                // Get the current state
                const city = mapContext.selectedCity
                const visibleTypes = mapContext.visiblePointTypes

                console.log("Current city:", city?.name)
                console.log("Visible point types:", visibleTypes)

                // Force a refresh
                mapContext.clearPointFeaturesCache(2)
                mapContext.triggerRefresh()

                console.log("Cache cleared and refresh triggered")
                console.groupEnd()

                alert("Madrid points debug info has been logged to the console. Press F12 to view.")
              } else {
                alert("Please select Madrid first to debug Madrid points.")
              }
            }}
          >
            <Bug className="h-4 w-4" />
            Debug Madrid Points
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleClearAllCaches}
          >
            <Trash2 className="h-4 w-4" />
            Clear All Caches
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => mapContext?.triggerRefresh?.()}
            disabled={!mapContext}
          >
            <RefreshCw className="h-4 w-4" />
            Force Refresh
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Current city: {mapContext?.selectedCity ? mapContext.selectedCity.name : "None"}</p>
          <p>Debug mode: {debugMode ? "Enabled" : "Disabled"}</p>
          <p>Map context: {mapContext ? "Available" : "Not available"}</p>
        </div>
      </CardContent>
    </Card>
  )
}
