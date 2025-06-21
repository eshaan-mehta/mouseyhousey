export interface Property {
  id: string | number;  // Can be string (for API) or number (for display)
  address: string;
  city: string;
  bed: number;
  bath: number;
  garage: number;
  sqft: number;
  price: string;
  description: string;
  status: string;
  zipcode: string;
} 