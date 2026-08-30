import type { Metadata } from 'next';

// Reuse the original standalone editor, including its stores and import/export flow.
export { default } from '../converter-and-editor/editor/page';

export const metadata: Metadata = {
  title: 'Video to GIF Editor — Interactive Converter',
  description: 'Convert and edit videos in a full-size browser workspace.',
  alternates: { canonical: '/video-to-gif' },
  robots: { index: false, follow: true },
};
