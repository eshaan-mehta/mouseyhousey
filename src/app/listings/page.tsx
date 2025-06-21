"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PropertyCard } from "@/components/PropertyCard"
import Link from "next/link"
import { getProperties, fallbackProperties } from "@/lib/data"
import { useEffect, useState } from "react"
import { Property } from "@/types/property"

interface FilterState {
  location: string
  minPrice: string
  maxPrice: string
  minBeds: string
  maxBeds: string
  minBaths: string
  maxBaths: string
  minGarage: string
  maxGarage: string
  propertyType: string
}

export default function ListingsPage() {
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    location: '',
    minPrice: '',
    maxPrice: '',
    minBeds: '',
    maxBeds: '',
    minBaths: '',
    maxBaths: '',
    minGarage: '',
    maxGarage: '',
    propertyType: ''
  })

  useEffect(() => {
    async function loadProperties() {
      try {
        const data = await getProperties()
        const propertiesToUse = data.length > 0 ? data : fallbackProperties
        setAllProperties(propertiesToUse)
        setFilteredProperties(propertiesToUse)
      } catch (error) {
        console.error('Error loading properties:', error)
        setAllProperties(fallbackProperties)
        setFilteredProperties(fallbackProperties)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [])

  // Apply filters whenever filters state changes
  useEffect(() => {
    applyFilters()
  }, [filters, allProperties])

  const applyFilters = () => {
    let filtered = [...allProperties]

    // Filter by location (address or zipcode)
    if (filters.location) {
      const locationLower = filters.location.toLowerCase()
      filtered = filtered.filter(property => 
        property.address.toLowerCase().includes(locationLower) ||
        property.zipcode.toLowerCase().includes(locationLower)
      )
    }

    // Filter by price range
    if (filters.minPrice) {
      const minPrice = parseInt(filters.minPrice.replace(/[$,]/g, ''))
      filtered = filtered.filter(property => {
        const propertyPrice = parseInt(property.price.replace(/[$,]/g, ''))
        return propertyPrice >= minPrice
      })
    }

    if (filters.maxPrice) {
      const maxPrice = parseInt(filters.maxPrice.replace(/[$,]/g, ''))
      filtered = filtered.filter(property => {
        const propertyPrice = parseInt(property.price.replace(/[$,]/g, ''))
        return propertyPrice <= maxPrice
      })
    }

    // Filter by beds range
    if (filters.minBeds) {
      const minBeds = parseInt(filters.minBeds)
      filtered = filtered.filter(property => parseInt(property.beds) >= minBeds)
    }

    if (filters.maxBeds) {
      const maxBeds = parseInt(filters.maxBeds)
      filtered = filtered.filter(property => parseInt(property.beds) <= maxBeds)
    }

    // Filter by baths range
    if (filters.minBaths) {
      const minBaths = parseFloat(filters.minBaths)
      filtered = filtered.filter(property => parseFloat(property.baths) >= minBaths)
    }

    if (filters.maxBaths) {
      const maxBaths = parseFloat(filters.maxBaths)
      filtered = filtered.filter(property => parseFloat(property.baths) <= maxBaths)
    }

    // Filter by garage range
    if (filters.minGarage) {
      const minGarage = parseInt(filters.minGarage)
      filtered = filtered.filter(property => parseInt(property.garage) >= minGarage)
    }

    if (filters.maxGarage) {
      const maxGarage = parseInt(filters.maxGarage)
      filtered = filtered.filter(property => parseInt(property.garage) <= maxGarage)
    }

    // Filter by property type (for now, we'll assume all are houses since we don't have this data)
    // This can be enhanced when property type data is available
    if (filters.propertyType) {
      // For now, we'll skip this filter since we don't have property type in our data
      // filtered = filtered.filter(property => property.propertyType === filters.propertyType)
    }

    setFilteredProperties(filtered)
  }

  const clearFilters = () => {
    setFilters({
      location: '',
      minPrice: '',
      maxPrice: '',
      minBeds: '',
      maxBeds: '',
      minBaths: '',
      maxBaths: '',
      minGarage: '',
      maxGarage: '',
      propertyType: ''
    })
  }

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading properties...</h2>
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
            <Link href="/">
              <h1 className="text-2xl font-bold">Mousey Housey</h1>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Find Your Dream Home</h2>
          
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Search Properties</CardTitle>
                  <CardDescription>
                    Enter your criteria to find the perfect property
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Location and Property Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      placeholder="City, State, or ZIP" 
                      value={filters.location}
                      onChange={(e) => updateFilter('location', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select value={filters.propertyType} onValueChange={(value) => updateFilter('propertyType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <Label className="text-base font-medium">Price Range</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="minPrice" className="text-sm">Min Price</Label>
                      <Input 
                        id="minPrice" 
                        placeholder="$100,000" 
                        value={filters.minPrice}
                        onChange={(e) => updateFilter('minPrice', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxPrice" className="text-sm">Max Price</Label>
                      <Input 
                        id="maxPrice" 
                        placeholder="$1,000,000" 
                        value={filters.maxPrice}
                        onChange={(e) => updateFilter('maxPrice', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Beds Range */}
                <div>
                  <Label className="text-base font-medium">Bedrooms</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="minBeds" className="text-sm">Min Beds</Label>
                      <Select value={filters.minBeds} onValueChange={(value) => updateFilter('minBeds', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1+</SelectItem>
                          <SelectItem value="2">2+</SelectItem>
                          <SelectItem value="3">3+</SelectItem>
                          <SelectItem value="4">4+</SelectItem>
                          <SelectItem value="5">5+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="maxBeds" className="text-sm">Max Beds</Label>
                      <Select value={filters.maxBeds} onValueChange={(value) => updateFilter('maxBeds', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Baths Range */}
                <div>
                  <Label className="text-base font-medium">Bathrooms</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="minBaths" className="text-sm">Min Baths</Label>
                      <Select value={filters.minBaths} onValueChange={(value) => updateFilter('minBaths', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1+</SelectItem>
                          <SelectItem value="1.5">1.5+</SelectItem>
                          <SelectItem value="2">2+</SelectItem>
                          <SelectItem value="2.5">2.5+</SelectItem>
                          <SelectItem value="3">3+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="maxBaths" className="text-sm">Max Baths</Label>
                      <Select value={filters.maxBaths} onValueChange={(value) => updateFilter('maxBaths', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="1.5">1.5</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="2.5">2.5</SelectItem>
                          <SelectItem value="3">3+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Garage Range */}
                <div>
                  <Label className="text-base font-medium">Garage Spaces</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="minGarage" className="text-sm">Min Garage</Label>
                      <Select value={filters.minGarage} onValueChange={(value) => updateFilter('minGarage', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0+</SelectItem>
                          <SelectItem value="1">1+</SelectItem>
                          <SelectItem value="2">2+</SelectItem>
                          <SelectItem value="3">3+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="maxGarage" className="text-sm">Max Garage</Label>
                      <Select value={filters.maxGarage} onValueChange={(value) => updateFilter('maxGarage', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} Found
          </h3>
          {filteredProperties.length !== allProperties.length && (
            <p className="text-sm text-muted-foreground">
              Showing filtered results from {allProperties.length} total properties
            </p>
          )}
        </div>
        
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria to find more properties.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 