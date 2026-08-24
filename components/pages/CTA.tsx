import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getGifEditorIntentHref } from '@/lib/editor-intents';

const primaryClassName =
  'group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-slate-900/10 transition-all duration-200 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:shadow-white/5 dark:hover:bg-slate-100 dark:hover:shadow-white/10';
const secondaryClassName =
  'inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-600 dark:hover:bg-slate-800';
const tertiaryClassName =
  'inline-flex items-center justify-center rounded-xl px-4 py-3 text-base font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 transition-colors duration-200 hover:text-slate-900 hover:decoration-slate-400 dark:text-slate-400 dark:decoration-slate-600 dark:hover:text-white dark:hover:decoration-slate-400';

const ctaLinks = {
  video: {
    href: '/video-to-gif#video-to-gif-tool',
    label: 'Convert video to GIF',
  },
  image: {
    href: '/image-to-gif#image-to-gif-tool',
    label: 'Create from images',
  },
  gif: {
    href: getGifEditorIntentHref('edit'),
    label: 'Edit an existing GIF',
  },
} as const;

export const CTA = ({ primary = 'video' }: { primary?: keyof typeof ctaLinks }) => {
  const order: Array<keyof typeof ctaLinks> =
    primary === 'gif' ? ['gif', 'video', 'image'] : ['video', 'image', 'gif'];
  const orderedLinks = order.map((key) => ctaLinks[key]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center justify-center gap-3 md:flex-row">
        {orderedLinks.slice(0, 2).map((link, index) => (
          <Link
            key={link.href}
            href={link.href}
            className={index === 0 ? primaryClassName : secondaryClassName}
          >
            {link.label}
            {index === 0 && (
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            )}
          </Link>
        ))}
      </div>
      <Link href={orderedLinks[2].href} className={tertiaryClassName}>
        {orderedLinks[2].label}
      </Link>
    </div>
  );
};
