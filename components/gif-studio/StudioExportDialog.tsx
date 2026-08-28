'use client';

import * as React from 'react';
import {
  Check,
  Clipboard,
  Download,
  FileDown,
  Gauge,
  LoaderCircle,
  Share2,
  TriangleAlert,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { trackProductEvent } from '@/lib/product-analytics';
import {
  exportStudioProject,
  probeStudioExportCapabilities,
  type StudioExportCapabilities,
} from '@/lib/gif-studio-engine';
import { optimizeGifToTarget } from '@/lib/gif-optimizer-engine';
import {
  bytesFromTarget,
  formatBytes,
  formatDuration,
  parseGifMetadata,
  type OptimizationOutcome,
  type OptimizationProgress,
  type TargetUnit,
} from '@/lib/gif-optimizer';
import { getProjectDuration, projectFileName } from '@/components/gif-studio/model';
import type {
  StudioExportFormat,
  StudioExportResult,
  StudioProgress,
  StudioProject,
} from '@/components/gif-studio/types';

const EXPORT_PRESETS = [
  {
    id: 'original',
    label: 'Current canvas',
    description: 'Keep the project dimensions and choose export settings manually.',
  },
  {
    id: 'docs',
    label: 'Product docs · max 960×540',
    description: 'A clear, compact result for guides, changelogs, and support articles.',
    maxWidth: 960,
    maxHeight: 540,
  },
  {
    id: 'web',
    label: 'Web · max 800 px, target 3 MB',
    description: 'Balance readable detail with a practical page-loading target.',
    maxWidth: 800,
    maxHeight: 800,
    targetValue: '3',
    targetUnit: 'MB' as const,
  },
  {
    id: 'chat',
    label: 'Chat · max 480 px, target 8 MB',
    description: 'Keep reactions and short demos compact for everyday sharing.',
    maxWidth: 480,
    maxHeight: 480,
    targetValue: '8',
    targetUnit: 'MB' as const,
  },
  {
    id: 'email',
    label: 'Email · max 600 px, target 1 MB',
    description: 'Prioritize a lightweight result for inboxes and newsletters.',
    maxWidth: 600,
    maxHeight: 600,
    targetValue: '1',
    targetUnit: 'MB' as const,
  },
] as const;

type ExportPreset = (typeof EXPORT_PRESETS)[number];

function canvasForPreset(
  width: number,
  height: number,
  preset: ExportPreset,
): { width: number; height: number } {
  if (!('maxWidth' in preset) || !('maxHeight' in preset)) return { width, height };
  const scale = Math.min(1, preset.maxWidth / width, preset.maxHeight / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getExtension(format: StudioExportFormat): string {
  return format === 'apng' ? 'png' : format;
}

function isPublicHttpsUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && !['localhost', '127.0.0.1'].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export function StudioExportDialog({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: StudioProject;
}) {
  const [format, setFormat] = React.useState<StudioExportFormat>('gif');
  const [activeTab, setActiveTab] = React.useState('export');
  const [presetId, setPresetId] = React.useState<(typeof EXPORT_PRESETS)[number]['id']>('original');
  const [quality, setQuality] = React.useState(82);
  const [loop, setLoop] = React.useState(0);
  const [progress, setProgress] = React.useState<StudioProgress>({
    phase: 'ready',
    value: 0,
    message: '',
  });
  const [result, setResult] = React.useState<StudioExportResult | null>(null);
  const [error, setError] = React.useState('');
  const [targetValue, setTargetValue] = React.useState('500');
  const [targetUnit, setTargetUnit] = React.useState<TargetUnit>('KB');
  const [optimizerProgress, setOptimizerProgress] = React.useState<OptimizationProgress | null>(
    null,
  );
  const [optimization, setOptimization] = React.useState<OptimizationOutcome | null>(null);
  const [hostedUrl, setHostedUrl] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [capabilities, setCapabilities] = React.useState<StudioExportCapabilities | null>(null);
  const [capabilityProgress, setCapabilityProgress] = React.useState<StudioProgress | null>(null);
  const dialogWasOpenRef = React.useRef(false);
  const baseCanvasRef = React.useRef({ ...project.canvas });

  React.useEffect(() => {
    if (open && !dialogWasOpenRef.current) {
      baseCanvasRef.current = { ...project.canvas };
      setActiveTab('export');
      setPresetId('original');
    }
    dialogWasOpenRef.current = open;
  }, [open, project.canvas]);

  React.useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  React.useEffect(() => {
    return () => {
      optimization?.variants.forEach((variant) => {
        if (!variant.original) URL.revokeObjectURL(variant.url);
      });
    };
  }, [optimization]);

  React.useEffect(() => {
    if (!open || capabilities || capabilityProgress) return;
    setCapabilityProgress({ phase: 'rendering', value: 0, message: 'Checking export support…' });
    void probeStudioExportCapabilities(setCapabilityProgress).then(
      (next) => {
        setCapabilities(next);
        setCapabilityProgress(null);
        if (!next[format].supported) {
          const fallback = (Object.keys(next) as StudioExportFormat[]).find(
            (candidate) => next[candidate].supported,
          );
          if (fallback) setFormat(fallback);
        }
      },
      (caught) => {
        setCapabilityProgress(null);
        setError(caught instanceof Error ? caught.message : 'Export support could not be checked.');
      },
    );
  }, [capabilities, capabilityProgress, format, open]);

  const rendering = progress.phase === 'rendering';
  const optimizing = Boolean(optimizerProgress && optimizerProgress.value < 100);
  const duration = getProjectDuration(project);
  const selectedPreset =
    EXPORT_PRESETS.find((preset) => preset.id === presetId) ?? EXPORT_PRESETS[0];
  const exportCanvas = canvasForPreset(
    baseCanvasRef.current.width,
    baseCanvasRef.current.height,
    selectedPreset,
  );
  const exportProject: StudioProject = {
    ...project,
    canvas: {
      ...project.canvas,
      ...exportCanvas,
    },
  };

  const runOptimization = async (exportedResult: StudioExportResult, targetBytes: number) => {
    setError('');
    setOptimizerProgress({ stage: 'loading', value: 1, message: 'Preparing Size Lab…' });
    optimization?.variants.forEach((variant) => {
      if (!variant.original) URL.revokeObjectURL(variant.url);
    });
    setOptimization(null);
    trackProductEvent('gif_size_lab_started', { target_kb: Math.round(targetBytes / 1024) });
    try {
      const file = new File([exportedResult.blob], projectFileName(project, 'gif'), {
        type: 'image/gif',
      });
      const metadata = parseGifMetadata(await exportedResult.blob.arrayBuffer());
      const outcome = await optimizeGifToTarget({
        file,
        fileUrl: exportedResult.url,
        metadata,
        targetBytes,
        settings: {
          maxWidth: exportCanvas.width,
          motionPriority: 'balanced',
          palette: 'auto',
          preserveTransparency: project.canvas.background === 'transparent',
        },
        onProgress: setOptimizerProgress,
      });
      setOptimization(outcome);
      trackProductEvent('gif_size_lab_ready', {
        variants: outcome.variants.length,
        target_kb: Math.round(targetBytes / 1024),
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Size Lab could not create variants.');
      trackProductEvent('gif_size_lab_failed');
    } finally {
      setOptimizerProgress(null);
    }
  };

  const runExport = async ({
    forceFormat,
    optimizeToTarget = false,
  }: { forceFormat?: StudioExportFormat; optimizeToTarget?: boolean } = {}) => {
    const exportFormat = forceFormat ?? format;
    const optimizationTarget = bytesFromTarget(Number(targetValue), targetUnit);
    if (optimizeToTarget && optimizationTarget < 1024) {
      setActiveTab('size');
      setError('Choose a target of at least 1 KB before exporting.');
      return;
    }
    setError('');
    setOptimization(null);
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
    trackProductEvent('gif_export_started', {
      format: exportFormat,
      preset: presetId,
      frames: project.frames.length,
    });
    try {
      setProgress({ phase: 'rendering', value: 1, message: 'Preparing frames…' });
      const next = await exportStudioProject(
        exportProject,
        { format: exportFormat, quality, loop },
        (nextProgress) => setProgress(nextProgress),
      );
      setFormat(exportFormat);
      setResult(next);
      setProgress({ phase: 'ready', value: 100, message: 'Export ready.' });
      trackProductEvent('gif_export_ready', {
        format: exportFormat,
        size_kb: Math.round(next.blob.size / 1024),
      });
      if (optimizeToTarget && exportFormat === 'gif') {
        setActiveTab('size');
        await runOptimization(next, optimizationTarget);
      }
    } catch (caught) {
      setProgress({ phase: 'error', value: 0, message: '' });
      setError(caught instanceof Error ? caught.message : 'The export could not be completed.');
      trackProductEvent('gif_export_failed', { format: exportFormat });
    }
  };

  const runSizeLab = async () => {
    if (!result || format !== 'gif') return;
    const targetBytes = bytesFromTarget(Number(targetValue), targetUnit);
    if (targetBytes < 1024) {
      setError('Choose a target of at least 1 KB.');
      return;
    }
    await runOptimization(result, targetBytes);
  };

  const shareResult = async () => {
    if (!result) return;
    const file = new File([result.blob], projectFileName(project, getExtension(format)), {
      type: result.mimeType,
    });
    const shareData = { title: project.title, files: [file] };
    if (!navigator.share || (navigator.canShare && !navigator.canShare(shareData))) {
      setError('File sharing is not supported in this browser. Download the export instead.');
      return;
    }
    try {
      await navigator.share(shareData);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') return;
      setError(caught instanceof Error ? caught.message : 'The share sheet could not open.');
    }
  };

  const copyEmbed = async () => {
    if (!isPublicHttpsUrl(hostedUrl)) return;
    const code = `<img src="${escapeAttribute(hostedUrl)}" alt="${escapeAttribute(project.title)}" width="${exportCanvas.width}" height="${exportCanvas.height}" loading="lazy">`;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(760px,calc(100dvh-2rem))] max-w-3xl flex-col gap-0 overflow-hidden border-slate-800 bg-slate-950 p-0 text-slate-100">
        <DialogHeader className="border-b border-slate-800 px-6 py-5 pr-12">
          <DialogTitle>Export animation</DialogTitle>
          <DialogDescription className="text-slate-400">
            Every frame, overlay, effect, and individual delay is rendered locally.
          </DialogDescription>
        </DialogHeader>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList className="mx-5 mt-4 grid h-10 w-auto grid-cols-3 bg-slate-900 sm:mx-6">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="size">Size Lab</TabsTrigger>
            <TabsTrigger value="share">
              <span className="sm:hidden">Share</span>
              <span className="hidden sm:inline">Share &amp; embed</span>
            </TabsTrigger>
          </TabsList>
          <ScrollArea className="min-h-0 flex-1">
            <TabsContent value="export" className="m-0 p-5 sm:p-6">
              <div className="grid gap-7 md:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400">Destination</Label>
                    <Select
                      value={presetId}
                      onValueChange={(id) => {
                        const preset = EXPORT_PRESETS.find((item) => item.id === id);
                        if (!preset) return;
                        setPresetId(preset.id);
                        if (result?.url) URL.revokeObjectURL(result.url);
                        setResult(null);
                        optimization?.variants.forEach((variant) => {
                          if (!variant.original) URL.revokeObjectURL(variant.url);
                        });
                        setOptimization(null);
                        if ('targetValue' in preset) {
                          setTargetValue(preset.targetValue);
                          setTargetUnit(preset.targetUnit);
                        }
                      }}
                    >
                      <SelectTrigger className="border-slate-700 bg-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPORT_PRESETS.map((preset) => (
                          <SelectItem key={preset.id} value={preset.id}>
                            {preset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs leading-5 text-slate-500">{selectedPreset.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">Format</Label>
                      <Select
                        value={format}
                        onValueChange={(value: StudioExportFormat) => setFormat(value)}
                        disabled={!capabilities}
                      >
                        <SelectTrigger className="border-slate-700 bg-slate-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {capabilities?.gif.supported ? (
                            <SelectItem value="gif">Animated GIF</SelectItem>
                          ) : null}
                          {capabilities?.webp.supported ? (
                            <SelectItem value="webp">Animated WebP</SelectItem>
                          ) : null}
                          {capabilities?.apng.supported ? (
                            <SelectItem value="apng">Animated PNG</SelectItem>
                          ) : null}
                          {capabilities?.mp4.supported ? (
                            <SelectItem value="mp4">MP4 video</SelectItem>
                          ) : null}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">Loop</Label>
                      <Select
                        value={String(loop)}
                        onValueChange={(value) => setLoop(Number(value))}
                        disabled={format === 'mp4'}
                      >
                        <SelectTrigger className="border-slate-700 bg-slate-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Forever</SelectItem>
                          <SelectItem value="1">Once</SelectItem>
                          <SelectItem value="3">3 times</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {format !== 'gif' ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Quality</span>
                        <span>{quality}%</span>
                      </div>
                      <Slider
                        value={[quality]}
                        min={40}
                        max={100}
                        step={1}
                        onValueChange={([value]) => setQuality(value)}
                        aria-label="Export quality"
                      />
                    </div>
                  ) : null}
                  <div className="border-y border-slate-800 py-4 text-xs text-slate-400">
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <dt>Canvas</dt>
                      <dd className="text-right tabular-nums text-slate-200">
                        {exportCanvas.width}×{exportCanvas.height}
                      </dd>
                      <dt>Frames</dt>
                      <dd className="text-right tabular-nums text-slate-200">
                        {project.frames.length}
                      </dd>
                      <dt>Duration</dt>
                      <dd className="text-right tabular-nums text-slate-200">
                        {formatDuration(duration)}
                      </dd>
                    </dl>
                  </div>
                  {capabilityProgress ? (
                    <div aria-live="polite">
                      <Progress value={capabilityProgress.value} className="h-1.5" />
                      <p className="mt-2 text-xs text-slate-400">{capabilityProgress.message}</p>
                    </div>
                  ) : null}
                  <Button
                    type="button"
                    onClick={() =>
                      void runExport({
                        optimizeToTarget: format === 'gif' && 'targetValue' in selectedPreset,
                      })
                    }
                    disabled={rendering || optimizing || !capabilities?.[format].supported}
                    className="w-full bg-sky-400 text-slate-950 hover:bg-sky-300"
                  >
                    {rendering || optimizing ? (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileDown className="mr-2 h-4 w-4" />
                    )}
                    {rendering
                      ? 'Rendering…'
                      : optimizing
                        ? 'Optimizing…'
                        : format === 'gif' && 'targetValue' in selectedPreset
                          ? `Export & target ${selectedPreset.targetValue} ${selectedPreset.targetUnit}`
                          : `Export ${format.toUpperCase()}`}
                  </Button>
                  {rendering ? (
                    <div aria-live="polite">
                      <Progress value={progress.value} className="h-1.5" />
                      <p className="mt-2 text-xs text-slate-400">{progress.message}</p>
                    </div>
                  ) : null}
                </div>
                <div className="flex min-h-[330px] flex-col overflow-hidden rounded-lg border border-slate-800 bg-[#090d14]">
                  {result ? (
                    <>
                      <div className="gif-checkerboard flex min-h-0 flex-1 items-center justify-center p-4">
                        {format === 'mp4' ? (
                          <video
                            src={result.url}
                            controls
                            loop
                            className="max-h-[360px] max-w-full"
                          />
                        ) : (
                          // Object URLs are local generated assets and cannot use Next's image optimizer.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={result.url}
                            alt="Export preview"
                            className="max-h-[360px] max-w-full object-contain"
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-100">Ready to download</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {formatBytes(result.blob.size)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            trackProductEvent('gif_downloaded', {
                              format,
                              size_kb: Math.round(result.blob.size / 1024),
                            });
                            downloadBlob(
                              result.blob,
                              projectFileName(project, getExtension(format)),
                            );
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                      <Gauge className="h-6 w-6 text-slate-600" />
                      <p className="mt-3 text-sm text-slate-300">
                        Your measured result appears here
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Nothing is uploaded while rendering.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {error ? (
                <Alert variant="destructive" className="mt-5">
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Export needs attention</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
            </TabsContent>

            <TabsContent value="size" className="m-0 p-5 sm:p-6">
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold">Compress to an exact target</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Choose the limit before exporting. Size Lab measures real GIF files and keeps the
                  clearest generated result under your target when possible.
                </p>
                <div className="mt-6 grid grid-cols-[minmax(0,1fr)_5rem] gap-2 sm:flex">
                  <Input
                    type="number"
                    min={1}
                    value={targetValue}
                    onChange={(event) => setTargetValue(event.target.value)}
                    className="min-w-0 border-slate-700 bg-slate-900"
                    aria-label="Target file size"
                  />
                  <Select
                    value={targetUnit}
                    onValueChange={(unit: TargetUnit) => setTargetUnit(unit)}
                  >
                    <SelectTrigger className="w-20 border-slate-700 bg-slate-900 sm:w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KB">KB</SelectItem>
                      <SelectItem value="MB">MB</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={() =>
                      result && format === 'gif'
                        ? void runSizeLab()
                        : void runExport({ forceFormat: 'gif', optimizeToTarget: true })
                    }
                    disabled={optimizing || rendering || !capabilities?.gif.supported}
                    className="col-span-2 w-full sm:w-auto"
                  >
                    {optimizing || rendering ? (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {result && format === 'gif' ? 'Run Size Lab' : 'Export GIF & run Size Lab'}
                  </Button>
                </div>
                {optimizerProgress ? (
                  <div className="mt-5" aria-live="polite">
                    <Progress value={optimizerProgress.value} className="h-1.5" />
                    <p className="mt-2 text-xs text-slate-400">{optimizerProgress.message}</p>
                  </div>
                ) : null}
                {optimization ? (
                  <div className="mt-7 divide-y divide-slate-800 border-y border-slate-800">
                    {optimization.variants.map((variant) => (
                      <div key={variant.id} className="flex items-center gap-4 py-4">
                        <span
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                            variant.underTarget
                              ? 'bg-emerald-400/10 text-emerald-300'
                              : 'bg-amber-400/10 text-amber-300',
                          )}
                        >
                          {variant.underTarget ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <TriangleAlert className="h-4 w-4" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-100">
                            {variant.label} · {formatBytes(variant.size)}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {variant.description}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-slate-700"
                          onClick={() => {
                            trackProductEvent('gif_downloaded', {
                              format: 'gif',
                              size_kb: Math.round(variant.blob.size / 1024),
                              optimized: true,
                            });
                            downloadBlob(variant.blob, projectFileName(project, 'gif'));
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : null}
                {error ? (
                  <Alert variant="destructive" className="mt-5">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Size Lab needs attention</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}
              </div>
            </TabsContent>

            <TabsContent value="share" className="m-0 p-5 sm:p-6">
              {result ? (
                <div className="max-w-2xl space-y-8">
                  <section>
                    <h3 className="text-lg font-semibold">Share the exported file</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      Opens your device share sheet. Source media and project data are never
                      published automatically.
                    </p>
                    <Button type="button" onClick={() => void shareResult()} className="mt-4">
                      <Share2 className="mr-2 h-4 w-4" /> Share file
                    </Button>
                  </section>
                  <section className="border-t border-slate-800 pt-7">
                    <h3 className="text-lg font-semibold">Embed after you host it</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      Paste the final public HTTPS asset URL. GIF Studio will generate safe image
                      markup; it does not upload anything itself.
                    </p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Input
                        type="url"
                        value={hostedUrl}
                        onChange={(event) => setHostedUrl(event.target.value)}
                        placeholder="https://cdn.example.com/demo.gif"
                        className="min-w-0 border-slate-700 bg-slate-900"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!isPublicHttpsUrl(hostedUrl)}
                        onClick={() => void copyEmbed()}
                        className="w-full border-slate-700 sm:w-auto"
                      >
                        {copied ? (
                          <Check className="mr-2 h-4 w-4" />
                        ) : (
                          <Clipboard className="mr-2 h-4 w-4" />
                        )}
                        {copied ? 'Copied' : 'Copy embed'}
                      </Button>
                    </div>
                  </section>
                  <Alert className="border-slate-800 bg-slate-900/50">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Remix safely with project files</AlertTitle>
                    <AlertDescription>
                      Use the Projects menu to export a versioned .gifstudio package. Import is
                      validated and never runs scripts or external resources.
                    </AlertDescription>
                  </Alert>
                  {error ? (
                    <Alert variant="destructive">
                      <TriangleAlert className="h-4 w-4" />
                      <AlertTitle>Sharing needs attention</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : null}
                </div>
              ) : (
                <div className="flex min-h-64 max-w-2xl flex-col items-start justify-center">
                  <h3 className="text-lg font-semibold">Create an export before sharing</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                    GIF Studio never publishes source media automatically. Render a local result,
                    then download, share, or generate embed markup for the hosted file.
                  </p>
                  <Button type="button" className="mt-5" onClick={() => setActiveTab('export')}>
                    Go to export
                  </Button>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
