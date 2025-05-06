# *Are U Query-ous?* — Project Structure Documentation

## Basic Structure

### Entry Point and Core Files

- **next.config.mjs**: Configuration file for Next.js that sets up build options, image optimization, and other project settings.
- **tailwind.config.ts**: Configuration for Tailwind CSS, defining theme colors, fonts, animations, and other styling options.
- **app/layout.tsx**: The root layout component that wraps all pages. It sets up:
  - Font loading (Manrope)
  - Theme provider for dark/light mode
  - Authentication provider
  - Debug panels (ApiDebug and DebugPanel)
- **app/page.tsx**: The main entry point for the home page, which renders the map view.

### Page Structure

The application follows Next.js App Router structure:

- **app/page.tsx**: Home page (Map view)
- **app/compare/page.tsx**: Compare view for comparing different areas
- **app/visualize/page.tsx**: Visualization view for data charts
- **app/admin/page.tsx**: Admin dashboard (protected by authentication)

Each page follows a similar pattern:

1. Wrapped in `MapProvider` for shared state
2. Includes `Header` component
3. Usually includes `CitySelector` component
4. Renders a specific view component (MapView, CompareView, VisualizeView, AdminView)

## Codebase Organization

### Pages → Components → UI Elements

1. **Pages** (in the `app` directory):
   - Import and use high-level components
   - Provide layout structure
   - Set up context providers

2. **Components** (in the `components` directory):
   - Implement specific features (map, charts, selectors)
   - Use UI elements for consistent styling
   - Connect to context for state management

3. **UI Elements** (in `components/ui`):
   - Shadcn/UI components (buttons, cards, dropdowns)
   - Styled with Tailwind CSS
   - Reused across the application

### Context → Services → Hooks

1. **Context** (`contexts` directory):
   - `map-context.tsx`: Central state management for map data, selections, and filters
   - `auth-context.tsx`: Authentication state and functions

2. **Services** (`lib` directory):
   - `api-service.ts`: Functions to fetch data with caching
   - `supabase-client.ts`: Direct database access functions
   - `indicator-service.ts`: Specialized functions for indicator data
   - `api-utils.ts`: Utility functions for API calls

3. **Hooks**:
   - Custom hooks like `useMapContext()` to access shared state
   - React hooks for component state and effects

### Data Flow Architecture

1. **Data Sources**:
   - Supabase Database (PostgreSQL with PostGIS)
   - Mock data for development and fallbacks

2. **Data Access Layer**:
   - `supabase-client.ts`: Direct database access with caching
   - `api-service.ts`: Unified API for data access (uses Supabase or external API)
   - `indicator-service.ts`: Specialized service for indicator data

3. **State Management**:
   - `map-context.tsx`: Central state store for map-related data
   - Component-level state for UI-specific concerns

4. **UI Components**:
   - Consume data from context
   - Render based on current state
   - Trigger state updates via context functions

### Map Implementation

1. **Map Components**:
   - `map-view.tsx`: Container with sidebars and controls
   - `map-component.tsx`: Dynamic loader for the map with point feature filtering
   - `leaflet-map.jsx`: Actual Leaflet implementation (client-side only)

2. **Map Features**:
   - GeoJSON rendering for districts/neighborhoods
   - Point features (markers) for points of interest
   - Interactive selection and filtering
   - Multiple map types (standard, satellite, terrain, etc.)

3. **Map Controls**:
   - `map-type-selector.tsx`: Toggle between different map styles
   - `point-features-toggle.tsx`: Toggle visibility of different point types
   - `filter-panel.tsx`: Filter areas by various indicators

## Specialized Components

### Data Visualization

1. **Chart Components**:
   - `population-chart.tsx`: Bar chart for population data
   - `income-chart.tsx`: Bar chart for income data
   - `education-chart.tsx`: Bar chart for education level data
   - `unemployment-chart.tsx`: Bar chart for unemployment rate data
   - `population-density-chart.tsx`: Bar chart for population density data

2. **Comparison Components**:
   - `district-comparison-chart.tsx`: Side-by-side comparison of districts
   - `compare-view.tsx`: UI for selecting and comparing areas

### Interactive Elements

1. **Selection Components**:
   - `city-selector.tsx`: Dropdown for selecting cities
   - `granularity-selector.tsx`: Toggle between district and neighborhood views

