'use client';
import * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { observer } from 'mobx-react';
import { Label } from './label';
import { useStores } from '@/store';
export const CustomProgress = observer(() => {
  const store = useStores().editorStore;
  const progress = store.progress;
  return (
    <div
      style={{
        display: progress.conversion > 0 ? 'flex' : 'none',
      }}
      className="flex flex-col items-start justify-center w-full flex-start gap-y-4"
    >
      <span>We are currently converting the video into single frames</span>
      <Progress value={progress.conversion} />
      {/* percent */}
      <div className="mt-1 ">
        <span>{Math.round(progress.conversion)}%</span>
      </div>
      {progress.rendering > 0 && (
        <>
          <span>Wait a quick moment, until the images being rendered and ready to be edited!</span>
          <Progress value={progress.rendering} />
          <div className="mt-1 ">
            <span>{Math.round(progress.rendering)}%</span>
          </div>
        </>
      )}
      {progress.rendering === 100 && <span>Images are ready to be edited!</span>}
    </div>
  );
});
