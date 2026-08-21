'use client';

import * as React from 'react';
import {
  ArrowDownToLine,
  Check,
  ChevronRight,
  FileImage,
  Gauge,
  Info,
  LoaderCircle,
  LockKeyhole,
  Minimize2,
  RotateCcw,
  Settings2,
  TriangleAlert,
  Upload,
  X,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  MAX_GIF_BYTES,
  bytesFromTarget,
  formatBytes,
  formatDuration,
  getSuggestedTarget,
  parseGifMetadata,
  type GifMetadata,
  type OptimizationOutcome,
  type OptimizationProgress,
  type OptimizationVariant,
  type OptimizerSettings,
  type PaletteChoice,
  type TargetUnit,
} from '@/lib/gif-optimizer';

type ToolPhase = 'idle' | 'analyzing' | 'ready' | 'loading' | 'optimizing' | 'success' | 'error';

interface SourceGif {
  file: File;
  url: string;
  metadata: GifMetadata;
}

interface AdvancedControlsProps {
  metadata: GifMetadata;
  settings: OptimizerSettings;
  onChange: (next: OptimizerSettings) => void;
}

const TARGET_PRESETS: Array<{ label: string; value: string; unit: TargetUnit }> = [
  { label: '500 KB', value: '500', unit: 'KB' },
  { label: '1 MB', value: '1', unit: 'MB' },
  { label: '5 MB', value: '5', unit: 'MB' },
  { label: '10 MB', value: '10', unit: 'MB' },
];

function useDesktopLayout(): boolean {
  const [desktop, setDesktop] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return desktop;
}

function AdvancedControls({
  metadata,
  settings,
  onChange,
}: AdvancedControlsProps): React.ReactElement {
  const sliderMinimum = Math.min(32, metadata.width);

  return (
    <div className="space-y-7 px-1 py-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="maximum-width">Maximum width</Label>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Smaller dimensions usually have the largest impact.
            </p>
          </div>
          <span className="shrink-0 font-mono text-sm text-slate-700 dark:text-slate-200">
            {settings.maxWidth} px
          </span>
        </div>
        <Slider
          id="maximum-width"
          min={sliderMinimum}
          max={metadata.width}
          step={Math.max(1, Math.round(metadata.width / 100))}
          value={[settings.maxWidth]}
          onValueChange={([maxWidth]) => onChange({ ...settings, maxWidth })}
          aria-label="Maximum output width"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>{sliderMinimum} px</span>
          <span>Original: {metadata.width} px</span>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="motion-priority">Motion priority</Label>
        <Select
          value={settings.motionPriority}
          onValueChange={(value) =>
            onChange({
              ...settings,
              motionPriority: value as OptimizerSettings['motionPriority'],
            })
          }
        >
          <SelectTrigger id="motion-priority" className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[950]">
            <SelectItem value="smooth">Smooth motion</SelectItem>
            <SelectItem value="balanced">Balanced</SelectItem>
            <SelectItem value="smallest">Smallest file</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
          Caps frame rate before the search adjusts dimensions and colors.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="palette-choice">Color palette</Label>
        <Select
          value={String(settings.palette)}
          onValueChange={(value) =>
            onChange({
              ...settings,
              palette: value === 'auto' ? 'auto' : (Number(value) as PaletteChoice),
            })
          }
        >
          <SelectTrigger id="palette-choice" className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[950]">
            <SelectItem value="auto">Automatic</SelectItem>
            <SelectItem value="256">Up to 256 colors</SelectItem>
            <SelectItem value="128">Up to 128 colors</SelectItem>
            <SelectItem value="64">Up to 64 colors</SelectItem>
            <SelectItem value="32">Up to 32 colors</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="flex items-start justify-between gap-5">
        <div>
          <Label htmlFor="keep-transparency">Keep transparent pixels</Label>
          <p className="mt-1 max-w-[270px] text-xs leading-5 text-slate-500 dark:text-slate-400">
            Reserves a palette slot for transparent areas in the source GIF.
          </p>
        </div>
        <Switch
          id="keep-transparency"
          checked={settings.preserveTransparency}
          onCheckedChange={(preserveTransparency) =>
            onChange({ ...settings, preserveTransparency })
          }
          aria-label="Keep transparent pixels"
        />
      </div>
    </div>
  );
}

