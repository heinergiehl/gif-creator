import type { Metadata } from 'next';
import { ConversionPageShell } from '@/components/gif-tools/conversion/ConversionPageShell';
import { GifFrameExtractorTool } from '@/components/gif-tools/conversion/GifFrameExtractorTool';
import { absoluteUrl } from '@/lib/site';

const title = 'Split GIF Into Frames Online and Download PNGs';
const description =
  'Extract every GIF frame as a correctly composited PNG. Preview individual frames, download them separately, or save the complete sequence as one ZIP file.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['split GIF into frames', 'GIF frame extractor', 'GIF to frames', 'extract GIF frames'],
  alternates: { canonical: '/split-gif-into-frames' },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/split-gif-into-frames'),
    title,
    description,
    images: [{ url: '/hero-dark.png', width: 1200, height: 630, alt: 'GIF frame extractor' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/hero-dark.png'] },
};

export default function SplitGifIntoFramesPage() {
  return (
    <ConversionPageShell
      canonicalPath="/split-gif-into-frames"
      eyebrow="GIF frame extractor"
      title="Split a GIF into the frames it is really made of"
      description={description}
      toolName="Split GIF Into Frames"
      featureList={[
        'Correctly composited PNG frames',
        'Individual frame downloads',
        'Complete ZIP download',
        'Local browser processing',
      ]}
      sectionTitle="Full-canvas frames, not broken GIF patches"
      sectionCopy="GIFs can store only the pixels that changed between frames. The extractor applies those disposal and transparency rules before creating each PNG."
      details={[
        {
          title: 'Composited output',
          text: 'Every PNG uses the complete GIF canvas, so partial update rectangles do not appear as missing or misplaced pixels.',
        },
        {
          title: 'Useful file names',
          text: 'Frames are numbered in playback order and can be downloaded one at a time or together in a dependency-free ZIP archive.',
        },
        {
          title: 'Bounded preview',
          text: 'Large sequences stay inside a responsive scroll region and reveal additional frames in manageable groups.',
        },
      ]}
      related={[
        {
          href: '/image-to-gif',
          label: 'Create a GIF from images',
          description: 'Reorder edited PNG frames and turn them back into an animation.',
        },
        {
          href: '/trim-gif',
          label: 'Trim a GIF first',
          description: 'Keep only the section you need before extracting a long sequence.',
        },
        {
          href: '/compress-gif',
          label: 'Compress the source GIF',
          description: 'Reduce a large source animation to a practical file-size target.',
        },
      ]}
    >
      <GifFrameExtractorTool />
    </ConversionPageShell>
  );
}
