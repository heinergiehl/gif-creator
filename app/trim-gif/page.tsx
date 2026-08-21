import type { Metadata } from 'next';
import { Scissors } from 'lucide-react';
import { MotionToolPage } from '@/components/gif-tools/motion/MotionToolPage';
import { absoluteUrl } from '@/lib/site';

const title = 'Trim GIF Online — Cut an Animated GIF by Time';
const description =
  'Trim an animated GIF with exact start and end times. Preview the cut, keep the animation and loop, and download the result without uploading your source.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'trim GIF',
    'cut GIF',
    'GIF trimmer',
    'shorten GIF',
    'cut animated GIF',
    'remove GIF frames',
    'trim GIF by time',
  ],
  alternates: { canonical: '/trim-gif' },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/trim-gif'),
    title,
    description,
    images: [
      { url: '/hero-dark.png', width: 1200, height: 630, alt: 'Trim an animated GIF online' },
    ],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/hero-dark.png'] },
};

export default function TrimGifPage(): React.ReactElement {
  return (
    <MotionToolPage
      kind="trim"
      path="/trim-gif"
      name="Trim GIF"
      eyebrow="Precise animated GIF trimmer"
      title="Trim a GIF to the moment worth keeping"
      description="Enter exact start and end times, inspect the animated cut, and download the measured result. The source stays in your browser throughout the workflow."
      icon={Scissors}
      highlights={[
        'Exact start and end times',
        'Quick half and middle selections',
        'Loop-aware GIF output',
      ]}
      steps={[
        {
          title: 'Choose an animated GIF',
          text: 'Its total duration, frames, dimensions, and current file size are measured locally.',
        },
        {
          title: 'Choose the part to keep',
          text: 'Enter start and end times in seconds or use a quick selection as a useful starting point.',
        },
        {
          title: 'Check the real cut',
          text: 'Preview the resulting loop, verify its new duration and frame count, then download it.',
        },
      ]}
      explanationTitle="Trim time without flattening the animation"
      explanation={[
        'Trimming keeps only frames inside the selected time range and resets the timeline so the new GIF begins immediately. The output remains animated rather than becoming a still image.',
        'GIF frames have discrete delays, so an encoded cut can land a few milliseconds away from the typed boundary. The result panel reports the duration read from the finished file.',
      ]}
      relatedTools={[
        {
          href: '/change-gif-speed',
          label: 'Change GIF speed',
          description: 'Make the trimmed clip faster, slower, or fit an exact duration.',
        },
        {
          href: '/reverse-gif',
          label: 'Reverse the trimmed GIF',
          description: 'Play the selected moment backward or turn it into a boomerang.',
        },
        {
          href: '/compress-gif',
          label: 'Compress the trimmed GIF',
          description: 'Fit the final clip under a specific file-size limit.',
        },
      ]}
    />
  );
}
