import { Metadata } from 'next';
import { SITE_BRAND } from '@/lib/site';
export const metadata: Metadata = {
  title: `Professional Video to GIF Converter & Editor - MP4, AVI, MOV to Animated GIF | ${SITE_BRAND}`,
  description:
    'Advanced video to GIF converter with professional editing tools. Convert MP4, AVI, MOV to high-quality animated GIFs. Resize, crop, add text, optimize frames, control animation speed. Free online video to GIF editor with no watermarks.',
  openGraph: {
    title: `Professional Video to GIF Converter & Editor | ${SITE_BRAND}`,
    description:
      'Convert videos to high-quality animated GIFs with professional editing tools. MP4, AVI, MOV support. Free, no watermarks.',
    url: '/video-to-gif/converter-and-editor',
    siteName: SITE_BRAND,
    images: [
      {
        url: '/hero-dark.png',
        width: 1200,
        height: 630,
        alt: `Video to GIF Converter - ${SITE_BRAND}`,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Professional Video to GIF Converter & Editor | ${SITE_BRAND}`,
    description:
      'Convert videos to high-quality animated GIFs with professional editing tools. Free, no watermarks.',
    images: ['/hero-dark.png'],
  },
  alternates: { canonical: '/video-to-gif' },
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
