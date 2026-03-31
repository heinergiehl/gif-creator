import Link from 'next/link';
import { format } from 'date-fns';
import { BlogPostMeta } from '@/lib/blog';

interface BlogCardProps {
  post: BlogPostMeta;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950/60">
      <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
        <span>{post.category}</span>
        <span>·</span>
        <span>{format(new Date(post.date), 'MMM d, yyyy')}</span>
        <span>·</span>
        <span>{post.readingTimeMinutes} min read</span>
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
        <Link href={`/blog/${post.slug}`} className="hover:text-sky-700 dark:hover:text-sky-300">
          {post.title}
        </Link>
      </h2>
      <p className="mt-4 flex-1 text-base leading-7 text-slate-700 dark:text-slate-300">
        {post.description}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {post.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-6">
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center text-sm font-semibold text-sky-700 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-200"
        >
          Read the guide
        </Link>
      </div>
    </article>
  );
}
