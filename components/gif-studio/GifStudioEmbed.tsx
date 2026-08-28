'use client';

import dynamic from 'next/dynamic';

const DynamicStudio = dynamic(
  () => import('@/components/gif-studio/GifStudio').then((module) => module.GifStudio),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[390px] items-center justify-center rounded-xl border border-slate-800 bg-[#090d14] text-sm text-slate-400"
      >
        Loading GIF Studio…
      </div>
    ),
  },
);

export function GifStudioEmbed() {
  return <DynamicStudio embedded />;
}
