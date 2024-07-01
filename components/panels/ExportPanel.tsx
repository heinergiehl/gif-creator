'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { useStores } from '@/store';
import { Confetti } from '@/components/magicui/confetti';
import ShinyButton from '../magicui/shiny-button';
import AnimatedShinyText from '../magicui/animated-shiny-text';
import { ArrowRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '../ui/use-toast';
import CustomRangeInput from '@/app/components/ui/CustomRangeInput';
import { Input } from '../ui/input';
import CustomNumberInput from '@/app/components/ui/CustomNumberInput';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { SelectSeparator } from '../ui/select';
import CustomTextInput from '@/app/components/ui/CustomTextInput';
import Image from 'next/image';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
const ExportPanel = observer(() => {
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const animtionStore = rootStore.animationStore;
  const fileStore = rootStore.fileStore;
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const handleCreateGif = async () => {
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
  };
  const handleCreatePreview = async () => {
    const url = await fileStore.createGifPreview();
    setPreviewUrl(url); // Store the URL in state
    toast({
      title: 'Preview generated!',
      description: 'Your gif preview is ready to view',
      duration: 5000,
    });
  };
  const { toast } = useToast();
  useEffect(() => {
    if (store.elements.length === 0) return;
    if (store.frames.length === 0) return;
    handleCreatePreview();
  }, [
    animtionStore.fps,
    store.frames,
    fileStore.gifQuality,
    store.elements,
    rootStore.canvasRef.current,
    rootStore.canvasOptionsStore.width,
    rootStore.canvasOptionsStore.height,
    rootStore.canvasOptionsStore.backgroundColor,
  ]);
  return (
    <div className="flex h-full  flex-col space-y-2 p-4">
      <ScrollArea className="flex h-[90%] flex-col  gap-y-2 pr-8">
        <span>Export Your GIF</span>
        <Separator className="my-4" />
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
        <CanvasOptions />
        {previewUrl && (
          <>
            <Separator className="my-4" />
            <Label className="flex flex-col items-start justify-center gap-y-4">
              <span>Preview</span>
              <Image src={previewUrl} width={300} height={300} alt="GIF Preview" />
            </Label>
          </>
        )}
        {store.elements.some((el) => el.isFrame) && !gifUrl && (
          <Button variant={'ghost'} onClick={handleCreateGif} className="btn btn-primary w-[150px]">
            Create Gif
          </Button>
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
                    Download Gif
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
  const applyChanges = () => {
    if (!canvas) return;
    canvas.setDimensions({
      width: canvasOptionsStore.width,
      height: canvasOptionsStore.height,
    });
  };
  useEffect(() => {
    applyChanges();
  }, [
    canvas,
    canvasOptionsStore.width,
    canvasOptionsStore.height,
    canvasOptionsStore.backgroundColor,
    rootStore.editorStore.elements,
  ]);
  return (
    <>
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
      <SelectSeparator className="col-span-2" />
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
