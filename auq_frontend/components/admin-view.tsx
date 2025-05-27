"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { BarChart, LineChart, Upload, AlertCircle, Database, Settings, Activity, ArrowLeft, LogOut, ExternalLink, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getCities, getFeatureDefinitions, getCityPointFeatures } from "@/lib/api-service"
import { getIndicatorDefinitions, clearCache } from "@/lib/supabase-client"
import { Loader2 } from "lucide-react"
import apiFileManifest from "../supabase/api-file-manifest.json"
import type { City, IndicatorDefinition, FeatureDefinition, PointFeature } from "@/lib/api-types"
import { useRouter, usePathname } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { createContext, useContext } from 'react'

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

// Custom AdminLink that intercepts navigation outside /admin
function AdminLink({ href, children, ...props }: any) {
  const { showLeaveModal, setShowLeaveModal, setPendingNavigation } = useAdminLeaveModal()
  const router = useRouter()
  const pathname = usePathname()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    const url = typeof href === 'string' ? href : href?.pathname || ''
    if (url !== '/admin' && url !== pathname) {
      e.preventDefault()
      setShowLeaveModal(true)
      setPendingNavigation(url)
    }
  }
  return (
    <Link href={href} {...props} onClick={handleClick}>
      {children}
    </Link>
  )
}

// Context for modal state
const AdminLeaveModalContext = createContext<any>(null)
function useAdminLeaveModal() {
  return useContext(AdminLeaveModalContext)
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
  const [activeTab, setActiveTab] = useState("datasets")
  const { user, logout } = useAuth()
  const [cities, setCities] = useState<City[]>([])
  const [indicatorDefinitions, setIndicatorDefinitions] = useState<IndicatorDefinition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)

  // Feature toggles for Available Features
  const [enabledFeatures, setEnabledFeatures] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('enabledFeatures')
      if (stored) return JSON.parse(stored)
    }
    return { map: true, compare: true, visualize: true }
  })
  const [featureError, setFeatureError] = useState<string | null>(null)

  // Clean URL on mount (remove query params/hash)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (url.pathname === "/admin" && (url.search || url.hash)) {
        router.replace("/admin")
      }
    }
  }, [router])

  // Intercept navigation away from /admin and show modal
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Intercept browser navigation (back/forward)
    const handleRouteChange = (e: PopStateEvent) => {
      const currentPath = window.location.pathname
      if (currentPath !== "/admin") {
        e.preventDefault?.()
        setShowLeaveModal(true)
        setPendingNavigation(currentPath)
        window.history.pushState(null, '', '/admin')
      }
    }
    window.addEventListener('popstate', handleRouteChange)

    // Intercept link clicks inside the admin panel
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a') as HTMLAnchorElement | null
      if (anchor && anchor.href) {
        const url = new URL(anchor.href)
        if (url.pathname !== '/admin' && url.origin === window.location.origin) {
          e.preventDefault()
          setShowLeaveModal(true)
          setPendingNavigation(url.pathname + url.search + url.hash)
        }
      }
    }
    const adminRoot = document.getElementById('admin-root')
    if (adminRoot) {
      adminRoot.addEventListener('click', handleLinkClick)
    }

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      if (adminRoot) {
        adminRoot.removeEventListener('click', handleLinkClick)
      }
    }
  }, [])

  // Wrap router.push and router.replace to intercept navigation
  useEffect(() => {
    const origPush = router.push
    const origReplace = router.replace
    router.push = (url: string, ...args: any[]) => {
      if (url !== '/admin' && url !== pathname) {
        setShowLeaveModal(true)
        setPendingNavigation(url)
        return
      }
      return origPush(url, ...args)
    }
    router.replace = (url: string, ...args: any[]) => {
      if (url !== '/admin' && url !== pathname) {
        setShowLeaveModal(true)
        setPendingNavigation(url)
        return
      }
      return origReplace(url, ...args)
    }
    return () => {
      router.push = origPush
      router.replace = origReplace
    }
  }, [router, pathname])

  // Handler for confirming navigation
  const handleConfirmLeave = () => {
    setShowLeaveModal(false)
    if (pendingNavigation) {
      window.location.href = pendingNavigation
    } else {
      window.location.reload()
    }
  }

  // Handler for canceling navigation
  const handleCancelLeave = () => {
    setShowLeaveModal(false)
    setPendingNavigation(null)
  }

  // Load cities and indicator definitions
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [citiesData, indicatorsData] = await Promise.all([getCities(), getIndicatorDefinitions()])

        setCities(citiesData)
        setIndicatorDefinitions(indicatorsData)
      } catch (error) {
        console.error("Error loading admin data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleLogout = async () => {
    await logout()
  }

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
    <AdminLeaveModalContext.Provider value={{ showLeaveModal, setShowLeaveModal, setPendingNavigation }}>
      <div id="admin-root" className="container mx-auto py-4 md:py-8 px-4 space-y-6">
        {/* Leave confirmation modal */}
        <Dialog open={showLeaveModal} onOpenChange={setShowLeaveModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Leave Admin Panel?</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <p>You are about to leave the admin panel. Any changes will be applied. Are you sure you want to continue?</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelLeave}>Cancel</Button>
              <Button variant="destructive" onClick={handleConfirmLeave}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="flex items-center gap-4 mb-6">
          <AdminLink href="/" className="md:hidden">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </AdminLink>
          <h1 className="text-xl md:text-2xl font-bold">Admin Dashboard</h1>
          <div className="ml-auto flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1">
              {user?.email || "Admin"}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Platform Management
            </CardTitle>
            <CardDescription>Manage datasets, features, and monitor platform performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="datasets" onValueChange={setActiveTab}>

              <TabsList className="modern-tabs">
                <TabsTrigger value="datasets" className="modern-tab">
                  <Database className="h-4 w-4 mr-2" />
                  Datasets
                </TabsTrigger>
                <TabsTrigger value="features" className="modern-tab">
                  <Settings className="h-4 w-4 mr-2" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="analytics" className="modern-tab">
                  <Activity className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="datasets" className="space-y-6 py-6">
                <h3 className="text-lg font-medium text-primary flex items-center gap-2 mb-4">
                  <Upload className="h-5 w-5" />
                  Data Sources Manifest
                </h3>
                <DataSourcesManifestViewer manifest={apiFileManifest} />
              </TabsContent>

              <TabsContent value="features" className="space-y-6 py-6">
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

              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        Daily Active Users
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] flex items-center justify-center">
                        <LineChart className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-primary" />
                        Query Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] flex items-center justify-center">
                        <BarChart className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-primary" />
                      System Logs
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      Live
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg text-xs overflow-auto h-[200px] font-mono">
                      <p className="text-green-500">2025-04-19 10:15:22 INFO: User login successful (admin)</p>
                      <p className="text-red-500">2025-04-19 10:15:22 ERROR: Dataset upload failed - invalid format</p>
                      <p className="text-green-500">
                        2025-04-19 10:15:22 INFO: New dataset uploaded (Barcelona-Demographics-2025)
                      </p>
                      <p className="text-green-500">2025-04-19 10:14:15 INFO: User viewed Barcelona map</p>
                      <p className="text-green-500">
                        2025-04-19 10:13:45 INFO: User compared Eixample and Gràcia districts
                      </p>
                      <p className="text-green-500">2025-04-19 10:12:30 INFO: System startup complete</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>System performance: Good</span>
                  </div>
                  <Button variant="outline">Export Reports</Button>
                </div>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLeaveModalContext.Provider>
  )
}

