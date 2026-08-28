import { Metadata } from 'next';
import { SITE_BRAND } from '@/lib/site';
export const metadata: Metadata = {
  title: 'Image to GIF Maker — Create GIFs from Photos',
  description:
    'Turn JPG, PNG, WebP, and HEIC images into an animated GIF. Arrange frames, set timing, add text, resize, and export locally without a watermark.',
  openGraph: {
    title: 'Image to GIF Maker — Create GIFs from Photos',
    description:
      'Turn photos and image sequences into an animated GIF, edit the timing, and export without a watermark.',
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
    title: 'Image to GIF Maker — Create GIFs from Photos',
    description:
      'Turn photos and image sequences into an animated GIF and export without a watermark.',
    images: ['/hero-dark.png'],
  },
  alternates: {
    canonical: '/image-to-gif',
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
