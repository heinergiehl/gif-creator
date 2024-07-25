import { Inter } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import RootNavigation from './RootNavigation';
import GoogleAnalytics from '@/app/components/consent/GoogleAnalytics';
import { Suspense } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/app/theme-provider';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Metadata } from 'next';
const inter = Inter({ subsets: ['latin'] });
const CookieBanner = dynamic(() => import('@/app/components/consent/CookieBanner'), {
  ssr: false,
});
import type { Viewport } from 'next';
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Also supported by less commonly used
  // interactiveWidget: 'resizes-visual',
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
        <CookieBanner />
      </body>
    </html>
  );
}
