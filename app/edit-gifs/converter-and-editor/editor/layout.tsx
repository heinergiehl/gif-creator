import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GIF Editor - GifMagic.app',
  description: 'Interactive GIF editor interface.',
  robots: 'noindex, nofollow'
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
