"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { useMapContext } from "@/contexts/map-context"
import { FilterPanel } from "@/components/filter-panel"
import { DistrictInfo } from "@/components/district-info"
import { PointFeaturesToggle } from "@/components/point-features-toggle"
import { ChatSidebar } from "@/components/chat-sidebar"
import { Filter, Info, MapPin, ChevronLeft, ChevronRight, Bot } from "lucide-react"

// Dynamically import the map component to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <p>Loading map...</p>
    </div>
  ),
})

// Add type for the area interface
interface AreaWithDetails {
  id: number;
  name: string;
  cityId: number;
  population: number;
  avgIncome: number;
  districtId?: number;
}

// Helper function to convert Area to AreaWithDetails
function convertAreaToDetails(area: any): AreaWithDetails {
  return {
    id: area.id,
    name: area.name,
    cityId: area.city_id || area.cityId,
    population: area.population || 0,
    avgIncome: area.avg_income || area.avgIncome || 0,
    districtId: area.district_id || area.districtId,
  };
}

export function MapView() {
  const { selectedCity, selectedArea, setVisiblePointTypes, visiblePointTypes, triggerRefresh, selectedGranularity } =
    useMapContext()
  const [activeTab, setActiveTab] = useState("points");
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(true);
  const mapContainerRef = useRef(null)

  // Handle responsive sidebar
  const [isMobile, setIsMobile] = useState(false)

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

  // Handle tab change with persistence
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      localStorage.setItem("activeTab", tab);
    }
  }, []);

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

  // Restore from localStorage after mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTab = localStorage.getItem("activeTab");
      if (savedTab && ["points", "filters", "info"].includes(savedTab)) {
        setActiveTab(savedTab);
      }
      const savedLeft = localStorage.getItem("leftSidebarCollapsed");
      if (savedLeft !== null) setLeftSidebarCollapsed(savedLeft === "true");
      const savedRight = localStorage.getItem("rightSidebarCollapsed");
      if (savedRight !== null) setRightSidebarCollapsed(savedRight === "true");
    }
  }, []);

  return (
    <div className="h-[calc(100vh-8rem)] flex w-full" ref={mapContainerRef}>
      {/* Left Sidebar container */}
      <div
        className={`h-full transition-all duration-300 flex-shrink-0 bg-background ${leftSidebarCollapsed ? "w-0" : "w-80"
          } ${isMobile ? "absolute" : ""}`}
      >
        <div className="flex h-full flex-col w-80">
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="modern-tabs flex mb-6">
                <button
                  type="button"
                  className={`flex-1 modern-tab ${activeTab === "points" ? "modern-tab-active" : "modern-tab-inactive"}`}
                  onClick={() => handleTabChange("points")}
                >
                  <MapPin className="h-4 w-4 mr-2 inline-block" />
                  Points
                </button>
                <button
                  type="button"
                  className={`flex-1 modern-tab ${activeTab === "filters" ? "modern-tab-active" : "modern-tab-inactive"}`}
                  onClick={() => handleTabChange("filters")}
                >
                  <Filter className="h-4 w-4 mr-2 inline-block" />
                  Filters
                </button>
                <button
                  type="button"
                  className={`flex-1 modern-tab ${activeTab === "info" ? "modern-tab-active" : "modern-tab-inactive"}`}
                  onClick={() => handleTabChange("info")}
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
                  <h3 className="section-title flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Area Information
                  </h3>
                  <p className="caption mb-4">Details about the selected area</p>
                  {selectedArea ? (
                    <DistrictInfo area={convertAreaToDetails(selectedArea)} />
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

      {/* Left Sidebar toggle button */}
      <button
        type="button"
        className="absolute left-4 top-4 z-40 rounded-full bg-background p-2 shadow-lg hover:bg-accent"
        onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
        style={{ left: leftSidebarCollapsed ? "1rem" : "21rem" }}
      >
        {leftSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Map area - takes full width when sidebars are collapsed */}
      <div className="flex-1 h-full relative">
        <MapComponent />
      </div>

      {/* Right Sidebar container */}
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
        type="button"
        className="absolute right-4 top-4 z-40 rounded-full bg-background p-2 shadow-lg hover:bg-accent"
        onClick={toggleRightSidebar}
        style={{ right: rightSidebarCollapsed ? "1rem" : "21rem" }}
      >
        <Bot className="h-4 w-4" />
      </button>
    </div>
  )
}
