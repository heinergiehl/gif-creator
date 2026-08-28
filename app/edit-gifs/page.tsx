import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Footer } from '@/app/components/ui/Footer';
import { GifStudioEmbed } from '@/components/gif-studio/GifStudioEmbed';
import { Button } from '@/components/ui/button';
import { getGifEditorIntentHref } from '@/lib/editor-intents';
import { SITE_BRAND, absoluteUrl } from '@/lib/site';

const pageTitle = 'Free Online GIF Editor — Edit Animated GIFs';
const pageDescription =
  'Edit animated GIFs frame by frame in one online studio. Crop, resize, add timed text, blur details, and export locally without a watermark.';

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: '/edit-gifs' },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/edit-gifs'),
    title: pageTitle,
    description: pageDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
  },
};

const editingFeatures = [
  {
    label: 'Timing',
    title: 'Control the pace frame by frame',
    description:
      'Set an individual delay for each frame or update the duration of a selected group, then preview the pacing on the timeline.',
  },
  {
    label: 'Transform',
    title: 'Correct only the frames that need it',
    description:
      'Crop, rotate, flip, zoom, and pan selected frames without taking the animation out of context.',
  },
  {
    label: 'Text',
    title: 'Place copy on a precise moment',
    description:
      'Style and position a text overlay, then choose exactly when it enters and leaves the animation.',
  },
  {
    label: 'Redaction',
    title: 'Hide sensitive details locally',
    description:
      'Cover a region for part or all of the animation with adjustable blur or pixelation.',
  },
  {
    label: 'Annotations',
    title: 'Explain a product flow clearly',
    description:
      'Add timed spotlights, callouts, and cursor markers for focused demos and walkthroughs.',
  },
  {
    label: 'Effects',
    title: 'Tune the look per selection',
    description:
      'Adjust brightness, contrast, saturation, blur, grayscale, and sepia on the selected frames.',
  },
] as const;

const workflowSteps = [
  {
    number: '01',
    title: 'Bring in the source',
    description:
      'Open a GIF, video, image sequence, or record a screen demo. The source media stays in your browser.',
  },
  {
    number: '02',
    title: 'Edit with the timeline in view',
    description:
      'Select one or more frames, set their timing, and add transforms, overlays, redaction, annotations, or effects.',
  },
  {
    number: '03',
    title: 'Export for the destination',
    description:
      'Download without a forced watermark. GIF is the core output; WebP, APNG, and MP4 depend on the current browser runtime.',
  },
] as const;

const toolLinks = [
  {
    href: '/resize-gif',
    title: 'Resize GIF',
    description: 'Set exact output dimensions in a focused resizing workflow.',
  },
  {
    href: '/crop-gif',
    title: 'Crop GIF',
    description: 'Remove unused edges and keep attention on the important region.',
  },
  {
    href: '/compress-gif',
    title: 'Compress GIF',
    description: 'Reduce file size with a workflow built around practical output targets.',
  },
  {
    href: '/add-text-to-gif',
    title: 'Add text to GIF',
    description: 'Start with the dedicated text workflow, then continue editing if needed.',
  },
  {
    href: '/video-to-gif',
    title: 'Video to GIF',
    description: 'Turn a short video clip into an editable animated GIF.',
  },
] as const;

const guideLinks = [
  {
    href: '/blog/how-to-edit-a-gif-without-losing-quality',
    title: 'How to edit a GIF without losing quality',
    description: 'A practical editing order for keeping motion clean and readable.',
  },
  {
    href: '/blog/optimize-gif-size-without-losing-quality',
    title: 'How to reduce GIF file size',
    description: 'Balance dimensions, timing, color, and motion before exporting again.',
  },
  {
    href: '/blog/how-to-add-text-to-a-gif-without-cluttering-the-animation',
    title: 'How to add text without cluttering a GIF',
    description: 'Choose readable copy, placement, and timing for short animations.',
  },
  {
    href: '/blog/gif-vs-webp-vs-apng-which-format-should-you-use',
    title: 'GIF vs WebP vs APNG',
    description: 'Choose an animation format based on compatibility, quality, and size.',
  },
] as const;

