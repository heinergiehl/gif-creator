import { Metadata } from 'next';
import { SITE_BRAND } from '@/lib/site';

export const metadata: Metadata = {
  title: `GIF Editor - ${SITE_BRAND}`,
  description: 'Interactive GIF editor interface.',
  robots: 'noindex, nofollow'
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
