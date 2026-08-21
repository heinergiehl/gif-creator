import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Gauge, LockKeyhole } from 'lucide-react';
import { GifOptimizerTool } from '@/components/gif-optimizer/GifOptimizerTool';
import { RelatedGifTools } from '@/components/gif-tools/RelatedGifTools';
import { absoluteUrl } from '@/lib/site';

const title = 'Compress GIF Online to an Exact KB or MB Size';
const description =
  'Compress an animated GIF to a specific KB or MB limit. Compare real output files, keep the clearest result under your target, and download it without uploading your source.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'compress GIF',
    'GIF compressor',
    'reduce GIF file size',
    'compress GIF to 1MB',
    'compress GIF to exact size',
    'make GIF smaller',
    'GIF size reducer',
  ],
  alternates: {
    canonical: '/compress-gif',
  },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/compress-gif'),
    title,
    description,
    images: [
      {
        url: '/hero-dark.png',
        width: 1200,
        height: 630,
        alt: 'Compress a GIF to an exact file-size target',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/hero-dark.png'],
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'GIF Size Lab',
  url: absoluteUrl('/compress-gif'),
  description,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires a modern browser with WebAssembly support.',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Exact KB or MB target',
    'Local browser processing',
    'Multiple measured output variants',
    'Frame-rate, color, and dimension controls',
  ],
};

const steps = [
  {
    number: '01',
    title: 'Choose an animated GIF',
    text: 'The file is analyzed locally for dimensions, frames, duration, and current size.',
  },
  {
    number: '02',
    title: 'Enter the real size limit',
    text: 'Use KB or MB. Advanced controls stay optional unless dimensions, motion, or color need a hard limit.',
  },
  {
    number: '03',
    title: 'Compare measured results',
    text: 'The tool tests multiple encodes and selects the clearest result that is at or below your target.',
  },
];

const questions = [
  {
    question: 'How does the optimizer hit a specific GIF size?',
    answer:
      'It performs a bounded search across real encodes, changing dimensions, frame rate, palette size, and dithering in controlled steps. File sizes shown in the results are measured outputs, not estimates.',
  },
  {
    question: 'Will my GIF be uploaded?',
    answer:
      'No. The source file is decoded and encoded in your browser. The browser downloads the processing engine, but the GIF itself is not sent to an editing server.',
  },
  {
    question: 'What if the target is too small?',
    answer:
      'The tool shows the smallest safe result it produced and says clearly that the target was not reached. You can then lower the maximum width or choose a smaller motion and color setting.',
  },
];

export default function CompressGifPage() {
  return (
    <main className="select-text overflow-x-clip bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pb-28">
        <header className="max-w-4xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            <Gauge className="h-4 w-4" />
            GIF Size Lab
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-5xl lg:text-6xl lg:leading-[1.05]">
            Compress a GIF to the size you actually need
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
            Set an exact KB or MB limit. We test real output files and keep the clearest version
            that fits—without uploading your source GIF.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Measured file sizes
            </span>
            <span className="inline-flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Browser-only processing
            </span>
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              No watermark
            </span>
          </div>
        </header>

        <div className="mt-10 lg:mt-12">
          <GifOptimizerTool />
        </div>

        <section
          aria-labelledby="how-it-works"
          className="mt-20 grid gap-10 border-y border-slate-200 py-14 dark:border-slate-800 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-20"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
              How it works
            </p>
            <h2
              id="how-it-works"
              className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              A size limit, not a mystery quality slider
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-600 dark:text-slate-400">
              The default path asks for one decision. Fine-grained controls are available when the
              destination has stricter visual requirements.
            </p>
          </div>
          <ol className="divide-y divide-slate-200 border-t border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {steps.map((step) => (
              <li key={step.number} className="grid gap-3 py-6 sm:grid-cols-[48px_1fr] sm:gap-5">
                <span className="font-mono text-sm text-blue-600 dark:text-blue-400">
                  {step.number}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-950 dark:text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="gif-compression-questions"
          className="mt-16 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"
        >
          <div>
            <h2
              id="gif-compression-questions"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Straight answers before you compress
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-600 dark:text-slate-400">
              Need a manual edit first?{' '}
              <Link
                href="/crop-gif"
                className="font-medium text-blue-700 underline underline-offset-4 dark:text-blue-300"
              >
                Crop the GIF
              </Link>{' '}
              or{' '}
              <Link
                href="/resize-gif"
                className="font-medium text-blue-700 underline underline-offset-4 dark:text-blue-300"
              >
                resize it
              </Link>{' '}
              before running the size search.
            </p>
            <Link
              href="/blog/optimize-gif-size-without-losing-quality"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-950 hover:text-blue-700 dark:text-white dark:hover:text-blue-300"
            >
              Read the practical GIF optimization guide
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {questions.map((item) => (
              <article key={item.question} className="py-6">
                <h3 className="font-semibold text-slate-950 dark:text-white">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-16">
          <RelatedGifTools currentPath="/compress-gif" />
        </div>
      </div>
    </main>
  );
}
