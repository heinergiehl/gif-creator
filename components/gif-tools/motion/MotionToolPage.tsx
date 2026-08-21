import type { ComponentType } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, LockKeyhole } from 'lucide-react';
import { MotionGifTool, type MotionToolKind } from '@/components/gif-tools/motion/MotionGifTool';
import { absoluteUrl } from '@/lib/site';

interface PageStep {
  title: string;
  text: string;
}

interface RelatedTool {
  href: string;
  label: string;
  description: string;
}

interface MotionToolPageProps {
  kind: MotionToolKind;
  path: string;
  name: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  highlights: string[];
  steps: PageStep[];
  explanationTitle: string;
  explanation: string[];
  relatedTools: RelatedTool[];
}

export function MotionToolPage({
  kind,
  path,
  name,
  eyebrow,
  title,
  description,
  icon: Icon,
  highlights,
  steps,
  explanationTitle,
  explanation,
  relatedTools,
}: MotionToolPageProps): React.ReactElement {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name,
        url: absoluteUrl(path),
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
        featureList: highlights,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'GIF Tools', item: absoluteUrl('/gif-tools') },
          { '@type': 'ListItem', position: 3, name, item: absoluteUrl(path) },
        ],
      },
    ],
  };

  return (
    <main className="select-text overflow-x-clip bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pb-28">
        <nav aria-label="Breadcrumb" className="mb-8 text-xs text-slate-500 dark:text-slate-400">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-blue-700 dark:hover:text-blue-300">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/gif-tools" className="hover:text-blue-700 dark:hover:text-blue-300">
                GIF Tools
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-slate-800 dark:text-slate-200">
              {name}
            </li>
          </ol>
        </nav>

        <header className="max-w-4xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            <Icon className="h-4 w-4" aria-hidden="true" />
            {eyebrow}
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-5xl lg:text-6xl lg:leading-[1.05]">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
            {description}
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
            {highlights.slice(0, 2).map((highlight) => (
              <li key={highlight} className="inline-flex items-center gap-2">
                <Check
                  className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
                {highlight}
              </li>
            ))}
            <li className="inline-flex items-center gap-2">
              <LockKeyhole
                className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
              Your GIF stays in the browser
            </li>
          </ul>
        </header>

        <div className="mt-10 lg:mt-12">
          <MotionGifTool kind={kind} />
        </div>

        <section
          aria-labelledby={kind + '-steps-title'}
          className="mt-20 grid gap-10 border-y border-slate-200 py-14 dark:border-slate-800 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-20"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
              How it works
            </p>
            <h2
              id={kind + '-steps-title'}
              className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              A direct workflow from source to download
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-600 dark:text-slate-400">
              Upload once, make the relevant motion decision, and inspect the actual encoded result
              before saving it.
            </p>
          </div>
          <ol className="divide-y divide-slate-200 border-t border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {steps.map((step, index) => (
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

        <section className="mt-16 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {explanationTitle}
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
              {explanation.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Continue with another GIF tool
            </h2>
            <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group grid gap-1 py-5 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4 dark:focus-visible:ring-offset-slate-950 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6"
                >
                  <span>
                    <span className="font-semibold text-slate-950 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
                      {tool.label}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {tool.description}
                    </span>
                  </span>
                  <ArrowRight
                    className="hidden h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 sm:block"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
            <Link
              href="/gif-tools"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 underline underline-offset-4 dark:text-blue-300"
            >
              Browse all GIF tools
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
