import Link from 'next/link';

const ctaLinks = [
  {
    href: '/video-to-gif/converter-and-editor/editor',
    label: 'Convert video to GIF',
    className:
      'inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl',
  },
  {
    href: '/image-to-gif/converter-and-editor/editor',
    label: 'Create from images',
    className:
      'inline-flex items-center justify-center rounded-lg border border-white/40 bg-white/70 px-8 py-4 text-lg font-semibold text-slate-900 backdrop-blur transition-all duration-200 hover:scale-105 hover:bg-white dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:hover:bg-slate-900',
  },
  {
    href: '/edit-gifs/converter-and-editor/editor',
    label: 'Edit an existing GIF',
    className:
      'inline-flex items-center justify-center rounded-lg px-4 py-3 text-base font-semibold text-slate-700 transition-colors duration-200 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white',
  },
];

export const CTA = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center justify-center gap-3 md:flex-row">
        {ctaLinks.slice(0, 2).map((link) => (
          <Link key={link.href} href={link.href} className={link.className}>
            {link.label}
          </Link>
        ))}
      </div>
      <Link href={ctaLinks[2].href} className={ctaLinks[2].className}>
        {ctaLinks[2].label}
      </Link>
    </div>
  );
};
