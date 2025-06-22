import { NextRequest, NextResponse } from 'next/server'

interface PropertyData {
  address: string
  currentPrice: number
  zipCode: string
  propertyType: string
  bedrooms: string
  bathrooms: string
  squareFeet: string
  garage: string
  description: string
  saleType: string
  score: string
  forecastData: {
    maxPrice: number
    minPrice: number
    avgPrice: number
    maxChangePercent: number
    avgChangePercent: number
    timeRange: string
  }
}

interface SummaryResponse {
  summary: string
  recommendation: 'Undervalued' | 'Fairly Valued' | 'Overvalued'
  confidence: number
  keyFactors: string[]
}

export async function POST(request: NextRequest) {
  try {
    const propertyData: PropertyData = await request.json()
    
    // Check if Gemini API key is available
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Prepare the prompt for Gemini
    const prompt = `You are a real estate investment analyst specializing in property valuation. Analyze the following property data and provide a concise valuation assessment.

Property Details:
- Address: ${propertyData.address}
- Current Price: $${propertyData.currentPrice.toLocaleString()}
- Zip Code: ${propertyData.zipCode}
- Property Type: ${propertyData.propertyType}
- Bedrooms: ${propertyData.bedrooms}
- Bathrooms: ${propertyData.bathrooms}
- Square Feet: ${propertyData.squareFeet}
- Garage Spaces: ${propertyData.garage}
- Sale Type: ${propertyData.saleType}
- Property Score: ${propertyData.score}/10
- Description: ${propertyData.description}

Forecast Data:
- Maximum Predicted Price: $${propertyData.forecastData.maxPrice.toLocaleString()}
- Minimum Predicted Price: $${propertyData.forecastData.minPrice.toLocaleString()}
- Average Predicted Price: $${propertyData.forecastData.avgPrice.toLocaleString()}
- Maximum Price Change: ${propertyData.forecastData.maxChangePercent.toFixed(1)}%
- Average Price Change: ${propertyData.forecastData.avgChangePercent.toFixed(1)}%
- Forecast Time Range: ${propertyData.forecastData.timeRange}

Please provide your analysis in the following JSON format:
{
  "summary": "A 2-3 sentence summary explaining the property's current valuation status based on the current price, forecast data, and property characteristics. Consider factors like price appreciation potential, location, property condition, and market trends.",
  "recommendation": "Undervalued|Fairly Valued|Overvalued",
  "confidence": 85,
  "keyFactors": [
    "Factor 1 explaining the valuation assessment",
    "Factor 2 explaining the valuation assessment",
    "Factor 3 explaining the valuation assessment"
  ]
}

Guidelines:
- "Undervalued" if the property shows strong appreciation potential (>10% average growth) and the current price is below market value
- "Fairly Valued" if the property shows moderate potential (5-10% growth) or the price aligns with market expectations
- "Overvalued" if the property shows poor potential (<5% growth) or the current price is significantly above market value
- Confidence should be 0-100 based on the strength of the data and market conditions
- Key factors should be specific, actionable insights about the property's valuation and market position

Respond only with valid JSON.`

    // Call Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    const responseText = geminiData.candidates[0].content.parts[0].text

    // Parse the JSON response from Gemini
    let parsedResponse: SummaryResponse
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      parsedResponse = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText)
      throw new Error('Invalid response format from AI')
    }

    // Validate the response structure
    if (!parsedResponse.summary || !parsedResponse.recommendation || 
        typeof parsedResponse.confidence !== 'number' || !Array.isArray(parsedResponse.keyFactors)) {
      throw new Error('Invalid response structure from AI')
    }

    return NextResponse.json(parsedResponse)

  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI analysis' },
      { status: 500 }
    )
  }
} 