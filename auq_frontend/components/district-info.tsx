"use client"

import { getIndicatorValue } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, DollarSign, Wallet, Map } from "lucide-react"
import { useMapContext } from "@/contexts/map-context"

type AreaInfoProps = {
  area: {
    id: number
    name: string
    cityId: number
    population: number
    avgIncome: number
    districtId?: number
  }
}

export function DistrictInfo({ area }: AreaInfoProps) {
  const { selectedGranularity } = useMapContext()

  // Get additional indicators
  const surface = getIndicatorValue(area.id, 2, selectedGranularity.level)
  const disposableIncome = getIndicatorValue(area.id, 4, selectedGranularity.level)

  return (
    <div className="space-y-4">
      <div className="modern-card bg-primary text-primary-foreground">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="h-5 w-5" />
          <h3 className="text-xl font-bold tracking-tight">{area.name}</h3>
        </div>
        <p className="text-sm text-primary-foreground/80">
          {selectedGranularity.level === "district" ? "District Profile" : "Neighborhood Profile"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="modern-card">
          <div className="flex flex-col items-center">
            <div className="bg-primary/10 p-2 rounded-full mb-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="data-value">{area.population.toLocaleString()}</div>
            <div className="data-label">Population</div>
          </div>
        </div>

        <div className="modern-card">
          <div className="flex flex-col items-center">
            <div className="bg-primary/10 p-2 rounded-full mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div className="data-value">{area.avgIncome.toLocaleString()} €</div>
            <div className="data-label">Avg. Income</div>
          </div>
        </div>
      </div>

      <div className="modern-card">
        <h4 className="text-sm font-medium mb-3 flex items-center">
          <Map className="h-4 w-4 mr-2 text-primary" />
          Additional Indicators
        </h4>
        <div className="space-y-3">
          {surface && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1 rounded-md">
                  <Map className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm">Surface</span>
              </div>
              <Badge variant="outline" className="font-medium">
                {surface} km²
              </Badge>
            </div>
          )}

          {disposableIncome && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1 rounded-md">
                  <Wallet className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm">Disposable Income</span>
              </div>
              <Badge variant="outline" className="font-medium">
                {disposableIncome.toLocaleString()} €
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
