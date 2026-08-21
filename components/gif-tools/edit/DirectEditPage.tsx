import Link from 'next/link';
import { ArrowRight, Check, LockKeyhole, type LucideIcon } from 'lucide-react';
import { GifEditTool, type GifEditMode } from '@/components/gif-tools/edit/GifEditTool';
import { absoluteUrl } from '@/lib/site';

export interface DirectEditPageContent {
  mode: GifEditMode;
  path: string;
  label: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  benefits: [string, string, string];
  steps: Array<{
    title: string;
    text: string;
  }>;
  related: Array<{
    href: string;
    label: string;
    description: string;
  }>;
}

export function DirectEditPage({ content }: { content: DirectEditPageContent }) {
  const { Icon } = content;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: content.label,
    url: absoluteUrl(content.path),
    description: content.description,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires a modern browser with WebAssembly support.',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <main className="select-text overflow-x-clip bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pb-28">
        <nav aria-label="Breadcrumb" className="mb-7 text-sm text-slate-500 dark:text-slate-400">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-blue-700 dark:hover:text-blue-300">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/gif-tools" className="hover:text-blue-700 dark:hover:text-blue-300">
                GIF tools
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-slate-800 dark:text-slate-200">
              {content.label}
            </li>
          </ol>
        </nav>

        <header className="max-w-4xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            <Icon className="h-4 w-4" aria-hidden="true" />
            {content.label}
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-5xl lg:text-6xl lg:leading-[1.05]">
            {content.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
            {content.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
            {content.benefits.map((benefit, index) => (
              <span key={benefit} className="inline-flex items-center gap-2">
                {index === 1 ? (
                  <LockKeyhole
                    className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                ) : (
                  <Check
                    className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                )}
                {benefit}
              </span>
            ))}
          </div>
        </header>

        <div className="mt-10 lg:mt-12">
          <GifEditTool mode={content.mode} />
        </div>

        <section
          aria-labelledby={`${content.mode}-steps-title`}
          className="mt-20 grid gap-10 border-y border-slate-200 py-14 dark:border-slate-800 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-20"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
              Three clear steps
            </p>
            <h2
              id={`${content.mode}-steps-title`}
              className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Edit the animation, not just its first frame
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-600 dark:text-slate-400">
              Every frame is rendered locally with its animation timing, loop information, and
              transparent areas kept wherever the GIF format allows.
            </p>
          </div>
          <ol className="divide-y divide-slate-200 border-t border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {content.steps.map((step, index) => (
              <li key={step.title} className="grid gap-3 py-6 sm:grid-cols-[48px_1fr] sm:gap-5">
                <span className="font-mono text-sm text-blue-600 dark:text-blue-400">
                  {String(index + 1).padStart(2, '0')}
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

        <section aria-labelledby={`${content.mode}-related-title`} className="mt-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                Continue editing
              </p>
              <h2
                id={`${content.mode}-related-title`}
                className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                Useful next steps for this GIF
              </h2>
            </div>
            <Link
              href="/gif-tools"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950 hover:text-blue-700 dark:text-white dark:hover:text-blue-300"
            >
              Browse all GIF tools
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-7 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {content.related.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group grid gap-2 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4 dark:focus-visible:ring-offset-slate-950 sm:grid-cols-[220px_1fr_auto] sm:items-center sm:gap-6"
              >
                <span className="font-semibold text-slate-950 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
                  {item.label}
                </span>
                <span className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {item.description}
                </span>
                <ArrowRight
                  className="hidden h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 sm:block"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
