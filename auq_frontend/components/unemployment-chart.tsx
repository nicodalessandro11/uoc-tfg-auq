"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getIndicatorValue } from "@/lib/mock-data"
import { Briefcase } from "lucide-react"
import { useMapContext } from "@/contexts/map-context"

type Area = {
  id: number
  name: string
  cityId: number
  population: number
  avgIncome: number
  districtId?: number
}

type UnemploymentChartProps = {
  areas: Area[]
}

export function UnemploymentChart({ areas }: UnemploymentChartProps) {
  const { selectedGranularity } = useMapContext()

  // Verificar si areas está definido y tiene elementos
  if (!areas || areas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Tasa de Desempleo por Área
          </CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Selecciona una ciudad para ver los datos de desempleo</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = areas.map((area) => ({
    name: area.name,
    unemployment: getIndicatorValue(area.id, 5, selectedGranularity.level) || 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Tasa de Desempleo por Área
        </CardTitle>
        <CardDescription>Porcentaje de población en edad laboral sin empleo en cada área</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            unemployment: {
              label: "Tasa de Desempleo (%)",
              color: "hsl(var(--chart-5))",
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
              <Bar dataKey="unemployment" fill="hsl(var(--chart-5))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
