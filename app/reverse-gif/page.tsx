import type { Metadata } from 'next';
import { Repeat2 } from 'lucide-react';
import { MotionToolPage } from '@/components/gif-tools/motion/MotionToolPage';
import { absoluteUrl } from '@/lib/site';

const title = 'Reverse GIF Online or Make a Boomerang GIF';
const description =
  'Reverse an animated GIF frame by frame or turn it into a forward-and-back boomerang. Preview and download it free with local browser processing.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/reverse-gif' },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/reverse-gif'),
    title,
    description,
    images: [
      {
        url: '/hero-dark.png',
        width: 1200,
        height: 630,
        alt: 'Reverse a GIF or create a boomerang GIF',
      },
    ],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/hero-dark.png'] },
};

export default function ReverseGifPage(): React.ReactElement {
  return (
    <MotionToolPage
      kind="reverse"
      path="/reverse-gif"
      name="Reverse GIF"
      eyebrow="Reverse and boomerang GIF maker"
      title="Reverse a GIF—or send it smoothly back again"
      description="Play every frame backward or create a forward-and-back boomerang loop. Preview the actual rebuilt animation before downloading it, with no source upload."
      icon={Repeat2}
      highlights={[
        'True frame-by-frame reverse',
        'Boomerang mode',
        'Original loop setting retained',
      ]}
      steps={[
        {
          title: 'Choose an animated GIF',
          text: 'The animation is validated and measured locally before any frames are rebuilt.',
        },
        {
          title: 'Reverse or boomerang',
          text: 'Reverse starts at the last frame. Boomerang continues back toward the first frame after playing forward.',
        },
        {
          title: 'Inspect the new loop',
          text: 'Compare both animations, check the new duration and size, and download the GIF you previewed.',
        },
      ]}
      explanationTitle="Reverse and boomerang are different loops"
      explanation={[
        'Reverse mode changes the entire frame order, so an action begins where the original ended. The output keeps the source loop instruction whenever the GIF contains one.',
        'Boomerang mode appends a reversed pass after the original. For animations with enough frames, repeated turn-around frames are removed to avoid a visible pause at the direction change.',
      ]}
      relatedTools={[
        {
          href: '/trim-gif',
          label: 'Trim the GIF first',
          description: 'Keep only the action that should play backward or bounce.',
        },
        {
          href: '/change-gif-speed',
          label: 'Adjust the loop speed',
          description: 'Make the reversed or boomerang result faster or slower.',
        },
        {
          href: '/compress-gif',
          label: 'Compress the result',
          description: 'Reduce the rebuilt GIF to a concrete KB or MB target.',
        },
      ]}
    />
  );
}
