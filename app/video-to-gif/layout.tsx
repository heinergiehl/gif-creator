import { Metadata } from 'next';
import { SITE_BRAND } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Video to GIF Converter — MP4 to GIF Online',
  description:
    'Convert MP4, MOV, and WebM video to GIF in your browser. Trim the clip, resize, add text, and export a clean animated GIF without a watermark.',
  alternates: { canonical: '/video-to-gif' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
