import React from 'react';
import type { Metadata } from 'next';
import { SITE_BRAND } from '@/lib/site';

export const metadata: Metadata = {
  title: `Terms of Service | ${SITE_BRAND}`,
  description: `Terms and conditions for using ${SITE_BRAND} and its online GIF creation tools.`,
  alternates: { canonical: '/terms-of-service' },
};
function TermsOfService() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="my-8 text-center text-4xl font-bold">Terms of Service</h1>
      <p className="mb-4">
        Welcome to {SITE_BRAND}! Please read these Terms of Service ("Terms", "Terms of Service")
        carefully before using the {SITE_BRAND} website (the "Service") operated by {SITE_BRAND}
        ("us", "we", or "our").
      </p>
      <h2 className="my-4 text-3xl font-bold">1. Acceptance of Terms</h2>
      <p className="mb-4">
        By accessing or using our Service, you agree to be bound by these Terms. If you disagree
        with any part of the terms, then you do not have permission to access the Service.
      </p>
      <h2 className="my-4 text-3xl font-bold">2. Use License</h2>
      <p className="mb-4">
        Subject to your compliance with these Terms, we grant you a non-exclusive, non-transferable,
        revocable license to use the Service for your personal, non-commercial use.
      </p>
      <h2 className="my-4 text-3xl font-bold">3. Your Content</h2>
      <p className="mb-4">
        You retain all rights in, and are solely responsible for, the content you post to
        {SITE_BRAND}.
      </p>
      <h2 className="my-4 text-3xl font-bold">4. Privacy & Data Protection</h2>
      <p className="mb-4">
        We respect your privacy and are committed to protecting it. The personal data you provide us
        when using our Service will be used in accordance with our Privacy Policy.
      </p>
      <h2 className="my-4 text-3xl font-bold">5. Cookies and Analytics</h2>
      <p className="mb-4">
        We use cookies and similar tracking technologies to track activity on our Service and we
        hold certain information. Analytics data is collected through third-party services such as
        Google Analytics.
      </p>
      <h2 className="my-4 text-3xl font-bold">6. Modifications to the Service and Prices</h2>
      <p className="mb-4">
        We reserve the right at any time to modify or discontinue the Service (or any part or
        content thereof) without notice at any time.
      </p>
      <h2 className="my-4 text-3xl font-bold">
        7. Disclaimer of Warranties; Limitation of Liability
      </h2>
      <p className="mb-4">
        Your use of our Service is at your sole risk. The Service is provided on an "AS IS" and "AS
        AVAILABLE" basis.
      </p>
      <h2 className="my-4 text-3xl font-bold">8. Governing Law</h2>
      <p className="mb-4">
        These Terms shall be governed by the laws of the European Union, without regard to its
        conflict of law provisions.
      </p>
      <h2 className="my-4 text-3xl font-bold">9. Changes</h2>
      <p className="mb-4">
        We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
        By continuing to access or use our Service after any revisions become effective, you agree
        to be bound by the revised terms.
      </p>
      <h2 className="my-4 text-3xl font-bold">10. Contact Us</h2>
      <p className="mb-4">If you have any questions about these Terms, please contact us.</p>
    </div>
  );
}
export default TermsOfService;
