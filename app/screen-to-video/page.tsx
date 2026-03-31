import Link from 'next/link';
import { Footer } from '@/app/components/ui/Footer';
import { LatestPostsSection } from '@/components/blog/LatestPostsSection';
import { SITE_BRAND, absoluteUrl } from '@/lib/site';
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
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="mt-[62px] font-sans">
        <section className="bg-slate-100 py-20 dark:bg-slate-950">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-4xl">
              <div className="mb-4 inline-flex rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                Screen recording + trim + crop + GIF workflow
              </div>
              <h1 className="text-5xl font-bold tracking-tight md:text-6xl">Free Online Screen Recorder</h1>
              <p className="py-6 text-lg text-slate-700 dark:text-slate-300">
                Record your screen, browser tab, or app window directly in the browser. Trim the clip,
                crop the important area, download MP4, or continue into GIF conversion without leaving {SITE_BRAND}.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
                <Link href="/screen-to-video/record-screen" className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700">
                  Start screen recording
                </Link>
                <Link href="/video-to-gif/converter-and-editor/editor" className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-8 py-4 text-lg font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800">
                  Convert a recording to GIF
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                <span>No install</span>
                <span>No sign-up</span>
                <span>Local browser workflow</span>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-16">
          <div className="container mx-auto w-full px-4">
            <h2 className="mb-8 text-center text-3xl font-bold">
              Why use {SITE_BRAND} for screen recording?
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">Clean MP4 export</h3>
                  <p>
                    Capture sharp recordings in-browser and download a shareable video without extra software.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">Fast capture workflow</h3>
                  <p>
                    Choose a screen, stop when you’re ready, trim the clip, and export in a few steps.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">Completely Free</h3>
                  <p>
                    {SITE_BRAND} is completely free to use. No hidden costs or subscriptions
                    required.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">Crop and focus the recording</h3>
                  <p>
                    Record your whole screen, browser tab, or a single app window, then crop to the area that matters.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">Built for GIF workflows</h3>
                  <p>
                    Move from screen recording to video trimming to GIF conversion without switching tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-3xl font-bold">How it works</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border bg-white/70 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h3 className="mb-3 text-xl font-semibold">1. Choose what to capture</h3>
                <p className="text-slate-700 dark:text-slate-300">Select your full screen, a browser tab, or a single app window in the browser permission dialog.</p>
              </div>
              <div className="rounded-2xl border bg-white/70 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h3 className="mb-3 text-xl font-semibold">2. Trim and crop</h3>
                <p className="text-slate-700 dark:text-slate-300">After recording, trim the start/end and crop the frame so the final video focuses on the important content.</p>
              </div>
              <div className="rounded-2xl border bg-white/70 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <h3 className="mb-3 text-xl font-semibold">3. Export or convert</h3>
                <p className="text-slate-700 dark:text-slate-300">Download MP4 for sharing or move into the GIF editor if you need a short animation for docs, demos, or social posts.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-gray-100 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-3xl font-bold">Frequently Asked Questions</h2>
            <div className="space-y-8 text-left">
              <div>
                <h3 className="text-xl font-semibold">
                  How do I record my screen and convert it into a video?
                </h3>
                <p>
                  Click “Start recording”, choose what you want to capture (screen, tab, or window),
                  then download the result as a video when you’re done.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Can I edit a video after converting it?</h3>
                <p>
                  Yes, after converting your screen recording to a video, you can use our editing
                  tools to customize it further. Add text, adjust sizes, and apply filters to make
                  your videos stand out.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Can I edit a GIF after converting it?</h3>
                <p>
                  Yes, after converting your video to a GIF, our platform offers various editing
                  tools. You can add text, adjust sizes, rotate, and scale images within your GIF,
                  making it perfectly suited to your needs.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  Is there a limit to how many GIFs I can create?
                </h3>
                <p>
                  At {SITE_BRAND}, we offer unlimited video to GIF conversions. Our service is
                  completely free, allowing you to create as many GIFs as you like without any
                  restrictions.
                </p>
              </div>
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
  );
}
