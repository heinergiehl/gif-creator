'use client';

import * as React from 'react';
import {
  ArrowDownToLine,
  Check,
  Download,
  FileArchive,
  Images,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  TriangleAlert,
  X,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  MAX_GIF_BYTES,
  formatBytes,
  formatDuration,
  parseGifMetadata,
  type GifMetadata,
} from '@/lib/gif-optimizer';
import type { ExtractedGifFrame, GifConversionProgress } from '@/lib/gif-conversion-engine';
import { UploadSurface } from './UploadSurface';

type ExtractorPhase =
  | 'idle'
  | 'analyzing'
  | 'ready'
  | 'extracting'
  | 'zipping'
  | 'success'
  | 'error';

interface SourceGif {
  file: File;
  url: string;
  metadata: GifMetadata;
}

interface FrameWithUrl extends ExtractedGifFrame {
  url: string;
}

const MAX_FRAME_COUNT = 600;
const MAX_DECODED_PIXELS = 260_000_000;
const INITIAL_VISIBLE_FRAMES = 48;

function getZipName(fileName: string): string {
  const base = fileName.replace(/\.gif$/i, '').replace(/[^a-z0-9-_]+/gi, '-');
  return `${base || 'animation'}-frames.zip`;
}

export function GifFrameExtractorTool() {
  const [phase, setPhase] = React.useState<ExtractorPhase>('idle');
  const [source, setSource] = React.useState<SourceGif | null>(null);
  const [frames, setFrames] = React.useState<FrameWithUrl[]>([]);
  const [visibleCount, setVisibleCount] = React.useState(INITIAL_VISIBLE_FRAMES);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [progress, setProgress] = React.useState<GifConversionProgress>({
    value: 0,
    message: '',
  });
  const errorRef = React.useRef<HTMLDivElement>(null);
  const resultHeadingRef = React.useRef<HTMLHeadingElement>(null);
  const busy = phase === 'analyzing' || phase === 'extracting' || phase === 'zipping';

  React.useEffect(() => {
    return () => {
      if (source) URL.revokeObjectURL(source.url);
    };
  }, [source]);

  React.useEffect(() => {
    return () => frames.forEach((frame) => URL.revokeObjectURL(frame.url));
  }, [frames]);

  React.useEffect(() => {
    if (phase === 'error' && source) errorRef.current?.focus();
    if (phase === 'success' && frames.length > 0) resultHeadingRef.current?.focus();
  }, [frames.length, phase, source]);

  const clearFrames = React.useCallback(() => {
    setFrames([]);
    setVisibleCount(INITIAL_VISIBLE_FRAMES);
  }, []);

  const handleFile = React.useCallback(
    async (file: File) => {
      clearFrames();
      setSource(null);
      setErrorMessage('');
      setPhase('analyzing');

      try {
        if (file.size === 0) throw new Error('This file is empty. Choose another GIF.');
        if (file.size > MAX_GIF_BYTES) throw new Error('Choose a GIF smaller than 50 MB.');

        const metadata = parseGifMetadata(await file.arrayBuffer());
        if (metadata.frameCount > MAX_FRAME_COUNT) {
          throw new Error(
            `This GIF has ${metadata.frameCount} frames. Use a GIF with ${MAX_FRAME_COUNT} frames or fewer, or trim it first.`,
          );
        }
        if (metadata.width * metadata.height * metadata.frameCount > MAX_DECODED_PIXELS) {
          throw new Error(
            'This GIF is too large to expand safely in one browser tab. Resize or trim it first.',
          );
        }

        setSource({ file, metadata, url: URL.createObjectURL(file) });
        setPhase('ready');
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'The GIF could not be opened.');
        setPhase('error');
      }
    },
    [clearFrames],
  );

  const loadExample = React.useCallback(async () => {
    setErrorMessage('');
    setPhase('analyzing');
    try {
      const response = await fetch('/example.gif');
      if (!response.ok) throw new Error('The example GIF is temporarily unavailable.');
      const blob = await response.blob();
      await handleFile(new File([blob], 'example-animation.gif', { type: 'image/gif' }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'The example could not be loaded.');
      setPhase('error');
    }
  }, [handleFile]);

  const extract = React.useCallback(async () => {
    if (!source || busy) return;
    clearFrames();
    setErrorMessage('');
    setPhase('extracting');
    setProgress({ value: 2, message: 'Loading the private browser engine…' });

    try {
      const { extractGifFrames } = await import('@/lib/gif-conversion-engine');
      const extracted = await extractGifFrames({
        file: source.file,
        onProgress: setProgress,
      });
      setFrames(
        extracted.map((frame) => ({
          ...frame,
          url: URL.createObjectURL(frame.blob),
        })),
      );
      setPhase('success');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'The browser could not extract the frames.',
      );
      setPhase('error');
    }
  }, [busy, clearFrames, source]);

  const downloadZip = React.useCallback(async () => {
    if (!source || frames.length === 0 || busy) return;
    setErrorMessage('');
    setPhase('zipping');
    setProgress({ value: 0, message: 'Packing PNG frames into one ZIP…' });

    try {
      const { createPngFramesZip } = await import('@/lib/gif-conversion-engine');
      const zip = await createPngFramesZip(frames, (value) =>
        setProgress({ value, message: 'Packing PNG frames into one ZIP…' }),
      );
      const url = URL.createObjectURL(zip);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = getZipName(source.file.name);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
      setProgress({ value: 100, message: 'ZIP download ready.' });
      setPhase('success');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'The ZIP file could not be prepared.',
      );
      setPhase('error');
    }
  }, [busy, frames, source]);

  const reset = React.useCallback(() => {
    clearFrames();
    setSource(null);
    setErrorMessage('');
    setPhase('idle');
    setProgress({ value: 0, message: '' });
  }, [clearFrames]);

  const statusText =
    phase === 'success' && frames.length > 0
      ? `${frames.length} PNG frames are ready.`
      : phase === 'error'
        ? errorMessage
        : busy
          ? progress.message || 'Reading GIF…'
          : '';

  return (
    <section
      aria-labelledby="gif-frame-extractor-title"
      aria-busy={busy}
      className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20"
    >
      <h2 id="gif-frame-extractor-title" className="sr-only">
        GIF frame extractor workspace
      </h2>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {statusText}
      </p>

      {!source ? (
        <UploadSurface
          accept="image/gif,.gif"
          formatLabel="GIF"
          title="Drop a GIF to reveal every frame"
          description="Each decoded animation frame becomes a full-canvas PNG that you can inspect and download."
          busy={busy}
          busyLabel="Reading GIF…"
          errorMessage={phase === 'error' ? errorMessage : ''}
          onFile={(file) => void handleFile(file)}
          onExample={() => void loadExample()}
        />
      ) : (
        <>
          <header className="flex min-w-0 items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <Images className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-950 dark:text-white">
                  {source.file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {source.metadata.frameCount} frames · {formatDuration(source.metadata.durationMs)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={reset}
              disabled={busy}
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              New GIF
            </Button>
          </header>

          <div className="grid min-w-0 lg:grid-cols-[minmax(0,1fr)_350px]">
            <div className="flex min-h-[420px] min-w-0 items-center justify-center border-b border-slate-200 bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] p-5 dark:border-slate-800 dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] lg:border-b-0 lg:border-r">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={source.url}
                alt="Source GIF preview"
                className="max-h-[560px] max-w-full object-contain"
              />
            </div>

            <aside className="min-w-0 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                Frame set
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {source.metadata.frameCount} composited PNGs
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                GIF disposal rules are applied before each full-canvas frame is exported.
              </p>

              <dl className="mt-5 divide-y divide-slate-200 border-y border-slate-200 text-sm dark:divide-slate-800 dark:border-slate-800">
                {[
                  ['File size', formatBytes(source.file.size)],
                  ['Canvas', `${source.metadata.width} × ${source.metadata.height}`],
                  ['Duration', formatDuration(source.metadata.durationMs)],
                  ['Frames', String(source.metadata.frameCount)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
                    <dd className="font-mono text-slate-900 dark:text-slate-100">{value}</dd>
                  </div>
                ))}
              </dl>

              {busy ? (
                <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/60 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="inline-flex min-w-0 items-center gap-2 font-medium text-blue-950 dark:text-blue-100">
                      <LoaderCircle className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none" />
                      <span className="truncate">{progress.message || 'Extracting frames…'}</span>
                    </span>
                    <span className="font-mono text-xs text-blue-700 dark:text-blue-300">
                      {Math.round(progress.value)}%
                    </span>
                  </div>
                  <Progress value={progress.value} className="mt-3 h-1.5" />
                </div>
              ) : null}

              {phase === 'error' && errorMessage ? (
                <Alert
                  ref={errorRef}
                  tabIndex={-1}
                  variant="destructive"
                  className="mt-5 outline-none"
                >
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Extraction stopped</AlertTitle>
                  <AlertDescription>
                    {errorMessage}
                    <Button
                      type="button"
                      variant="link"
                      className="mt-2 h-auto p-0 text-red-800 dark:text-red-200"
                      onClick={() => void extract()}
                    >
                      Try again
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}

              {phase === 'success' && frames.length > 0 ? (
                <Alert className="mt-5 border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-100">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <AlertTitle>{frames.length} frames ready</AlertTitle>
                  <AlertDescription>
                    Download one PNG below or save every frame as ZIP.
                  </AlertDescription>
                </Alert>
              ) : null}

              {frames.length > 0 ? (
                <Button
                  type="button"
                  size="lg"
                  className="mt-5 h-12 w-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                  onClick={() => void downloadZip()}
                  disabled={busy}
                >
                  <FileArchive className="mr-2 h-4 w-4" />
                  Download all as ZIP
                </Button>
              ) : (
                <Button
                  type="button"
                  size="lg"
                  className="mt-5 h-12 w-full bg-blue-600 text-white hover:bg-blue-500"
                  onClick={() => void extract()}
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />
                      Extracting frames…
                    </>
                  ) : (
                    <>
                      <Images className="mr-2 h-4 w-4" />
                      Extract {source.metadata.frameCount} frames
                    </>
                  )}
                </Button>
              )}
            </aside>
          </div>

          {frames.length > 0 ? (
            <section
              aria-labelledby="extracted-frames-title"
              className="border-t border-slate-200 dark:border-slate-800"
            >
              <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <h3
                    ref={resultHeadingRef}
                    id="extracted-frames-title"
                    tabIndex={-1}
                    className="text-lg font-semibold tracking-tight text-slate-950 outline-none dark:text-white"
                  >
                    Extracted PNG frames
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Showing {Math.min(visibleCount, frames.length)} of {frames.length}
                  </p>
                </div>
                <Button
                  type="button"
                  className="h-11 bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                  onClick={() => void downloadZip()}
                  disabled={busy}
                >
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                  Download ZIP
                </Button>
              </div>
              <Separator />
              <div className="max-h-[680px] overflow-y-auto p-4 sm:p-6">
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" role="list">
                  {frames.slice(0, visibleCount).map((frame) => (
                    <li
                      key={frame.name}
                      className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50"
                    >
                      <div
                        className="flex items-center justify-center overflow-hidden bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px] p-2 dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)]"
                        style={{
                          aspectRatio: `${source.metadata.width} / ${source.metadata.height}`,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={frame.url}
                          alt={`Frame ${frame.index + 1} from ${source.file.name}`}
                          loading="lazy"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-3 py-2 dark:border-slate-800">
                        <span className="truncate font-mono text-xs text-slate-600 dark:text-slate-300">
                          {String(frame.index + 1).padStart(3, '0')}
                        </span>
                        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <a href={frame.url} download={frame.name}>
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download frame {frame.index + 1}</span>
                          </a>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                {visibleCount < frames.length ? (
                  <div className="mt-6 text-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setVisibleCount((current) => Math.min(frames.length, current + 48))
                      }
                    >
                      Show {Math.min(48, frames.length - visibleCount)} more frames
                    </Button>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          <Separator />
          <footer className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs text-slate-500 dark:text-slate-400 sm:px-6">
            <span className="inline-flex items-center gap-1.5">
              <LockKeyhole className="h-3.5 w-3.5" />
              Source and frames stay in this browser
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={reset}
              disabled={busy}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Clear
            </Button>
          </footer>
        </>
      )}
    </section>
  );
}
