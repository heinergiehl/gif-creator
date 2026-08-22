'use client';

import dynamic from 'next/dynamic';

const DynamicStudio = dynamic(
  () => import('@/components/gif-studio/GifStudio').then((module) => module.GifStudio),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-dvh items-center justify-center bg-[#090d14] text-sm text-slate-400">
        Loading GIF Studio…
      </div>
    ),
  },
);

export default function EditGifsEditor() {
  return <DynamicStudio />;
}
