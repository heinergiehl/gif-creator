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
const ExportPanel = observer(() => {
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const animtionStore = rootStore.animationStore;
  const fileStore = rootStore.fileStore;
  const [gifUrl, setGifUrl] = useState<string | null>(null);
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
  const downloadButtonRef = React.createRef<HTMLParagraphElement>();
  const { toast } = useToast();
  return (
    <div className="flex flex-col space-y-2 p-4">
      <span>Export Your GIF</span>
      <Separator />
      <>
        <Label className="flex flex-col   ">
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
      {store.elements.some((el) => el.isFrame) && !gifUrl && (
        <button onClick={handleCreateGif} className="btn btn-primary">
          Create Gif
        </button>
      )}
      {gifUrl && (
        <div className="z-10 flex min-h-[16rem] items-center justify-center">
          <div
            className={cn(
              'group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800',
            )}
          >
            <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
              ✨{' '}
              <a href={gifUrl} download="animated.gif">
                Download Gif
              </a>
              <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
            </AnimatedShinyText>
          </div>
        </div>
      )}
    </div>
  );
});
export default ExportPanel;
