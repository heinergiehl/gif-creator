'use client';

import * as React from 'react';
import {
  ArrowDownToLine,
  Check,
  FileImage,
  LoaderCircle,
  LockKeyhole,
  Palette,
  RotateCcw,
  TriangleAlert,
  X,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MAX_GIF_BYTES, formatBytes, parseGifMetadata } from '@/lib/gif-optimizer';
import type { GifConversionKind, GifConversionProgress } from '@/lib/gif-conversion-engine';
import { UploadSurface } from './UploadSurface';

type ToolPhase = 'idle' | 'analyzing' | 'ready' | 'converting' | 'success' | 'error';

interface SourceMedia {
  file: File;
  url: string;
  width: number;
  height: number;
}

interface ConvertedMedia {
  blob: Blob;
  url: string;
  name: string;
  mimeType: string;
}

interface ToolConfig {
  inputLabel: 'GIF' | 'WebP';
  accept: string;
  uploadTitle: string;
  uploadDescription: string;
  actionLabel: string;
  workingLabel: string;
  resultLabel: string;
  outputExtension: 'mp4' | 'webp' | 'gif';
}

const TOOL_CONFIG: Record<GifConversionKind, ToolConfig> = {
  'gif-to-mp4': {
    inputLabel: 'GIF',
    accept: 'image/gif,.gif',
    uploadTitle: 'Drop a GIF to turn it into MP4',
    uploadDescription:
      'Animation timing is kept, transparent pixels use your chosen background, and odd dimensions are made video-safe.',
    actionLabel: 'Convert GIF to MP4',
    workingLabel: 'Creating MP4…',
    resultLabel: 'MP4 video',
    outputExtension: 'mp4',
  },
  'gif-to-webp': {
    inputLabel: 'GIF',
    accept: 'image/gif,.gif',
    uploadTitle: 'Drop a GIF to turn it into WebP',
    uploadDescription:
      'The browser converts the complete animation and keeps transparency where the format supports it.',
    actionLabel: 'Convert GIF to WebP',
    workingLabel: 'Creating animated WebP…',
    resultLabel: 'Animated WebP',
    outputExtension: 'webp',
  },
  'webp-to-gif': {
    inputLabel: 'WebP',
    accept: 'image/webp,.webp',
    uploadTitle: 'Drop a WebP to turn it into GIF',
    uploadDescription:
      'Animated WebP frames, timing, and transparent areas are carried into a shareable GIF.',
    actionLabel: 'Convert WebP to GIF',
    workingLabel: 'Creating GIF…',
    resultLabel: 'Converted GIF',
    outputExtension: 'gif',
  },
};

function isGif(bytes: Uint8Array): boolean {
  const signature = String.fromCharCode(...bytes.slice(0, 6));
  return signature === 'GIF87a' || signature === 'GIF89a';
}