function AdvancedSettingsPanel({
  open,
  onOpenChange,
  metadata,
  settings,
  onChange,
}: AdvancedControlsProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}): React.ReactElement {
  const desktop = useDesktopLayout();
  const trigger = (
    <Button
      type="button"
      variant="ghost"
      className="h-10 w-full justify-between px-0 text-slate-600 hover:bg-transparent hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
    >
      <span className="inline-flex items-center gap-2">
        <Settings2 className="h-4 w-4" />
        Advanced settings
      </span>
      <ChevronRight className="h-4 w-4" />
    </Button>
  );

  if (desktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent className="w-full border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-950 sm:max-w-md">
          <SheetHeader className="border-b border-slate-200 px-6 py-6 text-left dark:border-slate-800">
            <SheetTitle>Advanced optimization</SheetTitle>
            <SheetDescription>
              Optional limits for dimensions, motion, palette, and transparency.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100dvh-110px)] px-6 py-5">
            <AdvancedControls metadata={metadata} settings={settings} onChange={onChange} />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="max-h-[92dvh] border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <DrawerHeader className="border-b border-slate-200 px-5 py-5 text-left dark:border-slate-800">
          <DrawerTitle>Advanced optimization</DrawerTitle>
          <DrawerDescription>
            Optional limits for dimensions, motion, palette, and transparency.
          </DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="min-h-0 flex-1 px-5 py-4">
          <AdvancedControls metadata={metadata} settings={settings} onChange={onChange} />
        </ScrollArea>
        <DrawerFooter className="border-t border-slate-200 dark:border-slate-800">
          <DrawerClose asChild>
            <Button type="button">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function FileFacts({ source }: { source: SourceGif }): React.ReactElement {
  const facts = [
    { label: 'Size', value: formatBytes(source.file.size) },
    { label: 'Canvas', value: source.metadata.width + ' × ' + source.metadata.height },
    { label: 'Frames', value: String(source.metadata.frameCount) },
    { label: 'Duration', value: formatDuration(source.metadata.durationMs) },
  ];

  return (
    <dl className="grid grid-cols-2 border-y border-slate-200 dark:border-slate-800">
      {facts.map((fact, index) => (
        <div
          key={fact.label}
          className={cn(
            'py-3',
            index % 2 === 0 ? 'border-r border-slate-200 pr-4 dark:border-slate-800' : 'pl-4',
            index > 1 && 'border-t border-slate-200 dark:border-slate-800',
          )}
        >
          <dt className="text-xs uppercase tracking-[0.14em] text-slate-400">{fact.label}</dt>
          <dd className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Preview({
  source,
  selected,
}: {
  source: SourceGif;
  selected: OptimizationVariant | null;
}): React.ReactElement {
  const [mode, setMode] = React.useState('original');

  React.useEffect(() => {
    if (selected) setMode('optimized');
  }, [selected]);

  const imageClassName = 'max-h-[420px] max-w-full object-contain';

  return (
    <Tabs value={mode} onValueChange={setMode} className="flex min-h-[430px] flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-5">
        <TabsList className="h-9 bg-slate-100 p-1 dark:bg-slate-900">
          <TabsTrigger value="original" className="h-7 px-3 text-xs">
            Original
          </TabsTrigger>
          <TabsTrigger value="optimized" disabled={!selected} className="h-7 px-3 text-xs">
            Optimized
          </TabsTrigger>
          <TabsTrigger
            value="compare"
            disabled={!selected}
            className="hidden h-7 px-3 text-xs sm:flex"
          >
            Compare
          </TabsTrigger>
        </TabsList>
        <span className="hidden text-xs text-slate-400 sm:inline">Animated preview</span>
      </div>

      <TabsContent
        value="original"
        className="gif-checkerboard m-0 flex min-h-[370px] flex-1 items-center justify-center p-5"
      >
        <img
          src={source.url}
          alt={'Original preview of ' + source.file.name}
          className={imageClassName}
        />
      </TabsContent>

      <TabsContent
        value="optimized"
        className="gif-checkerboard m-0 flex min-h-[370px] flex-1 items-center justify-center p-5"
      >
        {selected ? (
          <img
            src={selected.url}
            alt={'Optimized preview of ' + source.file.name}
            className={imageClassName}
          />
        ) : null}
      </TabsContent>

      <TabsContent value="compare" className="gif-checkerboard m-0 min-h-[370px] flex-1">
        {selected ? (
          <div className="grid min-h-[370px] grid-cols-2">
            <figure className="flex min-w-0 flex-col border-r border-slate-300/70 p-4 dark:border-slate-700/80">
              <figcaption className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
                Original
              </figcaption>
              <div className="flex flex-1 items-center justify-center">
                <img
                  src={source.url}
                  alt={'Original comparison preview of ' + source.file.name}
                  className={imageClassName}
                />
              </div>
            </figure>
            <figure className="flex min-w-0 flex-col p-4">
              <figcaption className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
                Optimized
              </figcaption>
              <div className="flex flex-1 items-center justify-center">
                <img
                  src={selected.url}
                  alt={'Optimized comparison preview of ' + source.file.name}
                  className={imageClassName}
                />
              </div>
            </figure>
          </div>
        ) : null}
      </TabsContent>
    </Tabs>
  );
}

function ResultRows({
  sourceSize,
  outcome,
  selectedId,
  onSelect,
}: {
  sourceSize: number;
  outcome: OptimizationOutcome;
  selectedId: string;
  onSelect: (id: string) => void;
}): React.ReactElement {
  return (
    <div
      role="radiogroup"
      aria-label="Optimization variants"
      className="divide-y divide-slate-200 dark:divide-slate-800"
    >
      {outcome.variants.map((variant, index) => {
        const selected = variant.id === selectedId;
        const difference = Math.round((1 - variant.size / sourceSize) * 100);
        const differenceLabel =
          difference >= 0 ? difference + '% smaller' : Math.abs(difference) + '% larger';

        return (
          <button
            key={variant.id}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            data-result-index={index}
            onClick={() => onSelect(variant.id)}
            onKeyDown={(event) => {
              const lastIndex = outcome.variants.length - 1;
              let nextIndex: number | null = null;

              if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                nextIndex = index === lastIndex ? 0 : index + 1;
              } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                nextIndex = index === 0 ? lastIndex : index - 1;
              } else if (event.key === 'Home') {
                nextIndex = 0;
              } else if (event.key === 'End') {
                nextIndex = lastIndex;
              }

              if (nextIndex !== null) {
                event.preventDefault();
                onSelect(outcome.variants[nextIndex].id);
                const group = event.currentTarget.parentElement;
                requestAnimationFrame(() => {
                  group
                    ?.querySelector<HTMLButtonElement>('[data-result-index="' + nextIndex + '"]')
                    ?.focus();
                });
              }
            }}
            className={cn(
              'grid w-full gap-3 px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6',
              selected
                ? 'bg-blue-50/80 dark:bg-blue-950/20'
                : 'hover:bg-slate-50 dark:hover:bg-slate-900/50',
            )}
          >
            <span className="flex min-w-0 items-start gap-3">
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                  selected
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 dark:border-slate-600',
                )}
                aria-hidden="true"
              >
                {selected ? <Check className="h-3.5 w-3.5" /> : null}
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-950 dark:text-white">
                    {variant.label}
                  </span>
                  {variant.underTarget ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                      Under target
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {variant.description}
                </span>
              </span>
            </span>
            <span className="pl-8 sm:pl-0 sm:text-right">
              <span className="block font-mono text-sm font-semibold text-slate-900 dark:text-white">
                {formatBytes(variant.size)}
              </span>
              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                {differenceLabel}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function GifOptimizerTool(): React.ReactElement {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const resultHeadingRef = React.useRef<HTMLHeadingElement>(null);
  const errorRef = React.useRef<HTMLDivElement>(null);
  const [source, setSource] = React.useState<SourceGif | null>(null);
  const [phase, setPhase] = React.useState<ToolPhase>('idle');
  const [dragActive, setDragActive] = React.useState(false);
  const [targetValue, setTargetValue] = React.useState('1');
  const [targetUnit, setTargetUnit] = React.useState<TargetUnit>('MB');
  const [settings, setSettings] = React.useState<OptimizerSettings>({
    maxWidth: 1200,
    motionPriority: 'balanced',
    palette: 'auto',
    preserveTransparency: true,
  });
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [progress, setProgress] = React.useState<OptimizationProgress>({
    stage: 'loading',
    value: 0,
    message: '',
  });
  const [outcome, setOutcome] = React.useState<OptimizationOutcome | null>(null);
  const [selectedId, setSelectedId] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');

  React.useEffect(() => {
    return () => {
      if (source) URL.revokeObjectURL(source.url);
    };
  }, [source]);

  React.useEffect(() => {
    return () => {
      outcome?.variants.forEach((variant) => {
        if (!variant.original) URL.revokeObjectURL(variant.url);
      });
    };
  }, [outcome]);

  React.useEffect(() => {
    if (phase === 'success') resultHeadingRef.current?.focus();
    if (phase === 'error') errorRef.current?.focus();
  }, [phase]);

  const selectedVariant = outcome?.variants.find((variant) => variant.id === selectedId) ?? null;
  const numericTarget = Number(targetValue.replace(',', '.'));
  const targetBytes = bytesFromTarget(numericTarget, targetUnit);
  const targetError =
    targetValue.trim() === '' || !Number.isFinite(numericTarget) || numericTarget <= 0
      ? 'Enter a target greater than 0.'
      : targetBytes < 1024
        ? 'The minimum target is 1 KB.'
        : '';
  const busy = phase === 'analyzing' || phase === 'loading' || phase === 'optimizing';

  const clearOutcome = React.useCallback(() => {
    setOutcome(null);
    setSelectedId('');
  }, []);

  const invalidateResult = React.useCallback(() => {
    clearOutcome();
    if (source) setPhase('ready');
  }, [clearOutcome, source]);

  const handleFile = React.useCallback(
    async (file: File) => {
      clearOutcome();
      setErrorMessage('');
      setPhase('analyzing');

      try {
        if (!file.name.toLowerCase().endsWith('.gif') && file.type !== 'image/gif') {
          throw new Error(
            'Choose a .gif file. Other image and video formats are not accepted here.',
          );
        }
        if (file.size < 1) throw new Error('This file is empty.');
        if (file.size > MAX_GIF_BYTES) {
          throw new Error('This GIF is larger than 50 MB. Trim or resize it in the editor first.');
        }

        const metadata = parseGifMetadata(await file.arrayBuffer());
        const url = URL.createObjectURL(file);
        const suggested = getSuggestedTarget(file.size);
        setSource({ file, url, metadata });
        setTargetValue(suggested.value);
        setTargetUnit(suggested.unit);
        setSettings({
          maxWidth: metadata.width,
          motionPriority: 'balanced',
          palette: 'auto',
          preserveTransparency: true,
        });
        setPhase('ready');
      } catch (error) {
        setSource(null);
        setErrorMessage(error instanceof Error ? error.message : 'The GIF could not be analyzed.');
        setPhase('error');
      }
    },
    [clearOutcome],
  );

  const openFilePicker = React.useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }, []);

  const loadExample = React.useCallback(async () => {
    setErrorMessage('');
    setPhase('analyzing');
    try {
      const response = await fetch('/example.gif');
      if (!response.ok) throw new Error('The sample GIF is temporarily unavailable.');
      const blob = await response.blob();
      await handleFile(new File([blob], 'product-demo.gif', { type: 'image/gif' }));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'The sample GIF could not be loaded.',
      );
      setPhase('error');
    }
  }, [handleFile]);

  const optimize = React.useCallback(async () => {
    if (!source || targetError) return;

    clearOutcome();
    setErrorMessage('');
    setPhase('loading');
    setProgress({
      stage: 'loading',
      value: 2,
      message: 'Loading the private browser engine…',
    });

    try {
      const { optimizeGifToTarget } = await import('@/lib/gif-optimizer-engine');
      const nextOutcome = await optimizeGifToTarget({
        file: source.file,
        fileUrl: source.url,
        metadata: source.metadata,
        targetBytes,
        settings,
        onProgress: (nextProgress) => {
          setProgress(nextProgress);
          setPhase(nextProgress.stage === 'loading' ? 'loading' : 'optimizing');
        },
      });
      setOutcome(nextOutcome);
      setSelectedId(nextOutcome.selectedId);
      setPhase('success');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'The browser could not finish this optimization.',
      );
      setPhase('error');
    }
  }, [clearOutcome, settings, source, targetBytes, targetError]);

  const reset = React.useCallback(() => {
    clearOutcome();
    setSource(null);
    setErrorMessage('');
    setPhase('idle');
    setProgress({ stage: 'loading', value: 0, message: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [clearOutcome]);

  const updateSettings = React.useCallback(
    (next: OptimizerSettings) => {
      invalidateResult();
      setSettings(next);
    },
    [invalidateResult],
  );

  const downloadName = source
    ? source.file.name.replace(/\.gif$/i, '') + '-compressed.gif'
    : 'compressed.gif';
  const statusText =
    phase === 'success'
      ? outcome?.targetReached
        ? 'Optimization complete. A result meets the target.'
        : 'Optimization complete. The target could not be reached.'
      : phase === 'error'
        ? errorMessage
        : busy
          ? progress.message || 'Analyzing GIF…'
          : '';

  return (
    <TooltipProvider delayDuration={200}>
      <section
        aria-labelledby="gif-size-lab-title"
        aria-busy={busy}
        className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20"
      >
        <h2 id="gif-size-lab-title" className="sr-only">
          GIF Size Lab
        </h2>
        <input
          ref={fileInputRef}
          id="gif-file-input"
          type="file"
          accept="image/gif,.gif"
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose a GIF file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {statusText}
        </p>

        {!source ? (
          <div
            className={cn(
              'flex min-h-[520px] items-center justify-center px-5 py-14 transition-colors sm:px-10',
              dragActive && 'bg-blue-50 dark:bg-blue-950/20',
            )}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              if (event.currentTarget === event.target) setDragActive(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              const file = event.dataTransfer.files?.[0];
              if (file) void handleFile(file);
            }}
          >
            <div className="w-full max-w-lg text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-400">
                {phase === 'analyzing' ? (
                  <LoaderCircle className="h-6 w-6 animate-spin" />
                ) : (
                  <Upload className="h-6 w-6" />
                )}
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Drop a GIF to find its best size
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
                Set an exact KB or MB limit. The optimizer searches several real encodes and keeps
                the clearest result that fits.
              </p>

              <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  size="lg"
                  className="h-12 bg-blue-600 px-6 text-white hover:bg-blue-500"
                  onClick={openFilePicker}
                  disabled={phase === 'analyzing'}
                >
                  <FileImage className="mr-2 h-4 w-4" />
                  Choose GIF
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="h-12"
                  onClick={() => void loadExample()}
                  disabled={phase === 'analyzing'}
                >
                  Try example
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex cursor-help items-center gap-1.5">
                      <LockKeyhole className="h-3.5 w-3.5" />
                      Processed in your browser
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Your source GIF is not uploaded to an editing server.
                  </TooltipContent>
                </Tooltip>
                <span>GIF only</span>
                <span>Up to 50 MB</span>
              </div>

              {phase === 'error' && errorMessage ? (
                <Alert
                  ref={errorRef}
                  tabIndex={-1}
                  variant="destructive"
                  className="mt-7 text-left"
                >
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Could not open that file</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              ) : null}
            </div>
          </div>
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
                    {formatBytes(source.file.size)} · {source.metadata.frameCount} frames
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={openFilePicker}
                disabled={busy}
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                New GIF
              </Button>
            </header>

            <div className="grid min-w-0 lg:grid-cols-[minmax(0,1fr)_350px]">
              <div className="min-w-0 border-b border-slate-200 dark:border-slate-800 lg:border-b-0 lg:border-r">
                <Preview source={source} selected={selectedVariant} />
              </div>

              <aside className="min-w-0 p-5 sm:p-6">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                  <Gauge className="h-3.5 w-3.5" />
                  Target size
                </div>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  How small should it be?
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  The clearest result at or below this limit wins.
                </p>

                <div className="mt-5">
                  <Label htmlFor="target-size">Exact file-size limit</Label>
                  <div className="mt-2 grid grid-cols-[minmax(0,1fr)_96px] gap-2">
                    <Input
                      id="target-size"
                      type="text"
                      inputMode="decimal"
                      value={targetValue}
                      onChange={(event) => {
                        invalidateResult();
                        setTargetValue(event.target.value);
                      }}
                      aria-invalid={Boolean(targetError)}
                      aria-describedby={targetError ? 'target-error' : 'target-help'}
                      className="h-11 font-mono text-base"
                      disabled={busy}
                    />
                    <Select
                      value={targetUnit}
                      onValueChange={(value) => {
                        invalidateResult();
                        setTargetUnit(value as TargetUnit);
                      }}
                      disabled={busy}
                    >
                      <SelectTrigger aria-label="Target size unit" className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KB">KB</SelectItem>
                        <SelectItem value="MB">MB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {targetError ? (
                    <p id="target-error" className="mt-2 text-xs text-red-600 dark:text-red-400">
                      {targetError}
                    </p>
                  ) : (
                    <p id="target-help" className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Target: {formatBytes(targetBytes)}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2" aria-label="Target size presets">
                  {TARGET_PRESETS.map((preset) => (
                    <Button
                      key={preset.label}
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-full px-3 text-xs"
                      disabled={busy}
                      onClick={() => {
                        invalidateResult();
                        setTargetValue(preset.value);
                        setTargetUnit(preset.unit);
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>

                <div className="mt-6">
                  <FileFacts source={source} />
                </div>

                <div className="mt-3">
                  <AdvancedSettingsPanel
                    open={advancedOpen}
                    onOpenChange={setAdvancedOpen}
                    metadata={source.metadata}
                    settings={settings}
                    onChange={updateSettings}
                  />
                </div>

                {busy ? (
                  <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/60 dark:bg-blue-950/20">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="inline-flex min-w-0 items-center gap-2 font-medium text-blue-950 dark:text-blue-100">
                        <LoaderCircle className="h-4 w-4 shrink-0 animate-spin" />
                        <span className="truncate">{progress.message || 'Analyzing GIF…'}</span>
                      </span>
                      <span className="font-mono text-xs text-blue-700 dark:text-blue-300">
                        {Math.round(progress.value)}%
                      </span>
                    </div>
                    <Progress value={progress.value} className="mt-3 h-1.5" />
                    <p className="mt-3 text-xs leading-5 text-blue-800/80 dark:text-blue-200/70">
                      Keep this tab open. Encoding happens locally and can take a moment.
                    </p>
                  </div>
                ) : null}

                {phase === 'error' && errorMessage ? (
                  <Alert ref={errorRef} tabIndex={-1} variant="destructive" className="mt-4">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Optimization stopped</AlertTitle>
                    <AlertDescription>
                      {errorMessage}
                      <Button
                        type="button"
                        variant="link"
                        className="mt-2 h-auto p-0 text-red-800 dark:text-red-200"
                        onClick={() => void optimize()}
                      >
                        Try again
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : null}

                {phase === 'success' && outcome ? (
                  <Alert
                    role="status"
                    className={cn(
                      'mt-4',
                      outcome.targetReached
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-100'
                        : 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-100',
                    )}
                  >
                    {outcome.targetReached ? (
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    )}
                    <AlertTitle>
                      {outcome.targetReached ? 'Target reached' : 'Closest safe result'}
                    </AlertTitle>
                    <AlertDescription>
                      {outcome.targetReached
                        ? 'Choose a result below and download it.'
                        : 'The strongest tested settings are still above the limit. Try a smaller maximum width.'}
                    </AlertDescription>
                  </Alert>
                ) : null}

                <Button
                  type="button"
                  size="lg"
                  className="mt-5 h-12 w-full bg-blue-600 text-white hover:bg-blue-500"
                  onClick={() => void optimize()}
                  disabled={busy || Boolean(targetError)}
                >
                  {busy ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Optimizing…
                    </>
                  ) : outcome ? (
                    <>
                      <Minimize2 className="mr-2 h-4 w-4" />
                      Run again
                    </>
                  ) : (
                    <>
                      <Minimize2 className="mr-2 h-4 w-4" />
                      Optimize to {targetValue || 'target'} {targetUnit}
                    </>
                  )}
                </Button>
              </aside>
            </div>

            {outcome ? (
              <section
                aria-labelledby="optimizer-results-title"
                className="border-t border-slate-200 dark:border-slate-800"
              >
                <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <h3
                      ref={resultHeadingRef}
                      id="optimizer-results-title"
                      tabIndex={-1}
                      className="text-lg font-semibold tracking-tight text-slate-950 outline-none dark:text-white"
                    >
                      Choose your result
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {outcome.attempts} real encodes tested · no estimated file sizes
                    </p>
                  </div>
                  {selectedVariant ? (
                    <Button
                      asChild
                      size="lg"
                      className="h-11 bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                    >
                      <a href={selectedVariant.url} download={downloadName}>
                        <ArrowDownToLine className="mr-2 h-4 w-4" />
                        Download {formatBytes(selectedVariant.size)}
                      </a>
                    </Button>
                  ) : null}
                </div>
                <Separator />
                <ResultRows
                  sourceSize={source.file.size}
                  outcome={outcome}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </section>
            ) : null}

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:px-6">
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
    </TooltipProvider>
  );
}
