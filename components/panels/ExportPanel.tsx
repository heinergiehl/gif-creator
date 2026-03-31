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
import { SelectSeparator } from '../ui/select';
import CustomTextInput from '@/app/components/ui/CustomTextInput';
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
    <div className="relative flex h-screen  w-full flex-col dark:bg-slate-900">
      <span className="flex h-[50px] w-full items-center  justify-center bg-slate-200 text-sm dark:bg-slate-900">
        Export Your GIF
      </span>
      <ScrollArea className="flex h-[90%] flex-col  gap-y-2 px-4 pr-8">
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">Export readiness</div>
          <div className="mt-3 space-y-3">
            {exportStatus.map((item) => (
              <div key={item.label} className="flex items-start gap-3 text-sm">
                <span
                  className={cn(
                    'mt-1 inline-flex h-2.5 w-2.5 rounded-full',
                    item.ready ? 'bg-emerald-500' : 'bg-amber-500',
                  )}
                />
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">{item.label}</div>
                  <div className="text-slate-600 dark:text-slate-300">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <>
          <Label className="mt-4 flex  flex-col ">
            <span className="text-xs ">Frames Per Second</span>
            <div className="flex gap-x-4">
              <Input
                min={1}
                max={24}
                type="range"
                value={animtionStore.fps}
                onChange={(e) => (animtionStore.fps = parseInt(e.target.value, 10))}
              />
              <Input
                className="w-20"
                min={1}
                max={24}
                type="number"
                value={animtionStore.fps}
                onChange={(e) => (animtionStore.fps = parseInt(e.target.value, 10))}
              />
            </div>
          </Label>
        </>
        <Separator className="my-4" />
        <>
          <Label className="flex flex-col   ">
            <span className="text-xs ">Quality</span>
            <div className="flex gap-x-4">
              <Input
                type="range"
                min="1"
                max="10"
                value={fileStore.gifQuality}
                onChange={(e) => (fileStore.gifQuality = parseFloat(e.target.value))}
              />
              <Input
                className="w-20"
                type="number"
                min="1"
                max="10"
                value={fileStore.gifQuality}
                onChange={(e) => (fileStore.gifQuality = parseFloat(e.target.value))}
              />
            </div>
          </Label>
        </>
        <Separator className="my-4" />
        <>
          <Label className="flex flex-col   ">
            <span className="text-xs ">Palette Size</span>
            <div className="flex gap-x-4">
              <Input
                type="range"
                min="8"
                step="8"
                max="256"
                value={fileStore.paletteSize}
                onChange={(e) => (fileStore.paletteSize = parseInt(e.target.value, 10))}
              />
              <Input
                className="w-20"
                type="number"
                min="8"
                step="8"
                max="256"
                value={fileStore.paletteSize}
                onChange={(e) => (fileStore.paletteSize = parseInt(e.target.value, 10))}
              />
            </div>
          </Label>
        </>
        <Separator className="my-4" />
        <CanvasOptions />
        <Separator className="my-4" />
        {!gifUrl && (
          <Button onClick={handleCreateGif} disabled={!canExport} size="lg" className="w-full">
            {createButtonLabel}
          </Button>
        )}
        {!hasFrames && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Start by uploading a video, images, or an existing GIF in the source panel. Once frames exist, export becomes available here.
          </p>
        )}
        {gifUrl && (
          <>
            <Separator className="my-4" />
            <Label className="z-10 flex min-h-[16rem] flex-col items-start justify-start ">
              <span className="py-2 ">Download Gif</span>
              <div
                className={cn(
                  'group  rounded-sm border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800',
                )}
              >
                <AnimatedShinyText className="inline-flex items-center justify-center  px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                  ✨{' '}
                  <a href={gifUrl} download="animated.gif">
                    Download GIF
                  </a>
                  <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                </AnimatedShinyText>
              </div>
            </Label>
          </>
        )}
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
    <>
      <div className="flex flex-wrap  gap-x-2">
        <Label>
          <div className="flex flex-col gap-y-2">
            Width
            <CustomTextInput
              onChange={(value) => {
                canvasOptionsStore.setWidth(parseInt(value));
              }}
              className="w-20"
              name="width"
              inputTooltip="Adjust the width of the canvas"
              value={String(canvasOptionsStore.width)}
            />
          </div>
        </Label>
        <Label>
          <div className="flex flex-col gap-y-2">
            <span> Height</span>
            <CustomTextInput
              onChange={(value) => {
                canvasOptionsStore.setHeight(parseInt(value));
              }}
              className=" w-20"
              name="height"
              inputTooltip="Adjust the height of the canvas"
              value={String(canvasOptionsStore.height)}
            />
          </div>
        </Label>
      </div>
      <SelectSeparator className="my-4" />
      <Label>
        <div className="flex flex-col gap-y-2">
          <span>Background Color</span>
          <Input
            type="color"
            name="backgroundColor"
            onChange={(e) => {
              canvasOptionsStore.setBackgroundColor(e.target.value);
            }}
            value={canvasOptionsStore.backgroundColor}
          />
        </div>
      </Label>
    </>
  );
});
export default ExportPanel;
