"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { PropertyCard } from "@/components/PropertyCard"
import Link from "next/link"
import Image from "next/image"
import { getProperties } from "@/lib/data"
import { useEffect, useState } from "react"
import { Property } from "@/types/property"
import { Filter, Loader2 } from "lucide-react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

interface FilterState {
  location: string
  minPrice: string
  maxPrice: string
  minBeds: string
  minBaths: string
  minGarage: string
  propertyType: string
}

export default function ListingsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    location: '',
    minPrice: '',
    maxPrice: '10000000',
    minBeds: '',
    minBaths: '',
    minGarage: '',
    propertyType: ''
  })

  useEffect(() => {
    async function loadProperties() {
      try {
        const data = await getProperties()
        setAllProperties(data)
        setFilteredProperties(data)
      } catch (error) {
        console.error('Error loading properties:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [])

  // Update URL when filters change
  const updateURL = (newFilters: FilterState) => {
    const params = new URLSearchParams()
    
    if (newFilters.location) params.append('location', newFilters.location)
    if (newFilters.propertyType) params.append('propertyType', newFilters.propertyType)
    if (newFilters.minPrice) params.append('minPrice', newFilters.minPrice)
    if (newFilters.maxPrice && newFilters.maxPrice !== '10000000') params.append('maxPrice', newFilters.maxPrice)
    if (newFilters.minBeds) params.append('minBeds', newFilters.minBeds)
    if (newFilters.minBaths) params.append('minBaths', newFilters.minBaths)
    if (newFilters.minGarage) params.append('minGarage', newFilters.minGarage)
    
    const queryString = params.toString()
    const newURL = queryString ? `${pathname}?${queryString}` : pathname
    
    // Update URL without causing a page reload
    router.replace(newURL, { scroll: false })
  }

  // Handle URL parameters from homepage search or direct navigation
  useEffect(() => {
    const location = searchParams.get('location') || ''
    const propertyType = searchParams.get('propertyType') || ''
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || '10000000'
    const minBeds = searchParams.get('minBeds') || ''
    const minBaths = searchParams.get('minBaths') || ''
    const minGarage = searchParams.get('minGarage') || ''

    const newFilters = {
      location,
      propertyType,
      minPrice,
      maxPrice,
      minBeds,
      minBaths,
      minGarage
    }
    
    setFilters(newFilters)
    
    // Save to localStorage for backup
    if (location || propertyType || minPrice || maxPrice !== '10000000' || minBeds || minBaths || minGarage) {
      localStorage.setItem('mouseyhousey-filters', JSON.stringify(newFilters))
    }
  }, [searchParams])

  // Update URL when filters change (but not on initial load)
  useEffect(() => {
    // Skip the first render to avoid overriding URL params
    const timeoutId = setTimeout(() => {
      updateURL(filters)
    }, 0)
    
    return () => clearTimeout(timeoutId)
  }, [filters])

  const clearFilters = () => {
    const defaultFilters = {
      location: '',
      minPrice: '',
      maxPrice: '1000000',
      minBeds: '',
      minBaths: '',
      minGarage: '',
      propertyType: ''
    }
    setFilters(defaultFilters)
    localStorage.removeItem('mouseyhousey-filters')
    // Clear URL parameters
    router.replace(pathname, { scroll: false })
  }

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
    if (filters.minPrice && filters.minPrice !== '') {
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

    // Filter by baths range
    if (filters.minBaths) {
      const minBaths = parseFloat(filters.minBaths)
      filtered = filtered.filter(property => parseFloat(property.baths) >= minBaths)
    }

    // Filter by garage range
    if (filters.minGarage) {
      const minGarage = parseInt(filters.minGarage)
      filtered = filtered.filter(property => parseInt(property.garage) >= minGarage)
    }

    // Filter by property type
    if (filters.propertyType) {
      filtered = filtered.filter(property => 
        property.property_type.toLowerCase() === filters.propertyType.toLowerCase()
      )
    }

    setFilteredProperties(filtered)
  }

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin mx-auto text-muted-foreground" />
          <p className="text-lg text-muted-foreground">Loading...</p>
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

      {/* Search Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center">Properties In This Area</h2>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} Found
          </h3>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <SheetHeader>
                <SheetTitle>Filter Properties</SheetTitle>
                <SheetDescription>
                  Enter your criteria to find the perfect property
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto py-4">
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
                          <SelectItem value="townhouse">Townhouse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <Label className="text-base font-medium">Price Range</Label>
                    <div className="space-y-4 mt-2">
                      <div className="text-sm text-muted-foreground">
                        <span>
                          ${filters.minPrice ? parseInt(filters.minPrice).toLocaleString() : '0'} - ${filters.maxPrice ? parseInt(filters.maxPrice).toLocaleString() : '1,000,000'}
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <Label htmlFor="minPrice" className="text-sm">Min Price</Label>
                          <Slider
                            id="minPrice"
                            min={0}
                            max={10000000}
                            step={100000}
                            value={[filters.minPrice ? parseInt(filters.minPrice) : 0]}
                            onValueChange={(value) => {
                              const newMinPrice = value[0]
                              const currentMaxPrice = filters.maxPrice ? parseInt(filters.maxPrice) : 1000000
                              if (newMinPrice <= currentMaxPrice) {
                                updateFilter('minPrice', newMinPrice.toString())
                              }
                            }}
                            className="w-full pt-4"
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="maxPrice" className="text-sm">Max Price</Label>
                          <Slider
                            id="maxPrice"
                            min={0}
                            max={10000000}
                            step={100000}
                            value={[filters.maxPrice ? parseInt(filters.maxPrice) : 10000000]}
                            onValueChange={(value) => {
                              const newMaxPrice = value[0]
                              const currentMinPrice = filters.minPrice ? parseInt(filters.minPrice) : 0
                              if (newMaxPrice >= currentMinPrice) {
                                updateFilter('maxPrice', newMaxPrice.toString())
                              }
                            }}
                            className="w-full pt-4"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Beds, Baths, and Garage in one line */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="minBeds" className="text-base font-medium">Bedrooms</Label>
                      <Select value={filters.minBeds} onValueChange={(value) => updateFilter('minBeds', value)}>
                        <SelectTrigger id="minBeds">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="minBaths" className="text-base font-medium">Bathrooms</Label>
                      <Select value={filters.minBaths} onValueChange={(value) => updateFilter('minBaths', value)}>
                        <SelectTrigger id="minBaths">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="1.5">1.5</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="2.5">2.5</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="minGarage" className="text-base font-medium">Car</Label>
                      <Select value={filters.minGarage} onValueChange={(value) => updateFilter('minGarage', value)}>
                        <SelectTrigger id="minGarage">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t p-4">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
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
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
            {filteredProperties.map((property, index) => (
              <div 
                key={property.id} 
                className="break-inside-avoid mb-6"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <PropertyCard {...property} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 