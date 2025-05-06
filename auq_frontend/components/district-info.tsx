"use client"

import { getIndicatorValue } from "../lib/indicator-service"
import { MapPin, Users, DollarSign, Wallet, MapIcon, BarChart2, School, Briefcase } from "lucide-react"
import { useMapContext } from "@/contexts/map-context"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getIndicatorDefinitions } from "@/lib/supabase-client"

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

// Define indicator IDs based on the database schema
const INDICATOR_IDS = {
  POPULATION: 1,
  SURFACE: 2,
  AVG_INCOME: 3,
  DISPOSABLE_INCOME: 4,
  POPULATION_DENSITY: 5,
  EDUCATION_LEVEL: 6,
  UNEMPLOYMENT_RATE: 7,
}

export function DistrictInfo({ area }: AreaInfoProps) {
  const { selectedGranularity, setSelectedArea } = useMapContext()
  const [indicators, setIndicators] = useState({})
  const [availableIndicators, setAvailableIndicators] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch available indicator definitions from the database
  useEffect(() => {
    async function fetchIndicatorDefinitions() {
      try {
        const definitions = await getIndicatorDefinitions()
        setAvailableIndicators(definitions)
      } catch (error) {
        console.error("Error fetching indicator definitions:", error)
        setAvailableIndicators([])
      }
    }

    fetchIndicatorDefinitions()
  }, [])

  // Fetch indicator values for the selected area
  useEffect(() => {
    async function fetchIndicators() {
      if (!area || !area.id || !availableIndicators.length) return

      setIsLoading(true)
      try {
        console.log(`Fetching indicators for area ${area.id} (${area.name})`)
        const level = selectedGranularity?.level || "district"

        // Create an object to store all indicator values
        const indicatorValues = {}

        // Only fetch indicators that are defined in the database
        const indicatorPromises = availableIndicators.map(async (indicator) => {
          try {
            const value = await getIndicatorValue(area.id, indicator.id, level)
            indicatorValues[indicator.id] = {
              value,
              name: indicator.name,
              unit: indicator.unit || "",
            }
          } catch (error) {
            console.error(`Error fetching indicator ${indicator.id}:`, error)
          }
        })

        await Promise.all(indicatorPromises)
        setIndicators(indicatorValues)
      } catch (error) {
        console.error("Error fetching indicators:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchIndicators()
  }, [area, selectedGranularity, availableIndicators])

  if (!area) {
    return (
      <div className="text-center py-8 flex flex-col items-center gap-4">
        <div className="bg-muted rounded-full p-4">
          <MapPin className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Select an area on the map to view details</p>
      </div>
    )
  }

  // Helper function to render the appropriate icon for each indicator
  const getIndicatorIcon = (indicatorId) => {
    switch (indicatorId) {
      case INDICATOR_IDS.POPULATION:
        return <Users className="h-5 w-5 text-primary" />
      case INDICATOR_IDS.AVG_INCOME:
        return <DollarSign className="h-5 w-5 text-primary" />
      case INDICATOR_IDS.SURFACE:
        return <MapIcon className="h-5 w-5 text-primary" />
      case INDICATOR_IDS.DISPOSABLE_INCOME:
        return <Wallet className="h-5 w-5 text-primary" />
      case INDICATOR_IDS.POPULATION_DENSITY:
        return <BarChart2 className="h-5 w-5 text-primary" />
      case INDICATOR_IDS.EDUCATION_LEVEL:
        return <School className="h-5 w-5 text-primary" />
      case INDICATOR_IDS.UNEMPLOYMENT_RATE:
        return <Briefcase className="h-5 w-5 text-primary" />
      default:
        return <MapPin className="h-5 w-5 text-primary" />
    }
  }

  // Helper function to format indicator value with its unit
  const formatIndicatorValue = (indicator) => {
    if (!indicator || indicator.value === null || indicator.value === undefined) return "N/A"

    const value = indicator.value
    const unit = indicator.unit || ""

    if (typeof value === "number") {
      // Format numbers with thousands separators
      const formattedValue = value.toLocaleString()

      // Add unit based on indicator type
      if (unit === "€") return `${formattedValue} €`
      if (unit === "%") return `${formattedValue}%`
      if (unit === "km²") return `${formattedValue} km²`
      if (unit === "people/km²") return `${formattedValue} /km²`

      return formattedValue
    }

    return String(value)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-primary rounded-lg p-4 text-primary-foreground">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <h3 className="text-xl font-bold tracking-tight">{area.name}</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary/80"
            onClick={() => setSelectedArea(null)}
          >
            <span className="sr-only">Close</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>
        <p className="text-sm text-primary-foreground/80">
          {selectedGranularity?.level === "district" ? "District Profile" : "Neighborhood Profile"}
        </p>
      </div>

      {/* Main indicators */}
      <div className="grid grid-cols-2 gap-3">
        {/* Population */}
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="mb-2">
            <Users className="h-5 w-5 text-primary" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-1" />
          ) : (
            <div className="text-2xl font-bold">{area.population ? area.population.toLocaleString() : "N/A"}</div>
          )}
          <div className="text-sm text-muted-foreground">Population</div>
        </div>

        {/* Average Income */}
        <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mb-1" />
          ) : (
            <div className="text-2xl font-bold">{area.avgIncome ? `${area.avgIncome.toLocaleString()} €` : "N/A"}</div>
          )}
          <div className="text-sm text-muted-foreground">Avg. Income</div>
        </div>
      </div>

      {/* Other indicators */}
      <div className="grid grid-cols-2 gap-3">
        {/* Surface Area */}
        {availableIndicators.some((ind) => ind.id === INDICATOR_IDS.SURFACE) && (
          <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-4 flex flex-col items-center">
            <div className="mb-2">
              <MapIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm font-medium">Surface Area</div>
            {isLoading ? (
              <Skeleton className="h-6 w-16 mt-1" />
            ) : (
              <div className="mt-1">{formatIndicatorValue(indicators[INDICATOR_IDS.SURFACE])}</div>
            )}
          </div>
        )}

        {/* Disposable Income */}
        {availableIndicators.some((ind) => ind.id === INDICATOR_IDS.DISPOSABLE_INCOME) && (
          <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4 flex flex-col items-center">
            <div className="mb-2">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm font-medium">Disposable Income</div>
            {isLoading ? (
              <Skeleton className="h-6 w-16 mt-1" />
            ) : (
              <div className="mt-1">{formatIndicatorValue(indicators[INDICATOR_IDS.DISPOSABLE_INCOME])}</div>
            )}
          </div>
        )}

        {/* Population Density */}
        {availableIndicators.some((ind) => ind.id === INDICATOR_IDS.POPULATION_DENSITY) && (
          <div className="bg-cyan-50 dark:bg-cyan-900/10 rounded-lg p-4 flex flex-col items-center">
            <div className="mb-2">
              <BarChart2 className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm font-medium">Population Density</div>
            {isLoading ? (
              <Skeleton className="h-6 w-16 mt-1" />
            ) : (
              <div className="mt-1">{formatIndicatorValue(indicators[INDICATOR_IDS.POPULATION_DENSITY])}</div>
            )}
          </div>
        )}

        {/* Education Level */}
        {availableIndicators.some((ind) => ind.id === INDICATOR_IDS.EDUCATION_LEVEL) && (
          <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-lg p-4 flex flex-col items-center">
            <div className="mb-2">
              <School className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm font-medium">Education Level</div>
            {isLoading ? (
              <Skeleton className="h-6 w-16 mt-1" />
            ) : (
              <div className="mt-1">{formatIndicatorValue(indicators[INDICATOR_IDS.EDUCATION_LEVEL])}</div>
            )}
          </div>
        )}
      </div>

      {/* Unemployment Rate (full width) */}
      {availableIndicators.some((ind) => ind.id === INDICATOR_IDS.UNEMPLOYMENT_RATE) && (
        <div className="bg-rose-50 dark:bg-rose-900/10 rounded-lg p-4 flex flex-col items-center">
          <div className="mb-2">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div className="text-sm font-medium">Unemployment Rate</div>
          {isLoading ? (
            <Skeleton className="h-6 w-16 mt-1" />
          ) : (
            <div className="mt-1">{formatIndicatorValue(indicators[INDICATOR_IDS.UNEMPLOYMENT_RATE])}</div>
          )}
        </div>
      )}
    </div>
  )
}
