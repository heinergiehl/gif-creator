import type { Metadata } from 'next';
import { ConversionPageShell } from '@/components/gif-tools/conversion/ConversionPageShell';
import { MediaConversionTool } from '@/components/gif-tools/conversion/MediaConversionTool';
import { absoluteUrl } from '@/lib/site';

const title = 'GIF to MP4 Converter — Convert GIF to Video';
const description =
  'Convert an animated GIF to MP4 video in your browser. Keep the timing, choose a transparency background, preview the result, and download without a watermark.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/gif-to-mp4' },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/gif-to-mp4'),
    title,
    description,
    images: [{ url: '/hero-dark.png', width: 1200, height: 630, alt: 'GIF to MP4 converter' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/hero-dark.png'] },
};

export default function GifToMp4Page() {
  return (
    <ConversionPageShell
      canonicalPath="/gif-to-mp4"
      eyebrow="GIF to video converter"
      title="Turn an animated GIF into a practical MP4"
      description={description}
      toolName="GIF to MP4 Converter"
      featureList={[
        'Animated GIF to H.264 MP4',
        'Configurable transparency background',
        'Even, video-safe dimensions',
        'Local browser processing',
      ]}
      sectionTitle="A video file built for real playback"
      sectionCopy="MP4 is useful where GIF uploads are blocked, inefficient, or treated as static images. The converter creates a broadly compatible H.264 video."
      details={[
        {
          title: 'Animation timing',
          text: 'The decoded GIF timing drives the video instead of treating every source frame as an arbitrary fixed-speed slideshow.',
        },
        {
          title: 'Transparency',
          text: 'Because MP4 has no alpha channel, transparent areas are composited over the background color you choose.',
        },
        {
          title: 'Compatible canvas',
          text: 'Odd source dimensions are rounded to even output dimensions and encoded as yuv420p for dependable browser and social playback.',
        },
      ]}
      related={[
        {
          href: '/trim-gif',
          label: 'Trim the GIF',
          description: 'Remove unwanted opening or closing frames before making the video.',
        },
        {
          href: '/change-gif-speed',
          label: 'Change GIF speed',
          description: 'Adjust the animation duration before converting it to MP4.',
        },
        {
          href: '/compress-gif',
          label: 'Compress the GIF instead',
          description: 'Keep the GIF format while targeting a strict KB or MB limit.',
        },
      ]}
    >
      <MediaConversionTool kind="gif-to-mp4" />
    </ConversionPageShell>
  );
}
