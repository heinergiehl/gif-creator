import React from 'react';
import { observer } from 'mobx-react';
import { useStores } from '@/store';
import { Frame } from '@/store/EditorStore';
import { getUid } from '@/utils';
import { InputFile } from '@/app/components/ui/FileInput';
import { Label } from '../ui/label';
export const VideoResource = observer(() => {
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const editorCarousStore = rootStore.editorCarouselStore;
  const [frameRate, setFrameRate] = React.useState(1);
  const [resolution, setResolution] = React.useState(1);
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    editorCarousStore.isCreatingGifs = true;
    const file = event.target.files?.[0];
    if (!file) return;
    const extractedFrames = await extractFramesFromFile(file, frameRate, resolution);
    // render first frame
    store.frames = [...store.frames, ...extractedFrames];
    editorCarousStore.isCreatingGifs = false;
  };
  async function extractFramesFromFile(
    file: File,
    frameRate: number,
    resolutionScale: number,
  ): Promise<Frame[]> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth * resolutionScale;
        canvas.height = video.videoHeight * resolutionScale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        const frames: Frame[] = [];
        video.addEventListener('seeked', async () => {
          if (video.currentTime >= video.duration || video.ended) {
            URL.revokeObjectURL(url); // Cleanup
            resolve(frames);
            return;
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const id = getUid();
          frames.push({
            id: id,
            src: canvas.toDataURL('image/png'),
          });
          video.currentTime = Math.min(video.duration, video.currentTime + 1 / frameRate);
        });
        video.currentTime = 0;
      });
    });
  }
  return (
    <div className="p-4 lg:h-screen">
      {/* if store._editorelements, make sure to provide option for deleting all  frames and resetting the editor */}
      {store.frames.length > 0 && store.elements.length > 0 && (
        <div className="mb-4 flex w-full flex-col">
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
        <h2 className="font-semibold text-gray-700">Upload a video to extract frames</h2>
        <div className="flex w-full flex-col items-center justify-center gap-y-4 text-xs text-gray-700">
          <InputFile type="video" onChange={handleFileChange} />
          <Label className="form-control w-full max-w-xs gap-y-4">
            <span className="">Frame extraction rate (frames per second):</span>
            <span className="text-xs font-semibold">{frameRate} fps</span>
            <input
              type="range"
              step="1"
              min="1"
              max="24"
              value={frameRate}
              onChange={(e) => setFrameRate(parseFloat(e.target.value))}
              className=""
            />
          </Label>
          <label className="form-control w-full max-w-xs">
            <div className="label flex flex-col items-start">
              <span className=""> Resolution scale (1 for full, 0.5 for half, etc.):</span>
              <span className="font-semibold ">{resolution}</span>
            </div>
            <input
              type="range"
              step="0.1"
              max={1}
              min={0.1}
              value={resolution}
              onChange={(e) => setResolution(parseFloat(e.target.value))}
              className=""
            />
          </label>
        </div>
      </>
    </div>
  );
});
export default VideoResource;
