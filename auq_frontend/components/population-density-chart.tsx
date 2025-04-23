"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getIndicatorValue } from "@/lib/mock-data"
import { Users } from "lucide-react"
import { useMapContext } from "@/contexts/map-context"

type Area = {
  id: number
  name: string
  cityId: number
  population: number
  avgIncome: number
  districtId?: number
}

type PopulationDensityChartProps = {
  areas: Area[]
}

export function PopulationDensityChart({ areas }: PopulationDensityChartProps) {
  const { selectedGranularity } = useMapContext()

  // Verificar si areas está definido y tiene elementos
  if (!areas || areas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Densidad de Población por Área
          </CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Selecciona una ciudad para ver los datos de densidad de población</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = areas.map((area) => ({
    name: area.name,
    density: getIndicatorValue(area.id, 3, selectedGranularity.level) || 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Densidad de Población por Área
        </CardTitle>
        <CardDescription>Número de residentes por kilómetro cuadrado en cada área</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            density: {
              label: "Densidad de Población (personas/km²)",
              color: "hsl(var(--chart-3))",
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
              <Bar dataKey="density" fill="hsl(var(--chart-3))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
