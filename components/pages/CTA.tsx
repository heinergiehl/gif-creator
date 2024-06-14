'use client';
import { useRouter } from 'next/navigation';
import ShinyButton from '../magicui/shiny-button';
export const CTA = () => {
  const router = useRouter();
  return (
    <ShinyButton onClick={() => router.push('video-to-gif')}>
      <span className="text-xl text-foreground">Convert to GIF Now</span>
    </ShinyButton>
  );
};
