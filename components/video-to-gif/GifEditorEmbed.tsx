'use client';

import dynamic from 'next/dynamic';
import type { MenuOption } from '@/types';

const DynamicEditor = dynamic(() => import('@/components/video-to-gif/Editor'), {
  ssr: false,
  loading: () => (
    <div
      className="flex min-h-[70dvh] items-center justify-center bg-slate-100 px-6 text-center dark:bg-slate-900"
      role="status"
      aria-live="polite"
    >
      <div>
        <div
          className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400"
          aria-hidden="true"
        />
        <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
          Loading the browser editor…
        </p>
      </div>
    </div>
  ),
});

interface GifEditorEmbedProps {
  initialMenuOption: MenuOption;
  label: string;
}

export function GifEditorEmbed({ initialMenuOption, label }: GifEditorEmbedProps) {
  return (
    <div
      className="overflow-hidden border-y border-slate-200 bg-slate-100 shadow-2xl shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl sm:border"
      aria-label={label}
    >
      <DynamicEditor initialMenuOption={initialMenuOption} />
    </div>
  );
}
