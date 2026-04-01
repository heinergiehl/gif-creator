'use client';
import * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { observer } from 'mobx-react';
import { useStores } from '@/store';

export const CustomProgress = observer(() => {
  const store = useStores().editorStore;
  const progress = store.progress;
  const isVisible = progress.active || progress.stage === 'error';

  const conversionLabel = progress.title || 'Converting your video into frames';
  const renderingLabel =
    progress.stage === 'importing'
      ? 'Loading extracted frames into the editor'
      : 'Rendering frames for editing';

  if (!isVisible) return null;

  return (
    <div className="flex w-full flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{conversionLabel}</span>
        <Progress value={progress.conversion} className="h-2" />
        <span className="text-[10px] tabular-nums text-slate-500">{Math.round(progress.conversion)}%</span>
      </div>
      {progress.rendering > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{renderingLabel}</span>
          <Progress value={progress.rendering} className="h-2" />
          <span className="text-[10px] tabular-nums text-slate-500">{Math.round(progress.rendering)}%</span>
        </div>
      )}
      {progress.stage === 'error' && (
        <span className="text-xs font-medium text-red-500">{progress.message || 'Something went wrong while importing media.'}</span>
      )}
    </div>
  );
});
