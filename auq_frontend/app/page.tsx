import { MapProvider } from "@/contexts/map-context"
import { Header } from "@/components/header"
import { CitySelector } from "@/components/city-selector"
import { MapView } from "@/components/map-view"

export default function Home() {
  return (
    <MapProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex items-center px-4 py-2 bg-primary/5 border-b">
          <CitySelector />
        </div>
        <main className="flex-1">
          <MapView />
        </main>
      </div>
    </MapProvider>
  )
}
