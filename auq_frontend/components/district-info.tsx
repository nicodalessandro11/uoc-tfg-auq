"use client"

import { getIndicatorValue, getCityIndicators, getIndicatorDefinitions } from "../lib/supabase-client"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, DollarSign, Wallet, Map, Ruler, Euro } from "lucide-react"
import { useMapContext } from "@/contexts/map-context"
import { useEffect, useState } from "react"

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

// Icon mapping for indicator names
const indicatorIcons: Record<string, JSX.Element> = {
  population: <Users className="h-5 w-5 text-primary dark:text-primary-400" />,
  surface: <Map className="h-5 w-5 text-green-600 dark:text-green-400" />,
  "average gross taxable income per person": <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
  "disposable income per capita": <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
  "population density": <Ruler className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
  "education level": <Badge className="h-5 w-5 text-pink-600 dark:text-pink-400" />,
  "unemployment rate": <Euro className="h-5 w-5 text-red-600 dark:text-red-400" />,
}

export function DistrictInfo({ area }: AreaInfoProps) {
  const { selectedGranularity, selectedCity } = useMapContext()
  const [indicatorValues, setIndicatorValues] = useState<{ [indicatorName: string]: number | null }>({})
  const [indicatorDefs, setIndicatorDefs] = useState<any[]>([])

  useEffect(() => {
    async function fetchAllIndicators() {
      if (!selectedGranularity || !selectedCity) return
      try {
        // Get all indicator definitions
        const defs = await getIndicatorDefinitions()
        setIndicatorDefs(defs)
        // Get all indicators for this city and level
        const indicators = await getCityIndicators(selectedCity.id, selectedGranularity.level)
        // Find all indicators for this area
        const values: { [indicatorName: string]: number | null } = {}
        defs.forEach(def => {
          const found = indicators.find(ind => ind.indicator_def_id === def.id && ind.geo_id === area.id)
          values[def.name] = found ? found.value : null
        })
        setIndicatorValues(values)
      } catch (error) {
        console.error("Error fetching indicators:", error)
      }
    }
    fetchAllIndicators()
  }, [area.id, selectedGranularity, selectedCity])

  if (!selectedGranularity) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-primary/90 dark:bg-primary-900 text-primary-foreground px-5 py-4 flex flex-col gap-1 shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-xl font-bold tracking-tight text-primary-foreground">{area.name}</h3>
        </div>
        <p className="text-sm text-primary-foreground/80">
          {selectedGranularity.level === "district" ? "District Profile" : "Neighborhood Profile"}
        </p>
      </div>

      <div className="grid gap-4">
        {indicatorDefs.map(def => (
          indicatorValues[def.name] !== null && (
            <div
              className="rounded-xl border border-border bg-background/80 dark:bg-muted/70 shadow-sm p-5 flex flex-col gap-2 hover:shadow-md transition-all"
              key={def.id}
            >
              <div className="flex items-center gap-3 mb-1">
                <div>
                  <h4 className="text-base font-semibold text-foreground dark:text-white">{def.name}{def.unit ? ` (${def.unit})` : ''}</h4>
                  {def.description && (
                    <p className="text-xs text-muted-foreground mt-1">{def.description}</p>
                  )}
                </div>
              </div>
              <p className="text-xl text-center font-bold text-primary dark:text-primary-400">
                {indicatorValues[def.name]?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                {def.unit && !isNaN(Number(indicatorValues[def.name])) && ` ${def.unit}`}
              </p>
            </div>
          )
        ))}
      </div>
    </div>
  )
}
