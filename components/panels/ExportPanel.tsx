'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { useStores } from '@/store';
import { Confetti } from '@/components/magicui/confetti';
import AnimatedShinyText from '../magicui/animated-shiny-text';
import { ArrowRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '../ui/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { ffmpegStore } from '@/store/FFmpegStore';
const ExportPanel = observer(() => {
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const animtionStore = rootStore.animationStore;
  const fileStore = rootStore.fileStore;
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isHandleCreateGif, setIsHandleCreateGif] = useState(false);
  const hasFrames = store.elements.some((el) => el.isFrame);
  const isEngineReady = Boolean(ffmpegStore.ffmpeg?.loaded) && !ffmpegStore.loading;
  const canExport = hasFrames && isEngineReady && !isHandleCreateGif;
  const handleCreateGif = async () => {
    if (!canExport) return;
    setIsHandleCreateGif(true);
    const url = await fileStore.handleSaveAsGif();
    setGifUrl(url); // Store the URL in state
    toast({
      title: 'Gif successfully created, and ready to be downloaded!',
      description: 'Your gif is ready to download',
      duration: 5000,
    });
    Confetti({
      origin: { x: 0.2, y: 0 },
    });
    setIsHandleCreateGif(false);
    store.setProgressState({ conversion: 0 });
  };
  const { toast } = useToast();
  // when changing one of the paramters above, create new gif url
  useEffect(() => {
    if (hasFrames) {
      setGifUrl(null);
    }
  }, [
    animtionStore.fps,
    store.frames,
    fileStore.gifQuality,
    fileStore.paletteSize,
    store.elements,
    rootStore.canvasOptionsStore.width,
    rootStore.canvasOptionsStore.height,
    rootStore.canvasOptionsStore.backgroundColor,
    hasFrames,
  ]);
  const progress = store.progress.conversion;
  const { ffmpeg } = ffmpegStore;
  const exportStatus = useMemo(
    () => [
      {
        label: 'Frames added',
        description: hasFrames ? 'Ready to render your animation.' : 'Add a video, images, or GIF frames first.',
        ready: hasFrames,
      },
      {
        label: 'Export engine',
        description: isEngineReady ? 'FFmpeg is ready.' : 'Preparing local export engine...',
        ready: isEngineReady,
      },
    ],
    [hasFrames, isEngineReady],
  );
  useEffect(() => {
    const handleProgress = (e: any) => {
      store.setProgressState({ conversion: Math.round(e?.progress * 100) });
    };
    const handleLog = (e: any) => {
      // FFmpeg log output - silent in production
    };
    if (isHandleCreateGif) {
      ffmpeg?.on('progress', handleProgress);
      ffmpeg?.on('log', handleLog);
      return () => {
        // free all files from memory
        ffmpeg?.off('progress', handleProgress);
        ffmpeg?.off('log', handleLog);
      };
    }
  }, [ffmpeg, isHandleCreateGif, store]);
  useEffect(() => {
    return () => {
      if (gifUrl) {
        URL.revokeObjectURL(gifUrl);
      }
    };
  }, [gifUrl]);

  const createButtonLabel = isHandleCreateGif
    ? `Rendering GIF${progress ? ` (${progress}%)` : '...'}`
    : !hasFrames
      ? 'Add frames to export'
      : !isEngineReady
        ? 'Preparing export engine'
        : 'Create GIF';

  return (
    <div className="relative flex h-full w-full flex-col dark:bg-slate-900">
      <ScrollArea className="flex-1 px-4 pb-4">
        {/* readiness card */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Export readiness</div>
          <div className="mt-2 space-y-2">
            {exportStatus.map((item) => (
              <div key={item.label} className="flex items-start gap-2 text-sm">
                <span
                  className={cn(
                    'mt-1.5 inline-flex h-2 w-2 shrink-0 rounded-full',
                    item.ready ? 'bg-emerald-500' : 'bg-amber-500',
                  )}
                />
                <div>
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200">{item.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* settings */}
        <div className="mt-4 space-y-4">
          <Label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Frames Per Second</span>
            <div className="flex items-center gap-3">
              <Input type="range" min={1} max={24} className="flex-1" value={animtionStore.fps} onChange={(e) => (animtionStore.fps = parseInt(e.target.value, 10))} />
              <Input type="number" className="h-7 w-14 text-xs" min={1} max={24} value={animtionStore.fps} onChange={(e) => (animtionStore.fps = parseInt(e.target.value, 10))} />
            </div>
          </Label>

          <Label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Quality</span>
            <div className="flex items-center gap-3">
              <Input type="range" min={1} max={10} className="flex-1" value={fileStore.gifQuality} onChange={(e) => (fileStore.gifQuality = parseFloat(e.target.value))} />
              <Input type="number" className="h-7 w-14 text-xs" min={1} max={10} value={fileStore.gifQuality} onChange={(e) => (fileStore.gifQuality = parseFloat(e.target.value))} />
            </div>
          </Label>

          <Label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Palette Size</span>
            <div className="flex items-center gap-3">
              <Input type="range" min={8} max={256} step={8} className="flex-1" value={fileStore.paletteSize} onChange={(e) => (fileStore.paletteSize = parseInt(e.target.value, 10))} />
              <Input type="number" className="h-7 w-14 text-xs" min={8} max={256} step={8} value={fileStore.paletteSize} onChange={(e) => (fileStore.paletteSize = parseInt(e.target.value, 10))} />
            </div>
          </Label>

          <Separator />
          <CanvasOptions />
        </div>

        {/* actions */}
        <div className="mt-4 space-y-3">
          {!gifUrl && (
            <Button onClick={handleCreateGif} disabled={!canExport} size="sm" className="w-full">
              {createButtonLabel}
            </Button>
          )}
          {!hasFrames && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload a video, images, or GIF frames first, then come back here to export.
            </p>
          )}
          {gifUrl && (
            <div className="flex flex-col gap-2">
              <div
                className={cn(
                  'group rounded-md border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800',
                )}
              >
                <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1.5 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                  ✨{' '}
                  <a href={gifUrl} download="animated.gif">
                    Download GIF
                  </a>
                  <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                </AnimatedShinyText>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
});
const CanvasOptions = observer(() => {
  const rootStore = useStores();
  const canvasOptionsStore = rootStore.canvasOptionsStore;
  const canvas = rootStore.canvasRef.current;
  const applyChanges = useCallback(() => {
    if (!canvas) return;
    canvas.setDimensions({
      width: canvasOptionsStore.width,
      height: canvasOptionsStore.height,
    });
  }, [canvas, canvasOptionsStore.height, canvasOptionsStore.width]);

  useEffect(() => {
    applyChanges();
  }, [applyChanges]);

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Canvas Size
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <Label className="flex flex-col gap-1">
          <span className="text-xs text-slate-600 dark:text-slate-400">Width</span>
          <Input
            type="number"
            className="h-7 text-xs"
            value={canvasOptionsStore.width}
            onChange={(e) => canvasOptionsStore.setWidth(parseInt(e.target.value))}
          />
        </Label>
        <Label className="flex flex-col gap-1">
          <span className="text-xs text-slate-600 dark:text-slate-400">Height</span>
          <Input
            type="number"
            className="h-7 text-xs"
            value={canvasOptionsStore.height}
            onChange={(e) => canvasOptionsStore.setHeight(parseInt(e.target.value))}
          />
        </Label>
      </div>
      <Label className="flex flex-col gap-1">
        <span className="text-xs text-slate-600 dark:text-slate-400">Background</span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            className="h-7 w-7 cursor-pointer rounded border-none bg-transparent p-0"
            value={canvasOptionsStore.backgroundColor}
            onChange={(e) => canvasOptionsStore.setBackgroundColor(e.target.value)}
          />
          <Input
            className="h-7 flex-1 font-mono text-xs"
            value={canvasOptionsStore.backgroundColor}
            onChange={(e) => canvasOptionsStore.setBackgroundColor(e.target.value)}
          />
        </div>
      </Label>
    </div>
  );
});
export default ExportPanel;
