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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PriceTrendChartProps {
  currentPrice: string
  zipCode: string
}

export function PriceTrendChart({ currentPrice, zipCode }: PriceTrendChartProps) {
  // Parse current price and calculate scale
  const priceNumber = parseInt(currentPrice.replace(/[$,]/g, ''))
  const maxPrice = calculateMaxPrice(priceNumber)
  
  // Generate years (3 years prior to 5 years ahead, with 2025 in middle)
  const years = generateYears()
  
  // Generate mock data - in a real app, this would come from your forecasting API
  const data = generatePriceData(years, priceNumber, maxPrice)

  // Add current price point to data for marker
  const dataWithCurrent = [...data]
  const currentDataPoint = {
    year: 2025,
    price: priceNumber,
    isCurrent: true
  }
  
  // Replace the 2025 data point with current price
  const currentIndex = dataWithCurrent.findIndex(d => d.year === 2025)
  if (currentIndex !== -1) {
    dataWithCurrent[currentIndex] = currentDataPoint
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-center items-center">
        <h2 className="text-3xl font-semibold mb-2">Property Value Outlook</h2>
        <p className="text-muted-foreground">Here's what we predict the value of th</p>
      </div>
      
      <Card className="w-[70%] mx-auto">
        <CardContent className="p-6">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataWithCurrent}>
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
                {/* Vertical dashed line at 2025 (current time) */}
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function calculateMaxPrice(currentPrice: number): number {
  const targetMax = currentPrice * 10
  
  // Round to nearest significant number based on order of magnitude
  const orderOfMagnitude = Math.floor(Math.log10(targetMax))
  const base = Math.pow(10, orderOfMagnitude)
  const rounded = Math.ceil(targetMax / base) * base
  
  return rounded
}

function generateYears(): number[] {
  const years = []
  for (let i = 2022; i <= 2030; i++) {
    years.push(i)
  }
  return years
}

function generatePriceData(years: number[], currentPrice: number, maxPrice: number): Array<{ year: number; price: number }> {
  return years.map((year, index) => {
    // Create a realistic price trend with some variation
    const basePrice = currentPrice
    const yearsFromNow = year - 2025 // 2025 is the middle year
    const growthRate = 0.03 // 3% annual growth
    const volatility = 0.1 // 10% volatility
    
    // Calculate trend price
    let trendPrice = basePrice * Math.pow(1 + growthRate, yearsFromNow)
    
    // Add some realistic variation (more volatile in future years)
    const variation = (Math.random() - 0.5) * volatility * Math.abs(yearsFromNow) * 0.5
    trendPrice = trendPrice * (1 + variation)
    
    // Ensure price stays within reasonable bounds
    trendPrice = Math.max(trendPrice * 0.5, Math.min(trendPrice, maxPrice))
    
    return {
      year,
      price: Math.round(trendPrice)
    }
  })
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