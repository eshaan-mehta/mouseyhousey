import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Mousey Housey - Real Estate Platform",
  description: "Your trusted partner in finding the perfect home. Discover properties that match your lifestyle and budget.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
