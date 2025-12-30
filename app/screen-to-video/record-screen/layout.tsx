import { Metadata } from 'next';
import React from 'react';
import { SITE_BRAND } from '@/lib/site';
export const metadata: Metadata = {
  title: `Screen Recorder - Record and Download Video | ${SITE_BRAND}`,
  description:
    'Record your screen in the browser and download the result as a video. Use this page to start recording, then export your clip and convert it to a GIF if needed.',
  robots: 'noindex',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="">{children}</div>;
}