function DataSourcesManifestViewer({ manifest }: { manifest: any }) {
  return (
    <div className="space-y-6">
      {Object.entries(manifest as any).map(([city, cityData]) => (
        <Card key={city}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="capitalize">{city}</span>
              <Badge variant="outline">{Object.keys(cityData as any).length} sources</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(cityData as any).map(([dataType, dataInfo]) => (
                <div key={dataType} className="border-b pb-4 mb-6">
                  <div className="font-semibold capitalize mb-1">{dataType.replace(/_/g, " ")}</div>
                  {dataType === "indicators" && typeof (dataInfo as any).raw_file === "object" ? (
                    Object.entries((dataInfo as any).raw_file).map(([indicator, value]) => (
                      typeof value === "string" ? (
                        <div key={indicator} className="ml-4 mb-4">
                          <div className="font-medium">{indicator.replace(/_/g, " ")}</div>
                          <div className="flex items-center gap-2 ml-4 text-sm">
                            <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-1">
                              Ver archivo <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div key={indicator} className="ml-4 mb-4 space-y-2">
                          <div className="font-medium">{indicator.replace(/_/g, " ")}</div>
                          {Object.entries(value as any).map(([year, fileInfo]) => (
                            <div key={year} className="flex items-center gap-2 ml-4 text-sm">
                              <Badge variant="secondary">{year}</Badge>
                              <a href={(fileInfo as any).raw_file} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-1">
                                Ver archivo <ExternalLink className="h-3 w-3" />
                              </a>
                              <span className="text-muted-foreground">ID: {(fileInfo as any).resource_id}</span>
                            </div>
                          ))}
                        </div>
                      )
                    ))
                  ) : dataType === "point_features" && typeof (dataInfo as any).raw_file === "object" ? (
                    Object.entries((dataInfo as any).raw_file).map(([featureType, url]) => (
                      <div key={featureType} className="ml-4 flex items-center gap-2 text-sm mb-2">
                        <Badge variant="secondary">{featureType}</Badge>
                        <a href={url as string} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-1">
                          Ver archivo <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="ml-4 flex items-center gap-2 text-sm mb-2">
                      <a href={(dataInfo as any).raw_file} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-1">
                        Ver archivo <ExternalLink className="h-3 w-3" />
                      </a>
                      {(dataInfo as any).resource_id && <span className="text-muted-foreground">ID: {(dataInfo as any).resource_id}</span>}
                    </div>
                  )}
                  {(dataInfo as any).processed_file && (
                    <div className="ml-4 text-xs text-muted-foreground mt-1">
                      Procesado: <span className="font-mono">{(dataInfo as any).processed_file}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
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
    // No need to call loadIndicators here, useEffect will handle it
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
