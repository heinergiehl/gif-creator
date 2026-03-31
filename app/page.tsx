import { cn } from '@/lib/utils';
import { v2 as cloudinary } from 'cloudinary';
import { Footer } from './components/ui/Footer';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SITE_BRAND, absoluteUrl } from '@/lib/site';
import { Card } from '@/components/ui/card';
import { BorderBeam } from '@/components/magicui/border-beam';
import { FaMobile } from 'react-icons/fa6';
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card';
import { CTA } from '@/components/pages/CTA';
import {
  AppWindowIcon,
  CodeIcon,
  EyeIcon,
  RocketIcon,
  ShieldCheckIcon,
  SmileIcon,
  StarIcon,
} from 'lucide-react';
export const metadata: Metadata = {
  title: `${SITE_BRAND} — Free Online GIF Maker & Editor`,
  description:
    'Create and edit animated GIFs online. Convert video to GIF, make GIFs from images, crop, resize, add text, adjust speed, and optimize file size — free, fast, and without watermarks.',
  keywords:
    'GIF maker, video to GIF, GIF editor, animated GIF maker, resize GIF, crop GIF, rotate GIF, GIF optimizer, split GIF frames, add text to GIF, GIF converter, online GIF tools, edit GIF frames, GIF animation editor, compress GIF, WebP to GIF, APNG maker, free GIF editor, no watermark GIF, animated image editor, GIF effects, frame editor, GIF duration editor, image to GIF, animated GIF creator',
  alternates: { canonical: '/' },
};
const files = [
  {
    name: 'Fast GIF creation and editing',
    body: 'Create, edit, and export animated GIFs in seconds — optimized for speed without sacrificing quality.',
  },
  {
    name: 'Privacy-first, local processing',
    body: 'Your files stay on your device. Editing and conversion run locally in your browser for better privacy and faster workflows.',
  },
  {
    name: 'Advanced GIF editor with frame control',
    body: 'Resize, crop, rotate, add text, tweak timing, and fine-tune frames to get a GIF that looks right everywhere.',
  },
  {
    name: 'No sign-up, no watermark',
    body: 'Start editing instantly. Export clean GIFs without a watermark and without creating an account.',
  },
  {
    name: 'High-quality output with optimization',
    body: 'Balance quality and file size with smart optimization so your GIFs load fast on the web and social media.',
  },
  {
    name: 'Full creative control',
    body: 'Adjust frame duration, apply effects, add text, resize, crop, and export for the platform you’re posting to.',
  },
  {
    name: 'Works on desktop and mobile',
    body: `Use ${SITE_BRAND} on any modern browser — desktop, tablet, or phone — with a responsive editor that feels native.`,
  },
  {
    name: 'Real-time preview as you edit',
    body: 'See changes instantly while you crop, resize, and adjust timing — preview before you export your final GIF.',
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
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${SITE_BRAND} - Online GIF Maker & Editor`,
    "url": absoluteUrl('/'),
    "description": "Free online GIF maker and editor. Create, resize, crop, rotate, and optimize animated GIFs. Convert videos to GIFs with professional editing tools.",
    "applicationCategory": "ImageApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Video to GIF converter",
      "Resize animated GIFs", 
      "Crop GIF animations",
      "Rotate animated images",
      "Frame-by-frame editor",
      "Add text to GIFs",
      "GIF optimizer",
      "Split GIF frames",
      "Animation speed control",
      "No watermarks"
    ],
    "browserRequirements": "HTML5, JavaScript enabled",
    "author": {
      "@type": "Organization",
      "name": SITE_BRAND
    }
  };

  const faqData = [
    {
      question: 'How do I convert a video to GIF with frame editing?',
      answer:
        `Upload your video file to ${SITE_BRAND} for instant conversion to a high-quality GIF. Use the editor to crop and resize, tweak timing, add text, and optimize file size for smooth loops.`,
    },
    {
      question: 'Can I resize and crop animated GIFs online for free?',
      answer:
        'Yes, our free GIF editor includes professional resizing and cropping tools. Resize animated images to any dimensions, crop specific regions, and maintain animation quality. No watermarks or limits on our animated image editor.',
    },
    {
      question: 'Does your GIF maker support frame-by-frame editing?',
      answer: 'Absolutely! Edit individual GIF frames, control animation timing, add text overlays, apply effects, and optimize each frame. Our frame editor gives you complete control over your animated GIF creation.',
    },
    {
      question: 'How do I optimize GIF file size without losing quality?',
      answer:
        'Use our GIF optimizer to compress animated files while maintaining visual quality. Adjust frame rate, reduce colors, resize dimensions, and apply optimization algorithms to create smaller GIF files perfect for web use.',
    },
    {
      question: 'Can I rotate and flip animated GIFs online?',
      answer: 'Yes, our GIF rotation tool lets you rotate animations by any degree, flip horizontally or vertically, and maintain smooth animation flow. Perfect for correcting orientation in animated images.',
    },
    {
      question: 'What animated image formats do you support?',
      answer: 'We support GIF, WebP, APNG, AVIF, and more. Convert between formats, edit animations, and maintain quality across all supported animated image types.',
    },
    {
      question: 'How do I add text and effects to animated GIFs?',
      answer:
        'Our GIF editor includes text overlay tools, stickers, effects, and filters. Add animated text, apply visual effects, and customize your GIFs with professional editing features.',
    },
    {
      question: 'Is there a limit to GIF file size for editing?',
      answer: 'Currently, we support animated files up to 100MB to ensure fast processing. Perfect for most GIF editing needs including video conversion, frame editing, and optimization.',
    },
    {
      question: 'Can I split GIF into individual frames for editing?',
      answer:
        'Yes, use our GIF splitter to extract individual frames from animated GIFs. Edit each frame separately, reorder sequences, and reassemble into new animations with our frame editor.',
    },
    {
      question: 'How do I create a GIF with a transparent background?',
      answer: 'To create a GIF with a transparent background, start with images (like PNGs) that already have transparency. When you upload them to our GIF maker, the transparency will be preserved. You can also use our editor to remove a background color from an existing GIF or video.',
    },
    {
      question: 'Can I combine multiple GIFs into one?',
      answer: 'Yes, you can easily combine multiple GIFs. Upload your GIF files to our editor, and you can arrange them side-by-side or end-to-end. You can also adjust the order and timing of each GIF to create a seamless new animation.',
    },
    {
      question: 'What is the best frame rate for a smooth GIF?',
      answer: 'For a smooth, fluid animation, a frame rate of 24-30 frames per second (FPS) is ideal. However, for most web use, 10-15 FPS provides a good balance between smoothness and file size. Our editor allows you to adjust the frame rate to find the perfect setting.',
    },
    {
      question: 'How do I make a looping GIF?',
      answer: `GIFs created with ${SITE_BRAND} loop by default. You can adjust loop settings in the editor, including infinite looping or a set number of repeats.`,
    },
    {
      question: 'What is the difference between GIF, WebP, and APNG?',
      answer: 'GIF is the most widely supported format but is limited to 256 colors. WebP and APNG are more modern formats that support millions of colors and better transparency, resulting in higher quality and often smaller file sizes. Our tool lets you create and convert between all these formats.',
    },
  ];

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
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
            <div className="flex h-screen  max-w-6xl flex-col items-center justify-center gap-x-2">
              <NeonGradientCard className="mt-[170px] flex   items-center justify-center ">
                <h1 className="pointer-events-none z-10 w-full  bg-gradient-to-br from-[#ff2975] from-35% to-[#00FFF1] bg-clip-text text-center text-7xl font-bold leading-none tracking-tighter text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                  Free Online GIF Maker & Editor
                </h1>
              </NeonGradientCard>
              <div className="mt-6 rounded-full border border-white/40 bg-white/60 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200">
                Convert video, build from images, or edit an existing GIF — all in one browser-based editor.
              </div>
              <p className="max-w-6xl text-pretty px-4 py-6 text-center text-xl md:px-0">
                Start with a video, image sequence, or GIF. Then crop, resize, rotate, add text, tune timing, and optimize file size with a fast editor that runs locally in your browser. Supports GIF, WebP, and APNG, with no watermark on export.
              </p>
              <div className=" mx-auto flex flex-col items-center justify-center space-x-4 space-y-8">
                <CTA />
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span>Free to use</span>
                  <span>No sign-up required</span>
                  <span>Local browser processing</span>
                  <Link href="/video-to-gif" className="underline decoration-dotted underline-offset-4 hover:text-slate-950 dark:hover:text-white">
                    Explore video to GIF
                  </Link>
                </div>
                <div className="relative z-10 m-auto flex w-full items-center justify-start rounded-xl">
                  <Image
                    src="/hero-dark.png"
                    alt={`${SITE_BRAND} GIF maker and editor interface preview (dark mode)`}
                    width={1200}
                    height={500}
                    className=" z-10 hidden rounded-[inherit] border object-contain shadow-lg dark:block md:w-[1200px]"
                  />
                  <Image
                    width={1200}
                    height={500}
                    src="/hero-white.png"
                    alt={`${SITE_BRAND} GIF maker and editor interface preview (light mode)`}
                    className=" z-10 block rounded-[inherit] border object-contain shadow-lg dark:hidden md:w-[1200px]"
                  />
                  <BorderBeam size={250} duration={12} delay={9} borderWidth={5} />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="z-[999]">
          <div className="container  mx-auto flex h-full w-full flex-col px-4 ">
            <h2 className="pointer-events-none mb-8  whitespace-pre-wrap bg-gradient-to-b from-black to-gray-200/80 bg-clip-text py-28 text-center text-2xl font-bold leading-none text-transparent dark:from-white dark:to-slate-600/20 md:text-8xl">
              Professional GIF Editing Tools
            </h2>
            {/* Bento Grid Layout */}
            <div
              className="grid auto-rows-fr grid-cols-1 gap-2 lg:grid-cols-3"
              style={{ gridAutoRows: 'minmax(100px, auto)' }}
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
        <section className="">
          <div className="container mx-auto px-4">
            <h2 className="pointer-events-none mb-8 whitespace-pre-wrap bg-gradient-to-b from-black to-gray-200/90 bg-clip-text py-28 text-center text-3xl font-bold leading-none text-transparent dark:from-white dark:to-slate-600/20 md:text-8xl">
              GIF Maker & Editor FAQ
            </h2>
            <div className="mx-auto max-w-4xl space-y-8 mb-[100px]">
              {faqData.map((faq, index) => (
                <div key={index} className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
                  <h3 className="mb-4 text-2xl font-bold text-[#ff2975]">{faq.question}</h3>
                  <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </div>
    </>
  );
}
