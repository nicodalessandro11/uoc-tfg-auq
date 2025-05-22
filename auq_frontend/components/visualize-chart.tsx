"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import type { Area, IndicatorDefinition } from "@/lib/api-types"

interface VisualizeChartProps {
    areas: Area[]
    indicator: IndicatorDefinition
    indicatorValues: Record<number, number> // areaId -> value
    topN: number
}

export function VisualizeChart({ areas, indicator, indicatorValues, topN }: VisualizeChartProps) {
    // Ordenar áreas por valor del indicador y tomar el top N
    const sorted = React.useMemo(() => {
        return areas
            .map(area => ({
                ...area,
                value: indicatorValues[area.id] ?? 0
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, topN)
    }, [areas, indicatorValues, topN])

    const formatValue = (value: number) => {
        if (indicator.unit === "€") return `${value.toLocaleString()} €`
        if (indicator.unit === "%") return `${value.toFixed(1)}%`
        return value.toLocaleString()
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg text-center">
                    Top {topN} areas by {indicator.name}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sorted} margin={{ top: 10, right: 20, bottom: 10, left: 20 }} barGap={6} barCategoryGap={20}>
                            <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 'bold' }} interval={0} angle={0} textAnchor="middle" height={40} />
                            <YAxis tickFormatter={formatValue} tick={{ fontSize: 12 }} width={60} />
                            <Tooltip formatter={formatValue} labelFormatter={name => name} />
                            <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} label={{ position: 'top', formatter: formatValue, style: { fontSize: '12px', fill: '#666' } }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
} 