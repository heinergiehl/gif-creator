import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_BRAND } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    `Learn how ${SITE_BRAND} uses cookies and local storage for essential features and optional analytics.`,
  alternates: { canonical: '/info/cookies' },
};

export default function CookiePolicyPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-4xl font-bold">Cookie Policy</h1>
      <p className="mb-8 text-gray-700 dark:text-gray-300">
        Cookies and similar storage help {SITE_BRAND} run smoothly. This page explains what we use
        and why.
      </p>

      <h2 className="mb-3 text-2xl font-semibold">Essential cookies</h2>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        These are required for core functionality, such as keeping you signed in (if you use an
        account) and keeping the site secure.
      </p>

      <h2 className="mb-3 text-2xl font-semibold">Preferences</h2>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        We may store preferences like theme selection so the site looks the way you chose when you
        come back.
      </p>

      <h2 className="mb-3 text-2xl font-semibold">Analytics (optional)</h2>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        Analytics cookies help us understand what’s working and what needs improvement. Where
        required, we only enable analytics after you give consent.
      </p>

      <p className="text-gray-700 dark:text-gray-300">
        For more details, see our{' '}
        <Link className="underline" href="/privacy-policy">
          Privacy Policy
        </Link>
        .
      </p>
    </main>
  );
}