const faqs = [
  {
    question: 'Can I edit one GIF frame at a time?',
    answer:
      'Yes. The timeline lets you set timing for individual frames and select multiple frames when a transform or effect should apply to a group.',
  },
  {
    question: 'Does the GIF editor upload my source file?',
    answer:
      'No editing server is used for your source media. Importing, editing, previewing, and rendering happen locally in the browser.',
  },
  {
    question: 'Can I add text, blur, or annotations to an animated GIF?',
    answer:
      'Yes. Text, blur, pixelation, spotlights, callouts, and cursor markers can be positioned and limited to a chosen time range.',
  },
  {
    question: 'Which export formats are available?',
    answer:
      'GIF is the primary output. The studio checks the current browser runtime before offering animated WebP, APNG, or MP4, so those formats can vary by browser and device.',
  },
  {
    question: 'Will the editor add a watermark?',
    answer:
      'No forced watermark is added. A watermark remains an optional annotation only when you choose to add one yourself.',
  },
] as const;

export default function EditGifsPage() {
  const applicationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${SITE_BRAND} GIF Studio`,
    url: absoluteUrl('/edit-gifs'),
    description: pageDescription,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any device with a supported web browser',
    browserRequirements: 'JavaScript and WebAssembly support',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Local browser-based GIF editing',
      'Per-frame and multi-frame timing controls',
      'Crop, rotate, flip, zoom, and pan transforms',
      'Timed text overlays',
      'Blur and pixelation redaction',
      'Spotlight, callout, and cursor annotations',
      'Brightness, contrast, saturation, blur, grayscale, and sepia effects',
      'GIF export with runtime-checked WebP, APNG, and MP4 options',
      'Exports without a forced watermark',
    ],
    author: {
      '@type': 'Organization',
      name: SITE_BRAND,
    },
  };
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="dark min-h-screen overflow-x-hidden bg-[#090d14] text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      <main>
        <section aria-labelledby="editor-heading" className="border-b border-slate-800">
          <div className="mx-auto max-w-7xl px-3 pb-14 pt-20 sm:px-8 sm:pb-20 sm:pt-24 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:gap-16">
              <div>
                <p className="font-mono text-xs font-medium uppercase tracking-[0.24em] text-sky-300">
                  Free browser-based GIF editor
                </p>
                <h1
                  id="editor-heading"
                  className="mt-5 max-w-4xl text-balance text-[clamp(3.1rem,7vw,6.4rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-white"
                >
                  Free online <br />
                  GIF editor.
                </h1>
              </div>

              <div className="max-w-2xl lg:pb-1">
                <p className="mt-8 max-w-2xl text-pretty text-lg leading-8 text-slate-300 sm:text-xl sm:leading-9">
                  Edit every frame in one timeline. Crop, resize, tune timing, add timed text, blur
                  private details, and export without a watermark. Your source media stays in your
                  browser.
                </p>

                <div className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-md bg-white px-6 text-base font-semibold text-slate-950 hover:bg-slate-200"
                  >
                    <Link href={getGifEditorIntentHref('edit')}>
                      Start editing
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
                    <Link
                      href={getGifEditorIntentHref('add-text')}
                      className="inline-flex min-h-11 items-center border-b border-slate-700 text-slate-300 transition-colors hover:border-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#090d14]"
                    >
                      Add text
                    </Link>
                    <Link
                      href={getGifEditorIntentHref('record-demo')}
                      className="inline-flex min-h-11 items-center border-b border-slate-700 text-slate-300 transition-colors hover:border-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#090d14]"
                    >
                      Record a screen demo
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <ul className="mt-6 grid border-y border-slate-800 text-sm text-slate-400 sm:grid-cols-3 sm:divide-x sm:divide-slate-800">
              <li className="flex min-h-14 items-center border-b border-slate-800 py-4 sm:border-b-0 sm:px-5 sm:first:pl-0">
                Local browser processing
              </li>
              <li className="flex min-h-14 items-center border-b border-slate-800 py-4 sm:border-b-0 sm:px-5">
                Per-frame timing
              </li>
              <li className="flex min-h-14 items-center py-4 sm:px-5 sm:last:pr-0">
                No forced watermark
              </li>
            </ul>
            <div
              id="gif-editor-tool"
              aria-label="Upload and edit an animated GIF"
              className="mt-6 scroll-mt-24"
            >
              <GifStudioEmbed />
            </div>
          </div>
        </section>

        <section aria-labelledby="features-heading" className="border-b border-slate-800">
          <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:px-12 lg:py-32">
            <header className="max-w-md">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
                Editing controls
              </p>
              <h2
                id="features-heading"
                className="mt-5 text-balance text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl"
              >
                Enough control to finish the animation in one place.
              </h2>
              <p className="mt-6 text-base leading-7 text-slate-400">
                Each tool stays connected to the same canvas and timeline, so timing and visual
                decisions remain easy to compare.
              </p>
            </header>

            <div className="border-y border-slate-800">
              {editingFeatures.map((feature) => (
                <article
                  key={feature.label}
                  className="grid gap-3 border-b border-slate-800 py-7 last:border-b-0 sm:grid-cols-[7rem_1fr] sm:gap-7"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-sky-300">
                    {feature.label}
                  </p>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">{feature.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="workflow-heading" className="border-b border-slate-800">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
                Three-step workflow
              </p>
              <h2
                id="workflow-heading"
                className="mt-5 text-balance text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl"
              >
                From source to finished loop.
              </h2>
            </div>

            <ol className="mt-12 border-y border-slate-800 lg:grid lg:grid-cols-3 lg:divide-x lg:divide-slate-800">
              {workflowSteps.map((step) => (
                <li
                  key={step.number}
                  className="border-b border-slate-800 py-8 last:border-b-0 lg:border-b-0 lg:px-8 lg:first:pl-0 lg:last:pr-0"
                >
                  <span className="font-mono text-xs text-sky-300">{step.number}</span>
                  <h3 className="mt-8 text-xl font-semibold text-slate-100">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="tools-heading" className="border-b border-slate-800">
          <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:px-12 lg:py-32">
            <header className="max-w-md">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
                Focused GIF tools
              </p>
              <h2
                id="tools-heading"
                className="mt-5 text-balance text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl"
              >
                Start with the smallest workflow that fits the job.
              </h2>
              <p className="mt-6 text-base leading-7 text-slate-400">
                Use a dedicated tool for a quick change, or open the full studio when the task spans
                multiple editing steps.
              </p>
            </header>

            <nav aria-label="Focused GIF tools">
              <ul className="border-t border-slate-800">
                {toolLinks.map((tool) => (
                  <li key={tool.href} className="border-b border-slate-800">
                    <Link
                      href={tool.href}
                      className="group grid min-h-24 gap-2 py-6 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400 sm:grid-cols-[12rem_1fr_auto] sm:items-center sm:gap-6"
                    >
                      <span className="font-semibold text-slate-100">{tool.title}</span>
                      <span className="text-sm leading-6 text-slate-400">{tool.description}</span>
                      <ArrowRight
                        className="hidden h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-slate-200 sm:block"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>

        <section aria-labelledby="guides-heading" className="border-b border-slate-800">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
              <header className="max-w-md">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
                  Editing guides
                </p>
                <h2
                  id="guides-heading"
                  className="mt-5 text-balance text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl"
                >
                  Make deliberate export choices.
                </h2>
              </header>

              <div className="grid border-y border-slate-800 sm:grid-cols-2">
                {guideLinks.map((guide, index) => (
                  <Link
                    key={guide.href}
                    href={guide.href}
                    className={`group min-h-48 border-b border-slate-800 py-7 transition-colors hover:bg-slate-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400 sm:px-7 ${
                      index % 2 === 0 ? 'sm:border-r sm:border-slate-800 sm:pl-0' : 'sm:pr-0'
                    } ${index >= guideLinks.length - 2 ? 'sm:border-b-0' : ''}`}
                  >
                    <h3 className="max-w-xs text-lg font-semibold text-slate-100 group-hover:text-white">
                      {guide.title}
                    </h3>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
                      {guide.description}
                    </p>
                    <span className="mt-7 inline-flex items-center text-xs font-medium uppercase tracking-[0.15em] text-sky-300">
                      Read guide
                      <ArrowRight
                        className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="faq-heading">
          <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:px-12 lg:py-32">
            <header className="max-w-md">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">FAQ</p>
              <h2
                id="faq-heading"
                className="mt-5 text-balance text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl"
              >
                What to know before editing.
              </h2>
            </header>

            <dl className="border-y border-slate-800">
              {faqs.map((faq) => (
                <div key={faq.question} className="border-b border-slate-800 py-7 last:border-b-0">
                  <dt>
                    <h3 className="text-lg font-semibold text-slate-100">{faq.question}</h3>
                  </dt>
                  <dd className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
