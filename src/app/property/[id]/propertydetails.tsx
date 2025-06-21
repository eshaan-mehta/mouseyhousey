"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, MapPin, Bed, Bath, Car, Square, DollarSign, Calendar } from "lucide-react"
import { Property } from "@/types/property"
import { properties, getImageFilename } from "@/lib/data"

export default function PropertyDetails({ params }: { params: { id: string } }) {
  // Find the property directly without useState/useEffect
  console.log('PropertyDetails: Looking for property with ID:', params.id, 'Type:', typeof params.id)
  console.log('PropertyDetails: Available properties:', properties.map(p => ({ id: p.id, type: typeof p.id, address: p.address })))
  
  const propertyDetails = properties.find(p => p.id === params.id)
  
  console.log('PropertyDetails: Found property:', propertyDetails)

  if (!propertyDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
          <p className="text-sm text-gray-500 mb-4">ID: {params.id}</p>
          <p className="text-sm text-gray-500 mb-4">Available IDs: {properties.map(p => p.id).join(', ')}</p>
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
                  src={`/images/${getImageFilename(propertyDetails.address)}`}
                  alt={`Image of ${propertyDetails.address}, ${propertyDetails.city}`}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Additional Images Grid (if available) */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((imgNum) => (
                  <div key={imgNum} className="relative aspect-square rounded-md overflow-hidden bg-gray-200">
                    <Image
                      src={`/images/${getImageFilename(propertyDetails.address)}`}
                      alt={`Additional view ${imgNum}`}
                      fill
                      className="object-cover opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
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
                    {propertyDetails.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Property ID: {propertyDetails.id}</span>
                </div>
                <h1 className="text-3xl font-bold mb-2">{propertyDetails.address}</h1>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{propertyDetails.city}</span>
                  {propertyDetails.zipcode && (
                    <>
                      <span>•</span>
                      <span>{propertyDetails.zipcode}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="bg-primary/5 p-6 rounded-lg">
                <div className="flex items-baseline gap-2">
                  <DollarSign className="h-6 w-6 text-primary" />
                  <span className="text-4xl font-bold text-primary">{propertyDetails.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Estimated monthly payment: $2,450</p>
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
                        <p className="font-medium">{propertyDetails.bed}</p>
                        <p className="text-sm text-muted-foreground">Bedrooms</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Bath className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{propertyDetails.bath}</p>
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
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Square className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{propertyDetails.sqft.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Square Feet</p>
                      </div>
                    </div>
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
                      <span className="font-medium">Condominium</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Year Built</span>
                      <span className="font-medium">2015</span>
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

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button className="flex-1" size="lg">
                  Schedule Viewing
                </Button>
                <Button variant="outline" size="lg">
                  Contact Agent
                </Button>
              </div>

              {/* Additional Info */}
              <div className="text-center text-sm text-muted-foreground">
                <p>Last updated: <Calendar className="inline h-3 w-3 mr-1" />Today</p>
                <p className="mt-1">MLS#: SF123456</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 