"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HistoricalTrends() {
  // Generate fake historical data for the last 12 months
  const generateHistoricalData = () => {
    const data = []
    const baseValue = 420000
    let currentValue = baseValue * 0.85 // Start 15% lower

    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)

      // Add some realistic market fluctuation
      const monthlyChange = (Math.random() - 0.4) * 0.03 // -1.2% to +1.8% monthly
      currentValue *= 1 + monthlyChange

      data.push({
        month: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        value: Math.floor(currentValue),
        marketAvg: Math.floor(currentValue * (0.95 + Math.random() * 0.1)),
      })
    }

    return data
  }

  const historicalData = generateHistoricalData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>12-Month Price Trends</CardTitle>
        <CardDescription>Historical property values in your area</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            value: {
              label: "Property Value",
              color: "hsl(var(--chart-1))",
            },
            marketAvg: {
              label: "Market Average",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value: number, name: string) => [
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(value),
                  name === "value" ? "Property Value" : "Market Average",
                ]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-value)"
                strokeWidth={3}
                dot={{ fill: "var(--color-value)", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="marketAvg"
                stroke="var(--color-marketAvg)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "var(--color-marketAvg)", strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
