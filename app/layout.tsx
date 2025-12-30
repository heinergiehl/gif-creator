import { Inter } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import RootNavigation from './RootNavigation';
import GoogleAnalytics from '@/app/components/consent/GoogleAnalytics';
import { Suspense } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import CookieBannerWrapper from '@/app/components/consent/CookieBannerWrapper';
import { ThemeProvider } from '@/app/theme-provider';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Metadata } from 'next';
import { SITE_BRAND, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
const inter = Inter({ subsets: ['latin'] });
import type { Viewport } from 'next';
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: `${SITE_BRAND} — Free Online GIF Maker & Editor`,
    template: `%s | ${SITE_BRAND}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
  applicationName: SITE_NAME,
  keywords: ['GIF maker', 'GIF editor', 'video to GIF', 'image to GIF', 'animated GIF editor'],
  authors: [{ name: SITE_BRAND }],
  creator: SITE_BRAND,
  publisher: SITE_BRAND,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'technology',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_BRAND,
    title: `${SITE_BRAND} — Free Online GIF Maker & Editor`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/hero-dark.png',
        width: 1200,
        height: 630,
        alt: `${SITE_BRAND} — GIF maker and editor`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_BRAND} — Free Online GIF Maker & Editor`,
    description: SITE_DESCRIPTION,
    images: ['/hero-dark.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn([
          inter.className,
          ' font-sans text-black antialiased  transition-colors duration-500 ease-in-out  dark:text-white',
          'h-full select-none',
        ])}
      >
        <Suspense>
          <GoogleAnalytics GA_MEASUREMENT_ID="G-8M37TENBJS" />
        </Suspense>
        <ThemeProvider
          themes={['orange', 'light', 'dark', 'rose']}
          defaultTheme="dark"
          attribute="class"
          enableSystem
        >
          <RootNavigation />
          <Toaster />
          {children}
          <CookieBannerWrapper />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
