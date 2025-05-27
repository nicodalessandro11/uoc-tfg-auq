import type React from "react"
import { Manrope } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

// Load Manrope font with specific weights
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-manrope", // Create a CSS variable
})

export const metadata = {
  title: "Are U Query-ous?",
  description: "A Web-Based Platform for Democratizing Open Geospatial Data Access",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={manrope.variable}>
      <head>{/* We'll load Leaflet dynamically in the component */}</head>
      <body className="font-manrope">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
