import { Property } from '@/types/property';

// Function to get the correct image filename based on address
export function getImageFilename(address: string): string {
  const addressMap: { [key: string]: string } = {
    "2203 N Riverside Dr, Tampa, FL": "2203_N_Riverside_Dr_Tampa_FL.jpg",
    "2205 N Riverside Dr, Tampa, FL": "2205_N_Riverside_Dr_Tampa_FL.jpg",
    "1031 Andrew Aviles Cir, Tampa, FL": "1031_Andrew_Aviles_Cir_Tampa_FL.jpg",
    "2 S Treasure Dr, Tampa, FL": "2_S_Treasure_Dr_Tampa_FL.jpg",
    "711 S Bungalow Ter, Tampa, FL": "711_S_Bungalow_Ter_Tampa_FL.jpg",
    "Unit-3 - 403 S Fremont Ave, Tampa, FL": "Unit-3_-_403_S_Fremont_Ave_Tampa_FL.jpg",
    "14047 Briardale Ln, Tampa, FL": "14047_Briardale_Ln_Tampa_FL.jpg",
    "905 N Willow Ave, Tampa, FL": "905_N_Willow_Ave_Tampa_FL.jpg",
    "15316 Winding Creek Dr, Tampa, FL": "15316_Winding_Creek_Dr_Tampa_FL.jpg",
    "12212 Hidden Brook Dr, Tampa, FL": "12212_Hidden_Brook_Dr_Tampa_FL.jpg"
  }
  
  return addressMap[address] || "/placeholder.jpg"
}

export async function getProperties(): Promise<Property[]> {
  try {
    const response = await fetch('/data.json');
    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }
    const properties = await response.json();
    
    // Transform the data to match our Property interface
    return properties.map((property: any, index: number) => ({
      id: index.toString(),
      address: property.address,
      price: property.price,
      zipcode: property.zipcode,
      beds: property.beds,
      baths: property.baths,
      sqft: property.sqft,
      garage: property.garage,
      description: property.description,
      image: `/images/${getImageFilename(property.address)}`
    }));
  } catch (error) {
    console.error('Error reading properties from JSON:', error);
    return [];
  }
}

// Fallback data in case JSON file is not available
export const fallbackProperties: Property[] = [
  {
    id: "1",
    address: "2203 N Riverside Dr, Tampa, FL",
    price: "$1,600,000",
    zipcode: "33601",
    beds: "0",
    baths: "0",
    sqft: "",
    garage: "0",
    description: "This is the perfect opportunity to own prime property in the Ridgewood Park district of Tampa...",
    image: "/images/2203_N_Riverside_Dr_Tampa_FL.jpg"
  },
  {
    id: "2",
    address: "2205 N Riverside Dr, Tampa, FL",
    price: "$1,600,000",
    zipcode: "33601",
    beds: "4",
    baths: "2",
    sqft: "1905",
    garage: "0",
    description: "This is a perfect opportunity to own prime property in the Ridgewood Park district of Tampa...",
    image: "/images/2205_N_Riverside_Dr_Tampa_FL.jpg"
  }
]; 