import { cn } from '@/lib/utils';
import { v2 as cloudinary } from 'cloudinary';
import { Footer } from './components/ui/Footer';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SITE_BRAND, absoluteUrl } from '@/lib/site';
import { Card } from '@/components/ui/card';
import { BorderBeam } from '@/components/magicui/border-beam';
import { LatestPostsSection } from '@/components/blog/LatestPostsSection';
import { FaMobile } from 'react-icons/fa6';
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card';
import { CTA } from '@/components/pages/CTA';
import dynamic from 'next/dynamic';
const AnimatedBeamDemo = dynamic(
  () => import('@/components/pages/animated-beam-multiple-outputs'),
  { ssr: false },
);
import {
  AppWindowIcon,
  CodeIcon,
  DownloadIcon,
  EyeIcon,
  LockIcon,
  RocketIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  SmileIcon,
  StarIcon,
  UploadIcon,
} from 'lucide-react';
export const metadata: Metadata = {
  title: `${SITE_BRAND} — Free Online GIF Maker & Editor`,
  description:
    'Create and edit animated GIFs online. Convert video to GIF, make GIFs from images, crop, resize, add text, adjust speed, and optimize file size — free, fast, and without watermarks.',
  keywords:
    'GIF maker, video to GIF, GIF editor, animated GIF maker, resize GIF, crop GIF, rotate GIF, GIF optimizer, split GIF frames, add text to GIF, GIF converter, online GIF tools, edit GIF frames, GIF animation editor, compress GIF, WebP to GIF, APNG maker, free GIF editor, no watermark GIF, animated image editor, GIF effects, frame editor, GIF duration editor, image to GIF, animated GIF creator, convert MP4 to GIF online free, how to make a GIF from a video, reduce GIF file size, GIF speed changer, screen recording to GIF, make GIF from images, browser-based GIF editor, private GIF maker no upload, GIF loop editor, best free online GIF tool, create animated GIF without watermark, GIF frame timing editor, video clip to GIF converter, optimize GIF for web, animated sticker maker, MOV to GIF, AVI to GIF, WebM to GIF',
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

  const howToStructuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Make a GIF Online",
    "description": "Create animated GIFs from videos, images, or existing GIFs using a free browser-based editor. No uploads — everything runs locally in your browser.",
    "totalTime": "PT2M",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Upload your media",
        "text": "Drop a video (MP4, MOV, AVI, WebM), images (PNG, JPG), or an existing GIF into the editor.",
        "url": absoluteUrl('/video-to-gif')
      },
      {
        "@type": "HowToStep",
        "name": "Edit your GIF",
        "text": "Crop, resize, rotate, add text, adjust frame timing, apply effects, and fine-tune every detail — all locally in your browser.",
        "url": absoluteUrl('/edit-gifs')
      },
      {
        "@type": "HowToStep",
        "name": "Export your GIF",
        "text": "Download your finished GIF, WebP, or APNG — optimized for the web with no watermark.",
        "url": absoluteUrl('/')
      }
    ],
    "tool": {
      "@type": "HowToTool",
      "name": SITE_BRAND
    }
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToStructuredData) }}
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
      <div className="relative z-40 flex w-full flex-col items-stretch opacity-100">
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
        <section className="relative z-[999]">
          <div className="pointer-events-none absolute inset-0 bg-white/80 backdrop-blur-2xl dark:bg-slate-950/50 dark:backdrop-blur-xl" />
          <div className="relative container mx-auto flex h-full w-full flex-col px-4">
            <h2 className="mb-8 whitespace-pre-wrap py-28 text-center text-2xl font-bold leading-none text-slate-800 dark:bg-gradient-to-b dark:from-white dark:to-slate-500 dark:bg-clip-text dark:text-transparent md:text-8xl">
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

        {/* How It Works */}
        <section className="relative w-full py-24">
          <div className="pointer-events-none absolute inset-0 bg-white/60 backdrop-blur-xl dark:bg-slate-950/40 dark:backdrop-blur-lg" />
          <div className="relative mx-auto max-w-5xl px-4">
            <h2 className="mb-4 text-center text-3xl font-bold text-slate-800 dark:text-white md:text-5xl">
              How to Make a GIF in 3 Steps
            </h2>
            <p className="mx-auto mb-16 max-w-2xl text-center text-base text-slate-500 dark:text-slate-400">
              No installs, no sign-ups. Everything runs locally in your browser.
            </p>
            <div className="grid gap-10 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/30">
                  <UploadIcon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">1. Upload</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Drop a <Link href="/video-to-gif" className="font-medium text-indigo-600 underline decoration-dotted underline-offset-2 dark:text-indigo-400">video</Link>,{' '}
                  <Link href="/image-to-gif" className="font-medium text-indigo-600 underline decoration-dotted underline-offset-2 dark:text-indigo-400">images</Link>, or an existing{' '}
                  <Link href="/edit-gifs" className="font-medium text-indigo-600 underline decoration-dotted underline-offset-2 dark:text-indigo-400">GIF</Link> into the editor.
                  Supports MP4, MOV, AVI, WebM, PNG, JPG, and more.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-900/30">
                  <SlidersHorizontalIcon className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">2. Edit</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Crop, resize, rotate, add text, adjust frame timing, apply effects, and fine-tune every detail.
                  All editing happens locally in your browser — your files are never uploaded.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/30">
                  <DownloadIcon className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">3. Export</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Download your finished GIF, WebP, or APNG — optimized for the web with no watermark.{' '}
                  <Link href="/blog/optimize-gif-size-without-losing-quality" className="font-medium text-indigo-600 underline decoration-dotted underline-offset-2 dark:text-indigo-400">Learn how to optimize file size</Link>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Visualization */}
        <section className="relative w-full py-24">
          <div className="pointer-events-none absolute inset-0 bg-white/60 backdrop-blur-xl dark:bg-slate-950/40 dark:backdrop-blur-lg" />
          <div className="relative mx-auto max-w-5xl px-4 flex flex-col items-center">
            <h2 className="mb-4 text-center text-3xl font-bold text-slate-800 dark:text-white md:text-5xl">
              Your Entire GIF Workflow, One Place
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-base text-slate-500 dark:text-slate-400">
              Bring in video, images, or existing GIFs — edit your frames — export as GIF, WebP, or APNG.
              No uploads, no watermarks.
            </p>
            <AnimatedBeamDemo />
          </div>
        </section>

        <LatestPostsSection
          title="Learn the workflows behind better GIFs"
          description="Practical guides for GIF creation, editing, optimization, and screen-to-GIF workflows."
          postSlugs={[
            'how-to-make-a-gif-from-a-video',
            'how-to-edit-a-gif-without-losing-quality',
            'optimize-gif-size-without-losing-quality',
          ]}
        />

        {/* Privacy Section */}
        <section className="relative w-full py-24">
          <div className="pointer-events-none absolute inset-0 bg-white/70 backdrop-blur-2xl dark:bg-slate-950/50 dark:backdrop-blur-xl" />
          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
              <LockIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-slate-800 dark:text-white md:text-5xl">
              Your Files Never Leave Your Device
            </h2>
            <p className="mx-auto mb-14 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Unlike most online GIF tools, {SITE_BRAND} processes everything locally in your browser
              using WebAssembly and Canvas APIs. Your videos, images, and GIFs are never uploaded to
              a server — they stay on your machine, always.
            </p>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <ShieldCheckIcon className="mx-auto mb-3 h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">No server uploads</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">All processing runs in your browser. Zero data leaves your device.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <EyeIcon className="mx-auto mb-3 h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">No tracking</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">We don&apos;t track, store, or analyze your media. Your content is yours.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <SmileIcon className="mx-auto mb-3 h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">No account needed</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Start editing immediately. No sign-up, no email, no friction.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative">
          <div className="pointer-events-none absolute inset-0 bg-white/80 backdrop-blur-2xl dark:bg-slate-950/50 dark:backdrop-blur-xl" />
          <div className="relative container mx-auto px-4">
            <h2 className="mb-8 whitespace-pre-wrap py-28 text-center text-3xl font-bold leading-none text-slate-800 dark:bg-gradient-to-b dark:from-white dark:to-slate-500 dark:bg-clip-text dark:text-transparent md:text-8xl">
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
