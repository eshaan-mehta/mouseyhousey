import PropertyDetails from './propertydetails'

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params as required by Next.js 15
  const resolvedParams = await params
  
  return <PropertyDetails params={resolvedParams} />
} 