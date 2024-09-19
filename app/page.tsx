// pages/index.js
import { useState } from 'react';
import Image from 'next/image';
import {
  AppWindowIcon,
  SmileIcon,
  RocketIcon,
  ShieldCheckIcon,
  CodeIcon,
  StarIcon,
  EyeIcon,
} from 'lucide-react';
import { CTA } from '@/components/pages/CTA';
import { cn } from '@/lib/utils';
import { v2 as cloudinary } from 'cloudinary';
import { CustomAccordion } from './components/ui/CustomAccordion';
import { Footer } from './components/ui/Footer';
import { Metadata } from 'next';
// Import shadcn components
import { Card } from '@/components/ui/card';
import { BorderBeam } from '@/components/magicui/border-beam';
import { FaMobile } from 'react-icons/fa6';
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card';
export const metadata: Metadata = {
  title: 'GifMagic.app - Free Online GIF Maker',
  description:
    'Convert videos to GIFs, edit them by adding text, stickers, and more, and share them with your friends. No sign-up required and 100% free.',
  keywords:
    'GIF maker, video to GIF, free GIF editor, online GIF converter, no sign-up GIF tool, GIF editor',
  alternates: { canonical: 'https://www.gifmagic.app/' },
};
const files = [
  {
    name: '⚡ Blazingly Fast',
    body: 'GifMagic.app is designed to be fast and efficient, allowing you to convert videos to GIFs in seconds.',
  },
  {
    name: '💾 No Data Stored',
    body: 'This application runs entirely in your browser, and no data is stored on our servers, as we do not have any.',
  },
  {
    name: '💻 Feature-Rich Editor',
    body: 'Edit your GIFs with ease using our feature-rich editor. Add text, stickers, and more to your GIFs.',
  },
  {
    name: '🔒 Privacy Guaranteed',
    body: 'All processing is done locally in your browser. Your files are never uploaded to our servers, ensuring complete privacy.',
  },
  {
    name: '🚀 High-Quality Output',
    body: 'Create high-quality GIFs with smooth animations and vibrant colors.',
  },
  {
    name: '🎨 Customization Options',
    body: 'Personalize your GIFs with various customization options including filters, effects, and frames.',
  },
  {
    name: '📱 Mobile-Friendly',
    body: 'Use GifMagic.app on any device. Our tool is fully responsive and works on all platforms.',
  },
  {
    name: '👁️ Preview Before Download',
    body: 'Preview your GIFs in real-time before downloading to ensure they meet your expectations.',
  },
];
const optimizeVideoUrl = cloudinary.url(
  'https://res.cloudinary.com/dwez4z3uv/video/upload/v1719792684/qp5i4nvqq8lhc6rwyvtg.mp4',
  {
    resource_type: 'video',
    quality: 'auto',
    fetch_format: 'auto',
    effect: 'vibrance:100',
    secure: true,
    sign_url: true,
  },
);
const features = [
  {
    Icon: SmileIcon,
    name: files[0].name,
    description: files[0].body,
    href: '/',
    cta: 'Learn more',
    className: 'lg:col-span-2 lg:row-span-1',
    content: (
      <Card className="h-full p-6">
        <div className="flex items-center space-x-4">
          <SmileIcon className="h-8 w-8 text-blue-500" />
          <h3 className="text-xl font-bold">{files[0].name}</h3>
        </div>
        <p className="mt-2">{files[0].body}</p>
      </Card>
    ),
  },
  {
    Icon: AppWindowIcon,
    name: files[1].name,
    description: files[1].body,
    href: '/',
    cta: 'Learn more',
    className: 'lg:col-span-1 lg:row-span-2',
    content: (
      <Card className="flex h-full flex-col p-6">
        <div className="flex items-center space-x-4">
          <AppWindowIcon className="h-8 w-8 text-purple-500" />
          <h3 className="text-xl font-bold">{files[1].name}</h3>
        </div>
        <p className="mt-2 flex-1">{files[1].body}</p>
        <div className="mt-4">
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              filter: 'brightness(1.2) contrast(1.0) saturate(1.2)',
              clipPath: 'inset(35px 4px 20px 2px)',
            }}
            className="w-full rounded-md"
          >
            <source src={optimizeVideoUrl} type="video/mp4" />
          </video>
        </div>
      </Card>
    ),
  },
  {
    Icon: RocketIcon,
    name: files[2].name,
    description: files[2].body,
    href: '/',
    cta: 'Learn more',
    className: 'lg:col-span-2 lg:row-span-1',
    content: (
      <Card className="h-full p-6">
        <div className="flex items-center space-x-4">
          <RocketIcon className="h-8 w-8 text-red-500" />
          <h3 className="text-xl font-bold">{files[2].name}</h3>
        </div>
        <p className="mt-2">{files[2].body}</p>
      </Card>
    ),
  },
  {
    Icon: ShieldCheckIcon,
    name: files[3].name,
    description: files[3].body,
    href: '/',
    cta: 'Learn more',
    className: 'lg:col-span-1 lg:row-span-1',
    content: (
      <Card className="h-full p-6">
        <div className="flex items-center space-x-4">
          <ShieldCheckIcon className="h-8 w-8 text-green-500" />
          <h3 className="text-xl font-bold">{files[3].name}</h3>
        </div>
        <p className="mt-2">{files[3].body}</p>
      </Card>
    ),
  },
  {
    Icon: CodeIcon,
    name: files[4].name,
    description: files[4].body,
    href: '/',
    cta: 'Learn more',
    className: 'lg:col-span-2 lg:row-span-1',
    content: (
      <Card className="h-full p-6">
        <div className="flex items-center space-x-4">
          <CodeIcon className="h-8 w-8 text-yellow-500" />
          <h3 className="text-xl font-bold">{files[4].name}</h3>
        </div>
        <p className="mt-2">{files[4].body}</p>
      </Card>
    ),
  },
  {
    Icon: StarIcon,
    name: files[5].name,
    description: files[5].body,
    href: '/',
    cta: 'Learn more',
    className: 'lg:col-span-1 lg:row-span-1',
    content: (
      <Card className="h-full p-6">
        <div className="flex items-center space-x-4">
          <StarIcon className="h-8 w-8 text-indigo-500" />
          <h3 className="text-xl font-bold">{files[5].name}</h3>
        </div>
        <p className="mt-2">{files[5].body}</p>
      </Card>
    ),
  },
  {
    Icon: FaMobile,
    name: files[6].name,
    description: files[6].body,
    href: '/',
    cta: 'Learn more',
    className: 'lg:col-span-1 lg:row-span-1',
    content: (
      <Card className="h-full p-6">
        <div className="flex items-center space-x-4">
          <FaMobile className="h-8 w-8 text-pink-500" />
          <h3 className="text-xl font-bold">{files[6].name}</h3>
        </div>
        <p className="mt-2">{files[6].body}</p>
      </Card>
    ),
  },
  {
    Icon: EyeIcon,
    name: files[7].name,
    description: files[7].body,
    href: '/',
    cta: 'Learn more',
    className: 'lg:col-span-1 lg:row-span-1',
    content: (
      <Card className="h-full p-6">
        <div className="flex items-center space-x-4">
          <EyeIcon className="h-8 w-8 text-teal-500" />
          <h3 className="text-xl font-bold">{files[7].name}</h3>
        </div>
        <p className="mt-2">{files[7].body}</p>
      </Card>
    ),
  },
];
export default function Home() {
  const faqData = [
    {
      question: 'How do I convert a video to a GIF?',
      answer:
        "Simply upload your video file to GifMagic.app, and our tool will instantly convert it into a high-quality GIF. You can then customize the GIF's frame rate, add text, or edit it further according to your needs.",
    },
    {
      question: 'Is GifMagic.app free to use?',
      answer:
        'Yes, GifMagic.app is completely free to use. There are no hidden fees or premium versions.',
    },
    {
      question: 'Do I need to sign up to use GifMagic.app?',
      answer: 'No sign-up is required. You can start converting and editing your GIFs immediately.',
    },
    {
      question: 'Are my uploaded files stored on your servers?',
      answer:
        'No, all processing is done locally in your browser. We do not store any of your data.',
    },
    {
      question: 'Can I edit my GIFs after creating them?',
      answer: 'Absolutely! You can add text, stickers, and more using our feature-rich editor.',
    },
    {
      question: 'What file formats do you support?',
      answer: 'We support a wide range of video formats including MP4, AVI, MOV, and more.',
    },
    {
      question: 'Can I share my GIFs directly to social media?',
      answer:
        'Yes, after creating your GIF, you can download it and share it on any social media platform.',
    },
    {
      question: 'Is there a limit to the file size I can upload?',
      answer: 'Currently, we support files up to 100MB to ensure fast processing times.',
    },
    {
      question: 'How can I provide feedback or report issues?',
      answer:
        'We welcome your feedback! Please contact us through our support page for any inquiries or issues.',
    },
  ];
  return (
    <div className="relative z-40 h-full w-screen text-black dark:text-white md:w-full">
      <div
        className="absolute inset-0 z-[10] h-full w-full items-center px-5 py-24 opacity-100 
               [background:radial-gradient(125%_125%_at_50%_50%,#fdfdfd_30%,#63e_100%)]
               dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"
      ></div>
      <div
        className="absolute bottom-0 left-0 right-0 top-0 z-[20] h-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] 
            bg-[size:24px_24px] opacity-30 dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)]
            dark:bg-[size:24px_24px] dark:opacity-100"
      ></div>
      <div className="relative z-40 flex w-full flex-col items-center justify-center opacity-100">
        <section className="mt-[100px] h-screen w-full">
          <div className="flex items-center justify-center">
            <div className="flex h-screen min-h-screen max-w-6xl flex-col items-center justify-center gap-x-2">
              <NeonGradientCard className="m-auto flex   items-center justify-center ">
                <h1 className="pointer-events-none z-10 w-full  bg-gradient-to-br from-[#ff2975] from-35% to-[#00FFF1] bg-clip-text text-center text-7xl font-bold leading-none tracking-tighter text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                  Feature-Rich, Free-to-Use GIF Maker
                </h1>
              </NeonGradientCard>
              <p className="max-w-6xl text-pretty px-4 py-6 text-center text-xl md:px-0">
                Convert videos to GIFs, edit them by adding text, stickers, and more, and share them
                with your friends. No sign-up required and 100% free.
              </p>
              <div className="mx-auto flex flex-col items-center justify-center space-x-4 space-y-8">
                <CTA />
                <div className="relative m-auto flex w-full items-center justify-start rounded-xl">
                  <Image
                    src="/hero-dark.png"
                    alt="GifMagic.app Hero Image"
                    width={1200}
                    height={500}
                    className="hidden rounded-[inherit] border object-contain shadow-lg dark:block md:w-[1200px]"
                  />
                  <Image
                    width={1200}
                    height={500}
                    src="/hero-white.png"
                    alt="GifMagic.app Hero Image"
                    className="block rounded-[inherit] border object-contain shadow-lg dark:hidden md:w-[1200px]"
                  />
                  <BorderBeam size={250} duration={12} delay={9} borderWidth={5} />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="container mx-auto flex h-full w-full flex-col px-4">
            <h2 className="pointer-events-none mb-8 whitespace-pre-wrap bg-gradient-to-b from-black to-gray-200/80 bg-clip-text text-center text-2xl font-bold leading-none text-transparent dark:from-white dark:to-slate-600/20 md:text-8xl">
              Why Choose GifMagic.app?
            </h2>
            {/* Bento Grid Layout */}
            <div
              className="grid auto-rows-fr grid-cols-1 gap-2 lg:grid-cols-3"
              style={{ gridAutoRows: 'minmax(200px, auto)' }}
            >
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className={cn('mb-2', feature.className)}
                  style={{ display: 'grid' }}
                >
                  {feature.content}
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="pointer-events-none mb-8 whitespace-pre-wrap bg-gradient-to-b from-black to-gray-200/90 bg-clip-text text-center text-3xl font-bold leading-none text-transparent dark:from-white dark:to-slate-600/20 md:text-8xl">
              Frequently Asked Questions
            </h2>
            <div className="space-y-2 text-xl">
              {faqData.map((faq, index) => (
                <CustomAccordion trigger={faq.question} content={faq.answer} key={index} />
              ))}
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
}
