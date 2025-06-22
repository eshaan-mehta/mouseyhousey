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
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-none pb-4">
              Mousey Housey
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-muted-foreground leading-loose pb-2">
              Uncovering Hidden Truths in the Housing Market
            </h2>
            {/* <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              While platforms like Zillow only show you listings, Mousey Housey reveals whether a home is fairly priced, using predictive models, listing quality scores, and quantum-level price refinement.
            </p> */}
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
                  className="rounded-lg px-6 py-4"
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
                      <Search className="h-5 w-5" />
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
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why First-Time Buyers Choose Mousey Housey</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            First-time homebuyers are overwhelmed, wary of agent bias, and afraid to overpay. We provide the tools you need to make confident decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 min-h-[280px]">
            <CardHeader className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <Building2 className="h-20 w-20 text-muted-foreground opacity-80" />
              </div>
              <CardTitle className="text-xl mb-4">Fair Price Predictions</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                LSTM-trained regional models forecast accurate property values based on historical data and market trends.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 min-h-[280px]">
            <CardHeader className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <HomeIcon className="h-20 w-20 text-muted-foreground opacity-80" />
              </div>
              <CardTitle className="text-xl mb-4">Quality Scoring</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                We use Gemini (LLM) to evaluate listing descriptions and generate property-specific quality scores.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 min-h-[280px]">
            <CardHeader className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <Building className="h-20 w-20 text-muted-foreground opacity-80" />
              </div>
              <CardTitle className="text-xl mb-4">Quantum Adjustment</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Our quantum variational regressor corrects for semantic pricing mismatches in real-time.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 min-h-[280px]">
            <CardHeader className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <DollarSign className="h-20 w-20 text-muted-foreground opacity-80" />
              </div>
              <CardTitle className="text-xl mb-4">Clear Deal Score</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Every listing is tagged as Overpriced, Fair, or Undervalued—with concise, understandable reasoning.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Find Your Perfect Home?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start your journey with Mousey Housey and make data-driven decisions for your first home purchase.
            </p>
            <Button 
              size="lg" 
              className="mt-8"
              onClick={() => window.location.href = '/listings'}
            >
              Browse Listings
            </Button>
          </div>
        </div>
      </div>

      {/* Rolling News Ticker */}
      <div className="fixed bottom-0 left-0 right-0 bg-black text-white overflow-hidden z-50">
        <div className="flex items-center bg-black px-4 py-3">
          <div className="flex-1 overflow-hidden">
            <div className="animate-scroll flex whitespace-nowrap">
              <span className="inline-block mr-8 text-base">
                U.S. builders slash prices as mortgage rates flirt with 7%; home-builder sentiment hits a 2½-year low. reuters.com
              </span>
              <span className="inline-block mr-8 text-base">
                Canadian home sales bounce 3.6% in May, but the national benchmark price stays flat and is still 3.5% below last year. reuters.com
              </span>
              <span className="inline-block mr-8 text-base">
                UK house prices expected to climb 2–4% this year as the Bank of England prepares rate cuts, Reuters poll finds.
              </span>
              <span className="inline-block mr-8 text-base">
                U.S. builders slash prices as mortgage rates flirt with 7%; home-builder sentiment hits a 2½-year low. reuters.com
              </span>
              <span className="inline-block mr-8 text-base">
                Canadian home sales bounce 3.6% in May, but the national benchmark price stays flat and is still 3.5% below last year. reuters.com
              </span>
              <span className="inline-block mr-8 text-base">
                UK house prices expected to climb 2–4% this year as the Bank of England prepares rate cuts, Reuters poll finds.
              </span>
              <span className="inline-block mr-8 text-base">
                U.S. builders slash prices as mortgage rates flirt with 7%; home-builder sentiment hits a 2½-year low. reuters.com
              </span>
              <span className="inline-block mr-8 text-base">
                Canadian home sales bounce 3.6% in May, but the national benchmark price stays flat and is still 3.5% below last year. reuters.com
              </span>
              <span className="inline-block mr-8 text-base">
                UK house prices expected to climb 2–4% this year as the Bank of England prepares rate cuts, Reuters poll finds.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 