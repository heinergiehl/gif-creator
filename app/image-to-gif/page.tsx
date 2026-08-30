import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Footer } from '../components/ui/Footer';
import { LatestPostsSection } from '@/components/blog/LatestPostsSection';
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card';
import { Button } from '@/components/ui/button';
import { IMAGE_EDITOR_PATH } from '@/lib/editor-intents';
import { SITE_BRAND } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Image to GIF Maker — Create GIFs from Photos',
  description:
    'Turn JPG, PNG, WebP, and HEIC images into an animated GIF. Arrange frames, set timing, add text, resize, and export locally without a watermark.',
  alternates: { canonical: '/image-to-gif' },
};

export default function ImageToGif() {
  return (
    <div className="relative z-40 min-h-screen w-screen text-black dark:text-white md:w-full">
      <div
        className="fixed inset-0 z-[10] h-full w-full items-center px-5 py-24 opacity-100
                   [background:radial-gradient(125%_125%_at_50%_50%,#fdfdfd_30%,#63e_100%)]
                   dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"
      />
      <div
        className="fixed inset-0 z-[20] h-full w-full bg-[linear-gradient(to_right,#4f4f4f40_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f40_1px,transparent_1px)]
                   bg-[size:28px_28px] opacity-40 dark:bg-[linear-gradient(to_right,#4f4f4f55_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f55_1px,transparent_1px)]
                   dark:bg-[size:28px_28px] dark:opacity-100"
      />
      <div className="relative z-40 flex w-full flex-col items-stretch opacity-100">
        <main className="font-sans">
          <section className="w-full pb-16 pt-32">
            <div className="flex items-center justify-center">
              <div className="flex w-full max-w-6xl flex-col items-center gap-y-6 px-4">
                <div className="rounded-full border border-white/40 bg-white/60 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200">
                  JPG &middot; PNG &middot; WebP &middot; HEIC &mdash; browser-based, no watermark
                </div>
                <NeonGradientCard className="flex w-full items-center justify-center">
                  <h1 className="pointer-events-none z-10 w-full bg-gradient-to-br from-[#ff2975] from-35% to-[#00FFF1] bg-clip-text text-center text-4xl font-bold leading-tight tracking-tighter text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] sm:text-5xl md:text-7xl md:leading-none">
                    Free Image to GIF Converter
                  </h1>
                </NeonGradientCard>
                <p className="max-w-3xl text-pretty px-4 py-4 text-center text-xl text-slate-700 dark:text-slate-300 md:px-0">
                  Turn photos into smooth, looping GIFs in minutes. Upload JPG, PNG, WebP, or HEIC
                  images, arrange the order, set timing, add text, crop and resize, then export an
                  optimized animated GIF - free and watermark-free.
                </p>
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <Link
                    href={IMAGE_EDITOR_PATH}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-slate-900/10 transition-all duration-200 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:shadow-white/5 dark:hover:bg-slate-100"
                  >
                    Create Your GIF
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/blog/turn-images-into-a-smooth-animated-gif"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-600 dark:hover:bg-slate-800"
                  >
                    Image GIF guide
                  </Link>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span>Free to use</span>
                  <span>No sign-up</span>
                  <span>Local browser processing</span>
                  <span>No watermark</span>
                </div>
              </div>
            </div>
          </section>

          <section
            id="image-to-gif-tool"
            aria-labelledby="image-to-gif-tool-title"
            className="relative z-[999] scroll-mt-24 bg-slate-50/95 py-14 dark:bg-slate-950/95 sm:py-20"
          >
            <div className="mx-auto w-full max-w-7xl sm:px-6 lg:px-8">
              <div className="mb-8 px-4 sm:px-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                  Image to GIF tool
                </p>
                <h2
                  id="image-to-gif-tool-title"
                  className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl"
                >
                  Build your animation in the full-size editor
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-400">
                  Add JPG, PNG, WebP, or HEIC files, arrange the frame order, and adjust timing
                  in a dedicated workspace with room for the preview and timeline.
                </p>
              </div>
              <div className="px-4 sm:px-0">
                <Button asChild size="lg">
                  <Link href={IMAGE_EDITOR_PATH}>Open image editor</Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="relative z-[999] w-full py-20">
            <div className="pointer-events-none absolute inset-0 bg-white/30 dark:bg-slate-950/40" />
            <div className="relative mx-auto max-w-5xl px-4 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-800 dark:text-white md:text-5xl">
                Make an Animated GIF from Images
              </h2>
              <p className="mx-auto mb-12 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 md:text-lg">
                {SITE_BRAND} makes it easy to create an animated GIF from an image sequence. Upload
                your photos, adjust the timing, and export a lightweight GIF ready for social media,
                websites, and messaging.
              </p>
              <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-3">
                {[
                  {
                    step: '1',
                    title: 'Upload photos',
                    body: 'Add JPG, PNG, WebP, or HEIC images and they become individual frames.',
                  },
                  {
                    step: '2',
                    title: 'Arrange and edit',
                    body: 'Reorder frames, set duration, crop and resize, and add text for captions.',
                  },
                  {
                    step: '3',
                    title: 'Export and share',
                    body: 'Download an optimized animated GIF - clean exports with no watermark.',
                  },
                ].map(({ step, title, body }) => (
                  <article
                    key={step}
                    className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      Step {step}
                    </p>
                    <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                      {title}
                    </h3>
                    <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">{body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="relative w-full py-20">
            <div className="pointer-events-none absolute inset-0 bg-white/25 dark:bg-slate-950/40" />
            <div className="relative mx-auto max-w-4xl px-4">
              <h2 className="mb-8 py-8 text-center text-3xl font-bold text-slate-800 dark:bg-gradient-to-b dark:from-white dark:to-slate-500 dark:bg-clip-text dark:text-transparent md:text-5xl">
                Image to GIF FAQ
              </h2>
              <div className="mb-[60px] space-y-6">
                {[
                  {
                    q: 'What image formats do you support?',
                    a: 'You can create GIFs from JPG, PNG, WebP, HEIC, and most common image formats. Upload a sequence and export a single animated GIF.',
                  },
                  {
                    q: 'How do I control GIF speed?',
                    a: 'Adjust the frame duration to speed up or slow down your animation. Shorter durations create a faster GIF; longer durations create a slower one.',
                  },
                  {
                    q: 'How can I reduce GIF file size?',
                    a: 'Resize dimensions, reduce the number of frames, or increase frame duration. Exporting an optimized size helps GIFs load faster on the web.',
                  },
                  {
                    q: 'Can I add text to an image GIF?',
                    a: 'Yes. After arranging your frames, use the built-in text tool to add captions, labels, or callouts to any frame before exporting.',
                  },
                ].map(({ q, a }) => (
                  <div
                    key={q}
                    className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20"
                  >
                    <h3 className="mb-4 text-2xl font-bold text-[#ff2975]">{q}</h3>
                    <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <LatestPostsSection
            title="Image to GIF guides"
            description="Support image-sequence and photo-to-GIF searches with focused tutorials on timing, smooth playback, and file-size control."
            postSlugs={[
              'turn-images-into-a-smooth-animated-gif',
              'how-to-edit-a-gif-without-losing-quality',
              'optimize-gif-size-without-losing-quality',
            ]}
          />
        </main>
        <Footer />
      </div>
    </div>
  );
}
