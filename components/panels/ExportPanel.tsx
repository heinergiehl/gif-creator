'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { useStores } from '@/store';
import { Confetti } from '@/components/magicui/confetti';
import AnimatedShinyText from '../magicui/animated-shiny-text';
import { ArrowRightIcon, Download, Loader2, CheckCircle2, Sparkles, Settings2, Film, Palette, Gauge, RectangleHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '../ui/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Slider } from '../ui/slider';
import { ffmpegStore } from '@/store/FFmpegStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/* ─── Export states ───────────────────────────────────────── */
type ExportState = 'idle' | 'rendering' | 'done' | 'error';

const ExportPanel = observer(() => {
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const animationStore = rootStore.animationStore;
  const fileStore = rootStore.fileStore;

  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [modalOpen, setModalOpen] = useState(false);

  const hasFrames = store.elements.some((el) => el.isFrame);
  const isEngineReady = Boolean(ffmpegStore.ffmpeg?.loaded) && !ffmpegStore.loading;
  const canExport = hasFrames && isEngineReady && exportState !== 'rendering';

  const { toast } = useToast();
  const progress = store.progress.conversion;
  const { ffmpeg } = ffmpegStore;

  /* ── Create GIF ── */
  const handleCreateGif = async () => {
    if (!canExport) return;
    setExportState('rendering');
    setGifUrl(null);
    try {
      const url = await fileStore.handleSaveAsGif();
      if (url) {
        setGifUrl(url);
        setExportState('done');
        toast({
          title: 'GIF ready!',
          description: 'Your GIF is ready to download.',
          duration: 4000,
        });
        Confetti({ origin: { x: 0.5, y: 0.6 } });
      } else {
        setExportState('error');
      }
    } catch {
      setExportState('error');
    }
    store.setProgressState({ conversion: 0 });
  };

  /* ── Invalidate on setting changes ── */
  useEffect(() => {
    if (hasFrames) {
      setGifUrl(null);
      setExportState('idle');
    }
  }, [
    animationStore.fps,
    store.frames,
    fileStore.gifQuality,
    fileStore.paletteSize,
    store.elements,
    rootStore.canvasOptionsStore.width,
    rootStore.canvasOptionsStore.height,
    rootStore.canvasOptionsStore.backgroundColor,
    hasFrames,
  ]);

  /* ── FFmpeg progress listener ── */
  useEffect(() => {
    if (exportState !== 'rendering') return;
    const handleProgress = (e: any) => {
      store.setProgressState({ conversion: Math.round(e?.progress * 100) });
    };
    ffmpeg?.on('progress', handleProgress);
    return () => {
      ffmpeg?.off('progress', handleProgress);
    };
  }, [ffmpeg, exportState, store]);

  /* ── Cleanup blob URL ── */
  useEffect(() => {
    return () => {
      if (gifUrl) URL.revokeObjectURL(gifUrl);
    };
  }, [gifUrl]);

  const frameCount = store.frames.length;

  return (
    <div className="relative flex h-full w-full flex-col dark:bg-slate-900">
      {/* ── Header ── */}
      <div className="flex h-[42px] items-center justify-center border-b border-slate-200 dark:border-slate-800">
        <span className="text-sm font-medium">Export</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-5 p-5">
          {/* ── Status overview ── */}
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', hasFrames ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse')} />
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {hasFrames ? `${frameCount} frame${frameCount !== 1 ? 's' : ''}` : 'No frames'}
              </span>
            </div>
            <div className="h-3 w-px bg-slate-200 dark:bg-slate-600" />
            <div className="flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', isEngineReady ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse')} />
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {isEngineReady ? 'Engine ready' : 'Loading…'}
              </span>
            </div>
          </div>

          {/* ── Quick preview of settings ── */}
          <div className="grid grid-cols-3 gap-2">
            <SettingChip icon={Film} label="FPS" value={String(animationStore.fps)} />
            <SettingChip icon={Gauge} label="Quality" value={String(fileStore.gifQuality)} />
            <SettingChip icon={Palette} label="Colors" value={String(fileStore.paletteSize)} />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
            <RectangleHorizontal className="h-3 w-3" />
            {rootStore.canvasOptionsStore.width} × {rootStore.canvasOptionsStore.height}px
          </div>

          <Separator />

          {/* ── Configure button ── */}
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => setModalOpen(true)}
          >
            <Settings2 className="h-3.5 w-3.5" />
            Configure export settings
          </Button>

          {/* ── Create GIF button ── */}
          {exportState === 'idle' && (
            <Button
              onClick={handleCreateGif}
              disabled={!canExport}
              className="w-full gap-2 font-semibold"
            >
              <Sparkles className="h-4 w-4" />
              Create GIF
            </Button>
          )}

          {/* ── Rendering state ── */}
          {exportState === 'rendering' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 dark:border-blue-800 dark:bg-blue-950/40">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                    Rendering GIF{progress ? `… ${progress}%` : '…'}
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${Math.max(progress, 2)}%` }}
                />
              </div>
            </div>
          )}

          {/* ── Done state ── */}
          {exportState === 'done' && gifUrl && (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:border-emerald-800 dark:bg-emerald-950/40">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">GIF ready!</span>
              </div>
              <a
                href={gifUrl}
                download="animated.gif"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-emerald-700 active:bg-emerald-800"
              >
                <Download className="h-4 w-4" />
                Download GIF
              </a>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setExportState('idle');
                  setGifUrl(null);
                }}
              >
                Create another
              </Button>
            </div>
          )}

          {/* ── Error state ── */}
          {exportState === 'error' && (
            <div className="space-y-2">
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                Export failed. Try again or adjust settings.
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setExportState('idle')}
              >
                Try again
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ── Settings Modal ── */}
      <ExportSettingsModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
});

/* ─── Small setting chip ──────────────────────────────────── */
function SettingChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800/50">
      <Icon className="h-3 w-3 text-slate-400" />
      <div className="min-w-0">
        <div className="text-[9px] uppercase text-slate-400 dark:text-slate-500">{label}</div>
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{value}</div>
      </div>
    </div>
  );
}

/* ─── Export Settings Modal ───────────────────────────────── */
const ExportSettingsModal = observer(({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const rootStore = useStores();
  const animationStore = rootStore.animationStore;
  const fileStore = rootStore.fileStore;
  const canvasOptionsStore = rootStore.canvasOptionsStore;
  const canvas = rootStore.canvasRef.current;

  const applyCanvasSize = useCallback(() => {
    if (!canvas) return;
    canvas.setDimensions({
      width: canvasOptionsStore.width,
      height: canvasOptionsStore.height,
    });
  }, [canvas, canvasOptionsStore.height, canvasOptionsStore.width]);

  useEffect(() => {
    applyCanvasSize();
  }, [applyCanvasSize]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-blue-500" />
            Export settings
          </DialogTitle>
          <DialogDescription>Tune these before creating your GIF.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* ── FPS ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Frames per second</Label>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold tabular-nums text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {animationStore.fps}
              </span>
            </div>
            <Slider
              min={1}
              max={24}
              step={1}
              value={[animationStore.fps]}
              onValueChange={(v) => (animationStore.fps = v[0])}
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 — choppy</span>
              <span>24 — smooth</span>
            </div>
          </div>

          {/* ── Quality ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Quality</Label>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold tabular-nums text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {fileStore.gifQuality}
              </span>
            </div>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[fileStore.gifQuality]}
              onValueChange={(v) => (fileStore.gifQuality = v[0])}
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 — smallest file</span>
              <span>10 — best quality</span>
            </div>
          </div>

          {/* ── Palette Size ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Palette size</Label>
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold tabular-nums text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                {fileStore.paletteSize}
              </span>
            </div>
            <Slider
              min={8}
              max={256}
              step={8}
              value={[fileStore.paletteSize]}
              onValueChange={(v) => (fileStore.paletteSize = v[0])}
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>8 — few colors</span>
              <span>256 — full palette</span>
            </div>
          </div>

          <Separator />

          {/* ── Canvas Size ── */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Canvas size</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500">Width</span>
                <Input
                  type="number"
                  className="h-8 text-xs"
                  value={canvasOptionsStore.width}
                  onChange={(e) => canvasOptionsStore.setWidth(parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500">Height</span>
                <Input
                  type="number"
                  className="h-8 text-xs"
                  value={canvasOptionsStore.height}
                  onChange={(e) => canvasOptionsStore.setHeight(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* ── Background ── */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Background</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-8 w-8 cursor-pointer rounded-md border-2 border-slate-200 bg-transparent p-0 dark:border-slate-700"
                value={canvasOptionsStore.backgroundColor}
                onChange={(e) => canvasOptionsStore.setBackgroundColor(e.target.value)}
              />
              <Input
                className="h-8 flex-1 font-mono text-xs"
                value={canvasOptionsStore.backgroundColor}
                onChange={(e) => canvasOptionsStore.setBackgroundColor(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="gap-1.5">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default ExportPanel;
