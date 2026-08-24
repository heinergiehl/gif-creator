import { Metadata } from 'next';
import React from 'react';
import { SITE_BRAND } from '@/lib/site';
export const metadata: Metadata = {
  title: 'Professional GIF Editor & Advanced Editing Tools - Edit Animated GIFs Online',
  description:
    'Advanced GIF editor with professional editing tools. Edit animated GIFs online: add text, resize, crop, rotate, optimize frames, control animation speed. Free GIF editing with no watermarks.',
  keywords:
    'GIF editor, edit animated GIFs, professional GIF editing tools, resize GIF, crop animated GIF, rotate GIF, add text to GIF, GIF frame editor, optimize animated GIF, GIF effects editor, online GIF editor, free GIF editing tools, animated image editor',
  openGraph: {
    title: `Professional GIF Editor & Advanced Editing Tools | ${SITE_BRAND}`,
    description:
      'Edit animated GIFs with professional tools. Add text, resize, crop, optimize frames. Free online GIF editor.',
    url: '/edit-gifs/converter-and-editor',
    siteName: SITE_BRAND,
    images: [
      {
        url: '/hero-dark.png',
        width: 1200,
        height: 630,
        alt: `Professional GIF Editor - ${SITE_BRAND}`,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Professional GIF Editor & Advanced Editing Tools | ${SITE_BRAND}`,
    description:
      'Edit animated GIFs with professional tools. Add text, resize, crop, optimize frames.',
    images: ['/hero-dark.png'],
  },
  alternates: {
    canonical: '/edit-gifs',
  },
  robots: { index: false, follow: true },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
