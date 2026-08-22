'use client';

import * as React from 'react';
import { Film, Images, LockKeyhole, MonitorUp, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { StudioProgress } from '@/components/gif-studio/types';

export function StudioEmptyState({
  progress,
  error,
  embedded = false,
  onFiles,
  onLoadExample,
  onRecordScreen,
}: {
  progress: StudioProgress;
  error: string;
  embedded?: boolean;
  onFiles: (files: File[]) => void;
  onLoadExample: () => void;
  onRecordScreen: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const importing = progress.phase === 'importing';
  const Root = embedded ? 'section' : 'main';
  const Heading = embedded ? 'h2' : 'h1';

  return (
    <Root
      aria-label={embedded ? 'GIF caption editor' : undefined}
      className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#090d14] px-5 py-10 text-slate-100"
    >
      <div className="w-full max-w-2xl">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
            GIF Studio
          </p>
          <Heading className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
            One timeline for the whole animation
          </Heading>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-sm leading-6 text-slate-400 sm:text-base">
            Open a GIF, short video, screen recording, or image sequence. Adjust real frame timing,
            annotate the motion, and export without a watermark.
          </p>
        </div>

        <div
          className={cn(
            'mt-9 rounded-xl border border-dashed px-6 py-9 text-center transition-colors',
            dragging ? 'border-sky-300 bg-sky-400/[0.06]' : 'border-slate-700 bg-slate-900/35',
          )}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            const files = Array.from(event.dataTransfer.files);
            if (files.length) onFiles(files);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/gif,image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime,.gif,.png,.jpg,.jpeg,.webp,.mp4,.webm,.mov,.gifstudio"
            multiple
            className="sr-only"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              if (files.length) onFiles(files);
              event.currentTarget.value = '';
            }}
          />
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-sky-300">
            <Upload className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-base font-semibold text-white">Drop media here</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            GIF, MP4, WebM, MOV, PNG, JPG, WebP, or a saved .gifstudio project
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <Button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={importing}
              className="bg-sky-400 text-slate-950 hover:bg-sky-300"
            >
              Choose media
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onRecordScreen}
              disabled={importing}
              className="border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800"
            >
              <MonitorUp className="mr-2 h-4 w-4" /> Record screen
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onLoadExample}
              disabled={importing}
              className="text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            >
              Try an example
            </Button>
          </div>
          {importing ? (
            <div className="mx-auto mt-6 max-w-sm" aria-live="polite">
              <Progress value={progress.value} className="h-1.5" />
              <p className="mt-2 text-xs text-slate-400">{progress.message}</p>
            </div>
          ) : null}
          {error ? (
            <p role="alert" className="mx-auto mt-5 max-w-md text-sm text-red-300">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3 text-xs text-slate-500 sm:grid-cols-3">
          <p className="flex items-center justify-center gap-2 sm:justify-start">
            <LockKeyhole className="h-4 w-4 text-emerald-400" aria-hidden="true" /> Local processing
          </p>
          <p className="flex items-center justify-center gap-2">
            <Film className="h-4 w-4 text-slate-400" aria-hidden="true" /> Real frame timing
          </p>
          <p className="flex items-center justify-center gap-2 sm:justify-end">
            <Images className="h-4 w-4 text-slate-400" aria-hidden="true" /> No forced watermark
          </p>
        </div>
      </div>
    </Root>
  );
}
