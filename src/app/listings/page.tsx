import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PropertyCard } from "@/components/PropertyCard"
import Link from "next/link"

const properties = [
  {
    id: 1,
    address: "67 Rome St",
    city: "San Francisco, CA",
    bed: 2,
    bath: 2,
    garage: 1,
    sqft: 1200,
    price: "$450,000",
    description: "Beautiful modern condo in the heart of downtown with stunning city views and luxury amenities. This recently renovated unit features an open-concept living space, floor-to-ceiling windows that flood the apartment with natural light, and a private balcony perfect for morning coffee. The building offers a state-of-the-art gym and a rooftop terrace.",
    status: "For Sale"
  },
  {
    id: 2,
    address: "123 Suburbia Ln",
    city: "Austin, TX",
    bed: 4,
    bath: 3,
    garage: 2,
    sqft: 2800,
    price: "$750,000",
    description: "Spacious family home with a large backyard, an updated kitchen with stainless steel appliances, and located in an excellent school district. The property boasts a gorgeous outdoor patio with a built-in grill, making it ideal for entertaining guests year-round. Inside, you'll find hardwood floors, a master suite with a walk-in closet, and a bonus room.",
    status: "For Sale"
  },
  {
    id: 3,
    address: "456 Luxury Ave",
    city: "Beverly Hills, CA",
    bed: 3,
    bath: 2.5,
    garage: 2,
    sqft: 2500,
    price: "$650,000",
    description: "Elegant townhouse with high-end finishes, an attached two-car garage, and exclusive community amenities. Located in a prestigious gated community, this home offers access to a private pool, tennis courts, and a clubhouse. The interior is designed with luxury in mind, featuring marble countertops and custom cabinetry.",
    status: "For Sale"
  },
  {
    id: 4,
    address: "789 Starter Rd",
    city: "Phoenix, AZ",
    bed: 2,
    bath: 1,
    garage: 1,
    sqft: 1100,
    price: "$320,000",
    description: "Perfect starter home with recent updates, a newly fenced yard, and a great location for first-time buyers. This charming property features a modernized kitchen, energy-efficient windows, and a cozy living area. It's an ideal opportunity to enter the housing market in a friendly, well-established neighborhood with parks and amenities nearby.",
    status: "For Sale"
  },
  {
    id: 5,
    address: "101 Waterfront Way",
    city: "Miami, FL",
    bed: 5,
    bath: 4,
    garage: 3,
    sqft: 4500,
    price: "$1,200,000",
    description: "Stunning waterfront estate with a private dock, panoramic ocean views, and luxury finishes throughout. This architectural masterpiece includes a gourmet kitchen, an infinity pool, a home theater, and a spacious master suite that opens directly to the water. Experience the ultimate in coastal living with unparalleled luxury and direct ocean access.",
    status: "For Sale"
  },
  {
    id: 6,
    address: "202 Investor Blvd",
    city: "New York, NY",
    bed: 6,
    bath: 6,
    garage: 0,
    sqft: 3500,
    price: "$850,000",
    description: "Excellent investment opportunity with steady rental income and strong appreciation potential in a prime location. This multi-unit building has been fully renovated with modern amenities in each apartment, attracting high-quality tenants. Its proximity to public transportation and a bustling commercial district ensures high demand and consistent returns.",
    status: "For Sale"
  }
];

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