import { supabase } from "./supabase-client"

// Cache for indicator values
const indicatorCache = new Map<string, { data: number; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get indicator value for a specific area and indicator
 */
export async function getIndicatorValue(areaId: number, indicatorId: number, level: string): Promise<number | null> {
  const cacheKey = `indicator_${areaId}_${indicatorId}_${level}`
  const cachedItem = indicatorCache.get(cacheKey)
  const now = Date.now()

  // Return cached data if it exists and is not expired
  if (cachedItem && now - cachedItem.timestamp < CACHE_TTL) {
    return cachedItem.data
  }

  if (!supabase) {
    console.error("Supabase client not available")
    return null
  }

  try {
    // Convert level to geo_level_id
    const geoLevelId = level === "district" ? 2 : level === "neighborhood" || level === "neighbourhood" ? 3 : null

    if (geoLevelId === null) {
      throw new Error(`Invalid geographical level: ${level}`)
    }

    // Get the latest year
    const { data: yearData, error: yearError } = await supabase
      .from("indicators")
      .select("year")
      .order("year", { ascending: false })
      .limit(1)

    if (yearError) {
      throw new Error(`Error fetching latest year: ${yearError.message}`)
    }

    if (!yearData || yearData.length === 0) {
      throw new Error("No indicator data found")
    }

    const latestYear = yearData[0].year

    // Get indicator value
    const { data, error } = await supabase
      .from("indicators")
      .select("value")
      .eq("indicator_def_id", indicatorId)
      .eq("geo_level_id", geoLevelId)
      .eq("geo_id", areaId)
      .eq("year", latestYear)
      .single()

    if (error) {
      // If no data found, try to get it from the area's properties
      const { data: areaData, error: areaError } = await supabase
        .from(level === "district" ? "districts" : "neighbourhoods")
        .select("*")
        .eq("id", areaId)
        .single()

      if (areaError) {
        console.error(`Error fetching area data: ${areaError.message}`)
        return null
      }

      // Map indicator IDs to property names
      const propertyMap: Record<number, string> = {
        1: "population",
        2: "surface",
        3: "avg_income",
        4: "disposable_income",
        5: "population_density",
        6: "education_level",
        7: "unemployment_rate",
      }

      const propertyName = propertyMap[indicatorId]
      if (propertyName && areaData[propertyName] !== undefined) {
        const value = areaData[propertyName]
        // Cache the result
        indicatorCache.set(cacheKey, { data: value, timestamp: now })
        return value
      }

      console.error(`No indicator value found for area ${areaId}, indicator ${indicatorId}, level ${level}`)
      return null
    }

    // Cache the result
    indicatorCache.set(cacheKey, { data: data.value, timestamp: now })
    return data.value
  } catch (error) {
    console.error(`Error getting indicator value: ${error}`)
    return null
  }
}

/**
 * Clear indicator cache
 */
export function clearIndicatorCache(): void {
  indicatorCache.clear()
}
