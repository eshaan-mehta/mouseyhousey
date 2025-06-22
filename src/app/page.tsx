import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import Image from "next/image"
import { TrendingUp, Home as HomeIcon, Shield, Zap, Target, BarChart3, Users, Award, Eye, Brain, Lock } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center space-y-8">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="Mousey Housey Logo"
                  width={120}
                  height={120}
                  className="h-[120px] w-[120px]"
                />
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-green-500 text-white border-green-500 font-bold">
                    <Brain className="w-3 h-3 mr-1" />
                    AI
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                <span className="text-black">Don't Overpay for Your</span>
                <span className="text-green-500"> Dream Home</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
                Get AI-powered future value predictions to know if that listing price is actually worth it. 
                <span className="text-green-500 font-semibold"> Make smarter buying decisions.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <Link href="/listings">
                  <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg font-bold border-0">
                    <Target className="w-5 h-5 mr-2" />
                    Find Properties
                  </Button>
                </Link>
                <Link href="/predict">
                  <Button size="lg" variant="outline" className="border-2 border-green-500 text-green-500 hover:bg-green-50 px-8 py-3 text-lg font-bold">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Get Predictions
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Why Smart Buyers Choose Mousey Housey
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stop guessing and start making data-driven decisions with our advanced prediction technology
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg text-black">Future Value Predictions</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600">
                Get accurate 1, 3, and 5-year price forecasts using advanced machine learning models
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg text-black">Smart Investment Analysis</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600">
                Compare current prices with predicted values to identify undervalued opportunities
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg text-black">Market Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600">
                Access comprehensive market data and trends to understand local real estate dynamics
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg text-black">Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600">
                Understand potential risks and rewards before making your biggest investment
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 border-t border-gray-200 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get your property evaluation in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-black">Find Properties</h3>
              <p className="text-gray-600">
                Browse our curated selection of properties or search by location, price, and features
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-black">Get Predictions</h3>
              <p className="text-gray-600">
                Our AI analyzes market data to predict future property values and investment potential
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-black">Make Smart Decisions</h3>
              <p className="text-gray-600">
                Compare predictions with asking prices to identify the best investment opportunities
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make Smarter Home Buying Decisions?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of buyers who are using AI-powered predictions to find their perfect home at the right price
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/listings">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 text-lg font-bold">
                <HomeIcon className="w-5 h-5 mr-2" />
                Start Browsing
              </Button>
            </Link>
            <Link href="/predict">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg font-bold">
                <Zap className="w-5 h-5 mr-2" />
                Try Predictions
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Mousey Housey Logo"
              width={80}
              height={80}
              className="filter brightness-0 invert"
            />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-white">Mousey Housey</h3>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            Empowering home buyers with AI-powered property value predictions for smarter real estate decisions
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <span>© 2024 Mousey Housey</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  )
} 