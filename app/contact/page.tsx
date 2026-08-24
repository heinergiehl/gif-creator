import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_BRAND, SUPPORT_EMAIL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    `Contact ${SITE_BRAND} for support, feedback, or feature requests. We read every message and use it to improve the GIF tools.`,
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-4xl font-bold">Contact</h1>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        Need help, found a bug, or have a feature request? We’d love to hear from you.
      </p>

      <div className="rounded-lg border bg-white/5 p-6 backdrop-blur-sm dark:bg-black/20">
        <h2 className="mb-2 text-2xl font-semibold">Email</h2>
        <p className="text-gray-700 dark:text-gray-300">
          <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
        </p>
        <p className="mt-4 text-gray-700 dark:text-gray-300">
          Include a short description, what you expected to happen, and (if relevant) your browser
          and device. For bugs, a screenshot or screen recording helps a lot.
        </p>
      </div>

      <p className="mt-8 text-gray-700 dark:text-gray-300">
        Looking for legal pages? See our{' '}
        <Link className="underline" href="/privacy-policy">
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link className="underline" href="/terms-of-service">
          Terms of Service
        </Link>
        .
      </p>
    </main>
  );
}
