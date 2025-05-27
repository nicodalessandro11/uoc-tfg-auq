"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Database, Settings, MapPin, EyeOff, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getFeatureDefinitions, getCityPointFeatures } from "@/lib/api-service"
import { getIndicatorDefinitions, clearCache } from "@/lib/supabase-client"
import { Loader2 } from "lucide-react"
import type { IndicatorDefinition, FeatureDefinition, PointFeature } from "@/lib/api-types"
import { useRouter } from "next/navigation"

// Custom hook to sync state with localStorage and listen for changes
function useLocalStorageState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  })

  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === key) {
        setState(e.newValue ? JSON.parse(e.newValue) : defaultValue)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [key, defaultValue])

  const setValue = (value: T) => {
    setState(value)
    localStorage.setItem(key, JSON.stringify(value))
  }

  return [state, setValue]
}

function AvailablePointFeatures() {
  const [featureDefs, setFeatureDefs] = useState<FeatureDefinition[]>([])
  const [barcelonaFeatures, setBarcelonaFeatures] = useState<PointFeature[]>([])
  const [madridFeatures, setMadridFeatures] = useState<PointFeature[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const [defs, bcn, mad] = await Promise.all([
        getFeatureDefinitions(),
        getCityPointFeatures(1), // Barcelona
        getCityPointFeatures(2), // Madrid
      ])
      setFeatureDefs(defs)
      setBarcelonaFeatures(bcn)
      setMadridFeatures(mad)
      setIsLoading(false)
    }
    fetchData()
  }, [])

  function isAvailableInCity(defId: number, features: PointFeature[]) {
    return features.some(f => f.feature_definition_id === defId)
  }

  return (
    <div className="space-y-4 pt-4">
      <h3 className="text-lg font-medium text-primary flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        Available Point Features
      </h3>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Feature</th>
                <th className="text-left py-2 px-4">Description</th>
                <th className="text-center py-2 px-4">Available In</th>
              </tr>
            </thead>
            <tbody>
              {featureDefs.map((def) => (
                <tr key={def.id} className="border-b">
                  <td className="py-2 px-4 font-medium">{def.name}</td>
                  <td className="py-2 px-4 text-sm text-muted-foreground">{def.description}</td>
                  <td className="py-2 px-4 text-center">
                    {isAvailableInCity(def.id, barcelonaFeatures) && (
                      <Badge variant="outline" className="text-xs mr-1">Barcelona</Badge>
                    )}
                    {isAvailableInCity(def.id, madridFeatures) && (
                      <Badge variant="outline" className="text-xs">Madrid</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function AdminView() {
  const { user } = useAuth()
  const router = useRouter()

  // Feature toggles for Available Features
  const [enabledFeatures, setEnabledFeatures] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('enabledFeatures')
      if (stored) return JSON.parse(stored)
    }
    return { map: true, compare: true, visualize: true }
  })
  const [featureError, setFeatureError] = useState<string | null>(null)

  // Handler to prevent disabling all features
  const handleFeatureToggle = (feature: 'map' | 'compare' | 'visualize', value: boolean) => {
    const activeCount = Object.values(enabledFeatures).filter(Boolean).length
    if (!value && activeCount === 1) {
      setFeatureError('At least one feature must be enabled.')
      setTimeout(() => setFeatureError(null), 2000)
      return
    }
    const updated = { ...enabledFeatures, [feature]: value }
    setEnabledFeatures(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('enabledFeatures', JSON.stringify(updated))
      window.dispatchEvent(new Event('enabledFeaturesChanged'))
    }
  }

  return (
    <div id="config-root" className="container mx-auto py-4 md:py-8 px-4 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="md:hidden">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-xl md:text-2xl font-bold">User Settings</h1>
        <div className="ml-auto flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1">
            {user?.email || "User"}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <EyeOff className="h-5 w-5" />
            Map & Insights Settings
          </CardTitle>
          <CardDescription>Hi! Here you can manage your map and insights settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <AvailableIndicators />

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Available Features
              </h3>
              <div className="min-h-[20px] ml-4">
                {featureError && (
                  <span className="text-red-500 text-sm">{featureError}</span>
                )}
              </div>
            </div>
            <div className="modern-card flex items-center justify-between">
              <div>
                <p className="font-medium">Map Visualization</p>
                <p className="text-sm text-muted-foreground">Interactive map with district highlighting</p>
              </div>
              <Switch
                checked={enabledFeatures.map}
                onCheckedChange={v => handleFeatureToggle('map', v)}
              />
            </div>

            <div className="modern-card flex items-center justify-between">
              <div>
                <p className="font-medium">Area Comparison</p>
                <p className="text-sm text-muted-foreground">Compare indicators between two areas</p>
              </div>
              <Switch
                checked={enabledFeatures.compare}
                onCheckedChange={v => handleFeatureToggle('compare', v)}
              />
            </div>

            <div className="modern-card flex items-center justify-between">
              <div>
                <p className="font-medium">Data Visualization</p>
                <p className="text-sm text-muted-foreground">Charts and graphs for data analysis</p>
              </div>
              <Switch
                checked={enabledFeatures.visualize}
                onCheckedChange={v => handleFeatureToggle('visualize', v)}
              />
            </div>

            <div className="modern-card flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Natural Language Query</p>
                  <Badge variant="outline" className="text-xs">
                    Beta
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Feature not implemented yet</p>
              </div>
              <Switch />
            </div>
          </div>

          <AvailablePointFeatures />
        </CardContent>
      </Card>
    </div>
  )
}

function AvailableIndicators() {
  const [indicatorDefinitions, setIndicatorDefinitions] = useState<IndicatorDefinition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [disabledIndicators, setDisabledIndicators] = useLocalStorageState<string[]>(
    'disabledIndicators',
    []
  )
  const [indicatorError, setIndicatorError] = useState<string | null>(null)

  const loadIndicators = async () => {
    setIsLoading(true)
    try {
      const indicators = await getIndicatorDefinitions()
      setIndicatorDefinitions(indicators)
    } catch (error) {
      console.error("Error loading indicators:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Only load indicators once on mount
  useEffect(() => {
    loadIndicators()
  }, [])

  const handleToggleIndicator = (indicatorName: string) => {
    const enabledCount = indicatorDefinitions.length - disabledIndicators.length
    const isDisabling = !disabledIndicators.includes(indicatorName)
    if (isDisabling && enabledCount === 1) {
      setIndicatorError('At least one indicator must be enabled.')
      setTimeout(() => setIndicatorError(null), 2000)
      return
    }
    const newDisabled = disabledIndicators.includes(indicatorName)
      ? disabledIndicators.filter(name => name !== indicatorName)
      : [...disabledIndicators, indicatorName]
    setDisabledIndicators(newDisabled)
    clearCache()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-primary flex items-center gap-2">
          <Database className="h-5 w-5" />
          Available Indicators
        </h3>
        <div className="min-h-[20px] ml-4">
          {indicatorError && (
            <span className="text-red-500 text-sm">{indicatorError}</span>
          )}
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        indicatorDefinitions.map((indicator) => (
          <div key={indicator.id} className="modern-card flex items-center justify-between">
            <div>
              <p className="font-medium">{indicator.name}</p>
              <p className="text-sm text-muted-foreground">{indicator.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {disabledIndicators.includes(indicator.name) && (
                <Badge variant="outline" className="text-xs">Disabled</Badge>
              )}
              <Switch
                checked={!disabledIndicators.includes(indicator.name)}
                onCheckedChange={() => handleToggleIndicator(indicator.name)}
              />
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export { AdminView as ConfigView }
