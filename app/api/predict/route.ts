import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // In a real application, you would call your Flask backend here
    // const response = await fetch(`${process.env.BACKEND_URL}/predict`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(body),
    // })

    // Generate more realistic fake data based on input
    const sqft = Number.parseInt(body.squareFootage) || 2000
    const bedrooms = Number.parseInt(body.bedrooms) || 3
    const yearBuilt = Number.parseInt(body.yearBuilt) || 2000
    const currentYear = new Date().getFullYear()
    const age = currentYear - yearBuilt

    // Base price calculation with some randomness
    const basePrice = sqft * (180 + Math.random() * 120) // $180-300 per sqft
    const locationMultiplier = 0.8 + Math.random() * 0.6 // 0.8-1.4x
    const conditionMultiplier =
      body.condition === "excellent" ? 1.1 : body.condition === "good" ? 1.0 : body.condition === "fair" ? 0.9 : 0.8
    const ageMultiplier = age < 10 ? 1.1 : age < 20 ? 1.0 : age < 40 ? 0.95 : 0.85

    const estimatedValue = Math.floor(basePrice * locationMultiplier * conditionMultiplier * ageMultiplier)
    const variance = estimatedValue * 0.15 // 15% variance

    const simulatedResult = {
      estimatedValue,
      confidenceRange: {
        low: Math.floor(estimatedValue - variance),
        high: Math.floor(estimatedValue + variance),
      },
      confidence: Math.floor(Math.random() * 15) + 85, // 85-100%
      marketAverage: Math.floor(estimatedValue * (0.9 + Math.random() * 0.2)), // ±10% of estimate
      pricePerSqFt: Math.floor(estimatedValue / sqft),
      factors: {
        location: Math.floor(Math.random() * 20) + 75, // 75-95%
        condition:
          body.condition === "excellent" ? 95 : body.condition === "good" ? 85 : body.condition === "fair" ? 70 : 55,
        size: sqft > 2500 ? 90 : sqft > 2000 ? 80 : sqft > 1500 ? 70 : 60,
        age: age < 10 ? 95 : age < 20 ? 85 : age < 40 ? 75 : 60,
      },
      comparables: [
        {
          address: `${Math.floor(Math.random() * 999) + 100} Oak Street`,
          price: Math.floor(estimatedValue * (0.95 + Math.random() * 0.1)),
          sqft: Math.floor(sqft * (0.9 + Math.random() * 0.2)),
          distance: Math.round((Math.random() * 0.8 + 0.1) * 10) / 10,
        },
        {
          address: `${Math.floor(Math.random() * 999) + 100} Pine Avenue`,
          price: Math.floor(estimatedValue * (0.9 + Math.random() * 0.2)),
          sqft: Math.floor(sqft * (0.85 + Math.random() * 0.3)),
          distance: Math.round((Math.random() * 1.2 + 0.2) * 10) / 10,
        },
        {
          address: `${Math.floor(Math.random() * 999) + 100} Maple Drive`,
          price: Math.floor(estimatedValue * (0.92 + Math.random() * 0.16)),
          sqft: Math.floor(sqft * (0.88 + Math.random() * 0.24)),
          distance: Math.round((Math.random() * 1.5 + 0.3) * 10) / 10,
        },
        {
          address: `${Math.floor(Math.random() * 999) + 100} Cedar Lane`,
          price: Math.floor(estimatedValue * (0.87 + Math.random() * 0.26)),
          sqft: Math.floor(sqft * (0.82 + Math.random() * 0.36)),
          distance: Math.round((Math.random() * 2.0 + 0.4) * 10) / 10,
        },
      ],
      marketTrends: {
        lastMonth: Math.round((Math.random() * 6 - 3) * 10) / 10, // -3% to +3%
        lastYear: Math.round((Math.random() * 20 - 5) * 10) / 10, // -5% to +15%
        forecast: Math.round((Math.random() * 12 - 2) * 10) / 10, // -2% to +10%
      },
      neighborhood: {
        averagePrice: Math.floor(estimatedValue * (0.85 + Math.random() * 0.3)),
        medianPrice: Math.floor(estimatedValue * (0.9 + Math.random() * 0.2)),
        pricePerSqFt: Math.floor((estimatedValue * (0.85 + Math.random() * 0.3)) / sqft),
        daysOnMarket: Math.floor(Math.random() * 60) + 15, // 15-75 days
        inventory: Math.floor(Math.random() * 50) + 10, // 10-60 properties
      },
    }

    // Add a small delay to simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return NextResponse.json(simulatedResult)
  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json({ error: "Failed to process prediction" }, { status: 500 })
  }
}
