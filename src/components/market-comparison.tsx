import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MarketComparisonProps {
  estimatedValue: number
  marketAverage: number
  comparables: Array<{
    address: string
    price: number
    sqft: number
    distance: number
  }>
}

export default function MarketComparison({ estimatedValue, marketAverage, comparables }: MarketComparisonProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparable Properties</CardTitle>
        <CardDescription>Recent sales in your area used for valuation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comparables.map((comp, index) => (
            <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-sm">{comp.address}</div>
                <div className="text-xs text-gray-600">
                  {comp.sqft.toLocaleString()} sq ft • {comp.distance} miles away
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatCurrency(comp.price)}</div>
                <div className="text-xs text-gray-600">${Math.round(comp.price / comp.sqft)}/sq ft</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">Your Property Estimate</span>
            <span className="font-bold text-green-600">{formatCurrency(estimatedValue)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">Area Average</span>
            <span className="text-sm">{formatCurrency(marketAverage)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
