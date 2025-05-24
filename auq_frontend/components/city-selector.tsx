"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMapContext } from "@/contexts/map-context"
// Import the API service function
import { getCities } from "@/lib/api-service"
import type { City } from "@/lib/api-types"
import { GranularitySelector } from "@/components/granularity-selector"
import { useRouter, useSearchParams } from "next/navigation"

export function CitySelector() {
  const { selectedCity, setSelectedCity } = useMapContext()
  const [cities, setCities] = useState<Array<{ id: number; name: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Fetch cities from API
  // Replace the useEffect that fetches cities
  useEffect(() => {
    async function loadCities() {
      setIsLoading(true)
      console.log("CitySelector: Starting to load cities...")
      try {
        const citiesData = await getCities()
        console.log("CitySelector: Cities data received:", citiesData)
        setCities(citiesData)
        // On mount, if city param exists, set it
        const cityIdParam = searchParams.get("city")
        if (cityIdParam) {
          const found = citiesData.find((c) => c.id.toString() === cityIdParam)
          if (found) setSelectedCity(found)
        }
      } catch (error) {
        console.error("CitySelector: Error loading cities:", error)
      } finally {
        setIsLoading(false)
        console.log("CitySelector: Finished loading cities")
      }
    }

    loadCities()
  }, [])

  // Update URL when city changes
  useEffect(() => {
    if (selectedCity) {
      const params = new URLSearchParams(window.location.search)
      params.set("city", selectedCity.id.toString())
      router.replace(`?${params.toString()}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity])

  const handleCityChange = (city: City) => {
    if (city.id !== selectedCity?.id) {
      console.log("Changing city to:", city.name)
      setSelectedCity(city)
    }
  }

  return (
    <div className="flex items-center justify-between w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="font-medium" disabled={isLoading}>
            {isLoading ? "Loading cities..." : selectedCity ? "Change City" : "Select City"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[180px]">
          {Array.isArray(cities) ? (
            cities.map((city) => (
              <DropdownMenuItem
                key={city.id}
                onClick={() => handleCityChange(city)}
                className={selectedCity?.id === city.id ? "bg-primary/10 text-primary" : ""}
              >
                {city.name}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No cities available</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto">
        <GranularitySelector />
      </div>
    </div>
  )
}
