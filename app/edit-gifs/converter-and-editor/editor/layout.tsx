import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GIF Editor',
  description: 'Interactive GIF editor interface.',
  alternates: { canonical: '/edit-gifs' },
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
