import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PropertyCardProps {
  address: string;
  city: string;
  bed: number;
  bath: number;
  garage: number;
  sqft: number;
  price: string;
  description: string;
  status: string;
}

export function PropertyCard({ address, city, bed, bath, garage, sqft, price, description, status }: PropertyCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="aspect-video bg-muted rounded-lg mb-4" />
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{address}</CardTitle>
          <Badge variant="secondary">{status}</Badge>
        </div>
        <CardDescription>
          <div>{city}</div>
          <div className="flex items-center gap-2 flex-wrap">
            <span>{bed} bed</span>
            <span>•</span>
            <span>{bath} bath</span>
            <span>•</span>
            <span>{garage} garage</span>
            <span>•</span>
            <span>{sqft} sqft</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold mb-2">{price}</p>
        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>
        <Button className="w-full">View Details</Button>
      </CardContent>
    </Card>
  )
} 