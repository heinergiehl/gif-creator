import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"
import RootNavigation from "./RootNavigation"
import GoogleAnalytics from "@/app/components/consent/GoogleAnalytics"
import CookieBanner from "./components/consent/CookieBanner"
const inter = Inter({ subsets: ["latin"] })
export const metadata: Metadata = {
  title: "Turn any video into a GIF",
  description:
    "Convert videos to GIFs easily with this free online tool, and even customize the output with text and stickers.",
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <GoogleAnalytics GA_MEASUREMENT_ID="G-8M37TENBJS" />
      <body className={inter.className}>
        <RootNavigation />
        {children}
        <Analytics />
        <CookieBanner />
      </body>
    </html>
  )
}
