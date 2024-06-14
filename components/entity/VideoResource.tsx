'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { useStores } from '@/store';
import { Frame } from '@/store/EditorStore';
import { getUid } from '@/utils';
import { CustomInputFile } from '@/app/components/ui/CustomFileInput';
import { Label } from '../ui/label';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { CustomProgress } from '../ui/CustomProgress';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { FaRemoveFormat } from 'react-icons/fa';
import { FaDeleteLeft } from 'react-icons/fa6';
import { MdDelete } from 'react-icons/md';
import { CustomDialog } from '@/app/components/ui/CustomDialog';
export const VideoResource = observer(() => {
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const [frameRate, setFrameRate] = React.useState(1);
  const [quality, setQuality] = React.useState(1);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const ffmpegRef = useRef<FFmpeg>(new FFmpeg());
  const [inputKey, setInputKey] = useState(Date.now());
  const loadFFMPEG = async () => {
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on('log', ({ message }) => {
      console.log(message);
    });
    ffmpeg.on('progress', (e) => {
      console.error(e);
      store.progress.conversion = e.progress * 100;
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(
        'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
        'text/javascript',
      ),
      wasmURL: await toBlobURL(
        'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
        'application/wasm',
      ),
    });
  };
  useEffect(() => {
    const load = async () => {
      await loadFFMPEG();
    };
    load();
  }, []);
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileChange', event.target.files?.[0]);
    if (!ffmpegRef.current.loaded) return;
    const file = event.target.files?.[0];
    if (!file) return;
    const ffmpeg = ffmpegRef.current;
    console.warn('file', file.name);
    store.progress.conversion = 0;
    await ffmpeg.writeFile(file.name, await fetchFile(file));
    console.warn('file', file.name);
    await ffmpeg.exec([
      '-i',
      file.name,
      '-vf',
      `fps=1,scale=iw*${quality}:ih*${quality}`,
      'out%d.png',
      '-threads',
      '24',
      `-vf`,
      'compression_level=100',
    ]);
    const files = await ffmpeg.listDir('/');
    const imageFiles = files.filter(
      (file) => file.name.startsWith('out') && file.name.endsWith('.png'),
    );
    console.warn('files', imageFiles.length);
    await processFrames(ffmpeg, imageFiles);
    // remove files
    imageFiles.forEach(async (file) => await ffmpeg.deleteFile(file.name));
  };
  const processFrames = async (ffmpeg: FFmpeg, files: { name: string }[]) => {
    console.log('FILES', files.length);
    const promises = files.map(async (file) => {
      const data = await ffmpeg.readFile(file.name);
      const blobUrl = URL.createObjectURL(new Blob([data], { type: 'image/png' }));
      return new Promise<Frame>((resolve, reject) => {
        const img = new Image();
        img.src = blobUrl;
        img.onload = () => {
          resolve({ id: getUid(), src: blobUrl });
        };
        img.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          reject(new Error('Failed to load image'));
        };
      });
    });
    try {
      const frames = await Promise.all(promises);
      // only add new frames if they dont exist in store.frames
      const newFrames = frames.filter((frame) => store.frames.find((f) => f.src !== frame.src));
      console.log('newFRAMESLENGTH', newFrames.length, store.elements.length);
      if (store.frames.length > 0) store.frames = [...store.frames, ...frames];
      else store.frames = frames;
      store.addImages();
      setInputKey(Date.now());
    } catch (error) {
      console.error('Error processing some frames:', error);
      setInputKey(Date.now());
    }
  };
  const [openModal, setOpenModal] = useState(false);
  return (
    <div className="relative z-[100] h-full  p-8">
      <CustomDialog
        header="Add more frames from another video"
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
        <CustomInputFile key={inputKey} onChange={handleFileChange} type="video" />
        <CustomProgress />
      </CustomDialog>
      <>
        <h2 className="mb-8 font-semibold ">Upload a video to extract frames</h2>
        <div className="flex w-full flex-col items-start justify-center gap-y-4 text-xs ">
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
              <CustomInputFile key={inputKey} onChange={handleFileChange} type="video" />
            </>
          )}
          {/* if store._editorelements, make sure to provide option for deleting all  frames and resetting the editor */}
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
              {/* Turn another video into frames and append them on the existing ones */}
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
export default VideoResource;
