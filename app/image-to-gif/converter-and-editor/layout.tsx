import { Metadata } from 'next';
import { SITE_BRAND } from '@/lib/site';

export const metadata: Metadata = {
  title: `Professional Image to GIF Converter & Editor - Create Animated GIFs from Photos | ${SITE_BRAND}`,
  description:
    'Advanced image to GIF converter with professional editing tools. Create animated GIFs from JPG, PNG, WebP photos. Add text, effects, control timing, optimize quality. Free online image animation maker.',
  keywords:
    'image to GIF converter, photo to GIF editor, JPG to animated GIF, PNG to GIF creator, image animation maker, animated GIF from photos, professional image to GIF editor, photo animation tools, create GIF from images, image sequence to GIF',
  alternates: { canonical: '/image-to-gif' },
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
