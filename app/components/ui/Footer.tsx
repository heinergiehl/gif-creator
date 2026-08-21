import Link from 'next/link';
import { SITE_BRAND } from '@/lib/site';

const toolLinks = [
  { href: '/gif-tools', label: 'All GIF Tools' },
  { href: '/compress-gif', label: 'Compress GIF' },
  { href: '/resize-gif', label: 'Resize GIF' },
  { href: '/change-gif-speed', label: 'Change GIF Speed' },
  { href: '/split-gif-into-frames', label: 'Split GIF into Frames' },
  { href: '/gif-to-mp4', label: 'GIF to MP4' },
  { href: '/video-to-gif', label: 'Video to GIF' },
];

const learnLinks = [
  { href: '/blog', label: 'Blog' },
  { href: '/blog/how-to-make-a-gif-from-a-video', label: 'How to Make a GIF from Video' },
  {
    href: '/blog/how-to-edit-a-gif-without-losing-quality',
    label: 'Edit GIFs Without Quality Loss',
  },
  { href: '/blog/optimize-gif-size-without-losing-quality', label: 'Reduce GIF File Size' },
];

const legalLinks = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-of-service', label: 'Terms of Service' },
  { href: '/info/cookies', label: 'Cookie Policy' },
  { href: '/contact', label: 'Contact' },
  { href: '/rss.xml', label: 'RSS' },
  { href: '/sitemap.xml', label: 'Sitemap' },
];

export const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Tools
            </h3>
            <ul className="mt-3 grid gap-2">
              {toolLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block py-1 text-sm text-slate-700 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Learn
            </h3>
            <ul className="mt-3 grid gap-2">
              {learnLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block py-1 text-sm text-slate-700 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Legal &amp; info
            </h3>
            <ul className="mt-3 grid gap-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block py-1 text-sm text-slate-700 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Privacy
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {SITE_BRAND} processes your source media locally in your browser instead of uploading
              it to an editing server. Basic site analytics may run according to the privacy and
              cookie settings.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {SITE_BRAND} &copy; {new Date().getFullYear()}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
