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
const inter = Inter({ subsets: ['latin'] });
import type { Viewport } from 'next';
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Also supported by less commonly used
  // interactiveWidget: 'resizes-visual',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://gif-creator.heinerdevelops.tech/'),
  title: {
    default: 'https://gif-creator.heinerdevelops.tech/ - Advanced GIF Maker & Editor',
    template: '%s | https://gif-creator.heinerdevelops.tech/',
  },
  description:
    'Free online GIF maker and editor. Create, resize, crop, rotate animated GIFs. Convert videos to GIFs with professional editing tools.',
  keywords: ['GIF maker', 'GIF editor', 'video to GIF', 'animated GIF', 'online GIF tools'],
  authors: [{ name: 'https://gif-creator.heinerdevelops.tech/' }],
  creator: 'GifMagic.app',
  publisher: 'GifMagic.app',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gif-creator.heinerdevelops.tech/',
    siteName: 'GifMagic.app',
    title: 'Create GIFS instantly without the need of logging in - Free Online GIF Maker & Editor',
    description:
      'Create and edit animated GIFs online. Convert videos to GIFs, resize, crop, rotate, and optimize with professional tools.',
    images: [
      {
        url: '/hero-dark.png',
        width: 1200,
        height: 630,
        alt: 'GifMagic.app - GIF Maker and Editor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GifMagic.app - Free Online GIF Maker & Editor',
    description:
      'Create and edit animated GIFs online. Convert videos to GIFs with professional tools.',
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
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <Suspense>
        <GoogleAnalytics GA_MEASUREMENT_ID="G-8M37TENBJS" />
      </Suspense>
      <body
        className={cn([
          inter.className,
          ' font-sans text-black antialiased  transition-colors duration-500 ease-in-out  dark:text-white',
          'h-full select-none',
        ])}
      >
        <ThemeProvider
          themes={['orange', 'light', 'dark', 'rose']}
          defaultTheme="dark"
          attribute="class"
          enableSystem
        >
          {/* only render navigation when not on pathes that start with  converter-and-editor  */}
          <RootNavigation />
          <Toaster />
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        <CookieBannerWrapper />
      </body>
    </html>
  );
}
