import type { Metadata } from 'next';
import { ConversionPageShell } from '@/components/gif-tools/conversion/ConversionPageShell';
import { MediaConversionTool } from '@/components/gif-tools/conversion/MediaConversionTool';
import { absoluteUrl } from '@/lib/site';

const title = 'Convert Animated WebP to GIF Online';
const description =
  'Convert an animated WebP to GIF locally in your browser. Preserve animation timing and transparency, preview the converted GIF, and download it without a watermark.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['WebP to GIF', 'animated WebP to GIF', 'convert WebP to GIF', 'WebP GIF converter'],
  alternates: { canonical: '/webp-to-gif' },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/webp-to-gif'),
    title,
    description,
    images: [
      { url: '/hero-dark.png', width: 1200, height: 630, alt: 'Animated WebP to GIF converter' },
    ],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/hero-dark.png'] },
};

export default function WebpToGifPage() {
  return (
    <ConversionPageShell
      canonicalPath="/webp-to-gif"
      eyebrow="WebP to GIF converter"
      title="Turn an animated WebP into a widely shareable GIF"
      description={description}
      toolName="Animated WebP to GIF Converter"
      featureList={[
        'Animated WebP decoding',
        'GIF palette generated from the source',
        'Transparent pixel support',
        'Local browser processing',
      ]}
      sectionTitle="Compatibility without flattening the animation"
      sectionCopy="Some upload fields and messaging tools still expect GIF. This converter carries an animated WebP sequence into that older, widely recognized format."
      details={[
        {
          title: 'Animation support',
          text: 'When the WebP contains multiple frames, their sequence and timing are decoded and written into the resulting GIF.',
        },
        {
          title: 'Adaptive palette',
          text: 'A GIF palette is generated from the source animation and applied with controlled dithering instead of using a generic fixed palette.',
        },
        {
          title: 'Honest trade-off',
          text: 'GIF is limited to 256 colors per palette and may be larger than WebP. The measured result size is shown before download.',
        },
      ]}
      related={[
        {
          href: '/compress-gif',
          label: 'Compress the converted GIF',
          description: 'Bring the new GIF under a specific upload or messaging limit.',
        },
        {
          href: '/gif-to-webp',
          label: 'Convert GIF to WebP',
          description: 'Move in the other direction for modern image delivery.',
        },
        {
          href: '/gif-to-png',
          label: 'Extract GIF frames',
          description: 'Inspect or download the individual PNG frames after conversion.',
        },
      ]}
    >
      <MediaConversionTool kind="webp-to-gif" />
    </ConversionPageShell>
  );
}
