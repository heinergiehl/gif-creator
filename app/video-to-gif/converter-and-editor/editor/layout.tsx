import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video to GIF Editor — Interactive Converter',
  description:
    'Interactive video to GIF editor with real-time preview. Convert and edit videos to animated GIFs with professional tools.',
  alternates: { canonical: '/edit-gifs' },
  robots: { index: false, follow: true },
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