function isWebp(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  return (
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  );
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  if ('createImageBitmap' in window) {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  }

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function outputName(fileName: string, extension: string): string {
  const base = fileName.replace(/\.[^.]+$/i, '').replace(/[^a-z0-9-_]+/gi, '-');
  return `${base || 'animation'}-converted.${extension}`;
}

function Preview({
  source,
  result,
  previewTab,
  onPreviewTabChange,
}: {
  source: SourceMedia;
  result: ConvertedMedia | null;
  previewTab: 'original' | 'result';
  onPreviewTabChange: (value: 'original' | 'result') => void;
}) {
  return (
    <div className="min-w-0 bg-slate-100/60 p-4 dark:bg-slate-900/40 sm:p-6">
      {result ? (
        <Tabs
          value={previewTab}
          onValueChange={(value) => onPreviewTabChange(value as 'original' | 'result')}
        >
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="original">Original</TabsTrigger>
            <TabsTrigger value="result">Result</TabsTrigger>
          </TabsList>
          <TabsContent value="original" className="mt-4">
            <div className="flex min-h-[360px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] dark:border-slate-700 dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={source.url}
                alt="Original animation preview"
                className="max-h-[520px] max-w-full object-contain"
              />
            </div>
          </TabsContent>
          <TabsContent value="result" className="mt-4">
            <div className="flex min-h-[360px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-700">
              {result.mimeType === 'video/mp4' ? (
                <video
                  src={result.url}
                  aria-label="Converted MP4 preview"
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="max-h-[520px] max-w-full object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={result.url}
                  alt="Converted animation preview"
                  className="max-h-[520px] max-w-full object-contain"
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Original preview
          </p>
          <div className="flex min-h-[380px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] dark:border-slate-700 dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={source.url}
              alt="Source animation preview"
              className="max-h-[520px] max-w-full object-contain"
            />
          </div>
        </>
      )}
    </div>
  );
}

export function MediaConversionTool({ kind }: { kind: GifConversionKind }) {
  const config = TOOL_CONFIG[kind];
  const [phase, setPhase] = React.useState<ToolPhase>('idle');
  const [source, setSource] = React.useState<SourceMedia | null>(null);
  const [result, setResult] = React.useState<ConvertedMedia | null>(null);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [background, setBackground] = React.useState('#ffffff');
  const [webpQuality, setWebpQuality] = React.useState('82');
  const [previewTab, setPreviewTab] = React.useState<'original' | 'result'>('original');
  const [progress, setProgress] = React.useState<GifConversionProgress>({
    value: 0,
    message: '',
  });
  const errorRef = React.useRef<HTMLDivElement>(null);
  const resultHeadingRef = React.useRef<HTMLHeadingElement>(null);
  const busy = phase === 'analyzing' || phase === 'converting';

  React.useEffect(() => {
    return () => {
      if (source) URL.revokeObjectURL(source.url);
    };
  }, [source]);
  React.useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  React.useEffect(() => {
    if (phase === 'error' && source) errorRef.current?.focus();
    if (phase === 'success') resultHeadingRef.current?.focus();
  }, [phase, source]);

  const clearResult = React.useCallback(() => {
    setResult(null);
    setPreviewTab('original');
  }, []);

  const handleFile = React.useCallback(
    async (file: File) => {
      clearResult();
      setSource(null);
      setErrorMessage('');
      setPhase('analyzing');

      try {
        if (file.size === 0) throw new Error('This file is empty. Choose another file.');
        if (file.size > MAX_GIF_BYTES) throw new Error('Choose a file smaller than 50 MB.');

        const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
        const expectsGif = kind !== 'webp-to-gif';
        if (expectsGif && !isGif(header)) throw new Error('Choose a valid GIF file.');
        if (!expectsGif && !isWebp(header)) throw new Error('Choose a valid WebP file.');

        let dimensions: { width: number; height: number };
        if (expectsGif) {
          const metadata = parseGifMetadata(await file.arrayBuffer());
          dimensions = { width: metadata.width, height: metadata.height };
        } else {
          dimensions = await getImageDimensions(file);
        }

        if (dimensions.width < 1 || dimensions.height < 1) {
          throw new Error('The image dimensions could not be read.');
        }

        setSource({ file, url: URL.createObjectURL(file), ...dimensions });
        setPhase('ready');
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'The file could not be opened.');
        setPhase('error');
      }
    },
    [clearResult, kind],
  );

  const loadExample = React.useCallback(async () => {
    clearResult();
    setSource(null);
    setErrorMessage('');
    setPhase('analyzing');
    setProgress({ value: 2, message: 'Preparing the example…' });

    try {
      const response = await fetch('/example.gif');
      if (!response.ok) throw new Error('The example is temporarily unavailable.');
      const gifBlob = await response.blob();
      const gifFile = new File([gifBlob], 'example-animation.gif', { type: 'image/gif' });

      if (kind !== 'webp-to-gif') {
        await handleFile(gifFile);
        return;
      }

      const metadata = parseGifMetadata(await gifFile.arrayBuffer());
      const { convertAnimatedMedia } = await import('@/lib/gif-conversion-engine');
      const exampleResult = await convertAnimatedMedia({
        file: gifFile,
        kind: 'gif-to-webp',
        width: metadata.width,
        height: metadata.height,
        webpQuality: 78,
        onProgress: setProgress,
      });
      await handleFile(
        new File([exampleResult.blob], 'example-animation.webp', { type: 'image/webp' }),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'The example could not be prepared.',
      );
      setPhase('error');
    }
  }, [clearResult, handleFile, kind]);

  const convert = React.useCallback(async () => {
    if (!source || busy) return;
    clearResult();
    setErrorMessage('');
    setPhase('converting');
    setProgress({ value: 2, message: 'Loading the private browser engine…' });

    try {
      const { convertAnimatedMedia } = await import('@/lib/gif-conversion-engine');
      const conversion = await convertAnimatedMedia({
        file: source.file,
        kind,
        width: source.width,
        height: source.height,
        background,
        webpQuality: Number(webpQuality),
        onProgress: setProgress,
      });
      setResult({
        blob: conversion.blob,
        url: URL.createObjectURL(conversion.blob),
        name: outputName(source.file.name, conversion.extension),
        mimeType: conversion.mimeType,
      });
      setPreviewTab('result');
      setPhase('success');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'The browser could not finish the conversion.',
      );
      setPhase('error');
    }
  }, [background, busy, clearResult, kind, source, webpQuality]);

  const invalidateResult = React.useCallback(() => {
    if (!result) return;
    clearResult();
    setPhase('ready');
  }, [clearResult, result]);

  const reset = React.useCallback(() => {
    clearResult();
    setSource(null);
    setErrorMessage('');
    setPhase('idle');
    setProgress({ value: 0, message: '' });
  }, [clearResult]);

  const statusText =
    phase === 'success'
      ? `${config.resultLabel} is ready to download.`
      : phase === 'error'
        ? errorMessage
        : busy
          ? progress.message || config.workingLabel
          : '';

  return (
    <section
      aria-labelledby="media-conversion-workspace-title"
      aria-busy={busy}
      className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20"
    >
      <h2 id="media-conversion-workspace-title" className="sr-only">
        {config.actionLabel} workspace
      </h2>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {statusText}
      </p>

      {!source ? (
        <UploadSurface
          accept={config.accept}
          formatLabel={config.inputLabel}
          title={config.uploadTitle}
          description={config.uploadDescription}
          busy={busy}
          busyLabel={progress.message || 'Reading animation…'}
          errorMessage={phase === 'error' ? errorMessage : ''}
          onFile={(file) => void handleFile(file)}
          onExample={() => void loadExample()}
        />
      ) : (
        <>
          <header className="flex min-w-0 items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <FileImage className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-950 dark:text-white">
                  {source.file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatBytes(source.file.size)} · {source.width} × {source.height}
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
              New file
            </Button>
          </header>

          <div className="grid min-w-0 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 border-b border-slate-200 dark:border-slate-800 lg:border-b-0 lg:border-r">
              <Preview
                source={source}
                result={result}
                previewTab={previewTab}
                onPreviewTabChange={setPreviewTab}
              />
            </div>

            <aside className="min-w-0 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                Output
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {config.resultLabel}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                The complete animation is processed locally in this tab.
              </p>

              <dl className="mt-5 divide-y divide-slate-200 border-y border-slate-200 text-sm dark:divide-slate-800 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-slate-500 dark:text-slate-400">Source size</dt>
                  <dd className="font-mono text-slate-900 dark:text-slate-100">
                    {formatBytes(source.file.size)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-slate-500 dark:text-slate-400">Canvas</dt>
                  <dd className="font-mono text-slate-900 dark:text-slate-100">
                    {source.width} × {source.height}
                  </dd>
                </div>
                {result ? (
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-slate-500 dark:text-slate-400">Result size</dt>
                    <dd className="font-mono text-slate-900 dark:text-slate-100">
                      {formatBytes(result.blob.size)}
                    </dd>
                  </div>
                ) : null}
              </dl>

              {kind === 'gif-to-mp4' ? (
                <div className="mt-6">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-slate-500" />
                    <Label htmlFor="mp4-background">Transparency background</Label>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <Input
                      id="mp4-background"
                      type="color"
                      value={background}
                      onChange={(event) => {
                        invalidateResult();
                        setBackground(event.target.value);
                      }}
                      disabled={busy}
                      className="h-11 w-14 cursor-pointer p-1"
                    />
                    <span className="font-mono text-sm uppercase text-slate-600 dark:text-slate-300">
                      {background}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    MP4 has no alpha channel, so transparent GIF pixels need a solid color.
                  </p>
                </div>
              ) : null}

              {kind === 'gif-to-webp' ? (
                <div className="mt-6">
                  <Label htmlFor="webp-quality">WebP quality</Label>
                  <Select
                    value={webpQuality}
                    onValueChange={(value) => {
                      invalidateResult();
                      setWebpQuality(value);
                    }}
                    disabled={busy}
                  >
                    <SelectTrigger id="webp-quality" className="mt-2 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="92">High detail</SelectItem>
                      <SelectItem value="82">Balanced</SelectItem>
                      <SelectItem value="68">Smaller file</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {busy ? (
                <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/60 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="inline-flex min-w-0 items-center gap-2 font-medium text-blue-950 dark:text-blue-100">
                      <LoaderCircle className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none" />
                      <span className="truncate">{progress.message || config.workingLabel}</span>
                    </span>
                    <span className="font-mono text-xs text-blue-700 dark:text-blue-300">
                      {Math.round(progress.value)}%
                    </span>
                  </div>
                  <Progress value={progress.value} className="mt-3 h-1.5" />
                  <p className="mt-3 text-xs leading-5 text-blue-800/80 dark:text-blue-200/70">
                    Keep this tab open while the browser processes the animation.
                  </p>
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
                  <AlertTitle>Conversion stopped</AlertTitle>
                  <AlertDescription>
                    {errorMessage}
                    <Button
                      type="button"
                      variant="link"
                      className="mt-2 h-auto p-0 text-red-800 dark:text-red-200"
                      onClick={() => void convert()}
                    >
                      Try again
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}

              {phase === 'success' && result ? (
                <Alert className="mt-5 border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-100">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <AlertTitle>Conversion complete</AlertTitle>
                  <AlertDescription>
                    <h3 ref={resultHeadingRef} tabIndex={-1} className="outline-none">
                      Your {config.resultLabel.toLowerCase()} is ready.
                    </h3>
                  </AlertDescription>
                </Alert>
              ) : null}

              {result ? (
                <Button
                  asChild
                  size="lg"
                  className="mt-5 h-12 w-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                >
                  <a href={result.url} download={result.name}>
                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                    Download {formatBytes(result.blob.size)}
                  </a>
                </Button>
              ) : (
                <Button
                  type="button"
                  size="lg"
                  className="mt-5 h-12 w-full bg-blue-600 text-white hover:bg-blue-500"
                  onClick={() => void convert()}
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />
                      {config.workingLabel}
                    </>
                  ) : (
                    config.actionLabel
                  )}
                </Button>
              )}

              {result ? (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 h-11 w-full"
                  onClick={() => void convert()}
                  disabled={busy}
                >
                  Convert again
                </Button>
              ) : null}
            </aside>
          </div>

          <Separator />
          <footer className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs text-slate-500 dark:text-slate-400 sm:px-6">
            <span className="inline-flex items-center gap-1.5">
              <LockKeyhole className="h-3.5 w-3.5" />
              Source stays in this browser
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
