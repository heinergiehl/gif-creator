import { Metadata } from 'next';
import { SITE_BRAND, absoluteUrl } from '@/lib/site';
export const metadata: Metadata = {
  title: 'Free Online Screen Recorder - Record Screen to Video (MP4)',
  description:
    'Record your screen online and download the recording as a video. Choose resolution, crop to the area you want, then convert the clip to a GIF — free and easy to use.',
  keywords:
    'screen recorder, online screen recorder, record screen to video, screen to MP4, screen recording tool, screen to GIF, free screen recorder',
  alternates: { canonical: '/screen-to-video' },
  openGraph: {
    title: `Free Online Screen Recorder | ${SITE_BRAND}`,
    description:
      'Record your screen, browser tab, or app window online. Download MP4 recordings and move straight into GIF conversion or editing.',
    url: absoluteUrl('/screen-to-video'),
    type: 'website',
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
