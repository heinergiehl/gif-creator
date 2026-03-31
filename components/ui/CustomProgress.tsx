'use client';
import * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { observer } from 'mobx-react';
import { Label } from './label';
import { useStores } from '@/store';
export const CustomProgress = observer(() => {
  const store = useStores().editorStore;
  const progress = store.progress;
  const isVisible =
    progress.active ||
    progress.conversion > 0 ||
    progress.rendering > 0 ||
    progress.stage === 'ready' ||
    progress.stage === 'error';
  const conversionLabel = progress.title || 'Converting your video into frames';
  const renderingLabel =
    progress.stage === 'importing'
      ? 'Loading extracted frames into the editor'
      : 'Rendering frames for editing';
  if (!isVisible) {
    return null;
  }
  return (
    <div className="flex-start flex w-full flex-col items-start justify-center gap-y-4">
      <span>{conversionLabel}</span>
      <Progress value={progress.conversion} />
      <div className="mt-1 ">
        <span>{Math.round(progress.conversion)}%</span>
      </div>
      {progress.rendering > 0 && (
        <>
          <span>{renderingLabel}</span>
          <Progress value={progress.rendering} />
          <div className="mt-1 ">
            <span>{Math.round(progress.rendering)}%</span>
          </div>
        </>
      )}
      {progress.stage === 'ready' && <span>{progress.message || 'Images are ready to be edited!'}</span>}
      {progress.stage === 'error' && (
        <span className="text-red-500">{progress.message || 'Something went wrong while importing media.'}</span>
      )}
    </div>
  );
});
