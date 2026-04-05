'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { DownloadIcon, PaintbrushIcon, SlidersHorizontalIcon, UploadIcon } from 'lucide-react';
import { AnimatedBeam } from '@/components/magicui/animated-beam';

export default function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const icon1Ref = useRef<HTMLDivElement>(null);
  const icon2Ref = useRef<HTMLDivElement>(null);
  const icon3Ref = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="relative mx-auto max-w-5xl px-4">
      <h2 className="mb-4 text-center text-3xl font-bold text-slate-800 dark:text-white md:text-5xl">
        How to Make a GIF in 3 Steps
      </h2>
      <p className="mx-auto mb-16 max-w-2xl text-center text-base text-slate-500 dark:text-slate-400">
        No installs, no sign-ups. Everything runs locally in your browser.
      </p>

      <div className="relative" ref={containerRef}>
        <div className="relative grid gap-10 md:grid-cols-3">

          {/* Step 1: Upload */}
          <div className="flex flex-col items-center text-center">
            <div
              ref={icon1Ref}
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 shadow-sm ring-1 ring-indigo-100 dark:bg-indigo-900/30 dark:ring-indigo-800/40"
            >
              <UploadIcon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">1. Upload</h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Drop a{' '}
              <Link href="/video-to-gif" className="font-medium text-indigo-600 underline decoration-dotted underline-offset-2 dark:text-indigo-400">video</Link>,{' '}
              <Link href="/image-to-gif" className="font-medium text-indigo-600 underline decoration-dotted underline-offset-2 dark:text-indigo-400">images</Link>, or an existing{' '}
              <Link href="/edit-gifs" className="font-medium text-indigo-600 underline decoration-dotted underline-offset-2 dark:text-indigo-400">GIF</Link>{' '}
              into the editor. Supports MP4, MOV, AVI, WebM, PNG, JPG, and more.
            </p>
          </div>

          {/* Step 2: Edit */}
          <div className="flex flex-col items-center text-center">
            <div
              ref={icon2Ref}
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 shadow-sm ring-1 ring-purple-100 dark:bg-purple-900/30 dark:ring-purple-800/40"
            >
              <SlidersHorizontalIcon className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">2. Edit</h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Crop, resize, rotate. Type{' '}
              <span className="font-medium text-slate-700 dark:text-slate-300">text</span>, drop{' '}
              <span className="font-medium text-slate-700 dark:text-slate-300">shapes</span>, or{' '}
              <span className="inline-flex items-center gap-0.5 font-medium text-slate-700 dark:text-slate-300">
                <PaintbrushIcon className="h-3.5 w-3.5" />paint freehand
              </span>. Adjust per-frame timing, apply filters, and preview changes live.
            </p>
          </div>

          {/* Step 3: Export */}
          <div className="flex flex-col items-center text-center">
            <div
              ref={icon3Ref}
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 shadow-sm ring-1 ring-emerald-100 dark:bg-emerald-900/30 dark:ring-emerald-800/40"
            >
              <DownloadIcon className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">3. Export</h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Download as GIF, WebP, or APNG — optimized for the web with no watermark.{' '}
              <Link href="/blog/optimize-gif-size-without-losing-quality" className="font-medium text-indigo-600 underline decoration-dotted underline-offset-2 dark:text-indigo-400">
                Learn how to optimize file size
              </Link>.
            </p>
          </div>
        </div>

        {isDesktop && (
          <>
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={icon1Ref}
              toRef={icon2Ref}
              startXOffset={28}
              endXOffset={-28}
              gradientStartColor="#6366f1"
              gradientStopColor="#a855f7"
              pathColor="#a5b4fc"
              pathWidth={2}
              pathOpacity={0.5}
              duration={8}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={icon2Ref}
              toRef={icon3Ref}
              startXOffset={28}
              endXOffset={-28}
              gradientStartColor="#a855f7"
              gradientStopColor="#10b981"
              pathColor="#c4b5fd"
              pathWidth={2}
              pathOpacity={0.5}
              duration={8}
              delay={2}
            />
          </>
        )}
      </div>
    </div>
  );
}
