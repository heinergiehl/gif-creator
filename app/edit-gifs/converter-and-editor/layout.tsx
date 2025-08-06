import { Metadata } from 'next';
import React from 'react';
export const metadata: Metadata = {
  title: 'Professional GIF Editor & Advanced Editing Tools - Edit Animated GIFs Online | GifMagic.app',
  description: 'Advanced GIF editor with professional editing tools. Edit animated GIFs online: add text, resize, crop, rotate, optimize frames, control animation speed. Free GIF editing with no watermarks.',
  keywords: 'GIF editor, edit animated GIFs, professional GIF editing tools, resize GIF, crop animated GIF, rotate GIF, add text to GIF, GIF frame editor, optimize animated GIF, GIF effects editor, online GIF editor, free GIF editing tools, animated image editor',
  openGraph: {
    title: 'Professional GIF Editor & Advanced Editing Tools | GifMagic.app',
    description: 'Edit animated GIFs with professional tools. Add text, resize, crop, optimize frames. Free online GIF editor.',
    url: 'https://www.gifmagic.app/edit-gifs/converter-and-editor',
    siteName: 'GifMagic.app',
    images: [
      {
        url: '/hero-dark.png',
        width: 1200,
        height: 630,
        alt: 'GifMagic.app Professional GIF Editor',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professional GIF Editor & Advanced Editing Tools | GifMagic.app',
    description: 'Edit animated GIFs with professional tools. Add text, resize, crop, optimize frames.',
    images: ['/hero-dark.png'],
  },
  alternates: {
    canonical: 'https://www.gifmagic.app/edit-gifs/converter-and-editor',
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
