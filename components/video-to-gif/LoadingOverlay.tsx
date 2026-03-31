'use client';
import React from 'react';
import { observer } from 'mobx-react';
import { useStores } from '@/store';
import { Loader2, Film, CheckCircle2, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const LoadingOverlay = observer(function LoadingOverlay() {
  const store = useStores().editorStore;
  const progress = store.progress;

  if (!progress.active) return null;

  const conversionPct = Math.round(progress.conversion);
  const renderingPct = Math.round(progress.rendering);
  const hasRendering = progress.rendering > 0;
  const isReady = progress.stage === 'ready';
  const isError = progress.stage === 'error';

  // Overall progress: if we have both stages, combine them
  const overallPct = hasRendering
    ? Math.round((conversionPct + renderingPct) / 2)
    : conversionPct;

  const title = progress.title || 'Extracting frames';
  const message =
    progress.message ||
    'Converting the video into individual frames. Keep this tab open while processing runs locally.';

  return (
    <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/20 bg-white shadow-2xl dark:border-slate-700/50 dark:bg-slate-900">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500">
          <div
            className="h-full bg-white/30 transition-all duration-500 ease-out"
            style={{ width: `${100 - overallPct}%`, marginLeft: `${overallPct}%` }}
          />
        </div>

        <div className="p-6">
          {/* Icon + Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50">
              {isError ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : isReady ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{message}</p>
            </div>
          </div>

          {/* Progress bars */}
          <div className="mt-5 space-y-4">
            {/* Extraction / Conversion */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Film className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Extracting frames
                  </span>
                </div>
                <span className="tabular-nums text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {conversionPct}%
                </span>
              </div>
              <Progress value={conversionPct} className="h-2" />
            </div>

            {/* Rendering (only if active) */}
            {hasRendering && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Loading into editor
                    </span>
                  </div>
                  <span className="tabular-nums text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {renderingPct}%
                  </span>
                </div>
                <Progress value={renderingPct} className="h-2" />
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="mt-5 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/50">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Processing runs entirely in your browser — nothing is uploaded.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default LoadingOverlay;
