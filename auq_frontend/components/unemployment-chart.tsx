"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getIndicatorValue } from "../lib/supabase-client"
import { Briefcase } from "lucide-react"
import { useMapContext } from "@/contexts/map-context"
import { useEffect, useState } from "react"

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
  const [chartData, setChartData] = useState<Array<{ name: string; unemployment: number }>>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch real indicator data
  useEffect(() => {
    async function fetchData() {
      if (!areas || areas.length === 0) return

      setIsLoading(true)

      const newChartData = await Promise.all(
        areas.map(async (area) => {
          const unemployment = (await getIndicatorValue(area.id, 7, selectedGranularity.level)) || 0
          return {
            name: area.name,
            unemployment,
          }
        }),
      )

      setChartData(newChartData)
      setIsLoading(false)
    }

    fetchData()
  }, [areas, selectedGranularity.level])

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Tasa de Desempleo por Área
          </CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Cargando datos de desempleo...</p>
        </CardContent>
      </Card>
    )
  }

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
