"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { useMapContext } from "@/contexts/map-context"
import { FilterPanel } from "@/components/filter-panel"
import { DistrictInfo } from "@/components/district-info"
import { PointFeaturesToggle } from "@/components/point-features-toggle"
import { ChatSidebar } from "@/components/chat-sidebar"
import { Filter, Info, MapPin, ChevronLeft, ChevronRight, Bot } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

// Dynamically import the map component to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <p>Loading map...</p>
    </div>
  ),
})

export function MapView() {
  const { selectedCity, selectedArea, setVisiblePointTypes, visiblePointTypes, triggerRefresh, selectedGranularity, availableAreas, setSelectedArea } =
    useMapContext()
  const [activeTab, setActiveTab] = useState("points")
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(true) // Hidden by default
  const mapContainerRef = useRef(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Handle responsive sidebar
  const [isMobile, setIsMobile] = useState(false)

  // Set initial tab from URL on mount
  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam && ["points", "filters", "info"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // Auto-select area from URL param if present and level matches
  useEffect(() => {
    const areaParam = searchParams.get("area")
    const levelParam = searchParams.get("level")
    if (
      areaParam &&
      levelParam === selectedGranularity?.level &&
      availableAreas &&
      availableAreas.length > 0
    ) {
      const area = availableAreas.find(a => a.id.toString() === areaParam)
      if (area) {
        setSelectedArea(area)
      }
    }
  }, [searchParams, availableAreas, setSelectedArea, selectedGranularity])

  // Reset selected area and remove area param when granularity changes
  useEffect(() => {
    setSelectedArea(null)
    // Remove area param from URL
    const params = new URLSearchParams(window.location.search)
    params.delete("area")
    router.push(`?${params.toString()}`, { scroll: false })
  }, [selectedGranularity])

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set("tab", activeTab)
    router.push(`?${params.toString()}`, { scroll: false })
  }, [activeTab, router])

  // Memoize the setVisiblePointTypes handler to prevent unnecessary re-renders
  const handleVisiblePointTypesChange = useCallback(
    (types: Record<string, boolean>) => {
      // Only update if the values actually changed
      const hasChanged = Object.keys(types).some((key) => types[key] !== visiblePointTypes[key])
      if (hasChanged) {
        setVisiblePointTypes(types)
      }
    },
    [setVisiblePointTypes, visiblePointTypes],
  )

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setLeftSidebarCollapsed(true)
        setRightSidebarCollapsed(true)
      }
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Force map to update when sidebar state changes
  useEffect(() => {
    // Small delay to ensure DOM has updated
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"))
      triggerRefresh() // Force the map to refresh
    }, 300)
    return () => clearTimeout(timer)
  }, [leftSidebarCollapsed, rightSidebarCollapsed, triggerRefresh])

  // Toggle right sidebar and handle left sidebar state
  const toggleRightSidebar = () => {
    const newRightSidebarState = !rightSidebarCollapsed
    setRightSidebarCollapsed(newRightSidebarState)

    // If opening the right sidebar, automatically collapse the left sidebar
    if (!newRightSidebarState) {
      setLeftSidebarCollapsed(true)
    } else {
      // If closing the right sidebar, automatically open the left sidebar
      setLeftSidebarCollapsed(false)
    }

    // Force a refresh after sidebar state changes
    setTimeout(() => {
      triggerRefresh()
    }, 300)
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex w-full" ref={mapContainerRef}>
      {/* Left Sidebar container - fixed width when visible, 0 when collapsed */}
      <div
        className="h-full transition-all duration-300 flex-shrink-0"
        style={{
          width: leftSidebarCollapsed ? 0 : "350px",
          overflow: "hidden",
        }}
      >
        {/* Left Sidebar content */}
        <div className="h-full w-[350px] bg-background border-r">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold tracking-tight">{selectedCity ? selectedCity.name : "Select city"}</h2>
              <p className="text-sm text-muted-foreground mt-1">Walk the city through data</p>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="p-4">
                <div className="modern-tabs flex mb-6">
                  <button
                    className={`flex-1 modern-tab ${activeTab === "points" ? "modern-tab-active" : "modern-tab-inactive"}`}
                    onClick={() => setActiveTab("points")}
                  >
                    <MapPin className="h-4 w-4 mr-2 inline-block" />
                    Points
                  </button>
                  <button
                    className={`flex-1 modern-tab ${activeTab === "filters" ? "modern-tab-active" : "modern-tab-inactive"}`}
                    onClick={() => setActiveTab("filters")}
                  >
                    <Filter className="h-4 w-4 mr-2 inline-block" />
                    Filters
                  </button>
                  <button
                    className={`flex-1 modern-tab ${activeTab === "info" ? "modern-tab-active" : "modern-tab-inactive"}`}
                    onClick={() => setActiveTab("info")}
                  >
                    <Info className="h-4 w-4 mr-2 inline-block" />
                    Info
                  </button>
                </div>

                {activeTab === "points" && (
                  <div>
                    <h3 className="section-title flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Points of Interest
                    </h3>
                    <p className="caption mb-4">Customize what is displayed on the map</p>
                    <PointFeaturesToggle />
                  </div>
                )}

                {activeTab === "filters" && (
                  <div>
                    <h3 className="section-title flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter Areas
                    </h3>
                    <p className="caption mb-4">
                      Adjust filters to explore data from {selectedCity?.name || "the selected city"}
                    </p>
                    <FilterPanel />
                  </div>
                )}

                {activeTab === "info" && (
                  <div>
                    {selectedArea && "cityId" in selectedArea && "avgIncome" in selectedArea ? (
                      <DistrictInfo area={selectedArea as { id: number; name: string; cityId: number; population: number; avgIncome: number; districtId?: number }} />
                    ) : (
                      <div className="text-center py-8 flex flex-col items-center gap-4">
                        <div className="bg-muted rounded-full p-4">
                          <MapPin className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">Select an area on the map to view details</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Left Sidebar toggle button */}
      <button
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-[1000] bg-primary hover:bg-blue-600 text-white rounded-r-lg p-1 shadow-lg border-1 border-white"
        onClick={() => {
          setLeftSidebarCollapsed(!leftSidebarCollapsed)
          setTimeout(() => triggerRefresh(), 300)
        }}
        style={{ left: leftSidebarCollapsed ? "0" : isMobile ? "calc(100% - 30px)" : "350px" }}
      >
        {leftSidebarCollapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
      </button>

      {/* Map area - takes full width when sidebars are collapsed */}
      <div className="flex-1 h-full relative">
        <MapComponent />
      </div>

      {/* Right Sidebar container - fixed width when visible, 0 when collapsed */}
      <div
        className="h-full transition-all duration-300 flex-shrink-0"
        style={{
          width: rightSidebarCollapsed ? 0 : "350px",
          overflow: "hidden",
        }}
      >
        {/* Right Sidebar content */}
        <div className="h-full w-[350px]">
          <ChatSidebar />
        </div>
      </div>

      {/* Right Sidebar toggle button */}
      <button
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-[1000] bg-primary hover:bg-blue-600 text-white rounded-l-lg p-3 shadow-lg border-2 border-white"
        onClick={toggleRightSidebar}
        style={{ right: rightSidebarCollapsed ? "0" : "350px" }}
      >
        {rightSidebarCollapsed ? <Bot className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
      </button>
    </div>
  )
}
