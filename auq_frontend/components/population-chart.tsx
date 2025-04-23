"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Users } from "lucide-react"

type Area = {
  id: number
  name: string
  cityId: number
  population: number
  avgIncome: number
  districtId?: number
}

type PopulationChartProps = {
  areas: Area[]
}

export function PopulationChart({ areas }: PopulationChartProps) {
  // Check if areas is defined and has elements
  if (!areas || areas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Population by Area
          </CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Select a city to view population data</p>
        </CardContent>
      </Card>
    )
  }

  // Sort areas by population in descending order for better visualization
  const sortedAreas = [...areas].sort((a, b) => b.population - a.population)

  const chartData = sortedAreas.map((area) => ({
    name: area.name,
    population: area.population,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Population by Area
        </CardTitle>
        <CardDescription>Total number of residents in each area</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            population: {
              label: "Population",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="population" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
