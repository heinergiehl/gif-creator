'use client';

import * as React from 'react';
import {
  ArrowDownToLine,
  ArrowLeftRight,
  Check,
  FileImage,
  Gauge,
  LoaderCircle,
  LockKeyhole,
  Play,
  Repeat2,
  RotateCcw,
  Scissors,
  Sparkles,
  TriangleAlert,
  Upload,
  X,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  MAX_GIF_BYTES,
  formatBytes,
  formatDuration,
  parseGifMetadata,
  type GifMetadata,
} from '@/lib/gif-optimizer';
import {
  processGifMotion,
  type GifMotionOperation,
  type GifMotionProgress,
  type ReverseMode,
} from '@/lib/gif-motion-engine';
import { cn } from '@/lib/utils';

export type MotionToolKind = 'speed' | 'trim' | 'reverse';

interface MotionGifToolProps {
  kind: MotionToolKind;
}

interface SourceGif {
  file: File;
  url: string;
  metadata: GifMetadata;
}

interface ResultGif {
  url: string;
  blob: Blob;
  size: number;
  metadata: GifMetadata;
}

type ToolPhase = 'idle' | 'analyzing' | 'ready' | 'loading' | 'processing' | 'success' | 'error';

const TOOL_COPY: Record<
  MotionToolKind,
  {
    eyebrow: string;
    controlsTitle: string;
    controlsDescription: string;
    action: string;
    working: string;
    downloadSuffix: string;
    resultTitle: string;
    icon: typeof Gauge;
  }
> = {
  speed: {
    eyebrow: 'GIF speed changer',
    controlsTitle: 'Set the playback speed',
    controlsDescription: 'Use a multiplier or enter the exact finished duration.',
    action: 'Change GIF speed',
    working: 'Changing speed…',
    downloadSuffix: 'speed-changed',
    resultTitle: 'Retimed GIF ready',
    icon: Gauge,
  },
  trim: {
    eyebrow: 'GIF trimmer',
    controlsTitle: 'Choose the part to keep',
    controlsDescription: 'Set exact start and end times. Everything outside is removed.',
    action: 'Trim GIF',
    working: 'Trimming GIF…',
    downloadSuffix: 'trimmed',
    resultTitle: 'Trimmed GIF ready',
    icon: Scissors,
  },
  reverse: {
    eyebrow: 'GIF reverse tool',
    controlsTitle: 'Choose the playback direction',
    controlsDescription: 'Play every frame backward or create a seamless forward-and-back loop.',
    action: 'Reverse GIF',
    working: 'Rebuilding GIF…',
    downloadSuffix: 'reversed',
    resultTitle: 'Rebuilt GIF ready',
    icon: Repeat2,
  },
};

const SPEED_PRESETS = [0.5, 1.5, 2, 3];

function parseSeconds(value: string): number {
  return Number(value.replace(',', '.'));
}

function secondsLabel(seconds: number): string {
  if (!Number.isFinite(seconds)) return '—';
  return seconds < 10
    ? seconds.toFixed(2).replace(/0+$/, '').replace(/\.$/, '') + ' s'
    : seconds.toFixed(1) + ' s';
}

function fileNameFor(sourceName: string, suffix: string): string {
  const baseName = sourceName.replace(/\.gif$/i, '').replace(/[^a-z0-9_-]+/gi, '-');
  return (baseName || 'animation') + '-' + suffix + '.gif';
}

function errorText(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'The GIF could not be processed. Your source is still available, so you can try again.';
}

