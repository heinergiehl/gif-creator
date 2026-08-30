import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Footer } from '@/app/components/ui/Footer';
import { LatestPostsSection } from '@/components/blog/LatestPostsSection';
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card';
import { SITE_BRAND, absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Free Online Screen Recorder - Capture, Trim & Convert to GIF',
  description:
    'Record your screen, browser tab, or app window in the browser. Trim the clip, crop the area you want, download MP4, or continue into GIF conversion - no install, no sign-up.',
  alternates: { canonical: '/screen-to-video' },
};

export default function ScreenToVideo() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${SITE_BRAND} Screen Recorder`,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    url: absoluteUrl('/screen-to-video'),
    description:
      'Record your screen online, trim the captured video, crop the area you want, and continue into GIF conversion or editing.',
    featureList: [
      'Record screen, tab, or app window',
      'Trim screen recordings before export',
      'Crop recordings to the important area',
      'Download screen capture as MP4',
      'Continue into GIF conversion workflow',
    ],
  };

  return (
    <div className="relative z-40 min-h-screen w-screen text-black dark:text-white md:w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
                  Screen recording + trim + crop + GIF workflow
                </div>
                <NeonGradientCard className="flex w-full items-center justify-center">
                  <h1 className="pointer-events-none z-10 w-full bg-gradient-to-br from-[#ff2975] from-35% to-[#00FFF1] bg-clip-text text-center text-4xl font-bold leading-tight tracking-tighter text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] sm:text-5xl md:text-7xl md:leading-none">
                    Free Online Screen Recorder
                  </h1>
                </NeonGradientCard>
                <p className="max-w-3xl text-pretty px-4 py-4 text-center text-xl text-slate-700 dark:text-slate-300 md:px-0">
                  Record your screen, browser tab, or app window directly in the browser. Trim the
                  clip, crop the important area, download MP4, or continue into GIF conversion
                  without leaving {SITE_BRAND}.
                </p>
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <Link
                    href="/screen-to-video/record-screen"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-slate-900/10 transition-all duration-200 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:shadow-white/5 dark:hover:bg-slate-100"
                  >
                    Start Recording
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/video-to-gif/editor"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-600 dark:hover:bg-slate-800"
                  >
                    Convert recording to GIF
                  </Link>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span>No install</span>
                  <span>No sign-up</span>
                  <span>Local browser workflow</span>
                  <span>Free forever</span>
                </div>
              </div>
            </div>
          </section>

          <section className="relative z-[999] w-full py-20">
            <div className="pointer-events-none absolute inset-0 bg-white/30 dark:bg-slate-950/40" />
            <div className="relative mx-auto max-w-5xl px-4">
              <h2 className="mb-8 text-center text-3xl font-bold text-slate-800 dark:bg-gradient-to-b dark:from-white dark:to-slate-400 dark:bg-clip-text dark:text-transparent md:text-5xl">
                Why use {SITE_BRAND} for screen recording?
              </h2>
              <div className="grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    title: 'Clean MP4 export',
                    body: 'Capture sharp recordings in-browser and download a shareable video without extra software.',
                  },
                  {
                    title: 'Fast capture workflow',
                    body: 'Choose a screen, stop when ready, trim the clip, and export in a few steps.',
                  },
                  {
                    title: 'Completely free',
                    body:
                      SITE_BRAND +
                      ' is completely free to use. No hidden costs or subscriptions required.',
                  },
                  {
                    title: 'Crop and focus',
                    body: 'Record your whole screen, a browser tab, or a single app window, then crop to the area that matters.',
                  },
                  {
                    title: 'Built for GIF workflows',
                    body: 'Move from screen recording to video trimming to GIF conversion without switching tools.',
                  },
                  {
                    title: 'Privacy-first processing',
                    body: 'All recording and processing happens locally in your browser. Nothing is uploaded to a server.',
                  },
                ].map(({ title, body }) => (
                  <div
                    key={title}
                    className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                      {title}
                    </h3>
                    <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="relative w-full py-20">
            <div className="pointer-events-none absolute inset-0 bg-white/25 dark:bg-slate-950/40" />
            <div className="relative mx-auto max-w-5xl px-4 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-800 dark:text-white md:text-5xl">
                How it works
              </h2>
              <p className="mx-auto mb-12 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 md:text-lg">
                Three steps from browser tab to finished GIF.
              </p>
              <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-3">
                {[
                  {
                    step: '1',
                    title: 'Choose what to capture',
                    body: 'Select your full screen, a browser tab, or a single app window in the browser permission dialog.',
                  },
                  {
                    step: '2',
                    title: 'Trim and crop',
                    body: 'After recording, trim the start/end and crop the frame so the final video focuses on the important content.',
                  },
                  {
                    step: '3',
                    title: 'Export or convert',
                    body: 'Download MP4 for sharing or move into the GIF editor for a short animation for docs, demos, or social posts.',
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
            <div className="pointer-events-none absolute inset-0 bg-white/20 dark:bg-slate-950/50" />
            <div className="relative mx-auto max-w-4xl px-4">
              <h2 className="mb-8 py-8 text-center text-3xl font-bold text-slate-800 dark:bg-gradient-to-b dark:from-white dark:to-slate-500 dark:bg-clip-text dark:text-transparent md:text-5xl">
                Frequently Asked Questions
              </h2>
              <div className="mb-[60px] space-y-6">
                {[
                  {
                    q: 'How do I record my screen and convert it into a video?',
                    a: 'Click "Start Recording", choose what you want to capture (screen, tab, or window), then download the result as a video when you are done.',
                  },
                  {
                    q: 'Can I edit a video after recording it?',
                    a: 'Yes. After recording you can trim start and end points, crop the frame, and continue into the GIF editor to add text, adjust sizes, and apply filters.',
                  },
                  {
                    q: 'Can I convert a screen recording to a GIF?',
                    a: 'Yes. After recording, use the "Convert recording to GIF" button to take your MP4 straight into the GIF conversion workflow.',
                  },
                  {
                    q: 'Is there a limit to how many recordings I can make?',
                    a:
                      SITE_BRAND +
                      ' is completely free. Record as many screen captures as you need with no restrictions.',
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
            title="Screen recording to GIF workflow guides"
            description="Give search engines and users a clearer path from screen capture intent to conversion, editing, and optimization content."
            postSlugs={[
              'record-screen-and-turn-it-into-a-gif',
              'how-to-make-a-gif-from-a-video',
              'optimize-gif-size-without-losing-quality',
            ]}
          />
        </main>
        <Footer />
      </div>
    </div>
  );
}
