import type { Metadata } from 'next';
import { Gauge } from 'lucide-react';
import { MotionToolPage } from '@/components/gif-tools/motion/MotionToolPage';
import { absoluteUrl } from '@/lib/site';

const title = 'Change GIF Speed Online — Speed Up or Slow Down a GIF';
const description =
  'Change an animated GIF playback speed with a multiplier or exact duration. Preview the real result and download it free, without uploading your GIF.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'change GIF speed',
    'GIF speed changer',
    'speed up GIF',
    'slow down GIF',
    'make GIF faster',
    'make GIF slower',
    'change GIF duration',
  ],
  alternates: { canonical: '/change-gif-speed' },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/change-gif-speed'),
    title,
    description,
    images: [
      { url: '/hero-dark.png', width: 1200, height: 630, alt: 'Change GIF playback speed online' },
    ],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/hero-dark.png'] },
};

export default function ChangeGifSpeedPage(): React.ReactElement {
  return (
    <MotionToolPage
      kind="speed"
      path="/change-gif-speed"
      name="Change GIF Speed"
      eyebrow="Faster, slower, or exact duration"
      title="Change GIF speed without guessing the final timing"
      description="Speed up a GIF, slow it down, or set the exact duration you need. The animation is rebuilt locally so you can preview and measure the real output before downloading it."
      icon={Gauge}
      highlights={['0.25× to 4× playback', 'Exact finished duration', 'Animated result preview']}
      steps={[
        {
          title: 'Choose an animated GIF',
          text: 'The browser reads its real frame count, dimensions, duration, loop setting, and file size.',
        },
        {
          title: 'Set a speed or duration',
          text: 'Use a multiplier for a quick change or enter an exact finished duration in seconds.',
        },
        {
          title: 'Preview and download',
          text: 'Compare the original and retimed animation, check the measured duration, and save the new GIF.',
        },
      ]}
      explanationTitle="What changing GIF speed actually changes"
      explanation={[
        'A speed multiplier changes the delay between animation frames. At 2×, a four-second GIF finishes in roughly two seconds; at 0.5×, it takes roughly eight seconds.',
        'Very short frame delays can be rounded differently by browsers and messaging apps. This tool measures the encoded output rather than presenting the requested duration as if it were exact.',
      ]}
      relatedTools={[
        {
          href: '/trim-gif',
          label: 'Trim a GIF',
          description: 'Remove time from the beginning or end before changing playback speed.',
        },
        {
          href: '/reverse-gif',
          label: 'Reverse a GIF',
          description: 'Play the frames backward or build a forward-and-back boomerang.',
        },
        {
          href: '/compress-gif',
          label: 'Compress the finished GIF',
          description: 'Reduce the result to a specific KB or MB file-size limit.',
        },
      ]}
    />
  );
}
