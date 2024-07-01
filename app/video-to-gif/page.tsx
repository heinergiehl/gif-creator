import Link from 'next/link';
import { Footer } from '@/app/components/ui/Footer';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card';
import { CTA } from '@/components/pages/CTA';
import { BentoGrid } from '@/components/magicui/bento-grid';
import { cn } from '@/lib/utils';
const FadeInUpWrapper = dynamic(
  () => import('@/components/ui/FadeInWrapper').then((mod) => mod.FadeInUpWrapper),
  { ssr: false },
);
export const metadata: Metadata = {
  title: 'Free MP4 Video to GIF Online conversion tool | GifMagic.app',
  description:
    'Easily convert your videos to high-quality GIFs with GifMagic.app. Extract precise images, add text, elements, and more. Customize your GIFs effortlessly with our intuitive editor. Ready in seconds, no sign-up required.',
  keywords:
    'video to GIF converter, convert video, GIF maker, online GIF editor, customize GIF, add text to GIF, free GIF converter, GifMagic.app',
  alternates: { canonical: 'https://www.gifmagic.app/video-to-gif' },
};
const features = [
  {
    name: '⚡ Blazingly Fast',
    body: 'GifMagic.app is designed to be fast and efficient, allowing you to convert videos to GIFs in seconds.',
  },
  {
    name: '💾 No data will be stored',
    body: 'This application runs entirely in your browser, and no data is stored on our servers, as we do not have any.',
  },
  {
    name: '💻 Feature Rich Editor',
    body: 'Edit your GIFs with ease using our feature-rich editor. Add text, stickers, and more to your GIFs.',
  },
];
const faqData = [
  {
    question: 'How does the video-to-GIF conversion work?',
    answer:
      'GifMagic.app simplifies the conversion process. Just upload your video, use our editor to customize it, and download your high-quality, personalized GIF in seconds.',
  },
  {
    question: 'What customization options are available?',
    answer:
      'Beyond text and images, GifMagic.app allows you to add unique elements, adjust sizes, and much more, giving you total creative freedom over your GIFs.',
  },
  {
    question: 'Is GifMagic.app free to use?',
    answer:
      'Absolutely! GifMagic.app is your free resource for creating unlimited, high-quality, customized GIFs without any hidden costs.',
  },
];
export default function VideoToGif() {
  return (
    <div className="relative z-40 h-full w-full text-black dark:text-white">
      <div className="absolute inset-0 z-[10] h-full w-full items-center px-5 py-24 opacity-100 [background:radial-gradient(125%_125%_at_50%_50%,#fdfdfd_30%,#63e_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      <div className="absolute bottom-0 left-0 right-0 top-0 z-[20] h-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] dark:bg-[size:24px_24px] dark:opacity-100"></div>
      <div className="relative z-40 flex flex-col opacity-100">
        <main className="mt-[62px] font-sans">
          <section className="hero bg-base-200">
            <div className="hero-content text-center">
              <div className="mx-auto max-w-lg">
                <FadeInUpWrapper>
                  <h1 className="text-5xl font-bold">
                    Free MP4 Video to GIF Online conversion tool
                  </h1>
                  <p className="py-6">
                    Transform videos into high-quality, customized GIFs in just a few clicks with
                    GifMagic.app, our awesome gifmaker. Our intuitive editor allows you to extract
                    the precise images you want, add text in various fonts and sizes, and embellish
                    your GIF with unique elements and images. Experience the magic of creating
                    beautiful, customized GIFs effortlessly and quickly, ready to download and
                    share.
                  </p>
                  <Link href="/video-to-gif/converter-and-editor" className="btn btn-primary">
                    Convert Video to GIF Now
                  </Link>
                </FadeInUpWrapper>
              </div>
            </div>
          </section>
          <section className="py-16">
            <div className="container mx-auto flex h-full w-full flex-col px-4">
              <FadeInUpWrapper>
                <h2 className="mb-8 text-center text-3xl font-bold">
                  Why GifMagic.app is Your Go-To GIF Creation Tool
                </h2>
              </FadeInUpWrapper>
            </div>
          </section>
          <section className=" py-16">
            <FadeInUpWrapper>
              <div className="container mx-auto px-4">
                <h2 className="mb-8 text-center text-3xl font-bold">
                  Get Started with GifMagic.app Today
                </h2>
                <div className="space-y-8 text-left">
                  {faqData.map((faq, index) => (
                    <div key={index}>
                      <h3 className="text-xl font-semibold">{faq.question}</h3>
                      <p>{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInUpWrapper>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}
