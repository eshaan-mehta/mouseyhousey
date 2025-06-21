"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ValuationChartProps {
  data: {
    estimatedValue: number
    confidenceRange: {
      low: number
      high: number
    }
    marketAverage: number
  }
}

export default function ValuationChart({ data }: ValuationChartProps) {
  const chartData = [
    {
      name: "Low Estimate",
      value: data.confidenceRange.low,
      fill: "#ef4444",
    },
    {
      name: "Estimated Value",
      value: data.estimatedValue,
      fill: "#22c55e",
    },
    {
      name: "High Estimate",
      value: data.confidenceRange.high,
      fill: "#3b82f6",
    },
    {
      name: "Market Average",
      value: data.marketAverage,
      fill: "#6b7280",
    },
  ]

  return (
    <ChartContainer
      config={{
        value: {
          label: "Value",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={80} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
          <ChartTooltip
            content={<ChartTooltipContent />}
            formatter={(value: number) => [
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(value),
              "Value",
            ]}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
