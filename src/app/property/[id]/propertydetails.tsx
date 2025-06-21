"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, MapPin, Bed, Bath, Car, Square, DollarSign, Calendar } from "lucide-react"
import { Property } from "@/types/property"
import { getProperties, fallbackProperties } from "@/lib/data"
import { useEffect, useState } from "react"

export default function PropertyDetails({ params }: { params: { id: string } }) {
  const [propertyDetails, setPropertyDetails] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProperty() {
      try {
        const properties = await getProperties().catch(() => fallbackProperties)
        const property = properties.find(p => p.id === params.id)
        setPropertyDetails(property || null)
      } catch (error) {
        console.error('Error loading property:', error)
        setPropertyDetails(null)
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      </div>
    )
  }

  if (!propertyDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
          <p className="text-sm text-gray-500 mb-4">ID: {params.id}</p>
          <Link href="/listings">
            <Button>Back to Listings</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/listings" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Listings
            </Link>
            <Link href="/">
              <h1 className="text-2xl font-bold">Mousey Housey</h1>
            </Link>
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Side - Large Image */}
            <div className="space-y-4">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-lg bg-gray-200">
                <Image
                  src={propertyDetails.image}
                  alt={`Image of ${propertyDetails.address}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.jpg";
                  }}
                />
              </div>
              
              {/* Additional Images Grid (if available) */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((imgNum) => (
                  <div key={imgNum} className="relative aspect-square rounded-md overflow-hidden bg-gray-200">
                    <Image
                      src={propertyDetails.image}
                      alt={`Additional view ${imgNum}`}
                      fill
                      className="object-cover opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.jpg";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Property Details */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-sm">
                    For Sale
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold mb-2">{propertyDetails.address}</h1>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{propertyDetails.zipcode}</span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-primary/5 p-6 rounded-lg">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary">{propertyDetails.price}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-muted-foreground">
                    {propertyDetails.sqft && propertyDetails.sqft !== "0" && propertyDetails.sqft !== ""
                      ? `$${Math.round(parseInt(propertyDetails.price.replace(/[$,]/g, '')) / parseInt(propertyDetails.sqft))} per sq ft`
                      : "Price per sq ft: N/A"}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Active Listing</span>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Property Features</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Bed className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{propertyDetails.beds}</p>
                        <p className="text-sm text-muted-foreground">Bedrooms</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Bath className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{propertyDetails.baths}</p>
                        <p className="text-sm text-muted-foreground">Bathrooms</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Car className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{propertyDetails.garage}</p>
                        <p className="text-sm text-muted-foreground">Garage Spaces</p>
                      </div>
                    </div>
                    {propertyDetails.sqft && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Square className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{propertyDetails.sqft}</p>
                          <p className="text-sm text-muted-foreground">Square Feet</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {propertyDetails.description}
                  </p>
                </CardContent>
              </Card>

              {/* Property Details */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Property Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Property Type</span>
                      <span className="font-medium">Single Family</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Year Built</span>
                      <span className="font-medium">N/A</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lot Size</span>
                      <span className="font-medium">N/A</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Days on Market</span>
                      <span className="font-medium">15</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Agent
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Contact Agent</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">JD</span>
                      </div>
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-sm text-muted-foreground">Real Estate Agent</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button className="w-full">Call Agent</Button>
                      <Button variant="outline" className="w-full">Email Agent</Button>
                    </div>
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 