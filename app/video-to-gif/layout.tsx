import { Metadata } from 'next';
import { SITE_BRAND } from '@/lib/site';

export const metadata: Metadata = {
  title: `Video to GIF Converter - Convert MP4, AVI, MOV to Animated GIF | ${SITE_BRAND}`,
  description:
    'Free online video to GIF converter. Convert MP4, AVI, MOV (and more) into high-quality animated GIFs. Trim, crop, resize, add text, and optimize file size — no watermark and no sign-up.',
  keywords:
    'video to GIF converter, MP4 to GIF, AVI to GIF, MOV to GIF, convert video to GIF, online GIF converter, animated GIF maker, video converter, GIF from video, free video to GIF, resize GIF from video, crop video to GIF, optimize GIF size, video GIF editor',
  alternates: { canonical: '/video-to-gif' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
