'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface RecorderIntroProps {
  isEngineReady: boolean;
  startRecording: () => void;
}

export function RecorderIntro({
  isEngineReady,
  startRecording,
}: RecorderIntroProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 p-8">
      {/* Icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-400"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </div>

      {/* Text */}
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Screen Recorder
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Record your screen, trim the clip, crop to any region, and export as
          MP4 or convert to GIF — everything runs locally in your browser.
        </p>
      </div>

      {/* Record button */}
      <Button
        size="lg"
        onClick={startRecording}
        className="h-12 min-w-[220px] gap-2.5 bg-red-600 text-sm font-medium shadow-lg shadow-red-900/30 transition-all hover:bg-red-500 hover:shadow-xl hover:shadow-red-900/40"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
        </span>
        Start Recording
      </Button>

      {!isEngineReady && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading processing engine…
        </div>
      )}

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {['No install needed', 'Runs locally', 'Free & private'].map(
          (text) => (
            <span
              key={text}
              className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[11px] text-slate-500"
            >
              {text}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
