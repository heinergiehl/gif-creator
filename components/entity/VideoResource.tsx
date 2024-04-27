'use client';
import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { useStores } from '@/store';
import { Frame } from '@/store/EditorStore';
import { getUid } from '@/utils';
import { InputFile } from '@/app/components/ui/FileInput';
import { Label } from '../ui/label';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { CustomProgress } from '../ui/CustomProgress';
import { Input } from '../ui/input';

export const VideoResource = observer(() => {
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const editorCarousStore = rootStore.editorCarouselStore;
  const [frameRate, setFrameRate] = React.useState(1);
  const [quality, setQuality] = React.useState(1);
  // const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   editorCarousStore.isCreatingGifs = true;
  //   const file = event.target.files?.[0];
  //   if (!file) return;
  //   const extractedFrames = await extractFramesFromFile(file, frameRate, resolution);
  //   // render first frame
  //   store.frames = [...store.frames, ...extractedFrames];
  //   editorCarousStore.isCreatingGifs = false;
  // };
  // async function extractFramesFromFile(
  //   file: File,
  //   frameRate: number,
  //   resolutionScale: number,
  // ): Promise<Frame[]> {
  //   return new Promise((resolve, reject) => {
  //     const url = URL.createObjectURL(file);
  //     const video = document.createElement('video');
  //     video.src = url;
  //     video.addEventListener('loadedmetadata', () => {
  //       const canvas = document.createElement('canvas');
  //       canvas.width = video.videoWidth * resolutionScale;
  //       canvas.height = video.videoHeight * resolutionScale;
  //       const ctx = canvas.getContext('2d');
  //       if (!ctx) {
  //         reject(new Error('Could not get canvas context'));
  //         return;
  //       }
  //       const frames: Frame[] = [];
  //       video.addEventListener('seeked', async () => {
  //         if (video.currentTime >= video.duration || video.ended) {
  //           URL.revokeObjectURL(url); // Cleanup
  //           resolve(frames);
  //           return;
  //         }
  //         ctx.clearRect(0, 0, canvas.width, canvas.height);
  //         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  //         const id = getUid();
  //         frames.push({
  //           id: id,
  //           src: canvas.toDataURL('image/png'),
  //         });
  //         video.currentTime = Math.min(video.duration, video.currentTime + 1 / frameRate);
  //       });
  //       video.currentTime = 0;
  //     });
  //   });
  // }
  const [videoSrc, setVideoSrc] = useState<string>('');
  const ffmpegRef = useRef<FFmpeg>(new FFmpeg());
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
    if (!ffmpegRef.current.loaded) return;
    const file = event.target.files?.[0];
    if (!file) return;
    const ffmpeg = ffmpegRef.current;
    console.warn('file', file.name);
    await ffmpeg.writeFile(file.name, await fetchFile(file));
    console.warn('file', file.name);
    const time = new Date().getTime();
    // scaling best on quality 0.1 to 1, 1 is full resolution
    console.log('quality', quality);
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
    console.warn('time', new Date().getTime() - time);
    console.warn('exec!!');
    const canvas = document.createElement('canvas');
    canvas.width = store.canvas?.width || 0;
    canvas.height = store.canvas?.height || 0;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    const dir = await ffmpeg.listDir('/');
    const files = dir.filter((file) => file.name.startsWith('out') && file.name.endsWith('.png'));
    console.warn('files', files.length);
    const frames: Frame[] = [];
    store.progress.rendering = 0;
    for (let i = 1; i <= 100; i++) {
      try {
        const filename = `out${i}.png`;
        const data = await ffmpeg.readFile(filename);
        const blobUrl = URL.createObjectURL(new Blob([data], { type: 'image/png' }));
        // Wait for the image to load before using the data URL
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.src = blobUrl;
          img.width = store?.canvas?.width || 0;
          img.height = store?.canvas?.height || 0;
          img.onload = () => resolve(img);
          img.onerror = reject;
          console.warn('blobUrl', blobUrl);
        })
          .then(() => {
            // const canvas = document.createElement('canvas');
            // const ctx = canvas.getContext('2d');
            // if (!ctx) throw new Error('Failed to get canvas context');
            // canvas.width = img.width; // or use desired dimensions
            // canvas.height = img.height;
            // ctx.drawImage(img, 0, 0);
            // URL.revokeObjectURL(blobUrl); // Cleanup
            frames.push({ id: getUid(), src: blobUrl });
            store.progress.rendering = (i / files.length) * 100;
          })
          .catch((error) => {
            console.error('Error loading image:', error);
          });
      } catch (e) {
        console.error('Error reading file:', e);
        break; // Exit the loop if a file can't be read
      }
    }
    console.log('frames', frames);
    store.frames = frames; // Update the store with the new frames
  };
  return (
    <div className="relative z-[100] p-8">
      {/* if store._editorelements, make sure to provide option for deleting all  frames and resetting the editor */}
      {store.frames.length > 0 && store.elements.length > 0 && (
        <div className="flex flex-col w-full mb-4">
          <button
            onClick={() => {
              store.frames = [];
              store.elements = [];
              store.canvas?.clear();
            }}
            className="btn btn-primary"
          >
            Delete all Frames and Reset Editor
          </button>
        </div>
      )}
      <>
        <h2 className="mb-8 font-semibold ">Upload a video to extract frames</h2>
        <div className="flex flex-col items-center justify-center w-full text-xs gap-y-4 ">
          <Label className="flex flex-col w-full max-w-xs gap-y-4">
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
            <div className="flex flex-col items-start space-y-4 label">
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
          <InputFile type="video" onChange={handleFileChange} />
          <CustomProgress />
        </div>
      </>
    </div>
  );
});
export default VideoResource;
