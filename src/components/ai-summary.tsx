"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react"
import { Property } from "@/types/property"

interface AISummaryProps {
  property: Property
  chartData: Array<{ monthOffset: number; price: number; monthYear?: string }>
  isLoading: boolean
}

interface SummaryResponse {
  summary: string
  recommendation: 'Undervalued' | 'Fairly Valued' | 'Overvalued'
  confidence: number
  keyFactors: string[]
}

export function AISummary({ property, chartData, isLoading }: AISummaryProps) {
  const [summary, setSummary] = React.useState<SummaryResponse | null>(null)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isLoading && chartData.length > 0 && !summary) {
      generateAISummary()
    }
  }, [isLoading, chartData, summary])

  const generateAISummary = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      // Prepare the data for Gemini API
      const currentPrice = parseInt(property.price.replace(/[$,]/g, ''))
      const maxForecastPrice = Math.max(...chartData.map(d => d.price))
      const minForecastPrice = Math.min(...chartData.map(d => d.price))
      const avgForecastPrice = chartData.reduce((sum, d) => sum + d.price, 0) / chartData.length
      
      // Calculate price change percentages
      const maxChange = ((maxForecastPrice - currentPrice) / currentPrice) * 100
      const avgChange = ((avgForecastPrice - currentPrice) / currentPrice) * 100

      const propertyData = {
        address: property.address,
        currentPrice: currentPrice,
        zipCode: property.zipcode,
        propertyType: property.property_type,
        bedrooms: property.beds,
        bathrooms: property.baths,
        squareFeet: property.sqft,
        garage: property.garage,
        description: property.description,
        saleType: property.sale_type,
        score: property.score,
        forecastData: {
          maxPrice: maxForecastPrice,
          minPrice: minForecastPrice,
          avgPrice: avgForecastPrice,
          maxChangePercent: maxChange,
          avgChangePercent: avgChange,
          timeRange: `${chartData[0]?.monthYear} to ${chartData[chartData.length - 1]?.monthYear}`
        }
      }

      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate AI analysis')
      }

      const result = await response.json()
      setSummary(result)
    } catch (err) {
      console.error('Error generating AI summary:', err)
      setError('Failed to generate AI analysis. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'Undervalued':
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case 'Overvalued':
        return <TrendingDown className="h-5 w-5 text-red-600" />
      default:
        return <Minus className="h-5 w-5 text-yellow-600" />
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Undervalued':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Overvalued':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'Undervalued':
        return 'Undervalued'
      case 'Overvalued':
        return 'Overvalued'
      default:
        return 'Fairly Valued'
    }
  }

  if (isLoading || isGenerating) {
    return (
      <div className="w-full mt-8 shadow-md">
        <Card className="w-[85%] mx-auto">
          <CardContent className="p-8">
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground text-lg">
                {isGenerating ? 'Generating AI analysis...' : 'Loading...'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full mt-8">
        <Card className="w-[85%] mx-auto">
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-red-600 mb-4 text-lg">{error}</p>
              <button 
                onClick={generateAISummary}
                className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors border-b-2 border-primary/20 hover:border-primary/40"
              >
                <Sparkles className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <div className="w-full mt-8 mb-10">
      <Card className="w-[85%] mx-auto shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Investment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          {/* Recommendation Badge */}
          <div className="flex items-center justify-between bg-gradient-to-r from-muted/30 to-muted/10 p-6 rounded-xl">
            <div className="flex items-center gap-4">
              {getRecommendationIcon(summary.recommendation)}
              <div>
                <h3 className="font-semibold text-xl">Recommendation</h3>
                <p className="text-sm text-muted-foreground">
                  Confidence: {summary.confidence}%
                </p>
              </div>
            </div>
            <Badge className={`${getRecommendationColor(summary.recommendation)} font-semibold text-base px-4 py-2`}>
              {getRecommendationText(summary.recommendation)}
            </Badge>
          </div>

          {/* Summary Text */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-xl border border-primary/10">
            <p className="text-base leading-relaxed text-foreground">{summary.summary}</p>
          </div>

          {/* Key Factors */}
          {summary.keyFactors.length > 0 && (
            <div className="bg-muted/30 p-6 rounded-xl">
              <h4 className="font-semibold mb-4 text-lg">Key Factors</h4>
              <div className="space-y-3">
                {summary.keyFactors.map((factor, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground leading-relaxed">{factor}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground border-t border-border/50 pt-6">
            <p className="leading-relaxed">
              <strong>Disclaimer:</strong> This AI analysis is for informational purposes only and should not be considered as financial advice. 
              Always consult with a qualified real estate professional before making investment decisions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 