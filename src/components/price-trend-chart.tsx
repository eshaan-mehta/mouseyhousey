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
  Legend,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { AISummary } from "./ai-summary"
import { Property } from "@/types/property"

interface PriceTrendChartProps {
  currentPrice: string
  zipCode: string
  score: string
  index: number
  property: Property
}

interface ChartDataPoint {
  monthOffset: number;
  price: number;
  monthYear?: string;
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

// Function to convert month offset to month-year string
function getMonthYearFromOffset(monthOffset: number, currentDate: Date = new Date(2025, 5, 1)): string {
  const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, 1);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return `${months[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
}

// This function will now be used as a fallback if the API fails
function generateMockData(currentPrice: number): ChartDataPoint[] {
  const monthOffsets = [-12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 10, 12, 14, 20, 24, 30, 36, 42, 45, 48, 55, 60, 65];
  const maxPrice = calculateMaxPrice(currentPrice);
  
  const data: ChartDataPoint[] = monthOffsets.map((monthOffset) => {
    const growthRate = 0.03 / 12; // Monthly growth rate
    const volatility = 0.1;
    
    let trendPrice = currentPrice * Math.pow(1 + growthRate, monthOffset);
    const variation = (Math.random() - 0.5) * volatility * Math.abs(monthOffset) * 0.1;
    trendPrice *= (1 + variation);
    trendPrice = Math.max(trendPrice * 0.5, Math.min(trendPrice, maxPrice));
    
    return { 
      monthOffset, 
      price: Math.round(trendPrice),
      monthYear: getMonthYearFromOffset(monthOffset)
    };
  });
  
  return data;
}

export function PriceTrendChart({ currentPrice, zipCode, score, index, property }: PriceTrendChartProps) {
  const [chartData, setChartData] = React.useState<ChartDataPoint[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchForecastData() {
      setIsLoading(true)
      try {
        const response = await fetch(`http://0.0.0.0:8080/api/forecast?uid=${index}&zip_code=${zipCode}&score=${score}`)
        if (!response.ok) {
          throw new Error("Failed to fetch forecast data")
        }
        const apiData: { [monthOffset: string]: number } = await response.json()
        
        const processedData: ChartDataPoint[] = Object.entries(apiData).map(([monthOffset, price]) => ({
          monthOffset: parseInt(monthOffset),
          price: price,
          monthYear: getMonthYearFromOffset(parseInt(monthOffset))
        }))
        
        // Sort data by month offset to ensure chronological order
        processedData.sort((a, b) => a.monthOffset - b.monthOffset)
        
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

  const listingPriceNum = parseInt(currentPrice.replace(/[$,]/g, ''))
  const maxForecastPrice = chartData.length > 0 ? Math.max(...chartData.map(d => d.price)) : 0
  const yMax = Math.max(listingPriceNum, maxForecastPrice) * 1.15 // Add 15% padding for better visualization

  return (
    <div className="w-full mt-16 mb-10">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-semibold tracking-tight mb-2">
          Property Value Outlook
        </h2>
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
                    stroke="hsl(var(--foreground))"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="monthOffset"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) => getMonthYearFromOffset(value)}
                    tickCount={24}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) => formatPrice(value)}
                    domain={[0, yMax]}
                    tickCount={8}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload) return null
                      const dataPoint = payload[0]?.payload
                      return (
                        <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                          <div className="grid gap-2">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full bg-primary`} />
                              <span className="font-medium">
                                {dataPoint?.monthYear}: {formatPrice(payload[0]?.value as number)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }}
                  />
                  <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }}/>
                  <ReferenceLine
                    x={0}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                  <ReferenceLine 
                    y={listingPriceNum}
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                  />
                  <Line
                    name="Property Value"
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                  <Line name="Current Listing Price" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} activeDot={false} legendType="line" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Summary Section */}
      <AISummary 
        property={property}
        chartData={chartData}
        isLoading={isLoading}
      />
    </div>
  )
} 