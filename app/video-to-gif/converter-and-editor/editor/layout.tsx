import { Metadata } from 'next';
import { SITE_BRAND } from '@/lib/site';

export const metadata: Metadata = {
  title: `Video to GIF Editor - Interactive Converter | ${SITE_BRAND}`,
  description: 'Interactive video to GIF editor with real-time preview. Convert and edit videos to animated GIFs with professional tools.',
  robots: 'noindex', // Don't index the editor page itself
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
