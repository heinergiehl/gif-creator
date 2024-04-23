'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { useStores } from '@/store';
const ExportPanel = observer(() => {
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const animtionStore = rootStore.animationStore;
  const fileStore = rootStore.fileStore;
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const handleCreateGif = async () => {
    const url = await fileStore.handleSaveAsGif();
    setGifUrl(url); // Store the URL in state
  };
  return (
    <div className="flex flex-col space-y-2 p-4">
      <span className="text-xs font-semibold text-gray-700">Configure and Export Your GIFs</span>
      <>
        <input
          type="range"
          step={1}
          min="1"
          max="24"
          value={animtionStore.fps}
          onChange={(e) => (animtionStore.fps = parseFloat(e.target.value))}
        />
        <>
          <span className="label flex flex-col items-start text-xs text-gray-600">
            <span className="font-bold"> {animtionStore.fps} fps</span> (Be careful with higher
            values. A GIF with 24 fps and 24 frames will only last 1 second to go through all
            frames)
          </span>
        </>
      </>
      <>
        <span className="label text-xs font-bold text-gray-600">
          {' '}
          {fileStore.gifQuality} GIF quality
        </span>
        <input
          type="range"
          min="1"
          max="10"
          value={fileStore.gifQuality}
          onChange={(e) => (fileStore.gifQuality = parseFloat(e.target.value))}
        />
      </>
      {store.elements.some((el) => el.fabricObject) && !gifUrl && (
        <button onClick={handleCreateGif} className="btn btn-primary">
          Create Gif
        </button>
      )}
      {gifUrl && (
        <a href={gifUrl} download="animated.gif" className="btn btn-primary">
          Download Gif
        </a>
      )}
    </div>
  );
});
export default ExportPanel;
