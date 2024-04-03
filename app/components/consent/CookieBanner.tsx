"use client"
import { useEffect, useState } from "react"
import { getLocalStorage, setLocalStorage } from "@/app/lib/storageHelper"
import Link from "next/link"
import { cn } from "@/utils/cn"
export default function CookieBanner() {
  const [cookieConsent, setCookieConsent] = useState(false)
  useEffect(() => {
    const storedCookieConsent = getLocalStorage("cookie_consent", null)
    setCookieConsent(storedCookieConsent)
  }, [setCookieConsent])
  useEffect(() => {
    const newValue = cookieConsent ? "granted" : "denied"
    if (typeof window === "undefined") return
    if (!window.gtag) return
    window.gtag("consent", "update", {
      analytics_storage: newValue,
    })
    setLocalStorage("cookie_consent", cookieConsent)
    //For Testing
    console.log("Cookie Consent: ", cookieConsent)
  }, [cookieConsent])
  return (
    <div
      className={cn([
        `my-10 mx-auto max-w-max md:max-w-screen-sm
                        fixed bottom-0 left-0 right-0 
                        flex px-3 md:px-4 py-3 justify-between items-center flex-col sm:flex-row gap-4  
                         bg-gray-700 rounded-lg shadow`,
        cookieConsent ? "hidden" : "block",
      ])}
    >
      <div className="text-center">
        <Link href="/info/cookies">
          <p>
            We use <span className="font-bold text-sky-400">cookies</span> on
            our site.
          </p>
        </Link>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setCookieConsent(false)}
          className="px-5 py-2 text-gray-300 rounded-md border-gray-900"
        >
          Decline
        </button>
        <button
          onClick={() => setCookieConsent(true)}
          className="bg-gray-900 px-5 py-2 text-white rounded-lg"
        >
          Allow Cookies
        </button>
      </div>
    </div>
  )
}
