import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PropertyCard } from "@/components/PropertyCard"
import Link from "next/link"
import { properties } from "@/lib/data"

// Debug: Log the properties array
console.log('Listings page - properties loaded:', properties.length, 'properties')

export default function ListingsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold">Mousey Housey</h1>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Find Your Dream Home</h2>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search Properties</CardTitle>
              <CardDescription>
                Enter your criteria to find the perfect property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="City, State, or ZIP" />
                </div>
                <div>
                  <Label htmlFor="price">Max Price</Label>
                  <Input id="price" placeholder="$500,000" />
                </div>
                <div>
                  <Label htmlFor="type">Property Type</Label>
                  <Input id="type" placeholder="House, Condo, Townhouse" />
                </div>
              </div>
              <Button className="mt-4 w-full md:w-auto">
                Search Properties
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property, index) => (
            <PropertyCard key={index} {...property} />
          ))}
        </div>
      </div>
    </div>
  )
} 