import type { Metadata } from 'next';
import { ConversionPageShell } from '@/components/gif-tools/conversion/ConversionPageShell';
import { MediaConversionTool } from '@/components/gif-tools/conversion/MediaConversionTool';
import { absoluteUrl } from '@/lib/site';

const title = 'Convert GIF to Animated WebP Online';
const description =
  'Convert a GIF to animated WebP locally in your browser. Preserve animation and transparency, choose an output quality, compare the file size, and download the result.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['GIF to WebP', 'animated WebP converter', 'convert GIF to WebP', 'GIF WebP animation'],
  alternates: { canonical: '/gif-to-webp' },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/gif-to-webp'),
    title,
    description,
    images: [
      { url: '/hero-dark.png', width: 1200, height: 630, alt: 'GIF to animated WebP converter' },
    ],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/hero-dark.png'] },
};

export default function GifToWebpPage() {
  return (
    <ConversionPageShell
      canonicalPath="/gif-to-webp"
      eyebrow="Animated WebP converter"
      title="Convert a GIF to animated WebP without losing the motion"
      description={description}
      toolName="GIF to Animated WebP Converter"
      featureList={[
        'Animated WebP output',
        'Transparency preservation',
        'Three practical quality levels',
        'Local browser processing',
      ]}
      sectionTitle="Keep the animation in a modern image format"
      sectionCopy="An animated WebP can be substantially more efficient than the same visual in GIF while retaining motion and transparent pixels."
      details={[
        {
          title: 'All frames',
          text: 'The animation sequence is encoded as animated WebP rather than flattening the GIF into a single still image.',
        },
        {
          title: 'Quality control',
          text: 'Choose high detail, balanced, or a smaller file before encoding and compare the measured result with the source.',
        },
        {
          title: 'Web delivery',
          text: 'WebP is useful for modern sites and apps; keep a GIF fallback when a specific destination requires the older format.',
        },
      ]}
      related={[
        {
          href: '/webp-to-gif',
          label: 'Convert WebP back to GIF',
          description: 'Create a compatible GIF for a service that does not accept animated WebP.',
        },
        {
          href: '/compress-gif',
          label: 'Compress the original GIF',
          description: 'Keep the original format and target an exact file-size ceiling.',
        },
        {
          href: '/gif-to-mp4',
          label: 'Convert GIF to MP4',
          description: 'Make a video version for social feeds and video-first platforms.',
        },
      ]}
    >
      <MediaConversionTool kind="gif-to-webp" />
    </ConversionPageShell>
  );
}
