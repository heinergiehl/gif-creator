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
import { getProjectDuration, projectFileName, touchProject } from '@/components/gif-studio/model';
import type {
  StudioExportFormat,
  StudioExportResult,
  StudioProgress,
  StudioProject,
} from '@/components/gif-studio/types';

const EXPORT_PRESETS = [
  { id: 'original', label: 'Current canvas', width: 0, height: 0 },
  { id: 'docs', label: 'Product docs · 960×540', width: 960, height: 540 },
  { id: 'square', label: 'Square social · 1080×1080', width: 1080, height: 1080 },
  { id: 'chat', label: 'Chat reaction · 480×480', width: 480, height: 480 },
  { id: 'email', label: 'Email · 600×338', width: 600, height: 338 },
] as const;

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
  onProjectChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: StudioProject;
  onProjectChange: (project: StudioProject) => void;
}) {
  const [format, setFormat] = React.useState<StudioExportFormat>('gif');
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

  const runExport = async () => {
    setError('');
    setOptimization(null);
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
    try {
      setProgress({ phase: 'rendering', value: 1, message: 'Preparing frames…' });
      const next = await exportStudioProject(project, { format, quality, loop }, (nextProgress) =>
        setProgress(nextProgress),
      );
      setResult(next);
      setProgress({ phase: 'ready', value: 100, message: 'Export ready.' });
    } catch (caught) {
      setProgress({ phase: 'error', value: 0, message: '' });
      setError(caught instanceof Error ? caught.message : 'The export could not be completed.');
    }
  };

  const runSizeLab = async () => {
    if (!result || format !== 'gif') return;
    const targetBytes = bytesFromTarget(Number(targetValue), targetUnit);
    if (targetBytes < 1024) {
      setError('Choose a target of at least 1 KB.');
      return;
    }
    setError('');
    setOptimizerProgress({ stage: 'loading', value: 1, message: 'Preparing Size Lab…' });
    optimization?.variants.forEach((variant) => {
      if (!variant.original) URL.revokeObjectURL(variant.url);
    });
    setOptimization(null);
    try {
      const file = new File([result.blob], projectFileName(project, 'gif'), { type: 'image/gif' });
      const metadata = parseGifMetadata(await result.blob.arrayBuffer());
      const outcome = await optimizeGifToTarget({
        file,
        fileUrl: result.url,
        metadata,
        targetBytes,
        settings: {
          maxWidth: project.canvas.width,
          motionPriority: 'balanced',
          palette: 'auto',
          preserveTransparency: project.canvas.background === 'transparent',
        },
        onProgress: setOptimizerProgress,
      });
      setOptimization(outcome);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Size Lab could not create variants.');
    } finally {
      setOptimizerProgress(null);
    }
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
    const code = `<img src="${escapeAttribute(hostedUrl)}" alt="${escapeAttribute(project.title)}" width="${project.canvas.width}" height="${project.canvas.height}" loading="lazy">`;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[min(760px,92dvh)] max-w-3xl gap-0 overflow-hidden border-slate-800 bg-slate-950 p-0 text-slate-100">
        <DialogHeader className="border-b border-slate-800 px-6 py-5 pr-12">
          <DialogTitle>Export animation</DialogTitle>
          <DialogDescription className="text-slate-400">
            Every frame, overlay, effect, and individual delay is rendered locally.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="export" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="mx-6 mt-4 grid h-10 w-auto grid-cols-3 bg-slate-900">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="size" disabled={!result || format !== 'gif'}>
              Size Lab
            </TabsTrigger>
            <TabsTrigger value="share" disabled={!result}>
              Share & embed
            </TabsTrigger>
          </TabsList>
          <ScrollArea className="min-h-0 flex-1">
            <TabsContent value="export" className="m-0 p-6">
              <div className="grid gap-7 md:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400">Preset</Label>
                    <Select
                      defaultValue="original"
                      onValueChange={(id) => {
                        const preset = EXPORT_PRESETS.find((item) => item.id === id);
                        if (!preset || preset.id === 'original') return;
                        onProjectChange(
                          touchProject({
                            ...project,
                            canvas: {
                              ...project.canvas,
                              width: preset.width,
                              height: preset.height,
                            },
                          }),
                        );
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
                        {project.canvas.width}×{project.canvas.height}
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
                    onClick={() => void runExport()}
                    disabled={rendering || !capabilities?.[format].supported}
                    className="w-full bg-sky-400 text-slate-950 hover:bg-sky-300"
                  >
                    {rendering ? (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileDown className="mr-2 h-4 w-4" />
                    )}
                    {rendering ? 'Rendering…' : `Export ${format.toUpperCase()}`}
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
                          onClick={() =>
                            downloadBlob(
                              result.blob,
                              projectFileName(project, getExtension(format)),
                            )
                          }
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

            <TabsContent value="size" className="m-0 p-6">
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold">Compress to an exact target</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Size Lab measures real output files and keeps the clearest generated result under
                  your target when possible.
                </p>
                <div className="mt-6 flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={targetValue}
                    onChange={(event) => setTargetValue(event.target.value)}
                    className="border-slate-700 bg-slate-900"
                    aria-label="Target file size"
                  />
                  <Select
                    value={targetUnit}
                    onValueChange={(unit: TargetUnit) => setTargetUnit(unit)}
                  >
                    <SelectTrigger className="w-28 border-slate-700 bg-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KB">KB</SelectItem>
                      <SelectItem value="MB">MB</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={() => void runSizeLab()} disabled={optimizing}>
                    {optimizing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}Run
                    Size Lab
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
                          onClick={() =>
                            downloadBlob(variant.blob, projectFileName(project, 'gif'))
                          }
                        >
                          <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </TabsContent>

            <TabsContent value="share" className="m-0 p-6">
              <div className="max-w-2xl space-y-8">
                <section>
                  <h3 className="text-lg font-semibold">Share the exported file</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Opens your device share sheet. Source media and project data are never published
                    automatically.
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
                  <div className="mt-4 flex gap-2">
                    <Input
                      type="url"
                      value={hostedUrl}
                      onChange={(event) => setHostedUrl(event.target.value)}
                      placeholder="https://cdn.example.com/demo.gif"
                      className="border-slate-700 bg-slate-900"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!isPublicHttpsUrl(hostedUrl)}
                      onClick={() => void copyEmbed()}
                      className="border-slate-700"
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
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
