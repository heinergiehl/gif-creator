import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { Footer } from '@/app/components/ui/Footer';
import { gifToolCategories, gifTools } from '@/lib/gif-tools';
import { absoluteUrl } from '@/lib/site';

const title = 'Free Online GIF Tools for Editing, Converting, and Optimizing';
const description =
  'Use focused browser-based GIF tools to resize, crop, compress, trim, reverse, convert, or split animated GIFs without uploading your source file.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/gif-tools' },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/gif-tools'),
    title,
    description,
    images: ['/hero-dark.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/hero-dark.png'],
  },
};

const breadcrumbData = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
    { '@type': 'ListItem', position: 2, name: 'GIF Tools', item: absoluteUrl('/gif-tools') },
  ],
};

export default function GifToolsPage() {
  return (
    <>
      <main className="select-text bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />

        <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-slate-950 dark:hover:text-white">
              Home
            </Link>
            <span aria-hidden="true" className="px-2">
              /
            </span>
            <span aria-current="page">GIF Tools</span>
          </nav>

          <header className="mt-10 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
              All GIF tools
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl lg:text-6xl lg:leading-[1.05]">
              One focused tool for every GIF job
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
              Start on the page that matches your task. Each focused tool keeps the source on your
              device and gives you a direct result without a watermark.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <LockKeyhole
                className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
              Local browser processing for supported tools
            </p>
          </header>

          <div className="mt-16">
            {gifToolCategories.map((category) => {
              const tools = gifTools.filter((tool) => tool.category === category.id);
              if (!tools.length) return null;

              return (
                <section
                  key={category.id}
                  aria-labelledby={`category-${category.id}`}
                  className="grid gap-7 border-t border-slate-200 py-12 dark:border-slate-800 lg:grid-cols-[260px_1fr] lg:gap-16"
                >
                  <div>
                    <h2
                      id={`category-${category.id}`}
                      className="text-2xl font-semibold tracking-tight"
                    >
                      {category.label}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {category.description}
                    </p>
                  </div>
                  <ul className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                    {tools.map((tool) => (
                      <li key={tool.path}>
                        <Link
                          href={tool.path}
                          className="group grid gap-2 py-5 sm:grid-cols-[minmax(0,210px)_1fr_auto] sm:items-center sm:gap-6"
                        >
                          <h3 className="font-semibold text-slate-950 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
                            {tool.name}
                          </h3>
                          <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                            {tool.description}
                          </p>
                          <ArrowRight
                            className="hidden h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 sm:block"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
