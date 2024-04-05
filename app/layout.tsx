import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"
import RootNavigation from "./RootNavigation"
import GoogleAnalytics from "@/app/components/consent/GoogleAnalytics"
import CookieBanner from "./components/consent/CookieBanner"
import { Suspense } from "react"
import { SpeedInsights } from "@vercel/speed-insights/next"
const inter = Inter({ subsets: ["latin"] })
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <Suspense>
        <GoogleAnalytics GA_MEASUREMENT_ID="G-8M37TENBJS" />
      </Suspense>
      <body className={inter.className}>
        <RootNavigation />
        {children}
        <Analytics />
        <SpeedInsights />
        {/* <CookieBanner /> */}
      </body>
    </html>
  )
}
