"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface PropertyData {
  address: string
  propertyType: string
  bedrooms: string
  bathrooms: string
  squareFootage: string
  lotSize: string
  yearBuilt: string
  condition: string
  features: string
}

export default function PropertyForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<PropertyData>({
    address: "",
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    squareFootage: "",
    lotSize: "",
    yearBuilt: "",
    condition: "",
    features: "",
  })

  const handleInputChange = (field: keyof PropertyData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call to Flask backend
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        // Store result in sessionStorage for the results page
        sessionStorage.setItem("valuationResult", JSON.stringify(result))
        router.push("/results")
      } else {
        throw new Error("Failed to get valuation")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to get property valuation. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const loadSampleData = () => {
    const sampleData = {
      address: "123 Sunset Boulevard, Beverly Hills, CA 90210",
      propertyType: "single-family",
      bedrooms: "4",
      bathrooms: "3",
      squareFootage: "2800",
      lotSize: "8500",
      yearBuilt: "2010",
      condition: "good",
      features:
        "Swimming pool, 2-car garage, hardwood floors, granite countertops, stainless steel appliances, fireplace, updated HVAC system",
    }
    setFormData(sampleData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="address">Property Address</Label>
          <Input
            id="address"
            placeholder="123 Main St, City, State, ZIP"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="propertyType">Property Type</Label>
          <Select value={formData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single-family">Single Family Home</SelectItem>
              <SelectItem value="condo">Condominium</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="multi-family">Multi-Family</SelectItem>
              <SelectItem value="land">Land</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Select value={formData.bedrooms} onValueChange={(value) => handleInputChange("bedrooms", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select bedrooms" />
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

        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Select value={formData.bathrooms} onValueChange={(value) => handleInputChange("bathrooms", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select bathrooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="1.5">1.5</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="2.5">2.5</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="3.5">3.5</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="squareFootage">Square Footage</Label>
          <Input
            id="squareFootage"
            type="number"
            placeholder="2000"
            value={formData.squareFootage}
            onChange={(e) => handleInputChange("squareFootage", e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="lotSize">Lot Size (sq ft)</Label>
          <Input
            id="lotSize"
            type="number"
            placeholder="8000"
            value={formData.lotSize}
            onChange={(e) => handleInputChange("lotSize", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="yearBuilt">Year Built</Label>
          <Input
            id="yearBuilt"
            type="number"
            placeholder="2000"
            value={formData.yearBuilt}
            onChange={(e) => handleInputChange("yearBuilt", e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="condition">Property Condition</Label>
          <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="features">Additional Features</Label>
          <Textarea
            id="features"
            placeholder="Pool, garage, fireplace, updated kitchen, etc."
            value={formData.features}
            onChange={(e) => handleInputChange("features", e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={loadSampleData} className="flex-1">
          Load Sample Data
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Property...
            </>
          ) : (
            "Get Property Valuation"
          )}
        </Button>
      </div>
    </form>
  )
}
