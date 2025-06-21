import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface PropertyCardProps {
  id: number;
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

export function PropertyCard({ id, address, city, bed, bath, garage, sqft, price, description, status }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video">
        <Image
          src={`/images/${id}.jpg`}
          alt={`Image of ${address}, ${city}`}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{`${address}, ${city}`}</CardTitle>
          <Badge variant="secondary">{status}</Badge>
        </div>
        <CardDescription className="flex items-center gap-2 flex-wrap pt-1">
          <span>{bed} bed</span>
          <span>•</span>
          <span>{bath} bath</span>
          <span>•</span>
          <span>{garage} car</span>
          <span>•</span>
          <span>{sqft} sqft</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold mb-2">{price}</p>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 h-[2.7rem]">
          {description}
        </p>
        <Button className="w-full">View Details</Button>
      </CardContent>
    </Card>
  )
} 