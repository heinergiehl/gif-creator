import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { BlogCard } from '@/components/blog/BlogCard';
import { getAllPosts, getPostBySlug, getRelatedPosts } from '@/lib/blog';
import { getBlogWorkflowLinks } from '@/lib/seo-workflows';
import { SITE_BRAND, absoluteUrl } from '@/lib/site';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: `${post.title} | ${SITE_BRAND}`,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      url: absoluteUrl(`/blog/${post.slug}`),
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: '/hero-dark.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: ['/hero-dark.png'],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.slug);
  const workflowLinks = getBlogWorkflowLinks(post.slug);
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    wordCount: post.wordCount,
    keywords: post.keywords.join(', '),
    articleSection: post.category,
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_BRAND,
    },
  };

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: absoluteUrl('/blog'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: absoluteUrl(`/blog/${post.slug}`),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-32 pt-28 text-slate-950 dark:bg-slate-950 dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <article className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-slate-900 dark:hover:text-white">
              Blog
            </Link>
            <span className="mx-2">/</span>
            <span>{post.title}</span>
          </nav>
          <div className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 md:p-12">
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
              <span>{post.category}</span>
              <span>·</span>
              <span>{format(new Date(post.date), 'MMMM d, yyyy')}</span>
              <span>·</span>
              <span>{post.readingTimeMinutes} min read</span>
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">{post.title}</h1>
            <p className="mt-6 text-lg leading-8 text-slate-700 dark:text-slate-300">
              {post.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-10 rounded-2xl border border-sky-200 bg-sky-50 p-5 dark:border-sky-900/60 dark:bg-sky-950/30">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-800 dark:text-sky-300">
                Recommended next step
              </p>
              <p className="mt-2 text-base leading-7 text-slate-700 dark:text-slate-300">
                Follow this guide inside the product instead of switching between tabs.
              </p>
              <div className="mt-4">
                <Link
                  href={post.ctaHref}
                  className="inline-flex items-center rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-800"
                >
                  {post.ctaLabel}
                </Link>
              </div>
            </div>
            <div
              className="blog-content mt-10"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
            {workflowLinks.length > 0 ? (
              <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Matching tools
                </p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight">Use this workflow inside the product</h2>
                <p className="mt-3 text-base leading-7 text-slate-700 dark:text-slate-300">
                  These pages match the exact job this article covers, which strengthens internal linking and gives readers a direct next step.
                </p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {workflowLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{link.label}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {link.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </article>
      {relatedPosts.length > 0 ? (
        <section className="container mx-auto mt-16 px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Related guides</h2>
                <p className="mt-3 text-slate-700 dark:text-slate-300">
                  Keep the internal linking path strong with the next most relevant workflow.
                </p>
              </div>
              <Link href="/blog" className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                View all posts
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
