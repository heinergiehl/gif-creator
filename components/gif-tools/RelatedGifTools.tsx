import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getRelatedGifTools } from '@/lib/gif-tools';

export function RelatedGifTools({ currentPath }: { currentPath: string }) {
  const tools = getRelatedGifTools(currentPath);
  if (!tools.length) return null;

  return (
    <nav
      aria-labelledby="related-gif-tools-title"
      className="border-t border-slate-200 py-12 dark:border-slate-800"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="related-gif-tools-title"
            className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white"
          >
            Continue with your GIF
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            The next useful step depends on the file you need to deliver.
          </p>
        </div>
        <Link
          href="/gif-tools"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
        >
          Browse all GIF tools
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <ul className="mt-7 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
        {tools.map((tool) => (
          <li key={tool.path}>
            <Link
              href={tool.path}
              className="group grid gap-2 py-5 sm:grid-cols-[minmax(0,220px)_1fr_auto] sm:items-center sm:gap-6"
            >
              <span className="font-semibold text-slate-950 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
                {tool.name}
              </span>
              <span className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                {tool.description}
              </span>
              <ArrowRight
                className="hidden h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 sm:block"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
