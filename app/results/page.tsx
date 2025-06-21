"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ValuationChart from "@/components/valuation-chart"
import MarketComparison from "@/components/market-comparison"
import { ArrowLeft, Download, Share2 } from "lucide-react"
import HistoricalTrends from "@/components/historical-trends"

interface ValuationResult {
  estimatedValue: number
  confidenceRange: {
    low: number
    high: number
  }
  confidence: number
  marketAverage: number
  pricePerSqFt: number
  factors: {
    location: number
    condition: number
    size: number
    age: number
  }
  comparables: Array<{
    address: string
    price: number
    sqft: number
    distance: number
  }>
  marketTrends: {
    lastMonth: number
    lastYear: number
    forecast: number
  }
  neighborhood: {
    averagePrice: number
    medianPrice: number
    pricePerSqFt: number
    daysOnMarket: number
    inventory: number
  }
}

export default function ResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<ValuationResult | null>(null)

  useEffect(() => {
    const storedResult = sessionStorage.getItem("valuationResult")
    if (storedResult) {
      setResult(JSON.parse(storedResult))
    } else {
      router.push("/")
    }
  }, [router])

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading results...</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Valuation Report</h1>
              <p className="text-gray-600">AI-powered analysis completed</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Estimated Property Value
                  <Badge variant="secondary">{result.confidence}% Confidence</Badge>
                </CardTitle>
                <CardDescription>Based on current market conditions and property features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-green-600 mb-2">{formatCurrency(result.estimatedValue)}</div>
                  <div className="text-gray-600">
                    Range: {formatCurrency(result.confidenceRange.low)} - {formatCurrency(result.confidenceRange.high)}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">${result.pricePerSqFt} per sq ft</div>
                </div>

                <ValuationChart data={result} />
              </CardContent>
            </Card>

            <MarketComparison
              estimatedValue={result.estimatedValue}
              marketAverage={result.marketAverage}
              comparables={result.comparables}
            />

            <HistoricalTrends />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Valuation Factors</CardTitle>
                <CardDescription>Key factors affecting property value</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Location</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${result.factors.location}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{result.factors.location}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Condition</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${result.factors.condition}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{result.factors.condition}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Size</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${result.factors.size}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{result.factors.size}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Age</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${result.factors.age}%` }}></div>
                    </div>
                    <span className="text-sm text-gray-600">{result.factors.age}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Market Average</span>
                  <span className="font-medium">{formatCurrency(result.marketAverage)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Your Property</span>
                  <span className="font-medium text-green-600">{formatCurrency(result.estimatedValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Difference</span>
                  <span
                    className={`font-medium ${result.estimatedValue > result.marketAverage ? "text-green-600" : "text-red-600"}`}
                  >
                    {result.estimatedValue > result.marketAverage ? "+" : ""}
                    {formatCurrency(result.estimatedValue - result.marketAverage)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Trends</CardTitle>
                <CardDescription>Recent market performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Month</span>
                  <span
                    className={`font-medium ${result.marketTrends.lastMonth >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {result.marketTrends.lastMonth >= 0 ? "+" : ""}
                    {result.marketTrends.lastMonth}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Year</span>
                  <span
                    className={`font-medium ${result.marketTrends.lastYear >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {result.marketTrends.lastYear >= 0 ? "+" : ""}
                    {result.marketTrends.lastYear}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">12-Month Forecast</span>
                  <span
                    className={`font-medium ${result.marketTrends.forecast >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {result.marketTrends.forecast >= 0 ? "+" : ""}
                    {result.marketTrends.forecast}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Neighborhood Stats</CardTitle>
                <CardDescription>Local market conditions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Price</span>
                  <span className="font-medium">{formatCurrency(result.neighborhood.averagePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Median Price</span>
                  <span className="font-medium">{formatCurrency(result.neighborhood.medianPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Price per Sq Ft</span>
                  <span className="font-medium">${result.neighborhood.pricePerSqFt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Days on Market</span>
                  <span className="font-medium">{result.neighborhood.daysOnMarket} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Listings</span>
                  <span className="font-medium">{result.neighborhood.inventory}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
