import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"
import RootNavigation from "./RootNavigation"
import GoogleAnalytics from "@/app/components/consent/GoogleAnalytics"
import { Suspense } from "react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import dynamic from "next/dynamic"
const inter = Inter({ subsets: ["latin"] })
const CookieBanner = dynamic(
  () => import("@/app/components/consent/CookieBanner"),
  {
    ssr: false,
  }
)
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
        <CookieBanner />
      </body>
    </html>
  )
}
