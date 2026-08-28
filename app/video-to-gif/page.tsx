import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { Footer } from '@/app/components/ui/Footer';
import { LatestPostsSection } from '@/components/blog/LatestPostsSection';
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card';
import { BorderBeam } from '@/components/magicui/border-beam';
import { GifEditorEmbed } from '@/components/video-to-gif/GifEditorEmbed';
import { SITE_BRAND, absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Video to GIF Converter — MP4 to GIF Online',
  description:
    'Convert MP4, MOV, and WebM video to GIF in your browser. Trim the clip, resize, add text, and export a clean animated GIF without a watermark.',
  alternates: { canonical: '/video-to-gif' },
};
const features = [
  {
    name: 'Fast video to GIF conversion',
    body: 'Convert common formats like MP4, AVI, and MOV into smooth animated GIFs in seconds — right in your browser.',
  },
  {
    name: 'Private by design',
    body: 'Processing runs locally in your browser so your video stays on your device.',
  },
  {
    name: 'Built-in GIF editor',
    body: 'Crop, resize, rotate, add text, adjust frame rate, and optimize file size for the perfect loop.',
  },
  {
    name: 'Trim and timing control',
    body: 'Pick the exact moment, adjust speed, and fine-tune timing so your GIF feels natural.',
  },
  {
    name: 'Wide format support',
    body: 'Works with MP4, AVI, MOV, WebM, and more — with automatic format handling.',
  },
  {
    name: 'Works on desktop and mobile',
    body: 'Use the same converter on desktop, tablet, or phone — no app needed.',
  },
];
const faqData = [
  {
    question: 'How do I convert MP4 to GIF with high quality?',
    answer:
      'Upload your MP4 video to our converter, select your desired frame range and quality settings. Our tool maintains high resolution while optimizing file size. You can resize, crop, and adjust frame rate for perfect GIF quality from your MP4 video.',
  },
  {
    question: 'What video formats can I convert to GIF?',
    answer:
      'Our video to GIF converter supports MP4, AVI, MOV, WMV, FLV, WebM, and most other popular video formats. Simply upload your video file and our tool will automatically detect and convert it to an optimized animated GIF.',
  },
  {
    question: 'Can I edit the GIF after converting from video?',
    answer:
      'Yes! After converting your video to GIF, use our built-in editor to resize dimensions, crop regions, add text overlays, adjust animation speed, optimize file size, and apply effects. Full frame-by-frame editing control available.',
  },
  {
    question: 'Is there a file size limit for video to GIF conversion?',
    answer:
      'Currently we support video files up to 100MB for optimal performance. For larger videos, consider trimming to your desired segment first. Our converter optimizes output GIF size while maintaining quality.',
  },
  {
    question: 'How do I reduce GIF file size after video conversion?',
    answer:
      'Use our GIF optimizer to reduce file size: lower the frame rate, resize dimensions, reduce color palette, or crop unnecessary areas. Our compression algorithms maintain visual quality while significantly reducing file size.',
  },
  {
    question: 'Can I convert video to GIF on mobile devices?',
    answer:
      'Absolutely! Our video to GIF converter is fully responsive and works on all mobile devices. Convert videos to GIFs directly from your phone or tablet browser with the same features as desktop.',
  },
  {
    question: 'Do you add watermarks to converted GIFs?',
    answer:
      'No, all GIFs created with our video to GIF converter are completely free of watermarks. Download and use your converted animated GIFs for any purpose without attribution requirements.',
  },
  {
    question: 'How long does video to GIF conversion take?',
    answer:
      'Conversion speed depends on video length and quality settings, but most videos convert to GIF in under 30 seconds. Processing happens locally in your browser for fast, secure conversion.',
  },
];
export default function VideoToGif() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `Video to GIF Converter - ${SITE_BRAND}`,
    url: absoluteUrl('/video-to-gif'),
    description:
      'Free online video to GIF converter. Convert MP4, AVI, MOV videos to high-quality animated GIFs with professional editing tools.',
    applicationCategory: 'VideoApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'MP4 to GIF converter',
      'AVI to GIF converter',
      'MOV to GIF converter',
      'Video frame extraction',
      'GIF quality optimization',
      'Frame rate control',
      'Video cropping',
      'Animation speed adjustment',
      'No watermarks',
    ],
    author: {
      '@type': 'Organization',
      name: SITE_BRAND,
    },
  };

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
                    MP4 · MOV · AVI · WebM — browser-based, no watermark
                  </div>
                  <NeonGradientCard className="flex w-full items-center justify-center">
                    <h1 className="pointer-events-none z-10 w-full bg-gradient-to-br from-[#ff2975] from-35% to-[#00FFF1] bg-clip-text text-center text-4xl font-bold leading-tight tracking-tighter text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] sm:text-5xl md:text-7xl md:leading-none">
                      Free Video to GIF Converter
                    </h1>
                  </NeonGradientCard>
                  <p className="max-w-3xl text-pretty px-4 py-4 text-center text-xl text-slate-700 dark:text-slate-300 md:px-0">
                    Turn a short clip into a crisp, looping GIF. Upload MP4, AVI, MOV, or WebM, trim
                    the scene, crop and resize, add text, and export an optimized GIF — free and
                    watermark-free.
                  </p>
                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <Link
                      href="#video-to-gif-tool"
                      className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-slate-900/10 transition-all duration-200 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:shadow-white/5 dark:hover:bg-slate-100"
                    >
                      Convert Video to GIF
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                      href="/blog/how-to-make-a-gif-from-a-video"
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-600 dark:hover:bg-slate-800"
                    >
                      Conversion guide
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
              id="video-to-gif-tool"
              aria-labelledby="video-to-gif-tool-title"
              className="relative z-[999] scroll-mt-24 bg-slate-50/95 py-14 dark:bg-slate-950/95 sm:py-20"
            >
              <div className="mx-auto w-full max-w-7xl sm:px-6 lg:px-8">
                <div className="mb-8 px-4 sm:px-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                    Video to GIF tool
                  </p>
                  <h2
                    id="video-to-gif-tool-title"
                    className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl"
                  >
                    Upload a clip and create the GIF here
                  </h2>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-400">
                    Import MP4, MOV, AVI, or WebM, choose the useful frames, edit the loop, and
                    export without moving to a separate landing page.
                  </p>
                </div>
                <GifEditorEmbed initialMenuOption="Video" label="Video to GIF editor" />
              </div>
            </section>

            <section className="relative z-[999] w-full py-20">
              <div className="pointer-events-none absolute inset-0 bg-white/30 dark:bg-slate-950/40" />
              <div className="container relative mx-auto flex h-full w-full flex-col px-4">
                <h2 className="mb-8 whitespace-pre-wrap py-12 text-center text-3xl font-bold leading-none text-slate-800 dark:bg-gradient-to-b dark:from-white dark:to-slate-500 dark:bg-clip-text dark:text-transparent md:text-6xl">
                  Video to GIF Conversion Features
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                        {feature.name}
                      </h3>
                      <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
                        {feature.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <section className="relative w-full py-20">
              <div className="mx-auto max-w-6xl px-4">
                <div className="mx-auto mb-12 max-w-3xl text-center">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white md:text-5xl">
                    How to convert video to GIF online
                  </h2>
                  <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400 md:text-lg">
                    Four steps from raw clip to optimized animation.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {[
                    {
                      step: '1',
                      title: 'Upload your video',
                      body: 'Select your video file (MP4, AVI, MOV, WMV, etc.). Files are processed locally — nothing is uploaded to a server.',
                    },
                    {
                      step: '2',
                      title: 'Customize settings',
                      body: 'Choose frame range, adjust quality, resize dimensions, and set frame rate. Preview your GIF in real time.',
                    },
                    {
                      step: '3',
                      title: 'Edit and optimize',
                      body: 'Crop regions, add text overlays, apply effects, and fine-tune file size with the built-in GIF editor.',
                    },
                    {
                      step: '4',
                      title: 'Download your GIF',
                      body: 'Export a high-quality animated GIF with no watermark. Perfect for social, websites, docs, and messaging.',
                    },
                  ].map(({ step, title, body }) => (
                    <article
                      key={step}
                      className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
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
              <div className="container relative mx-auto px-4">
                <h2 className="mb-8 whitespace-pre-wrap py-12 text-center text-3xl font-bold leading-none text-slate-800 dark:bg-gradient-to-b dark:from-white dark:to-slate-500 dark:bg-clip-text dark:text-transparent md:text-6xl">
                  Video to GIF Converter FAQ
                </h2>
                <div className="mx-auto mb-[60px] max-w-4xl space-y-6">
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
            <LatestPostsSection
              title="Video to GIF tutorials and optimization tips"
              description="These guides support the same search intent as the converter page and help users choose better clip length, quality, and file-size settings."
              postSlugs={[
                'how-to-make-a-gif-from-a-video',
                'optimize-gif-size-without-losing-quality',
                'record-screen-and-turn-it-into-a-gif',
              ]}
            />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}
