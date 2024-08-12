// Import React hooks and other necessary components
import React, { useContext, useState, ChangeEvent, useEffect, useLayoutEffect } from 'react';
import { observer } from 'mobx-react';
import { fabric } from 'fabric';
import { SuperGif } from '@wizpanda/super-gif';
import { useStores } from '@/store';
import { Frame } from '@/store/EditorStore';
import { getUid } from '@/utils';
import { CustomInputFile } from '@/app/components/ui/CustomFileInput';
import { CustomDialog } from '@/app/components/ui/CustomDialog';
import { Label } from '@radix-ui/react-label';
import { Input } from '../ui/input';
import { CustomProgress } from '../ui/CustomProgress';
import { Button } from '../ui/button';
import { MdDelete } from 'react-icons/md';
import { FaRemoveFormat } from 'react-icons/fa';
const GifResource = observer(() => {
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const editorCarouselStore = useStores().editorCarouselStore;
  const [frameRate, setFrameRate] = useState<number>(1);
  const [quality, setQuality] = useState<number>(1);
  const [inputKey, setInputKey] = useState<number>(Date.now());
  const [loading, setLoading] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const editorStore = useStores().editorStore;
  const extractFrames = async (file: File) => {
    setLoading(true);
    editorCarouselStore.isCreatingGifs = true;
    const image = new Image();
    image.src = URL.createObjectURL(file);
    const superGif = new SuperGif(image, {});
    superGif.load(async () => {
      const frames: Frame[] = [];
      const length = superGif.getLength();
      const interval = Math.max(1, Math.floor(1000 / frameRate)); // Calculate interval based on FPS
      for (let i = 0; i < length; i += interval) {
        superGif.moveTo(i);
        const canvas = superGif.getCanvas();
        const src = canvas.toDataURL('image/png', quality);
        const id = getUid();
        frames.push({ id, src });
      }
      editorStore.frames = [...editorStore.frames, ...frames];
      editorStore.addImages();
      editorCarouselStore.isCreatingGifs = false;
      setLoading(false);
    });
  };
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await extractFrames(file);
    }
  };
  return (
    <div className="relative  h-full w-screen md:w-full">
      <CustomDialog
        header="Add more frames from another GIF"
        open={openModal}
        onClose={() => setOpenModal(false)}
      >
        <Label className="flex w-full max-w-xs flex-col gap-y-4">
          <span className="">Frame extraction rate (frames per second):</span>
          <span className="text-xs font-semibold">{frameRate} fps</span>
          <Input
            type="range"
            step="1"
            min="1"
            max="24"
            value={frameRate}
            onChange={(e) => setFrameRate(parseFloat(e.target.value))}
            className=""
          />
        </Label>
        <Label className="w-full space-y-4 md:max-w-xs">
          <div className="label flex flex-col items-start space-y-4">
            <span className=""> Resolution scale (1 for full, 0.5 for half, etc.):</span>
            <span className="font-semibold ">{quality}</span>
          </div>
          <Input
            type="range"
            step="0.1"
            max={1}
            min={0.1}
            value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
            className=""
          />
        </Label>
        <CustomInputFile key={inputKey} onChange={handleFileChange} type="gif" />
        <CustomProgress />
      </CustomDialog>
      <>
        <div className="flex h-[50px] w-full items-center justify-center bg-slate-200 text-sm dark:bg-slate-900">
          Upload GIF
        </div>
        <div className="flex w-full flex-col items-start justify-center gap-y-4 p-8  text-xs">
          {store.frames.length === 0 && store.elements.length === 0 && (
            <>
              <Label className="flex w-full max-w-xs flex-col gap-y-4">
                <span className="">Frame extraction rate (frames per second):</span>
                <span className="text-xs font-semibold">{frameRate} fps</span>
                <Input
                  type="range"
                  step="1"
                  min="1"
                  max="24"
                  value={frameRate}
                  onChange={(e) => setFrameRate(parseFloat(e.target.value))}
                  className=""
                />
              </Label>
              <Label className="w-full max-w-xs space-y-4">
                <div className="label flex flex-col items-start space-y-4">
                  <span className=""> Resolution scale (1 for full, 0.5 for half, etc.):</span>
                  <span className="font-semibold ">{quality}</span>
                </div>
                <Input
                  type="range"
                  step="0.1"
                  max={1}
                  min={0.1}
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className=""
                />
              </Label>
              <CustomInputFile key={inputKey} onChange={handleFileChange} type="gif" />
            </>
          )}
          {store.frames.length > 0 && store.elements.length > 0 && (
            <div className="mb-4 flex w-full flex-col gap-y-4">
              <Button
                onClick={() => {
                  store.frames = [];
                  store.elements = [];
                  store.currentKeyFrame = 0;
                }}
                variant={'destructive'}
              >
                <MdDelete className="mr-2" /> Delete Frames
              </Button>
              <Button
                onClick={() => {
                  setOpenModal(true);
                }}
                variant={'outline'}
              >
                <FaRemoveFormat className="mr-2" /> Add more frames
              </Button>
            </div>
          )}
          <CustomProgress />
        </div>
      </>
    </div>
  );
});
export default GifResource;
