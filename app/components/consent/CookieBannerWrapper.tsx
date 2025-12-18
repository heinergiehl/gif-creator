'use client';

import dynamic from 'next/dynamic';

const CookieBanner = dynamic(() => import('@/app/components/consent/CookieBanner'), {
  ssr: false,
});

export default function CookieBannerWrapper() {
  return <CookieBanner />;
}
