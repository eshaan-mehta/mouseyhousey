import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold tracking-tight">
            Mousey Housey
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your trusted partner in finding the perfect home. Discover properties that match your lifestyle and budget with our innovative real estate platform.
          </p>
          
          <div className="flex gap-4 justify-center mt-8">
            <Link href="/listings">
              <Button size="lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Separator />

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Smart Search</CardTitle>
              <CardDescription>
                Find your dream home with advanced filtering and search capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our intelligent search engine helps you discover properties that match your exact criteria, from location to amenities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trusted Partners</CardTitle>
              <CardDescription>
                Work with verified real estate professionals and trusted agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Connect with experienced agents who understand your needs and guide you through every step of the home-buying process.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secure Platform</CardTitle>
              <CardDescription>
                Your data and transactions are protected with enterprise-grade security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Rest easy knowing your personal information and financial data are safeguarded with the highest security standards.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 