import { Property } from '@/types/property';

// Function to get the correct image filename based on address
export function getImageFilename(address: string): string {
  // Remove commas and periods, replace spaces with underscores, and append .jpg
  return address
    .replace(/[,.]/g, "")
    .replace(/\s+/g, "_")
    + ".jpg";
}

export async function getProperties(): Promise<Property[]> {
  try {
    const response = await fetch('/data.json');
    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }
    const properties = await response.json();
    
    console.log('Raw properties from JSON:', properties.length);
    console.log('First property sample:', properties[0]);
    
    // Transform the data to match our Property interface
    const transformedProperties = properties.map((property: any, index: number) => ({
      id: index.toString(),
      address: property.address,
      price: property.price,
      zipcode: property.zipcode,
      beds: property.beds,
      baths: property.baths,
      sqft: property.sqft,
      garage: property.garage,
      description: property.description,
      property_type: property.property_type || 'house', // Default to 'house' if not specified
      image: `/images/${getImageFilename(property.address)}`,
      index: property.index || index, // Use the index from data or fallback to array index
      sale_type: property.sale_type || 'Sale', // Default to 'Sale' if not specified
      score: property.score || '5' // Default to '5' if not specified
    }));
    
    console.log('Transformed properties:', transformedProperties.length);
    console.log('First transformed property:', transformedProperties[0]);
    
    return transformedProperties;
  } catch (error) {
    console.error('Error reading properties from JSON:', error);
    return [];
  }
}