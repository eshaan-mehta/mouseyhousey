"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { Property } from "@/types/property"

export function PropertyCard({ id, address, beds, baths, garage, sqft, price, description, image }: Property) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-gray-200">
        <Image
          src={image}
          alt={`Image of ${address}`}
          fill
          className="object-cover"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.jpg";
          }}
        />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{address}</CardTitle>
          <Badge variant="secondary">For Sale</Badge>
        </div>
        <CardDescription className="flex items-center gap-2 flex-wrap pt-1">
          <span>{beds} bed</span>
          <span>•</span>
          <span>{baths} bath</span>
          <span>•</span>
          <span>{garage} car</span>
          {sqft && (
            <>
              <span>•</span>
              <span>{sqft} sqft</span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold mb-2">{price}</p>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 h-[2.7rem]">
          {description}
        </p>
        <Link href={`/property/${id}`}>
          <Button className="w-full">View Details</Button>
        </Link>
      </CardContent>
    </Card>
  )
} 