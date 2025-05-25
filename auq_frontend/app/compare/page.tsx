import { Header } from "@/components/header"
import { CitySelector } from "@/components/city-selector"
import { CompareView } from "@/components/compare-view"

export default function ComparePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex items-center px-4 py-2 bg-primary/5 border-b">
        <CitySelector />
      </div>
      <main className="flex-1">
        <CompareView />
      </main>
    </div>
  )
}
