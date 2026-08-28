import type { Metadata } from 'next';
import { Maximize2 } from 'lucide-react';
import {
  DirectEditPage,
  type DirectEditPageContent,
} from '@/components/gif-tools/edit/DirectEditPage';
import { absoluteUrl } from '@/lib/site';

const title = 'GIF Resizer — Resize Animated GIF Online';
const description =
  'Resize an animated GIF to exact pixel dimensions with aspect-ratio locking and presets. Preview every frame locally and download without uploading the GIF.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/resize-gif' },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/resize-gif'),
    title,
    description,
    images: [
      {
        url: '/hero-dark.png',
        width: 1200,
        height: 630,
        alt: 'Resize an animated GIF online',
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
  mode: 'resize',
  path: '/resize-gif',
  label: 'GIF Resizer',
  title: 'Resize a GIF without flattening the animation',
  description,
  Icon: Maximize2,
  benefits: ['Exact pixel dimensions', 'Private browser processing', 'No watermark'],
  steps: [
    {
      title: 'Choose the animated GIF',
      text: 'The browser reads its canvas, frame count, timing, and file size before any editing starts.',
    },
    {
      title: 'Set width and height',
      text: 'Keep the original aspect ratio locked, enter exact dimensions, or begin with a practical preset.',
    },
    {
      title: 'Render and download',
      text: 'Every frame is resized with high-quality scaling and rebuilt as a downloadable animated GIF.',
    },
  ],
  related: [
    {
      href: '/compress-gif',
      label: 'Compress the resized GIF',
      description: 'Set an exact KB or MB limit after choosing the final canvas size.',
    },
    {
      href: '/crop-gif',
      label: 'Crop the GIF first',
      description: 'Remove unused edges and keep only the part of the animation that matters.',
    },
    {
      href: '/change-gif-speed',
      label: 'Change GIF speed',
      description: 'Make the resized animation faster or slower without rebuilding it by hand.',
    },
  ],
};

export default function ResizeGifPage() {
  return <DirectEditPage content={content} />;
}
