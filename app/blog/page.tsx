import type { Metadata } from 'next';
import { BlogCard } from '@/components/blog/BlogCard';
import { getAllPosts } from '@/lib/blog';
import { SITE_BRAND, absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'GIF Blog — Tutorials, Editing & Optimization',
  description:
    'People-first guides for making, editing, optimizing, and converting GIFs. Learn video to GIF workflows, image sequence tips, screen recording steps, and file size best practices.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: `GIF Blog - Tutorials, Editing Tips & Optimization Guides | ${SITE_BRAND}`,
    description:
      'People-first guides for making, editing, optimizing, and converting GIFs with practical steps and internal tool workflows.',
    url: absoluteUrl('/blog'),
    type: 'website',
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${SITE_BRAND} Blog`,
    description:
      'Tutorials and practical guides for making, editing, optimizing, and converting GIFs online.',
    url: absoluteUrl('/blog'),
    publisher: {
      '@type': 'Organization',
      name: SITE_BRAND,
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      url: post.url,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      author: {
        '@type': 'Person',
        name: post.author,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-32 pt-28 text-slate-950 dark:bg-slate-950 dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-medium text-sky-800 shadow-sm dark:border-sky-900/70 dark:bg-slate-900 dark:text-sky-300">
            GIF tutorials, workflows, and optimization guides
          </div>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-6xl">
            A practical blog for making better GIFs
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-700 dark:text-slate-300">
            Learn how to convert video to GIF, create GIFs from image sequences, edit animations
            without losing quality, and keep files lightweight enough for docs, social posts, and
            landing pages.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/rss.xml"
              className="inline-flex items-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900"
            >
              Subscribe via RSS
            </a>
            <a
              href="/sitemap.xml"
              className="inline-flex items-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900"
            >
              View sitemap
            </a>
          </div>
        </div>
      </section>
      <section className="container mx-auto mt-16 px-4">
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}
