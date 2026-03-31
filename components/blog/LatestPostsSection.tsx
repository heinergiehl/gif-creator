import Link from 'next/link';
import { BlogCard } from '@/components/blog/BlogCard';
import { getFeaturedPosts, getPostsBySlugs } from '@/lib/blog';

interface LatestPostsSectionProps {
  title: string;
  description: string;
  postSlugs?: string[];
  limit?: number;
  ctaHref?: string;
  ctaLabel?: string;
}

export function LatestPostsSection({
  title,
  description,
  postSlugs,
  limit = 3,
  ctaHref = '/blog',
  ctaLabel = 'Browse the full blog',
}: LatestPostsSectionProps) {
  const posts = postSlugs?.length ? getPostsBySlugs(postSlugs) : getFeaturedPosts(limit);
  const visiblePosts = posts.slice(0, limit);

  if (!visiblePosts.length) {
    return null;
  }

  return (
    <section className="w-full py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-700 dark:text-slate-300">
            {description}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visiblePosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
