import { Property } from "@/types/property"

export const properties: Property[] = [
  {
    id: "1",
    address: "2203 N Riverside Dr",
    city: "Tampa, FL",
    bed: 0,
    bath: 0,
    garage: 0,
    sqft: 0,
    price: "$1,600,000",
    description: "Land property available for development. This prime location offers excellent potential for building your dream home or investment property. Located in a desirable Tampa neighborhood with convenient access to amenities.",
    status: "For Sale",
    zipcode: "33601"
  },
  {
    id: "2",
    address: "2205 N Riverside Dr",
    city: "Tampa, FL",
    bed: 4,
    bath: 2,
    garage: 0,
    sqft: 1905,
    price: "$1,600,000",
    description: "Beautiful single family residence built in 1964 with 4 bedrooms and 2 bathrooms. Features 1905 sqft of living space with an average price per sqft of $839. This well-maintained home includes a garage and is located in a prime Tampa location.",
    status: "For Sale",
    zipcode: "33601"
  },
  {
    id: "3",
    address: "1031 Andrew Aviles Cir",
    city: "Tampa, FL",
    bed: 3,
    bath: 3,
    garage: 0,
    sqft: 1832,
    price: "$315,000",
    description: "Charming townhouse built in 2005 with 3 bedrooms and 3 bathrooms. Features 1832 sqft of living space with an average price per sqft of $171. Includes a garage and is located in the Alexandria Place community.",
    status: "For Sale",
    zipcode: "33601"
  },
  {
    id: "4",
    address: "2 S Treasure Dr",
    city: "Tampa, FL",
    bed: 3,
    bath: 3,
    garage: 0,
    sqft: 1984,
    price: "$999,400",
    description: "Historic single family residence built in 1950 with 3 bedrooms and 3 bathrooms. Features 1984 sqft of living space with an average price per sqft of $503. Located in the prestigious Bayshore Estates neighborhood.",
    status: "For Sale",
    zipcode: "33601"
  },
  {
    id: "5",
    address: "711 S Bungalow Ter",
    city: "Tampa, FL",
    bed: 2,
    bath: 2,
    garage: 0,
    sqft: 1360,
    price: "$810,000",
    description: "Charming bungalow built in 1916 with 2 bedrooms and 2 bathrooms. Features 1360 sqft of living space with an average price per sqft of $595. This historic home is located in the Bungalow Terrace neighborhood.",
    status: "For Sale",
    zipcode: "33601"
  },
  {
    id: "6",
    address: "Unit-3 - 403 S Fremont Ave",
    city: "Tampa, FL",
    bed: 3,
    bath: 3,
    garage: 0,
    sqft: 1748,
    price: "$675,000",
    description: "Luxury townhouse built in 2002 with 3 bedrooms and 3 bathrooms. Features 1748 sqft of living space with an average price per sqft of $386. Includes a garage and is located in the Casa Isabel Townhomes community.",
    status: "For Sale",
    zipcode: "33601"
  },
  {
    id: "7",
    address: "14047 Briardale Ln",
    city: "Tampa, FL",
    bed: 3,
    bath: 2,
    garage: 0,
    sqft: 1581,
    price: "$435,000",
    description: "Well-maintained single family residence built in 1974 with 3 bedrooms and 2 bathrooms. Features 1581 sqft of living space with an average price per sqft of $275. Includes a garage and is located in the Cherry Creek neighborhood.",
    status: "For Sale",
    zipcode: "33601"
  },
  {
    id: "8",
    address: "905 N Willow Ave",
    city: "Tampa, FL",
    bed: 5,
    bath: 4,
    garage: 0,
    sqft: 3315,
    price: "$1,345,000",
    description: "Spacious single family residence built in 2025 with 5 bedrooms and 4 bathrooms. Features 3315 sqft of living space with an average price per sqft of $405. This newer construction includes a garage and is located in the Collins Addition neighborhood.",
    status: "For Sale",
    zipcode: "33601"
  },
  {
    id: "9",
    address: "15316 Winding Creek Dr",
    city: "Tampa, FL",
    bed: 4,
    bath: 2,
    garage: 0,
    sqft: 1888,
    price: "$649,000",
    description: "Beautiful single family residence built in 1979 with 4 bedrooms and 2 bathrooms. Features 1888 sqft of living space with an average price per sqft of $343. Includes a garage and is located in the Country Lakes community.",
    status: "For Sale",
    zipcode: "33601"
  },
  {
    id: "10",
    address: "12212 Hidden Brook Dr",
    city: "Tampa, FL",
    bed: 3,
    bath: 2,
    garage: 0,
    sqft: 1222,
    price: "$399,900",
    description: "Charming single family residence built in 1984 with 3 bedrooms and 2 bathrooms. Features 1222 sqft of living space with an average price per sqft of $327. Includes a garage and is located in the Country Run community.",
    status: "For Sale",
    zipcode: "33601"
  }
]

// Function to get the correct image filename based on address
export function getImageFilename(address: string): string {
  const addressMap: { [key: string]: string } = {
    "2203 N Riverside Dr": "2203_N_Riverside_Dr_Tampa_FL.jpg",
    "2205 N Riverside Dr": "2205_N_Riverside_Dr_Tampa_FL.jpg",
    "1031 Andrew Aviles Cir": "1031_Andrew_Aviles_Cir_Tampa_FL.jpg",
    "2 S Treasure Dr": "2_S_Treasure_Dr_Tampa_FL.jpg",
    "711 S Bungalow Ter": "711_S_Bungalow_Ter_Tampa_FL.jpg",
    "Unit-3 - 403 S Fremont Ave": "Unit-3_-_403_S_Fremont_Ave_Tampa_FL.jpg",
    "14047 Briardale Ln": "14047_Briardale_Ln_Tampa_FL.jpg",
    "905 N Willow Ave": "905_N_Willow_Ave_Tampa_FL.jpg",
    "15316 Winding Creek Dr": "15316_Winding_Creek_Dr_Tampa_FL.jpg",
    "12212 Hidden Brook Dr": "12212_Hidden_Brook_Dr_Tampa_FL.jpg"
  }
  
  return addressMap[address] || "/placeholder.jpg"
} 