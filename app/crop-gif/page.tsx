import type { Metadata } from 'next';
import { Crop } from 'lucide-react';
import {
  DirectEditPage,
  type DirectEditPageContent,
} from '@/components/gif-tools/edit/DirectEditPage';
import { absoluteUrl } from '@/lib/site';

const title = 'Crop GIF Online — Animated GIF Cropper';
const description =
  'Crop an animated GIF with exact controls or common aspect-ratio presets. Preview the crop area and download the full animation locally without a watermark.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/crop-gif' },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/crop-gif'),
    title,
    description,
    images: [
      {
        url: '/hero-dark.png',
        width: 1200,
        height: 630,
        alt: 'Crop an animated GIF online',
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
  mode: 'crop',
  path: '/crop-gif',
  label: 'GIF Cropper',
  title: 'Crop the exact part of a GIF you want to keep',
  description,
  Icon: Crop,
  benefits: ['Visible crop framing', 'Private browser processing', 'Animation preserved'],
  steps: [
    {
      title: 'Open the source GIF',
      text: 'Its real canvas and animation details define the safe limits for the crop area.',
    },
    {
      title: 'Frame the useful area',
      text: 'Choose a square, 4:3, or 16:9 crop, or enter precise coordinates and dimensions.',
    },
    {
      title: 'Crop every frame',
      text: 'The blue selection is applied across the complete animation and returned as a new GIF.',
    },
  ],
  related: [
    {
      href: '/resize-gif',
      label: 'Resize the cropped GIF',
      description: 'Set exact output dimensions once the composition is correct.',
    },
    {
      href: '/compress-gif',
      label: 'Reduce its file size',
      description: 'Compress the final crop to a precise KB or MB target.',
    },
    {
      href: '/add-text-to-gif',
      label: 'Add text to the GIF',
      description: 'Place a caption or callout after the frame has the right composition.',
    },
  ],
};

export default function CropGifPage() {
  return <DirectEditPage content={content} />;
}
