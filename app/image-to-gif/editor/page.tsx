import type { Metadata } from 'next';

export { default } from '../converter-and-editor/editor/page';

export const metadata: Metadata = {
  title: 'Image to GIF Editor',
  description: 'Arrange images and create GIFs in a full-size browser workspace.',
  alternates: { canonical: '/image-to-gif' },
  robots: { index: false, follow: true },
};
