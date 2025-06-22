import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Mousey Housey - AI-Powered Property Value Predictions",
  description: "Don't overpay for your dream home. Get AI-powered future value predictions to know if that listing price is actually worth it. Make smarter buying decisions.",
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
