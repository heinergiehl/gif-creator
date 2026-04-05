import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Footer } from '@/app/components/ui/Footer';
import { LatestPostsSection } from '@/components/blog/LatestPostsSection';
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card';
import { SeoWorkflowPage } from '@/lib/seo-workflows';
import { SITE_BRAND, absoluteUrl } from '@/lib/site';

interface SeoWorkflowLandingProps {
  page: SeoWorkflowPage;
}

export function SeoWorkflowLanding({ page }: SeoWorkflowLandingProps) {
  const appStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${page.title} - ${SITE_BRAND}`,
    url: absoluteUrl(page.path),
    description: page.description,
    applicationCategory: 'ImageApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: page.features.map((feature) => feature.title),
    author: {
      '@type': 'Organization',
      name: SITE_BRAND,
    },
  };

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const howToStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: page.title,
    description: page.description,
    totalTime: 'PT2M',
    step: page.steps.map((step) => ({
      '@type': 'HowToStep',
      name: step.title,
      text: step.description,
      url: absoluteUrl(page.path),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToStructuredData) }}
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
          <main>
            <section className="w-full pb-16 pt-32">
              <div className="mx-auto flex max-w-6xl flex-col items-center px-4 text-center">
                <div className="rounded-full border border-white/40 bg-white/60 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200">
                  Free browser-based workflow — local processing, no watermark
                </div>
                <NeonGradientCard className="mt-8 flex w-full items-center justify-center">
                  <h1 className="pointer-events-none z-10 w-full bg-gradient-to-br from-[#ff2975] from-35% to-[#00FFF1] bg-clip-text text-center text-4xl font-bold leading-tight tracking-tighter text-transparent sm:text-5xl md:text-7xl md:leading-none dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                    {page.title}
                  </h1>
                </NeonGradientCard>
                <p className="mt-8 max-w-3xl text-pretty text-center text-xl leading-8 text-slate-700 dark:text-slate-300">
                  {page.intro}
                </p>
                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                  <Link
                    href={page.primaryCta.href}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-slate-900/10 transition-all duration-200 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:shadow-white/5 dark:hover:bg-slate-100"
                  >
                    {page.primaryCta.label}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  {page.secondaryCta ? (
                    <Link
                      href={page.secondaryCta.href}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-600 dark:hover:bg-slate-800"
                    >
                      {page.secondaryCta.label}
                    </Link>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="relative w-full py-20">
              <div className="pointer-events-none absolute inset-0 bg-white/20 dark:bg-slate-950/30" />
              <div className="relative mx-auto max-w-6xl px-4">
                <div className="mb-12 max-w-3xl">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white md:text-5xl">
                    Why it works
                  </h2>
                  <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400 md:text-lg">
                    Key reasons this workflow fits how people actually edit and share animated images online.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  {page.features.map((feature) => (
                    <article
                      key={feature.title}
                      className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                      <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
                        {feature.description}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="relative w-full py-20">
              <div className="mx-auto max-w-6xl px-4">
                <div className="mx-auto mb-12 max-w-3xl text-center">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white md:text-5xl">
                    How to {page.title.toLowerCase()}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400 md:text-lg">
                    Use this simple workflow to go from raw animation to a clean export that is ready for the web.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  {page.steps.map((step, index) => (
                    <article
                      key={step.title}
                      className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        Step {index + 1}
                      </p>
                      <h3 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
                      <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
                        {step.description}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="relative w-full py-20">
              <div className="pointer-events-none absolute inset-0 bg-white/20 dark:bg-slate-950/25" />
              <div className="relative mx-auto max-w-6xl px-4">
                <div className="mx-auto mb-12 max-w-3xl text-center">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white md:text-5xl">
                    Related GIF workflows
                  </h2>
                  <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400 md:text-lg">
                    Internal links between closely related tasks help users move deeper into the product and help search engines understand the workflow cluster.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {page.relatedLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                    >
                      <h3 className="text-2xl font-bold text-slate-900 transition group-hover:text-pink-600 dark:text-white dark:group-hover:text-pink-300">
                        {link.label}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                        {link.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            <section className="relative w-full py-20">
              <div className="pointer-events-none absolute inset-0 bg-white/20 dark:bg-slate-950/25" />
              <div className="relative mx-auto max-w-5xl px-4">
                <div className="mx-auto mb-12 max-w-3xl text-center">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white md:text-5xl">
                    Frequently asked questions
                  </h2>
                </div>
                <div className="space-y-6">
                  {page.faqs.map((faq) => (
                    <div
                      key={faq.question}
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
              title={`${page.title} guides and supporting content`}
              description="Support the landing page with adjacent informational content that reinforces the same workflow intent."
              postSlugs={page.relatedPostSlugs}
            />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}
