import { cn } from '@/lib/utils';
import { v2 as cloudinary } from 'cloudinary';
import { Footer } from './components/ui/Footer';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SITE_BRAND, absoluteUrl } from '@/lib/site';
import { gifTools } from '@/lib/gif-tools';
import { Card } from '@/components/ui/card';
import { BorderBeam } from '@/components/magicui/border-beam';
import { LatestPostsSection } from '@/components/blog/LatestPostsSection';
import { FaMobile } from 'react-icons/fa6';
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card';
import { CTA } from '@/components/pages/CTA';
import AnimatedBeamDemo from '@/components/pages/animated-beam-multiple-outputs';
import {
  AppWindowIcon,
  CodeIcon,
  DownloadIcon,
  EyeIcon,
  LockIcon,
  RocketIcon,
  ScissorsIcon,
  ShieldCheckIcon,
  SmileIcon,
  StarIcon,
  UploadIcon,
} from 'lucide-react';
export const metadata: Metadata = {
  title: 'Free GIF Maker & Animated GIF Creator',
  description:
    'Make animated GIFs from video, images, or an existing GIF. Edit frames, timing, text, and file size locally in your browser with no watermark.',
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

const howItWorksSteps = [
  {
    Icon: UploadIcon,
    title: 'Upload your video, images, or GIF',
    description:
      'Start with MP4, MOV, AVI, WebM, PNG, JPG, or an existing GIF. Choose the workflow that matches what you want to make.',
    links: [
      { href: '/video-to-gif', label: 'Convert video to GIF' },
      { href: '/image-to-gif', label: 'Make a GIF from images' },
      { href: '/edit-gifs', label: 'Edit an existing GIF' },
    ],
  },
  {
    Icon: ScissorsIcon,
    title: 'Edit frames, timing, text, and size',
    description:
      'Crop, resize, rotate, add text, adjust speed, and fine-tune frame timing in a browser-based editor designed for animated media.',
    links: [
      { href: '/edit-gifs', label: 'Open the GIF editor' },
      {
        href: '/blog/how-to-edit-a-gif-without-losing-quality',
        label: 'Learn how to edit GIFs without losing quality',
      },
    ],
  },
  {
    Icon: DownloadIcon,
    title: 'Export an optimized file for the web',
    description:
      'Download as GIF, WebP, or APNG with no watermark, then optimize file size for faster loading on websites, social posts, and chats.',
    links: [
      { href: '/blog/optimize-gif-size-without-losing-quality', label: 'Learn GIF optimization' },
      { href: '/video-to-gif', label: 'Start creating now' },
    ],
  },
];

const popularTasks = gifTools
  .filter((tool) => tool.featured)
  .slice(0, 6)
  .map((tool) => ({ href: tool.path, title: tool.name, description: tool.description }));

export default function Home() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${SITE_BRAND} - Online GIF Maker`,
    url: absoluteUrl('/'),
    description:
      'Make animated GIFs from video, images, or existing animations, then edit and optimize them locally in your browser.',
    applicationCategory: 'ImageApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Video to GIF converter',
      'Resize animated GIFs',
      'Crop GIF animations',
      'Rotate animated images',
      'Frame-by-frame editor',
      'Add text to GIFs',
      'GIF optimizer',
      'Split GIF frames',
      'Animation speed control',
      'No watermarks',
    ],
    browserRequirements: 'HTML5, JavaScript enabled',
    author: {
      '@type': 'Organization',
      name: SITE_BRAND,
    },
  };

  const faqData = [
    {
      question: 'Are my GIFs uploaded to a server?',
      answer: `No. The focused ${SITE_BRAND} tools process source files in your browser. The browser downloads the processing engine, but your GIF is not sent to an editing server.`,
    },
    {
      question: 'Can I resize or crop a GIF without losing the animation?',
      answer:
        'Yes. The resize and crop tools apply the same transformation to every frame and then rebuild the animated GIF. You can preview the actual result before downloading it.',
    },
    {
      question: 'Can I compress a GIF to an exact file-size limit?',
      answer:
        'Yes. Enter a target in KB or MB. The compressor tests multiple real encodes and selects the clearest generated result at or below the limit when that target is achievable.',
    },
    {
      question: 'How do I make a GIF faster, slower, or shorter?',
      answer:
        'Use Change GIF Speed for playback timing, or Trim GIF to keep an exact start and end range. Both pages report the measured duration of the finished file.',
    },
    {
      question: 'Can I extract every frame from a GIF?',
      answer:
        'Yes. Split GIF into Frames creates correctly composited PNG files, provides individual downloads, and can package the complete sequence into a ZIP file.',
    },
    {
      question: 'Can I convert an animated GIF to MP4 or WebP?',
      answer:
        'Yes. GIF to MP4 creates a video with a chosen transparency background, while GIF to WebP keeps animation in a modern image format. A separate WebP to GIF tool converts in the other direction.',
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="relative z-40 min-h-screen w-screen text-black dark:text-white md:w-full">
        <div
          className="fixed inset-0 z-[10] h-full w-full items-center px-5 py-24 opacity-100
               [background:radial-gradient(125%_125%_at_50%_50%,#fdfdfd_30%,#63e_100%)]
               dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"
        ></div>
        <div
          className="fixed inset-0 z-[20] h-full w-full bg-[linear-gradient(to_right,#4f4f4f40_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f40_1px,transparent_1px)]
            bg-[size:28px_28px] opacity-40 dark:bg-[linear-gradient(to_right,#4f4f4f55_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f55_1px,transparent_1px)]
            dark:bg-[size:28px_28px] dark:opacity-100"
        ></div>
        <div className="relative z-40 flex w-full flex-col items-stretch opacity-100">
          <section className="w-full pb-16 pt-32">
            <div className="flex items-center justify-center">
              <div className="flex w-full max-w-6xl flex-col items-center gap-y-6">
                <NeonGradientCard className="flex w-full items-center justify-center">
                  <h1 className="pointer-events-none z-10 w-full bg-gradient-to-br from-[#ff2975] from-35% to-[#00FFF1] bg-clip-text text-center text-4xl font-bold leading-tight tracking-tighter text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] sm:text-5xl md:text-7xl md:leading-none">
                    Free Online GIF Maker
                  </h1>
                </NeonGradientCard>
                <div className="mt-6 rounded-full border border-white/40 bg-white/60 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200">
                  Make an animated GIF from video or images, then continue in the full editor.
                </div>
                <p className="max-w-6xl text-pretty px-4 py-6 text-center text-xl md:px-0">
                  Start with a video, image sequence, or existing GIF. Arrange frames, tune timing,
                  add text, and optimize file size in a fast local workflow with no watermark.
                </p>
                <div className=" mx-auto flex flex-col items-center justify-center space-x-4 space-y-8">
                  <CTA />
                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <span>Free to use</span>
                    <span>No sign-up required</span>
                    <span>Local browser processing</span>
                    <Link
                      href="/video-to-gif"
                      className="underline decoration-dotted underline-offset-4 hover:text-slate-950 dark:hover:text-white"
                    >
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
            <div className="pointer-events-none absolute inset-0 bg-white/30 dark:bg-slate-950/40" />
            <div className="container relative mx-auto flex h-full w-full flex-col px-4">
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
            <div className="pointer-events-none absolute inset-0 bg-white/15 dark:bg-slate-950/20" />
            <div className="relative mx-auto max-w-6xl px-4">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-slate-800 dark:text-white md:text-5xl">
                  How to Make a GIF Online
                </h2>
                <p className="mx-auto mb-14 max-w-2xl text-base text-slate-600 dark:text-slate-400 md:text-lg">
                  Create a GIF from a video, image sequence, or existing animation in three steps.
                  The core workflow, use cases, and internal links are now rendered directly in the
                  initial HTML.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {howItWorksSteps.map((step, index) => (
                  <article
                    key={step.title}
                    className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                      <step.Icon className="h-7 w-7 text-slate-900 dark:text-white" />
                    </div>
                    <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      Step {index + 1}
                    </p>
                    <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
                      {step.description}
                    </p>
                    <div className="mt-6 flex flex-col gap-2">
                      {step.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="text-sm font-medium text-indigo-700 underline decoration-dotted underline-offset-4 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-200"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="relative w-full py-24">
            <div className="pointer-events-none absolute inset-0 bg-white/20 dark:bg-slate-950/25" />
            <div className="relative mx-auto max-w-6xl px-4">
              <div className="mx-auto mb-12 max-w-3xl text-center">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white md:text-5xl">
                  Popular GIF Editing Tasks
                </h2>
                <p className="mt-4 text-base text-slate-600 dark:text-slate-400 md:text-lg">
                  These entry points target the main jobs users search for when they need to create,
                  edit, convert, or optimize GIFs online.
                </p>
                <Link
                  href="/gif-tools"
                  className="mt-5 inline-block text-sm font-semibold text-indigo-700 underline underline-offset-4 dark:text-indigo-300"
                >
                  Browse all GIF tools
                </Link>
              </div>

              <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                {popularTasks.map((task) => (
                  <Link
                    key={task.href}
                    href={task.href}
                    className="group grid gap-2 py-6 text-left transition sm:grid-cols-[minmax(0,220px)_1fr_auto] sm:items-center sm:gap-8"
                  >
                    <h3 className="text-lg font-semibold text-slate-900 transition group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-300">
                      {task.title}
                    </h3>
                    <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
                      {task.description}
                    </p>
                    <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                      Open tool →
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Workflow Visualization */}
          <section className="relative w-full py-24">
            <div className="pointer-events-none absolute inset-0 bg-white/20 dark:bg-slate-950/30" />
            <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4">
              <h2 className="mb-4 text-center text-3xl font-bold text-slate-800 dark:text-white md:text-5xl">
                Your Entire GIF Workflow, One Place
              </h2>
              <p className="mx-auto mb-12 max-w-2xl text-center text-base text-slate-500 dark:text-slate-400">
                Bring in video, images, or existing GIFs — edit your frames — export as GIF, WebP,
                or APNG. No uploads, no watermarks.
              </p>
              <AnimatedBeamDemo />
            </div>
          </section>

          <LatestPostsSection
            title="Learn the workflows behind better GIFs"
            description="Practical guides for GIF creation, editing, optimization, and intent-specific workflows like resizing, captioning, and performance tuning."
            postSlugs={[
              'how-to-make-a-gif-from-a-video',
              'how-to-edit-a-gif-without-losing-quality',
              'optimize-gif-size-without-losing-quality',
            ]}
          />

          {/* Privacy Section */}
          <section className="relative w-full py-24">
            <div className="pointer-events-none absolute inset-0 bg-white/25 dark:bg-slate-950/35" />
            <div className="relative mx-auto max-w-4xl px-4 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
                <LockIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-slate-800 dark:text-white md:text-5xl">
                Your Files Never Leave Your Device
              </h2>
              <p className="mx-auto mb-14 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                Unlike most online GIF tools, {SITE_BRAND} processes everything locally in your
                browser using WebAssembly and Canvas APIs. Your videos, images, and GIFs are never
                uploaded to a server — they stay on your machine, always.
              </p>
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  <ShieldCheckIcon className="mx-auto mb-3 h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">
                    No server uploads
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    All processing runs in your browser. Zero data leaves your device.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  <EyeIcon className="mx-auto mb-3 h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">
                    No media analytics
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    We never inspect filenames or media content. Product analytics contain only
                    anonymous workflow events.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  <SmileIcon className="mx-auto mb-3 h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">
                    No account needed
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Start editing immediately. No sign-up, no email, no friction.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="pointer-events-none absolute inset-0 bg-white/25 dark:bg-slate-950/40" />
            <div className="container relative mx-auto px-4">
              <h2 className="mb-8 whitespace-pre-wrap py-28 text-center text-3xl font-bold leading-none text-slate-800 dark:bg-gradient-to-b dark:from-white dark:to-slate-500 dark:bg-clip-text dark:text-transparent md:text-8xl">
                GIF Maker & Editor FAQ
              </h2>
              <div className="mx-auto mb-[100px] max-w-4xl space-y-8">
                {faqData.map((faq, index) => (
                  <div
                    key={index}
                    className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20"
                  >
                    <h3 className="mb-4 text-2xl font-bold text-[#ff2975]">{faq.question}</h3>
                    <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                      {faq.answer}
                    </p>
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
