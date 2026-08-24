import { Metadata } from 'next';
import { SITE_BRAND } from '@/lib/site';
export const metadata: Metadata = {
  title: 'Image to GIF Converter - Create Animated GIFs from Photos',
  description:
    'Convert images to animated GIFs online. Create GIFs from JPG, PNG, WebP photos. Professional editing tools: resize, crop, add text, optimize. Free image to GIF converter.',
  keywords: 'image to GIF, photo to GIF, JPG to GIF, PNG to GIF, animated GIF from images, image animation maker, free image to GIF converter',
  openGraph: {
    title: 'Free Image to GIF Converter - Create Animated GIFs from Photos',
    description: 'Convert images to animated GIFs online. Support for JPG, PNG, WebP formats. Professional editing tools included.',
    url: '/image-to-gif',
    siteName: SITE_BRAND,
    images: [
      {
        url: '/hero-dark.png',
        width: 1200,
        height: 630,
        alt: `Image to GIF Converter - ${SITE_BRAND}`,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Image to GIF Converter - Create Animated GIFs from Photos',
    description: 'Convert images to animated GIFs online. Support for JPG, PNG, WebP formats.',
    images: ['/hero-dark.png'],
  },
  alternates: {
    canonical: '/image-to-gif',
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
