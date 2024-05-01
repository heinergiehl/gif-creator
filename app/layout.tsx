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
import { ModeToggle } from './components/ui/DarkToggle';
import Script from 'next/script';
const inter = Inter({ subsets: ['latin'] });
const CookieBanner = dynamic(() => import('@/app/components/consent/CookieBanner'), {
  ssr: false,
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Suspense>
        <GoogleAnalytics GA_MEASUREMENT_ID="G-8M37TENBJS" />
      </Suspense>
      <body
        className={cn([
          inter.className,
          ' font-sans text-black antialiased  transition-colors duration-500 ease-in-out  dark:text-white',
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
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        <CookieBanner />
      </body>
    </html>
  );
}