2. **Information Display**:
   - `district-info.tsx`: Detailed information about selected areas
   - `chat-sidebar.tsx`: Conversational interface for geospatial queries

### Debug and Development Tools

1. **Debug Components**:
   - `api-debug.tsx`: Monitor API calls during development
   - `debug-panel.tsx`: Debug controls and information
   - `connection-status.tsx`: Display Supabase connection status

2. **Authentication**:
   - `login-modal.tsx`: Authentication UI
   - `auth-context.tsx`: Authentication state management

## Database Integration

### Supabase Structure

1. **Database Schema**:
   - Cities, districts, neighborhoods with GeoJSON geometries
   - Indicators and indicator definitions
   - Point features and feature definitions
   - Geographical levels for hierarchy

2. **SQL Functions**:
   - `execute_sql.sql`: Function for executing raw SQL queries
   - PostGIS functions for spatial operations

3. **Data Access**:
   - Direct queries via Supabase client
   - Cached responses for performance
   - Fallback to mock data when needed

## For Dummies Understanding

Think of this application like a house:

- **Foundation** (Next.js, Tailwind, Supabase): The structure that everything is built on
- **Walls** (Context, Services): The framework that holds everything together and provides data
- **Rooms** (Pages): Different areas of the application with specific purposes
- **Furniture** (Components): The functional pieces that make each room useful
- **Decorations** (UI Elements): The styling that makes everything look good
- **Plumbing** (Data Flow): How information moves through the house

When you visit the site:

1. The app starts at `app/layout.tsx` which sets up the overall structure
2. It loads the appropriate page based on the URL (e.g., `app/page.tsx` for home)
3. The page uses the `MapProvider` to access shared data
4. Components like `Header`, `CitySelector`, and `MapView` are rendered
5. These components use UI elements like buttons and cards
6. When you interact (e.g., select a city), the context updates
7. Components react to context changes and update what you see

### Key Concepts Simplified

- **Map Context**: The brain of the app that remembers what you've selected and what data to show
- **Supabase**: The filing cabinet where all the map data is stored
- **Leaflet Map**: The interactive map that lets you explore geographical data
- **Point Features**: Markers on the map showing interesting locations like museums or parks
- **Indicators**: Numbers that tell you about an area (population, income, etc.)
- **Filters**: Tools to narrow down what you see based on what you're interested in

This flow allows for a responsive, interactive application where changes in one part (like selecting a city) affect multiple components throughout the app.

## File Organization

```bash
project/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Home page (Map view)
│   ├── compare/              # Compare view
│   ├── visualize/            # Visualization view
│   └── admin/                # Admin dashboard
├── components/               # React components
│   ├── ui/                   # Shadcn UI components
│   ├── header.tsx            # Main navigation header
│   ├── city-selector.tsx     # City selection dropdown
│   ├── map-view.tsx          # Map view container
│   ├── map-component.tsx     # Map component loader
│   ├── leaflet-map.jsx       # Leaflet implementation
│   └── ...                   # Other components
├── contexts/                 # React context providers
│   ├── map-context.tsx       # Map state management
│   └── auth-context.tsx      # Authentication state
├── lib/                      # Utility and service functions
│   ├── api-service.ts        # API service layer
│   ├── supabase-client.ts    # Supabase client
│   ├── indicator-service.ts  # Indicator data service
│   ├── api-utils.ts          # API utility functions
│   ├── api-types.ts          # TypeScript types for API
│   └── mock-data.ts          # Mock data for development
├── public/                   # Static assets
│   ├── mascot-blue.svg       # Application mascot
│   └── marker-icon.png       # Map marker icons
├── styles/                   # CSS styles
│   └── globals.css           # Global styles
├── supabase/                 # Supabase configuration
│   ├── schema.sql            # Database schema
│   ├── seed/                 # Seed data
│   └── functions/            # Database functions
└── ...                       # Configuration files
```

## Development Workflow

1. **Setup**: Clone repository and install dependencies
2. **Environment**: Set up Supabase connection variables
3. **Development**: Run Next.js development server
4. **Database**: Use Supabase dashboard for database management
5. **Deployment**: Deploy to Vercel with Supabase integration

This structure provides a clear organization of the codebase, making it easier to understand, maintain, and extend the application.
