"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { useState } from "react"
import { Search, MapPin, Home as HomeIcon, Building2, Building, DollarSign, Loader2 } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

export default function Home() {
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    minBeds: '',
    minBaths: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = () => {
    setIsLoading(true)
    
    const params = new URLSearchParams()
    if (searchFilters.location) params.append('location', searchFilters.location)
    if (searchFilters.propertyType) params.append('propertyType', searchFilters.propertyType)
    if (searchFilters.minPrice) params.append('minPrice', searchFilters.minPrice)
    if (searchFilters.maxPrice) params.append('maxPrice', searchFilters.maxPrice)
    if (searchFilters.minBeds) params.append('minBeds', searchFilters.minBeds)
    if (searchFilters.minBaths) params.append('minBaths', searchFilters.minBaths)
    
    const queryString = params.toString()
    window.location.href = `/listings${queryString ? `?${queryString}` : ''}`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Mousey Housey Logo"
                width={120}
                height={120}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-xl"></div>
            </div>
          </div>

          {/* Main Title */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-none pb-1">
              Mousey Housey
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-muted-foreground leading-loose pb-2">
              Uncovering Mispricings in the Housing Market
            </h2>
          </div>
          
          {/* Search Section */}
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Main Search Bar */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-lg border">
                <MapPin className="h-6 w-6 text-muted-foreground ml-4" />
                <Input 
                  placeholder="Search by ZIP code, address, or city..."
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg py-6"
                  value={searchFilters.location}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
                />
                <Button 
                  size="lg" 
                  className="rounded-xl px-6 py-4"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-1 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-1" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Optional Filters */}
            <div className="flex flex-wrap gap-4">
              {/* Property Type */}
              <div className="relative flex-1 min-w-[200px]">
                <Select value={searchFilters.propertyType} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, propertyType: value }))}>
                  <SelectTrigger className="h-12 rounded-lg border bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Min Price Slider */}
              <div className="relative flex-1 min-w-[200px]">
                <Label htmlFor="minPrice" className="text-sm mb-2 block">Min Price</Label>
                <Slider
                  id="minPrice"
                  min={0}
                  max={10000000}
                  step={100000}
                  value={[searchFilters.minPrice ? parseInt(searchFilters.minPrice) : 0]}
                  onValueChange={(value) => {
                    const newMinPrice = value[0]
                    const currentMaxPrice = searchFilters.maxPrice ? parseInt(searchFilters.maxPrice) : 10000000
                    if (newMinPrice <= currentMaxPrice) {
                      setSearchFilters(prev => ({ ...prev, minPrice: newMinPrice.toString() }))
                    }
                  }}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  ${searchFilters.minPrice ? parseInt(searchFilters.minPrice).toLocaleString() : '0'}
                </div>
              </div>

              {/* Max Price Slider */}
              <div className="relative flex-1 min-w-[200px]">
                <Label htmlFor="maxPrice" className="text-sm mb-2 block">Max Price</Label>
                <Slider
                  id="maxPrice"
                  min={0}
                  max={10000000}
                  step={100000}
                  value={[searchFilters.maxPrice ? parseInt(searchFilters.maxPrice) : 10000000]}
                  onValueChange={(value) => {
                    const newMaxPrice = value[0]
                    const currentMinPrice = searchFilters.minPrice ? parseInt(searchFilters.minPrice) : 0
                    if (newMaxPrice >= currentMinPrice) {
                      setSearchFilters(prev => ({ ...prev, maxPrice: newMaxPrice.toString() }))
                    }
                  }}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  ${searchFilters.maxPrice ? parseInt(searchFilters.maxPrice).toLocaleString() : '10,000,000'}
                </div>
              </div>

              {/* Min Beds */}
              <div className="relative flex-1 min-w-[200px]">
                <Select value={searchFilters.minBeds} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, minBeds: value }))}>
                  <SelectTrigger className="h-12 rounded-lg border bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors">
                    <SelectValue placeholder="Min Beds" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1+ Bed</SelectItem>
                    <SelectItem value="2">2+ Beds</SelectItem>
                    <SelectItem value="3">3+ Beds</SelectItem>
                    <SelectItem value="4">4+ Beds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex justify-center items-center gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-muted-foreground">Properties</div>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">98%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Mousey Housey?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Advanced technology meets real estate expertise to deliver the most accurate property insights and investment opportunities.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Smart Search</CardTitle>
              <CardDescription>
                Advanced filtering and AI-powered search capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our intelligent search engine helps you discover properties that match your exact criteria with unprecedented accuracy.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-4">
                <HomeIcon className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Investment Insights</CardTitle>
              <CardDescription>
                Data-driven analysis for informed investment decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get detailed market analysis, price predictions, and investment potential for every property listing.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Market Intelligence</CardTitle>
              <CardDescription>
                Real-time market data and trend analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Stay ahead with comprehensive market insights, neighborhood analysis, and future value projections.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 