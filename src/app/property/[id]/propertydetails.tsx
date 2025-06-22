"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PriceTrendChart } from "@/components/price-trend-chart"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, MapPin, Bed, Bath, Car, Square, DollarSign, Calendar } from "lucide-react"
import { Property } from "@/types/property"
import { getProperties } from "@/lib/data"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function PropertyDetails({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [propertyDetails, setPropertyDetails] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)

  const handleBackToListings = () => {
    // Use browser back if possible, otherwise go to listings
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/listings')
    }
  }

  useEffect(() => {
    async function loadProperty() {
      try {
        const properties = await getProperties()
        const property = properties.find((p: Property) => p.id === params.id)
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
          <Button onClick={handleBackToListings}>Back to Listings</Button>
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
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Mousey Housey Logo"
                width={40}
                height={40}
              />
              {/* <h1 className="text-2xl font-bold">Mousey Housey</h1> */}
            </Link>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <button 
          onClick={handleBackToListings}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </button>
      </div>

      {/* Property Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="space-y-8">
            
            {/* Top Section - Image and Property Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Side - Large Image */}
              <div className="space-y-4 overflow-hidden rounded-lg">
                <div className="relative aspect-[4/3] rounded-lg shadow-lg bg-gray-200 hover:scale-[1.025] transition-all duration-300">
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
              </div>

              {/* Right Side - Property Details */}
              <div className="space-y-6">
                {/* Header */}
                <div className="animate-slide-up">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-sm capitalize">
                      {propertyDetails.property_type}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{propertyDetails.address}</h1>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{propertyDetails.zipcode}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-primary/5 p-6 rounded-lg animate-slide-up">
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
                      <div className={`w-2 h-2 rounded-full ${
                        propertyDetails.sale_type === 'Sale' ? 'bg-green-500' : 
                        propertyDetails.sale_type === 'Rental' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-sm font-medium text-muted-foreground capitalize">
                        {"For " + propertyDetails.sale_type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Features */}
                <Card className="animate-slide-up">
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
              </div>
            </div>
                      
            {/* Description - Full Width Below */}
            <Card className="border-none shadow-none animate-slide-up">
              <CardContent className="p-6">
                <h3 className="text-3xl font-semibold mb-4 flex justify-center">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {propertyDetails.description}
                </p>
              </CardContent>
            </Card>

            {/* Price Trend Chart */}
            <div className="animate-slide-up">
              <PriceTrendChart 
                currentPrice={propertyDetails.price}
                zipCode={propertyDetails.zipcode}
                score={propertyDetails.score}
                index={propertyDetails.index}
                property={propertyDetails}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  )
} 
