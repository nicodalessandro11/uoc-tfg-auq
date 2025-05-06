# *Are U Query-ous?* — Frontend Application

This document outlines the structure and functionality of the **frontend interface** for the Are U Query-ous platform. Built with **Next.js**, **Tailwind CSS**, and **Supabase**, the app provides a geospatial visualization experience, enabling users to compare and analyze open urban data interactively.

## Features Overview

* Interactive map with **district** and **neighbourhood** polygons
* Marker layers for **point features** (parks, libraries, etc.)
* Visual dashboards and data **comparison views**
* Supabase integration for fetching live **geospatial** and **statistical** data
* Context-based **filtering**, **selection**, and **state sharing**
* Admin dashboard (protected)
* Mobile-responsive and dark-mode ready

## Page Architecture

Each page is built with the **Next.js App Router** structure:

* `app/page.tsx`: Default **Map View**
* `app/compare/page.tsx`: Compare view between selected areas
* `app/visualize/page.tsx`: Data visualization (charts)
* `app/admin/page.tsx`: Admin tools (secured)

All pages are wrapped with a shared **MapProvider** for global state and include modular components like:

* `Header`
* `CitySelector`
* `MapView`, `CompareView`, `VisualizeView`, `AdminView`

## Component Structure

### Layout and Routing

```bash
auq_frontend/
├── app/                # Next.js App Router pages
│   ├── layout.tsx      # Root layout + providers
│   ├── page.tsx        # Home (map view)
│   ├── compare/        # Area comparison
│   ├── visualize/      # Data visualization
│   └── admin/          # Admin dashboard
```

### Logic & State

```bash
├── contexts/
│   ├── map-context.tsx     # Manages selected city/area and filters
│   └── auth-context.tsx    # Manages user auth state
```

### Core Components

```bash
├── components/
│   ├── ui/                 # Shadcn UI components
│   ├── map-view.tsx        # View wrapper
│   ├── map-component.tsx   # Loader
│   ├── leaflet-map.jsx     # Leaflet implementation
│   ├── city-selector.tsx   # Dropdown
│   ├── filter-panel.tsx    # Filtering UI
│   └── ...                 # Other shared components
```

### Data Layer

```bash
├── lib/
│   ├── supabase-client.ts      # Direct Supabase access
│   ├── api-service.ts          # Unified API abstraction
│   ├── indicator-service.ts    # Specialized indicator access
│   ├── api-utils.ts            # Utility functions
│   ├── mock-data.ts            # Local fallback data
```

## Data Flow Summary

* **Data Source**: Supabase (PostgreSQL + PostGIS)
* **Fetcher**: `api-service.ts` or `supabase-client.ts`
* **Context**: `map-context.tsx` handles selected city, view mode, filters
* **Consumers**: UI components subscribe to changes and update display

## Development Workflow

### 1. Setup

```bash
cd auq_frontend
pnpm install
```

Create `.env.local` with Supabase credentials if needed.

### 2. Dev Server

```bash
pnpm dev
```

Opens at `localhost:3000`.

### 3. Build for Production

```bash
pnpm build
```

## Styling System

* Tailwind CSS configured via `tailwind.config.ts`
* Uses **Slate** color palette and **New York** layout via `shadcn/ui`
* Responsive grid layout for map, filters, dashboards

## Debug & Auth Tools

* `debug-panel.tsx`: Internal debug switch
* `connection-status.tsx`: Supabase status
* `login-modal.tsx`: Admin login
* `auth-context.tsx`: Supabase JWT auth

---

## Tech Stack

| Tool          | Role                              |
| ------------- | --------------------------------- |
| **Next.js**   | Application framework             |
| **React 19**  | UI components                     |
| **Leaflet**   | Interactive mapping engine        |
| **Tailwind**  | Styling and layout                |
| **Supabase**  | Backend DB and auth               |
| **Shadcn/ui** | UI system (buttons, modals, etc.) |

## License & Ownership

This **frontend interface** was designed and implemented by **Nico Dalessandro**
for the UOC Final Degree Project (TFG) — "Are U Query-ous?"

All frontend code is released under the [MIT License](../LICENSE).
You are free to use, modify, and distribute it with attribution.
