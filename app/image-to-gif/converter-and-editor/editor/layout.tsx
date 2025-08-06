import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image to GIF Editor - GifMagic.app',
  description: 'Interactive image to GIF editor interface.',
  robots: 'noindex, nofollow'
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
