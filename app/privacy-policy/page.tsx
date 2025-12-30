import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_BRAND, SUPPORT_EMAIL } from '@/lib/site';

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE_BRAND}`,
  description:
    `Learn how ${SITE_BRAND} handles your data, cookies, and analytics. We focus on privacy and keep media processing in the browser whenever possible.`,
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-4xl font-bold">Privacy Policy</h1>
      <p className="mb-8 text-gray-700 dark:text-gray-300">
        This Privacy Policy explains how {SITE_BRAND} collects, uses, and protects information when
        you use our website and tools.
      </p>

      <h2 className="mb-3 text-2xl font-semibold">1. Media Processing</h2>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        When you convert or edit media (for example, video to GIF or image to GIF), processing is
        designed to happen locally in your browser whenever possible. That means your files don’t
        need to be uploaded to our servers just to perform a conversion.
      </p>

      <h2 className="mb-3 text-2xl font-semibold">2. Cookies and Local Storage</h2>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        We use browser storage and cookies for core functionality (for example, remembering your
        preferences and, if you use an account, keeping you signed in). We also use a consent banner
        so you can choose whether non-essential analytics cookies are enabled.
      </p>

      <h2 className="mb-3 text-2xl font-semibold">3. Analytics</h2>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        We may use analytics to understand how the site is used and to improve performance. Where
        required, analytics is only enabled after consent. If you decline, analytics storage is
        disabled by default.
      </p>

      <h2 className="mb-3 text-2xl font-semibold">4. Third-Party Services</h2>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        {SITE_BRAND} may rely on third-party services for hosting and performance monitoring. These
        providers may process limited technical data (like device and request information) to
        operate and secure the service.
      </p>

      <h2 className="mb-3 text-2xl font-semibold">5. Contact</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Questions about privacy? Email us at{' '}
        <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>{' '}
        or use the <Link className="underline" href="/contact">contact page</Link>.
      </p>
    </main>
  );
}
