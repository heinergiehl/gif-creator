import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, LockKeyhole } from 'lucide-react';
import { absoluteUrl } from '@/lib/site';

interface RelatedToolLink {
  href: string;
  label: string;
  description: string;
}

interface ConversionPageShellProps {
  canonicalPath: string;
  eyebrow: string;
  title: string;
  description: string;
  toolName: string;
  featureList: string[];
  sectionTitle: string;
  sectionCopy: string;
  details: Array<{ title: string; text: string }>;
  related: RelatedToolLink[];
  children: ReactNode;
}

export function ConversionPageShell({
  canonicalPath,
  eyebrow,
  title,
  description,
  toolName,
  featureList,
  sectionTitle,
  sectionCopy,
  details,
  related,
  children,
}: ConversionPageShellProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: toolName,
    url: absoluteUrl(canonicalPath),
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
    featureList,
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
              {toolName}
            </li>
          </ol>
        </nav>

        <header className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            {eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-5xl lg:text-6xl lg:leading-[1.05]">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
            {description}
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Local browser processing
            </span>
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              No watermark
            </span>
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Free download
            </span>
          </div>
        </header>

        <div className="mt-10 lg:mt-12">{children}</div>

        <section
          aria-labelledby={`${canonicalPath.slice(1)}-details`}
          className="mt-20 grid gap-10 border-y border-slate-200 py-14 dark:border-slate-800 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-20"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
              What the tool does
            </p>
            <h2
              id={`${canonicalPath.slice(1)}-details`}
              className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              {sectionTitle}
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-600 dark:text-slate-400">
              {sectionCopy}
            </p>
          </div>
          <dl className="divide-y divide-slate-200 border-t border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {details.map((detail) => (
              <div key={detail.title} className="grid gap-2 py-6 sm:grid-cols-[170px_1fr] sm:gap-8">
                <dt className="font-semibold text-slate-950 dark:text-white">{detail.title}</dt>
                <dd className="text-sm leading-7 text-slate-600 dark:text-slate-400">
                  {detail.text}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby={`${canonicalPath.slice(1)}-related`} className="mt-16">
          <div className="max-w-2xl">
            <h2
              id={`${canonicalPath.slice(1)}-related`}
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Continue working with your animation
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
              Use the next tool for the job instead of squeezing unrelated controls into one
              workspace.
            </p>
          </div>
          <ul className="mt-7 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {related.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group grid gap-2 py-5 sm:grid-cols-[220px_1fr_auto] sm:items-center sm:gap-8"
                >
                  <span className="font-semibold text-slate-950 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
                    {item.label}
                  </span>
                  <span className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {item.description}
                  </span>
                  <ArrowRight className="hidden h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 sm:block" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
