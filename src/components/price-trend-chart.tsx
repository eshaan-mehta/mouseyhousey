"use client"

import * as React from "react"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface PriceTrendChartProps {
  currentPrice: string
  zipCode: string
  score: string
  index: number
}

interface ChartDataPoint {
  year: number;
  price: number;
  isCurrent?: boolean;
}

function calculateMaxPrice(currentPrice: number): number {
  const orderOfMagnitude = Math.floor(Math.log10(currentPrice * 10))
  const base = Math.pow(10, orderOfMagnitude)
  return Math.ceil((currentPrice * 10) / base) * base
}

function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`
  } else if (price >= 1000) {
    return `$${(price / 1000).toFixed(0)}K`
  } else {
    return `$${price.toLocaleString()}`
  }
}

// This function will now be used as a fallback if the API fails
function generateMockData(currentPrice: number): ChartDataPoint[] {
  const years = Array.from({ length: 9 }, (_, i) => 2022 + i) // 2022 to 2030
  const maxPrice = calculateMaxPrice(currentPrice)
  
  const data: ChartDataPoint[] = years.map((year) => {
    const growthRate = 0.03
    const volatility = 0.1
    const yearsFromNow = year - 2025
    
    let trendPrice = currentPrice * Math.pow(1 + growthRate, yearsFromNow)
    const variation = (Math.random() - 0.5) * volatility * Math.abs(yearsFromNow) * 0.5
    trendPrice *= (1 + variation)
    trendPrice = Math.max(trendPrice * 0.5, Math.min(trendPrice, maxPrice))
    
    return { year, price: Math.round(trendPrice) }
  })
  
  // Replace 2025 data with current listing price
  const currentIndex = data.findIndex(d => d.year === 2025)
  if (currentIndex !== -1) {
    data[currentIndex] = { year: 2025, price: currentPrice, isCurrent: true }
  }
  
  return data
}

export function PriceTrendChart({ currentPrice, zipCode, score, index }: PriceTrendChartProps) {
  const [chartData, setChartData] = React.useState<ChartDataPoint[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchForecastData() {
      setIsLoading(true)
      try {
        const response = await fetch(`http://0.0.0.0:8080/api/forecast?uid={index}&zip_code=${zipCode}&score=${score}`)
        if (!response.ok) {
          throw new Error("Failed to fetch forecast data")
        }
        const apiData: { [year: string]: number } = await response.json()
        
        const priceNumber = parseInt(currentPrice.replace(/[$,]/g, ''))
        
        const processedData: ChartDataPoint[] = Object.entries(apiData).map(([year, price]) => ({
          year: parseInt(year),
          price: price,
        }))
        
        // Add current price marker
        const currentIndex = processedData.findIndex(d => d.year === 2025)
        if (currentIndex !== -1) {
          processedData[currentIndex] = { ...processedData[currentIndex], price: priceNumber, isCurrent: true }
        } else {
          processedData.push({ year: 2025, price: priceNumber, isCurrent: true })
          processedData.sort((a, b) => a.year - b.year)
        }
        
        setChartData(processedData)
      } catch (error) {
        console.error(error)
        // Fallback to mock data on API error
        const priceNumber = parseInt(currentPrice.replace(/[$,]/g, ''))
        setChartData(generateMockData(priceNumber))
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchForecastData()
  }, [zipCode, currentPrice, score, index])

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-semibold tracking-tight mb-2">
          Property Value Outlook
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Uncover the truth behind the listing price. Here is our projection of this property's value over time based on market trends.
        </p>
      </div>
      
      <Card className="w-[70%] mx-auto">
        <CardContent className="p-6">
          <div className="h-[400px] w-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid 
                    strokeDasharray="1 1" 
                    stroke="hsl(var(--border))"
                    opacity={0.8}
                  />
                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) => value.toString()}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) => formatPrice(value)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload) return null
                      const dataPoint = payload[0]?.payload
                      return (
                        <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                          <div className="grid gap-2">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${dataPoint?.isCurrent ? 'bg-destructive' : 'bg-primary'}`} />
                              <span className="font-medium">
                                {dataPoint?.year}: {formatPrice(payload[0]?.value as number)}
                                {dataPoint?.isCurrent && ' (Current)'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }}
                  />
                  <ReferenceLine
                    x={2025}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                  <Line
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={(props) => {
                      const { cx, cy, payload, index } = props
                      if (payload?.isCurrent) {
                        return (
                          <circle
                            key={`current-dot-${index}`}
                            cx={cx}
                            cy={cy}
                            r={6}
                            fill="hsl(var(--destructive))"
                            stroke="hsl(var(--destructive))"
                            strokeWidth={2}
                          />
                        )
                      }
                      return (
                        <circle
                          key={`dot-${index}`}
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill="hsl(var(--primary))"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                        />
                      )
                    }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 