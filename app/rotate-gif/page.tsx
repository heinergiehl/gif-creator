import type { Metadata } from 'next';
import { RotateCw } from 'lucide-react';
import {
  DirectEditPage,
  type DirectEditPageContent,
} from '@/components/gif-tools/edit/DirectEditPage';
import { absoluteUrl } from '@/lib/site';

const title = 'Rotate or Flip GIF Online';
const description =
  'Rotate an animated GIF by 90, 180, or 270 degrees and flip it horizontally or vertically. Preview the orientation and download the full animation locally.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/rotate-gif' },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/rotate-gif'),
    title,
    description,
    images: [
      {
        url: '/hero-dark.png',
        width: 1200,
        height: 630,
        alt: 'Rotate or flip an animated GIF online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/hero-dark.png'],
  },
};

const content: DirectEditPageContent = {
  mode: 'rotate',
  path: '/rotate-gif',
  label: 'GIF Rotator',
  title: 'Rotate or mirror every frame of a GIF',
  description,
  Icon: RotateCw,
  benefits: ['90° precision controls', 'Private browser processing', 'Flip and rotate together'],
  steps: [
    {
      title: 'Choose the GIF',
      text: 'The original animation stays visible while you decide on the final orientation.',
    },
    {
      title: 'Rotate, flip, or combine',
      text: 'Turn the canvas clockwise by 90, 180, or 270 degrees and add either mirror direction.',
    },
    {
      title: 'Render the animation',
      text: 'The transformation is applied to every frame before the finished GIF is downloaded.',
    },
  ],
  related: [
    {
      href: '/crop-gif',
      label: 'Crop the rotated GIF',
      description: 'Tighten the composition after changing the canvas orientation.',
    },
    {
      href: '/reverse-gif',
      label: 'Reverse the GIF motion',
      description: 'Play the animation backward or create a smooth ping-pong loop.',
    },
    {
      href: '/compress-gif',
      label: 'Compress the result',
      description: 'Reduce the final GIF to the exact file-size limit you need.',
    },
  ],
};

export default function RotateGifPage() {
  return <DirectEditPage content={content} />;
}