function GifFacts({
  size,
  metadata,
  compact = false,
}: {
  size: number;
  metadata: GifMetadata;
  compact?: boolean;
}): React.ReactElement {
  const facts = [
    { label: 'File size', value: formatBytes(size) },
    { label: 'Canvas', value: metadata.width + ' × ' + metadata.height },
    { label: 'Frames', value: String(metadata.frameCount) },
    { label: 'Duration', value: formatDuration(metadata.durationMs) },
  ];

  return (
    <dl
      className={cn(
        'grid grid-cols-2 divide-x divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800',
        compact && 'rounded-md border-x',
      )}
    >
      {facts.map((fact) => (
        <div key={fact.label} className="min-w-0 px-3 py-3 sm:px-4">
          <dt className="text-[11px] font-medium uppercase tracking-[0.13em] text-slate-400">
            {fact.label}
          </dt>
          <dd className="mt-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100">
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function GifPreview({
  source,
  result,
}: {
  source: SourceGif;
  result: ResultGif | null;
}): React.ReactElement {
  const [view, setView] = React.useState('original');

  React.useEffect(() => {
    setView(result ? 'result' : 'original');
  }, [result]);

  const imageClassName = 'max-h-[390px] max-w-full object-contain';

  return (
    <Tabs value={view} onValueChange={setView} className="flex min-h-[430px] flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-5">
        <TabsList className="h-9 bg-slate-100 p-1 dark:bg-slate-900">
          <TabsTrigger value="original" className="h-7 px-3 text-xs">
            Original
          </TabsTrigger>
          <TabsTrigger value="result" disabled={!result} className="h-7 px-3 text-xs">
            Result
          </TabsTrigger>
          <TabsTrigger
            value="compare"
            disabled={!result}
            className="hidden h-7 px-3 text-xs sm:flex"
          >
            Compare
          </TabsTrigger>
        </TabsList>
        <span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:inline-flex">
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
          Animated preview
        </span>
      </div>

      <TabsContent
        value="original"
        className="gif-checkerboard m-0 flex min-h-[370px] flex-1 items-center justify-center p-5"
      >
        <img
          src={source.url}
          alt={'Original animated preview of ' + source.file.name}
          className={imageClassName}
          draggable={false}
        />
      </TabsContent>

      <TabsContent
        value="result"
        className="gif-checkerboard m-0 flex min-h-[370px] flex-1 items-center justify-center p-5"
      >
        {result ? (
          <img
            src={result.url}
            alt={'Processed animated preview of ' + source.file.name}
            className={imageClassName}
            draggable={false}
          />
        ) : null}
      </TabsContent>

      <TabsContent value="compare" className="gif-checkerboard m-0 min-h-[370px] flex-1">
        {result ? (
          <div className="grid min-h-[370px] sm:grid-cols-2">
            <figure className="flex min-w-0 flex-col border-b border-slate-300/70 p-4 dark:border-slate-700/80 sm:border-b-0 sm:border-r">
              <figcaption className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">
                Original
              </figcaption>
              <div className="flex min-h-52 flex-1 items-center justify-center">
                <img
                  src={source.url}
                  alt="Original GIF"
                  className={imageClassName}
                  draggable={false}
                />
              </div>
            </figure>
            <figure className="flex min-w-0 flex-col p-4">
              <figcaption className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">
                Result
              </figcaption>
              <div className="flex min-h-52 flex-1 items-center justify-center">
                <img
                  src={result.url}
                  alt="Processed GIF"
                  className={imageClassName}
                  draggable={false}
                />
              </div>
            </figure>
          </div>
        ) : null}
      </TabsContent>
    </Tabs>
  );
}

interface ControlsProps {
  source: SourceGif;
  markChanged: () => void;
  speedMode: 'multiplier' | 'duration';
  setSpeedMode: (mode: 'multiplier' | 'duration') => void;
  speed: number;
  setSpeed: (speed: number) => void;
  exactDuration: string;
  setExactDuration: (duration: string) => void;
  trimStart: string;
  setTrimStart: (start: string) => void;
  trimEnd: string;
  setTrimEnd: (end: string) => void;
  reverseMode: ReverseMode;
  setReverseMode: (mode: ReverseMode) => void;
}

function SpeedControls({
  source,
  markChanged,
  speedMode,
  setSpeedMode,
  speed,
  setSpeed,
  exactDuration,
  setExactDuration,
}: ControlsProps): React.ReactElement {
  const sourceSeconds = source.metadata.durationMs / 1000;
  const exactSeconds = parseSeconds(exactDuration);
  const effectiveSpeed = speedMode === 'duration' ? sourceSeconds / exactSeconds : speed;
  const resultSeconds = speedMode === 'duration' ? exactSeconds : sourceSeconds / speed;

  return (
    <Tabs
      value={speedMode}
      onValueChange={(value) => {
        setSpeedMode(value as 'multiplier' | 'duration');
        markChanged();
      }}
    >
      <TabsList className="grid h-10 w-full grid-cols-2 bg-slate-100 dark:bg-slate-900">
        <TabsTrigger value="multiplier">Multiplier</TabsTrigger>
        <TabsTrigger value="duration">Exact duration</TabsTrigger>
      </TabsList>

      <TabsContent value="multiplier" className="mt-6 space-y-5">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm font-medium">Playback multiplier</span>
          <output className="font-mono text-lg font-semibold text-blue-700 dark:text-blue-300">
            {speed.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}×
          </output>
        </div>
        <Slider
          min={0.25}
          max={4}
          step={0.05}
          value={[speed]}
          onValueChange={([value]) => {
            setSpeed(value);
            markChanged();
          }}
          aria-label="GIF playback speed multiplier"
        />
        <div className="flex justify-between text-xs text-slate-400" aria-hidden="true">
          <span>0.25× slower</span>
          <span>4× faster</span>
        </div>
        <ToggleGroup
          type="single"
          value={String(speed)}
          onValueChange={(value) => {
            if (!value) return;
            setSpeed(Number(value));
            markChanged();
          }}
          className="grid grid-cols-4 gap-2"
          aria-label="Speed presets"
        >
          {SPEED_PRESETS.map((preset) => (
            <ToggleGroupItem
              key={preset}
              value={String(preset)}
              className="h-10 border border-slate-200 text-xs data-[state=on]:border-blue-500 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-800 dark:border-slate-800 dark:data-[state=on]:bg-blue-950/40 dark:data-[state=on]:text-blue-200"
            >
              {preset}×
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </TabsContent>

      <TabsContent value="duration" className="mt-6 space-y-3">
        <Label htmlFor="exact-gif-duration">Finished duration</Label>
        <div className="relative">
          <Input
            id="exact-gif-duration"
            inputMode="decimal"
            value={exactDuration}
            onChange={(event) => {
              setExactDuration(event.target.value);
              markChanged();
            }}
            aria-describedby="exact-duration-help"
            className="h-11 pr-12"
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-400">
            sec
          </span>
        </div>
        <p
          id="exact-duration-help"
          className="text-xs leading-5 text-slate-500 dark:text-slate-400"
        >
          The original runs for {secondsLabel(sourceSeconds)}. The supported range is{' '}
          {secondsLabel(sourceSeconds / 4)} to {secondsLabel(sourceSeconds * 4)}.
        </p>
      </TabsContent>

      <div className="mt-6 border-y border-slate-200 py-4 dark:border-slate-800">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-slate-500 dark:text-slate-400">Expected result</span>
          <span className="text-right font-medium text-slate-900 dark:text-white">
            {secondsLabel(resultSeconds)} ·{' '}
            {Number.isFinite(effectiveSpeed) ? effectiveSpeed.toFixed(2) : '—'}×
          </span>
        </div>
      </div>
    </Tabs>
  );
}

function TrimControls({
  source,
  markChanged,
  trimStart,
  setTrimStart,
  trimEnd,
  setTrimEnd,
}: ControlsProps): React.ReactElement {
  const totalSeconds = source.metadata.durationMs / 1000;
  const start = parseSeconds(trimStart);
  const end = parseSeconds(trimEnd);
  const selection = end - start;

  const setRange = (nextStart: number, nextEnd: number) => {
    setTrimStart(nextStart.toFixed(2));
    setTrimEnd(nextEnd.toFixed(2));
    markChanged();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="trim-start">Start time</Label>
          <div className="relative">
            <Input
              id="trim-start"
              inputMode="decimal"
              value={trimStart}
              onChange={(event) => {
                setTrimStart(event.target.value);
                markChanged();
              }}
              aria-describedby="trim-range-help"
              className="h-11 pr-10"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
              s
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="trim-end">End time</Label>
          <div className="relative">
            <Input
              id="trim-end"
              inputMode="decimal"
              value={trimEnd}
              onChange={(event) => {
                setTrimEnd(event.target.value);
                markChanged();
              }}
              aria-describedby="trim-range-help"
              className="h-11 pr-10"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
              s
            </span>
          </div>
        </div>
      </div>

      <p id="trim-range-help" className="text-xs leading-5 text-slate-500 dark:text-slate-400">
        Keep times between 0 and {secondsLabel(totalSeconds)}. The selected clip must be at least
        0.1 seconds.
      </p>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.13em] text-slate-400">
          Quick selections
        </p>
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRange(0, totalSeconds / 2)}
          >
            First half
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRange(totalSeconds / 4, totalSeconds * 0.75)}
          >
            Middle
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRange(totalSeconds / 2, totalSeconds)}
          >
            Last half
          </Button>
        </div>
      </div>

      <div className="border-y border-slate-200 py-4 dark:border-slate-800">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-slate-500 dark:text-slate-400">Selected duration</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {secondsLabel(selection)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ReverseControls({
  markChanged,
  reverseMode,
  setReverseMode,
}: ControlsProps): React.ReactElement {
  return (
    <div className="space-y-5">
      <ToggleGroup
        type="single"
        value={reverseMode}
        onValueChange={(value) => {
          if (!value) return;
          setReverseMode(value as ReverseMode);
          markChanged();
        }}
        className="grid grid-cols-2 gap-2"
        aria-label="GIF playback direction"
      >
        <ToggleGroupItem
          value="reverse"
          className="h-auto min-h-20 flex-col gap-1.5 border border-slate-200 px-3 data-[state=on]:border-blue-500 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-900 dark:border-slate-800 dark:data-[state=on]:bg-blue-950/40 dark:data-[state=on]:text-blue-100"
        >
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
          <span>Reverse</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="boomerang"
          className="h-auto min-h-20 flex-col gap-1.5 border border-slate-200 px-3 data-[state=on]:border-blue-500 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-900 dark:border-slate-800 dark:data-[state=on]:bg-blue-950/40 dark:data-[state=on]:text-blue-100"
        >
          <ArrowLeftRight className="h-5 w-5" aria-hidden="true" />
          <span>Boomerang</span>
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="border-y border-slate-200 py-4 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:text-slate-400">
        {reverseMode === 'reverse'
          ? 'The last frame becomes the first while the original loop setting is retained.'
          : 'The animation plays forward and then backward. Duplicate turn-around frames are removed when the source has enough frames.'}
      </div>
    </div>
  );
}

export function MotionGifTool({ kind }: MotionGifToolProps): React.ReactElement {
  const copy = TOOL_COPY[kind];
  const ToolIcon = copy.icon;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const resultHeadingRef = React.useRef<HTMLHeadingElement>(null);
  const errorRef = React.useRef<HTMLDivElement>(null);
  const sourceUrlRef = React.useRef<string | null>(null);
  const resultUrlRef = React.useRef<string | null>(null);

  const [phase, setPhase] = React.useState<ToolPhase>('idle');
  const [source, setSource] = React.useState<SourceGif | null>(null);
  const [result, setResult] = React.useState<ResultGif | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState<GifMotionProgress>({
    stage: 'loading',
    value: 0,
    message: '',
  });
  const [dragging, setDragging] = React.useState(false);
  const [speedMode, setSpeedMode] = React.useState<'multiplier' | 'duration'>('multiplier');
  const [speed, setSpeed] = React.useState(2);
  const [exactDuration, setExactDuration] = React.useState('1');
  const [trimStart, setTrimStart] = React.useState('0');
  const [trimEnd, setTrimEnd] = React.useState('1');
  const [reverseMode, setReverseMode] = React.useState<ReverseMode>('reverse');

  const busy = phase === 'analyzing' || phase === 'loading' || phase === 'processing';

  const revokeResult = React.useCallback(() => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = null;
    setResult(null);
  }, []);

  const markChanged = React.useCallback(() => {
    revokeResult();
    setErrorMessage(null);
    setPhase((current) => (current === 'idle' || current === 'analyzing' ? current : 'ready'));
  }, [revokeResult]);

  const reset = React.useCallback(() => {
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    sourceUrlRef.current = null;
    revokeResult();
    setSource(null);
    setErrorMessage(null);
    setDragging(false);
    setPhase('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [revokeResult]);

  React.useEffect(
    () => () => {
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    },
    [],
  );

  const loadFile = React.useCallback(
    async (file: File) => {
      setErrorMessage(null);
      setPhase('analyzing');

      try {
        if (file.size > MAX_GIF_BYTES) {
          throw new Error(
            'Choose a GIF smaller than 50 MB so it can be processed safely in your browser.',
          );
        }
        if (!file.name.toLowerCase().endsWith('.gif') && file.type !== 'image/gif') {
          throw new Error(
            'Choose a GIF file. Other image and video formats are not accepted here.',
          );
        }

        const metadata = parseGifMetadata(await file.arrayBuffer());
        if (!metadata.animated) {
          throw new Error(
            'This file has only one frame. Choose an animated GIF to use a motion tool.',
          );
        }

        if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
        revokeResult();
        const url = URL.createObjectURL(file);
        sourceUrlRef.current = url;
        const seconds = metadata.durationMs / 1000;
        setSource({ file, url, metadata });
        setSpeedMode('multiplier');
        setSpeed(2);
        setExactDuration(Math.max(0.1, seconds / 2).toFixed(2));
        setTrimStart('0');
        setTrimEnd(seconds.toFixed(2));
        setReverseMode('reverse');
        setPhase('ready');
      } catch (error) {
        setErrorMessage(errorText(error));
        setPhase(source ? 'ready' : 'idle');
        window.setTimeout(() => errorRef.current?.focus(), 0);
      }
    },
    [revokeResult, source],
  );

  const loadSample = React.useCallback(async () => {
    setErrorMessage(null);
    setPhase('analyzing');
    try {
      const response = await fetch('/example.gif');
      if (!response.ok)
        throw new Error('The sample GIF is unavailable right now. Choose your own GIF instead.');
      const blob = await response.blob();
      await loadFile(new File([blob], 'sample-animation.gif', { type: 'image/gif' }));
    } catch (error) {
      setErrorMessage(errorText(error));
      setPhase('idle');
      window.setTimeout(() => errorRef.current?.focus(), 0);
    }
  }, [loadFile]);

  const controlError = React.useMemo(() => {
    if (!source) return null;
    const sourceSeconds = source.metadata.durationMs / 1000;

    if (kind === 'speed' && speedMode === 'duration') {
      const duration = parseSeconds(exactDuration);
      if (
        !Number.isFinite(duration) ||
        duration < sourceSeconds / 4 ||
        duration > sourceSeconds * 4
      ) {
        return 'Enter a finished duration within the supported range.';
      }
    }

    if (kind === 'trim') {
      const start = parseSeconds(trimStart);
      const end = parseSeconds(trimEnd);
      if (!Number.isFinite(start) || !Number.isFinite(end))
        return 'Enter valid start and end times.';
      if (start < 0 || end > sourceSeconds + 0.001)
        return 'Keep both times inside the original GIF.';
      if (end - start < 0.1) return 'The selected clip must be at least 0.1 seconds long.';
    }

    return null;
  }, [exactDuration, kind, source, speedMode, trimEnd, trimStart]);

  const buildOperation = React.useCallback((): GifMotionOperation => {
    if (!source) throw new Error('Choose an animated GIF first.');
    if (kind === 'speed') {
      const sourceSeconds = source.metadata.durationMs / 1000;
      return {
        kind: 'speed',
        speed: speedMode === 'duration' ? sourceSeconds / parseSeconds(exactDuration) : speed,
      };
    }
    if (kind === 'trim') {
      return {
        kind: 'trim',
        startSeconds: parseSeconds(trimStart),
        endSeconds: parseSeconds(trimEnd),
      };
    }
    return { kind: 'reverse', mode: reverseMode };
  }, [exactDuration, kind, reverseMode, source, speed, speedMode, trimEnd, trimStart]);

  const run = React.useCallback(async () => {
    if (!source || busy || controlError) return;
    revokeResult();
    setErrorMessage(null);
    setPhase('loading');
    setProgress({ stage: 'loading', value: 2, message: 'Starting local processing…' });

    try {
      const output = await processGifMotion({
        file: source.file,
        metadata: source.metadata,
        operation: buildOperation(),
        onProgress: (nextProgress) => {
          setProgress(nextProgress);
          setPhase(nextProgress.stage === 'loading' ? 'loading' : 'processing');
        },
      });
      const url = URL.createObjectURL(output.blob);
      resultUrlRef.current = url;
      setResult({ ...output, url });
      setPhase('success');
      window.setTimeout(() => resultHeadingRef.current?.focus(), 0);
    } catch (error) {
      setErrorMessage(errorText(error));
      setPhase('error');
      window.setTimeout(() => errorRef.current?.focus(), 0);
    }
  }, [buildOperation, busy, controlError, revokeResult, source]);

  const controlsProps: ControlsProps | null = source
    ? {
        source,
        markChanged,
        speedMode,
        setSpeedMode,
        speed,
        setSpeed,
        exactDuration,
        setExactDuration,
        trimStart,
        setTrimStart,
        trimEnd,
        setTrimEnd,
        reverseMode,
        setReverseMode,
      }
    : null;

  return (
    <section
      aria-label={copy.eyebrow}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/gif,.gif"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void loadFile(file);
          event.target.value = '';
        }}
      />

      {!source ? (
        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <ToolIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              {copy.eyebrow}
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
              Local browser processing
            </span>
          </div>

          <div
            className={cn(
              'mt-4 flex min-h-[330px] flex-col items-center justify-center rounded-lg border border-dashed px-5 py-12 text-center transition-colors',
              dragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'border-slate-300 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-900/40',
            )}
            onDragEnter={(event) => {
              event.preventDefault();
              if (!busy) setDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null))
                setDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files?.[0];
              if (file && !busy) void loadFile(file);
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {phase === 'analyzing' ? (
                <LoaderCircle
                  className="h-5 w-5 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <Upload className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {phase === 'analyzing' ? 'Reading your GIF…' : 'Drop an animated GIF here'}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Up to 50 MB. Your source stays on this device and is never uploaded to an editing
              server.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                type="button"
                className="h-11 bg-blue-600 text-white hover:bg-blue-500"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
              >
                <FileImage className="mr-2 h-4 w-4" aria-hidden="true" />
                Choose GIF
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => void loadSample()}
                disabled={busy}
              >
                <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                Try the sample
              </Button>
            </div>
          </div>

          {errorMessage ? (
            <Alert ref={errorRef} tabIndex={-1} variant="destructive" className="mt-4 outline-none">
              <TriangleAlert className="h-4 w-4" aria-hidden="true" />
              <AlertTitle>GIF not ready</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}
        </div>
      ) : (
        <>
          <header className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {source.file.name}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {source.metadata.width} × {source.metadata.height} · {source.metadata.frameCount}{' '}
                frames · {formatBytes(source.file.size)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Replace
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={reset} disabled={busy}>
                <X className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Clear
              </Button>
            </div>
          </header>

          <div className="grid lg:grid-cols-[minmax(0,1.5fr)_minmax(330px,0.8fr)]">
            <div className="min-w-0 border-b border-slate-200 dark:border-slate-800 lg:border-b-0 lg:border-r">
              <GifPreview source={source} result={result} />
              <GifFacts size={source.file.size} metadata={source.metadata} />
            </div>

            <aside className="flex min-w-0 flex-col p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                  {copy.eyebrow}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  {copy.controlsTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {copy.controlsDescription}
                </p>
              </div>

              <Separator className="my-6" />

              {controlsProps && kind === 'speed' ? <SpeedControls {...controlsProps} /> : null}
              {controlsProps && kind === 'trim' ? <TrimControls {...controlsProps} /> : null}
              {controlsProps && kind === 'reverse' ? <ReverseControls {...controlsProps} /> : null}

              {controlError ? (
                <p
                  className="mt-4 text-sm font-medium text-red-700 dark:text-red-300"
                  role="status"
                >
                  {controlError}
                </p>
              ) : null}

              {phase === 'loading' || phase === 'processing' ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-950 dark:border-blue-900 dark:bg-blue-950/25 dark:text-blue-100"
                >
                  <div className="flex items-center justify-between gap-4 text-sm font-medium">
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <LoaderCircle
                        className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                      />
                      <span className="truncate">{progress.message}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs">
                      {Math.round(progress.value)}%
                    </span>
                  </div>
                  <Progress
                    value={progress.value}
                    aria-label="GIF processing progress"
                    className="mt-3 h-1.5 bg-blue-100 dark:bg-blue-950"
                  />
                  <p className="mt-3 text-xs leading-5 text-blue-800 dark:text-blue-200">
                    Keep this tab open. Longer animations can take a moment.
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
                  <TriangleAlert className="h-4 w-4" aria-hidden="true" />
                  <AlertTitle>Processing stopped</AlertTitle>
                  <AlertDescription>
                    <p>{errorMessage}</p>
                    <Button
                      type="button"
                      variant="link"
                      className="mt-2 h-auto p-0 text-red-800 dark:text-red-200"
                      onClick={() => void run()}
                    >
                      Try again with the same settings
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}

              {result && phase === 'success' ? (
                <div className="mt-5">
                  <div className="flex items-start gap-3 text-emerald-900 dark:text-emerald-100">
                    <Check
                      className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                    <div>
                      <h3
                        ref={resultHeadingRef}
                        tabIndex={-1}
                        className="font-semibold outline-none"
                      >
                        {copy.resultTitle}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-emerald-800/80 dark:text-emerald-200/75">
                        Preview the animation, then download the measured output.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <GifFacts size={result.size} metadata={result.metadata} compact />
                  </div>
                  <Button
                    asChild
                    size="lg"
                    className="mt-4 h-12 w-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                  >
                    <a
                      href={result.url}
                      download={fileNameFor(
                        source.file.name,
                        reverseMode === 'boomerang' && kind === 'reverse'
                          ? 'boomerang'
                          : copy.downloadSuffix,
                      )}
                    >
                      <ArrowDownToLine className="mr-2 h-4 w-4" aria-hidden="true" />
                      Download {formatBytes(result.size)}
                    </a>
                  </Button>
                </div>
              ) : null}

              <Button
                type="button"
                size="lg"
                className="mt-5 h-12 w-full bg-blue-600 text-white hover:bg-blue-500"
                onClick={() => void run()}
                disabled={busy || Boolean(controlError)}
                aria-describedby={controlError ? 'motion-control-blocker' : undefined}
              >
                {busy ? (
                  <>
                    <LoaderCircle
                      className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                    {copy.working}
                  </>
                ) : result ? (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                    Run again
                  </>
                ) : (
                  <>
                    <ToolIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                    {kind === 'reverse' && reverseMode === 'boomerang'
                      ? 'Make boomerang GIF'
                      : copy.action}
                  </>
                )}
              </Button>
              {controlError ? (
                <span id="motion-control-blocker" className="sr-only">
                  {controlError}
                </span>
              ) : null}

              <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                Processing happens locally. The first run downloads the browser engine.
              </p>
            </aside>
          </div>
        </>
      )}
    </section>
  );
}
