'use client';

import dynamic from 'next/dynamic';

const GifStudio = dynamic(
  () => import('@/components/gif-studio/GifStudio').then((module) => module.GifStudio),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] items-center justify-center rounded-xl border border-slate-800 bg-[#090d14] text-sm text-slate-400">
        Loading the local caption editor…
      </div>
    ),
  },
);

export function AddTextGifTool() {
  return <GifStudio initialIntent="add-text" embedded />;
}
