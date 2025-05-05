# Project Structure Documentation

## Basic Structure

### Entry Point and Core Files

- **next.config.mjs**: Configuration file for Next.js that sets up build options, image optimization, and other project settings.
- **tailwind.config.ts**: Configuration for Tailwind CSS, defining theme colors, fonts, animations, and other styling options.
- **app/layout.tsx**: The root layout component that wraps all pages. It sets up:
  - Font loading (Manrope)
  - Theme provider for dark/light mode
  - Authentication provider
  - Debug panels
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

### Context → Types → Hooks

1. **Context** (`contexts` directory):
   - `map-context.tsx`: Central state management for map data, selections, and filters
   - `auth-context.tsx`: Authentication state and functions

2. **Types** (`lib/api-types.ts`):
   - Define TypeScript interfaces for data structures
   - Used throughout the application for type safety

3. **Hooks**:
   - Custom hooks like `useMapContext()` to access shared state
   - React hooks for component state and effects

### API and Data Flow

1. **API Service** (`lib/api-service.ts`):
   - Functions to fetch data from backend
   - Caching mechanism for performance
   - Transforms data to match application needs

2. **Supabase Client** (`lib/supabase-client.ts`):
   - Direct database access for certain operations
   - Fallback to mock data when needed

3. **Mock Data** (`lib/mock-api-responses.ts`):
   - Simulated API responses for development
   - Used when real API is unavailable

### Map Implementation

1. **Map Components**:
   - `map-view.tsx`: Container with sidebars and controls
   - `map-component.tsx`: Dynamic loader for the map
   - `leaflet-map.jsx`: Actual Leaflet implementation (client-side only)

2. **Map Features**:
   - GeoJSON rendering for districts/neighborhoods
   - Point features (markers) for points of interest
   - Interactive selection and filtering

## For Dummies Understanding

Think of this application like a house:

- **Foundation** (Next.js, Tailwind): The structure that everything is built on
- **Walls** (Context, API): The framework that holds everything together and provides data
- **Rooms** (Pages): Different areas of the application with specific purposes
- **Furniture** (Components): The functional pieces that make each room useful
- **Decorations** (UI Elements): The styling that makes everything look good

When you visit the site:

1. The app starts at `app/layout.tsx` which sets up the overall structure
2. It loads the appropriate page based on the URL (e.g., `app/page.tsx` for home)
3. The page uses the `MapProvider` to access shared data
4. Components like `Header`, `CitySelector`, and `MapView` are rendered
5. These components use UI elements like buttons and cards
6. When you interact (e.g., select a city), the context updates
7. Components react to context changes and update what you see

This flow allows for a responsive, interactive application where changes in one part (like selecting a city) affect multiple components throughout the app.
