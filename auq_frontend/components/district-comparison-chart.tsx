"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type DistrictData = {
  id: number
  name: string
  cityId: number
  population: number
  avgIncome: number
  surface: number
  disposableIncome: number
}

type DistrictComparisonChartProps = {
  district1: DistrictData | null
  district2: DistrictData | null
  granularity: string
}

export function DistrictComparisonChart({ district1, district2, granularity }: DistrictComparisonChartProps) {
  if (!district1 || !district2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>District Comparison</CardTitle>
          <CardDescription>Select two districts to compare.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Please select two districts to compare</p>
        </CardContent>
      </Card>
    )
  }

  const data = [
    {
      name: district1.name,
      Population: district1.population !== undefined ? district1.population : 0,
      Income: district1.avgIncome !== undefined ? district1.avgIncome : 0,
    },
    {
      name: district2.name,
      Population: district2.population !== undefined ? district2.population : 0,
      Income: district2.avgIncome !== undefined ? district2.avgIncome : 0,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>District Comparison</CardTitle>
        <CardDescription>
          Comparing key indicators between {district1.name} and {district2.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Population" barSize={30} fill="hsl(var(--chart-1))" />
            <Bar dataKey="Income" barSize={30} fill="hsl(var(--chart-2))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
