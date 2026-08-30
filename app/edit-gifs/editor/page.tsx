import type { Metadata } from 'next';

export { default } from '../converter-and-editor/editor/page';

export const metadata: Metadata = {
  title: 'GIF Editor',
  description: 'Edit animated GIFs in the full-size GIF Studio workspace.',
  alternates: { canonical: '/edit-gifs' },
  robots: { index: false, follow: true },
};
