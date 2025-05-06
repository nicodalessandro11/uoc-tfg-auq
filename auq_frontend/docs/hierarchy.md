# *Are U Query-ous?* — Frontend Component Hierarchy

This document outlines the hierarchical relationships between components in the application.

## Application Structure

```bash
[app/layout.tsx]
|_ThemeProvider
|_ AuthProvider
   |_Children (Page Content)
   |_ ApiDebug
   |_ DebugPanel
```

## Home Page View

```bash
[app/page.tsx]
|_MapProvider (context)
   |_ Header
   |  |_ModeToggle
   |  |_ Navigation Links/Dropdown
   |  |_ConnectionStatus (Supabase connection status)
   |_ CitySelector
   |  |_DropdownMenu
   |  |_ GranularitySelector
   |     |_ToggleGroup
   |_ MapView
      |_Left Sidebar
      |  |_ Tabs (Points, Filters, Info)
      |  |_PointFeaturesToggle
      |  |_ FilterPanel
      |  |_DistrictInfo
      |_ MapComponent (dynamic import)
      |  |_LeafletMap
      |     |_ Map Layers (GeoJSON, Markers)
      |     |_MapTypeSelector
      |     |_ Tooltips and Popups
      |_Right Sidebar
      |  |_ ChatSidebar
      |     |_Message List
      |     |_ Input Form
      |_ DebugPanel (when in debug mode)
```

## Compare Page View

```bash
[app/compare/page.tsx]
|_MapProvider (context)
   |_ Header
   |  |_ModeToggle
   |  |_ Navigation Links/Dropdown
   |  |_ConnectionStatus
   |_ CitySelector
   |  |_DropdownMenu
   |  |_ GranularitySelector
   |     |_ToggleGroup
   |_ CompareView
      |_Area Selection Cards
      |_ DistrictComparisonChart
      |_ DebugPanel (when in debug mode)
```

## Visualize Page View

```bash
[app/visualize/page.tsx]
|_MapProvider (context)
   |_ Header
   |  |_ModeToggle
   |  |_ Navigation Links/Dropdown
   |  |_ConnectionStatus
   |_ CitySelector
   |  |_DropdownMenu
   |  |_ GranularitySelector
   |     |_ToggleGroup
   |_ VisualizeView
      |_Indicator Selector
      |_ Charts (based on selected indicator)
         |_PopulationChart
         |_ IncomeChart
         |_EducationChart
         |_ UnemploymentChart
         |_PopulationDensityChart
      |_ DebugPanel (when in debug mode)
```

## Admin Page View

```bash
[app/admin/page.tsx]
|_MapProvider (context)
   |_ AuthProvider (context)
      |_Header
      |  |_ ModeToggle
      |  |_Navigation Links/Dropdown
      |  |_ ConnectionStatus
      |_AdminView (if authenticated)
      |  |_ Tabs (Datasets, Features, Analytics)
      |  |_Admin Controls
      |  |_ ApiDebug
      |_LoginModal (if not authenticated)
      |_ DebugPanel (when in debug mode)
```

## Leaflet Map Component Hierarchy

```bash
[components/map-component.tsx]
|_MapWithNoSSR (dynamic import of leaflet-map.jsx)
|_ MapTypeSelector
|_Loading Indicators
|_ Empty State Messages

[components/leaflet-map.jsx]
|_Map Container
   |_ TileLayer (Base Map)
   |_GeoJSON Layer
   |  |_ District/Neighborhood Polygons
   |  |_Polygon Event Handlers
   |  |_ Styling Functions
   |_Markers Layer
   |  |_ CircleMarkers for Points of Interest
   |  |_Marker Event Handlers
   |  |_ Custom Tooltips
   |_Map Controls
      |_ Zoom Controls
      |_ Attribution Control
```

## Context Providers

```bash
[contexts/map-context.tsx]
|_State Management
   |_ selectedCity
   |_selectedGranularity
   |_ selectedArea
   |_comparisonArea
   |_ availableAreas
   |_filters
   |_ filterRanges
   |_visiblePointTypes
   |_ currentGeoJSON
   |_mapType
|_ Functions
   |_setSelectedCity
   |_ setSelectedGranularity
   |_setSelectedArea
   |_ setComparisonArea
   |_setFilters
   |_ resetFilters
   |_setVisiblePointTypes
   |_ loadGeoJSON
   |_triggerRefresh
   |_ clearPointFeaturesCache

[contexts/auth-context.tsx]
|_State Management
   |_ user
   |_isLoading
   |_ isAuthenticated
   |_supabase
|_ Functions
   |_login
   |_ logout
```

## Data Services

```bash
[lib/api-service.ts]
|_API Functions
   |_ getCities
   |_getGeographicalLevels
   |_ getDistricts
   |_getNeighborhoods
   |_ getGeographicalUnits
   |_getGeoJSON
   |_ getFeatureDefinitions
   |_getIndicatorDefinitions
   |_ getCityPointFeatures
   |_getCityIndicators
|_ Cache Management
   |_getCachedData
   |_ clearApiCache
   |_ clearApiCacheEntry

[lib/supabase-client.ts]
|_Supabase Client (singleton)
|_ Data Access Functions
   |_getCities
   |_ getDistrictPolygons
   |_getNeighbourhoodPolygons
   |_ getGeographicalUnits
   |_getDistricts
   |_ getNeighborhoods
   |_getFeatureDefinitions
   |_ getCityPointFeatures
   |_getIndicatorDefinitions
   |_ getCityIndicators
   |_checkPostGISAvailability
   |_ getGeographicalLevels
|_Cache Management
   |_ getCachedData
   |_clearCache
   |_ clearCacheEntry

[lib/indicator-service.ts]
|_Indicator Functions
   |_ getIndicatorValue
   |_ clearIndicatorCache
```

## Debug Components

```bash
[components/api-debug.tsx]
|_ApiDebug
   |_ Log Display
   |_ Control Buttons

[components/debug-panel.tsx]
|_DebugPanel
   |_ Debug Controls
   |_Cache Management
   |_ Status Display
```

## UI Components

```bash
[components/connection-status.tsx]
|_ConnectionStatus
   |_ Status Badge
   |_ PostGIS Availability Check

[components/point-features-toggle.tsx]
|_PointFeaturesToggle
   |_ Feature Type List
   |_Toggle Switches
   |_ Feature Icons

[components/filter-panel.tsx]
|_FilterPanel
   |_ Population Filter (Slider)
   |_Income Filter (Slider)
   |_ Surface Filter (Slider)
   |_Disposable Income Filter (Slider)
   |_ Reset Button

[components/district-info.tsx]
|_DistrictInfo
   |_ Area Header
   |_Main Indicators
   |_ Secondary Indicators
   |_ Close Button
```

## Data Flow

The data flow in the application follows this general pattern:

1. **User Interaction** → Triggers state changes in MapContext
2. **MapContext** → Calls data loading functions from API services
3. **API Services** → Fetch data from Supabase or external API
4. **Supabase Client** → Executes database queries and returns results
5. **API Services** → Cache results and transform data
6. **MapContext** → Updates state with new data
7. **React Components** → Re-render with updated data

For example, when a user selects a city:

```bash
CitySelector → setSelectedCity → MapContext → loadGeoJSON →
api-service.getGeoJSON → supabase-client.getDistrictPolygons →
Database Query → Transform to GeoJSON → Cache Result →
Update MapContext.currentGeoJSON → LeafletMap Re-renders
```

This hierarchical structure ensures separation of concerns and maintainable code organization.
