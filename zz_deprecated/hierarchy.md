# Component Hierarchy

This document outlines the hierarchical relationships between components in the application.

## Home Page View

```
[app/page.tsx]
|_MapProvider (context)
   |_ Header
   |  |_ModeToggle
   |  |_ Navigation Links/Dropdown
   |_CitySelector
   |  |_ DropdownMenu
   |  |_GranularitySelector
   |     |_ ToggleGroup
   |_MapView
      |_ MapComponent (dynamic import)
      |  |_LeafletMap
      |     |_ Map Layers (GeoJSON, Markers)
      |     |_MapTypeSelector
      |_ PointFeaturesToggle
      |_FilterPanel
      |_ DistrictInfo
      |_ ChatSidebar
```

## Compare Page View

```
[app/compare/page.tsx]
|_MapProvider (context)
   |_ Header
   |  |_ModeToggle
   |  |_ Navigation Links/Dropdown
   |_CitySelector
   |  |_ DropdownMenu
   |  |_GranularitySelector
   |     |_ ToggleGroup
   |_CompareView
      |_ Area Selection Cards
      |_ DistrictComparisonChart
```

## Visualize Page View

```
[app/visualize/page.tsx]
|_MapProvider (context)
   |_ Header
   |  |_ModeToggle
   |  |_ Navigation Links/Dropdown
   |_CitySelector
   |  |_ DropdownMenu
   |  |_GranularitySelector
   |     |_ ToggleGroup
   |_VisualizeView
      |_ Indicator Selector
      |_Charts (based on selected indicator)
         |_ PopulationChart
         |_IncomeChart
         |_ EducationChart
         |_UnemploymentChart
         |_ PopulationDensityChart
```

## Admin Page View

```
[app/admin/page.tsx]
|_MapProvider (context)
   |_ AuthProvider (context)
      |_Header
      |  |_ ModeToggle
      |  |_Navigation Links/Dropdown
      |_ AdminView (if authenticated)
      |  |_Tabs (Datasets, Features, Analytics)
      |  |_ Admin Controls
      |_ LoginModal (if not authenticated)
```

## Map Component Hierarchy

```
[components/map-view.tsx]
|_Left Sidebar
|  |_ Tabs (Points, Filters, Info)
|  |_PointFeaturesToggle
|  |  |_ Feature Type Switches
|  |_FilterPanel
|  |  |_ Population Filter
|  |  |_Income Filter
|  |  |_ Surface Filter
|  |  |_Disposable Income Filter
|  |_ DistrictInfo
|     |_Area Statistics
|_ MapComponent
|  |_LeafletMap
|     |_ Base Map Layer
|     |_GeoJSON Layer (Districts/Neighborhoods)
|     |_ Markers Layer (Points of Interest)
|     |_MapTypeSelector
|_ Right Sidebar
   |_ChatSidebar
      |_ Message List
      |_ Input Form
```

## Context and Data Flow

```
[contexts/map-context.tsx]
|_State Management
   |_ City Selection
   |_Granularity Selection
   |_ Area Selection
   |_Filters
   |_ Point Feature Visibility
   |_Map Type
   |_ GeoJSON Data
|_Data Loading Functions
   |_ loadGeoJSON
   |_loadAvailableAreas
   |_ loadFilterRanges
|_Cache Management
   |_ GeoJSON Cache
   |_ API Cache
```

## API and Data Services

```
[lib/api-service.ts]
|_API Functions
   |_ getCities
   |_getDistricts
   |_ getNeighborhoods
   |_getGeoJSON
   |_ getFeatureDefinitions
   |_getCityPointFeatures
|_ Cache Management
   |_apiCache
   |_ clearApiCache
   |_ clearApiCacheEntry

[lib/supabase-client.ts]
|_Supabase Functions
   |_ getDistrictPolygons
   |_getNeighborhoodPolygons
   |_ getCityPointFeatures
   |_getFeatureDefinitionsWithNames
|_ Cache Management
   |_dataCache
   |_ clearCache
   |_ clearCacheEntry
```

## UI Components and Utilities

```
[components/ui/*]
|_Button
|_ Card
|_Dialog
|_ Dropdown
|_Input
|_ Label
|_Select
|_ Slider
|_Switch
|_ Toggle
|_ ... (other shadcn/ui components)

[lib/utils.ts]
|_Utility Functions
   |_ API Utilities
   |_Data Transformation
   |_ Caching Helpers
```

This hierarchy shows how components are nested and how data flows through the application. The top-level contexts (MapProvider, AuthProvider) provide state that flows down to components, which then render UI elements and handle user interactions.
