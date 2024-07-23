'use client';
import { useEffect, useLayoutEffect, useState } from 'react';
import { getLocalStorage, setLocalStorage } from '@/app/lib/storageHelper';
import Link from 'next/link';
import { cn } from '@/utils/cn';
export default function CookieBanner() {
  const [cookieConsent, setCookieConsent] = useState<boolean | null>(null);
  useLayoutEffect(() => {
    const storedCookieConsent = getLocalStorage('cookie_consent', null);
    setCookieConsent(storedCookieConsent);
  }, [setCookieConsent]);
  useEffect(() => {
    const newValue = cookieConsent ? 'granted' : 'denied';
    if (typeof window === 'undefined') return;
    if (!window.gtag) return;
    window.gtag('consent', 'update', {
      analytics_storage: newValue,
    });
    setLocalStorage('cookie_consent', cookieConsent);
    //For Testing
  }, [cookieConsent]);
  if (cookieConsent === true) return null;
  return (
    <div
      className={cn([
        `fixed bottom-0 left-0 right-0 z-[1001]
                        mx-auto my-10 max-w-max flex-col 
                         items-center justify-between gap-4 rounded-lg bg-gray-700 px-3 py-3 shadow  
                         sm:flex-row md:max-w-screen-sm md:px-4 `,
        cookieConsent === null ? 'flex' : 'hidden',
      ])}
    >
      <div className="text-center">
        <Link href="/info/cookies">
          <p>
            We use <span className="font-bold text-sky-400">cookies</span> on our site.
          </p>
        </Link>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setCookieConsent(false)}
          className="rounded-md border-gray-900 px-5 py-2 text-gray-300"
        >
          Decline
        </button>
        <button
          onClick={() => setCookieConsent(true)}
          className="rounded-lg bg-gray-900 px-5 py-2 text-white"
        >
          Allow Cookies
        </button>
      </div>
    </div>
  );
}
