'use client';
import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { useStores } from '@/store';
import { CustomProgress } from '@/components/ui/CustomProgress';
import { CustomDialog } from '@/app/components/ui/CustomDialog';
import { Separator } from '@radix-ui/react-select';
import { loadFFMPEG, loadUserVideos, handleFileChange, handleAddButtonClick } from './utils';
import FrameSettings from './FrameSettings';
import FileInput from './FileInput';
import VideoList from './VideoList';
import { VideoResourceProps } from './types';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { ScrollArea } from '@/components/ui/scroll-area';
const VideoResource: React.FC<VideoResourceProps> = observer(() => {
  const { editorStore, supabase } = useStores();
  const [frameRate, setFrameRate] = useState<number>(1);
  const [quality, setQuality] = useState<number>(1);
  const ffmpegRef = useRef(new FFmpeg());
  const [inputKey, setInputKey] = useState(Date.now());
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  useEffect(() => {
    loadFFMPEG(ffmpegRef, editorStore);
  }, [editorStore]);
  // useEffect(() => {
  //   loadUserVideos(supabase, editorStore, setLoading);
  // }, [supabase, editorStore]);
  return (
    <ScrollArea className=" mb-[90px] h-[85vh]">
      <div className="relative flex  flex-col items-center justify-center gap-4">
        <CustomDialog
          header="Add more frames from another video"
          open={openModal}
          onClose={() => setOpenModal(false)}
        >
          <FrameSettings
            frameRate={frameRate}
            setFrameRate={setFrameRate}
            quality={quality}
            setQuality={setQuality}
          />
          <FileInput
            key={inputKey}
            onChange={(event) =>
              handleFileChange(
                event,
                ffmpegRef,
                frameRate,
                quality,
                editorStore,
                setInputKey,
                supabase,
              )
            }
          />
          <CustomProgress />
        </CustomDialog>
        <div className=" w-full bg-slate-200 text-sm dark:bg-slate-900">
          <span className="flex h-[50px]  items-center justify-center"> Upload Video</span>
        </div>
        <FileInput
          onChange={(event) =>
            handleFileChange(
              event,
              ffmpegRef,
              frameRate,
              quality,
              editorStore,
              setInputKey,
              supabase,
            )
          }
        />
        <div className="flex  w-full flex-col items-start justify-center gap-y-4 p-8 text-xs">
          <FrameSettings
            frameRate={frameRate}
            setFrameRate={setFrameRate}
            quality={quality}
            setQuality={setQuality}
          />
          {useStores().editorStore.progress.conversion > 0 &&
            useStores().editorStore.progress.conversion !== 100 && <CustomProgress />}
          <Separator />
          {/* {loading ? (
            <div className="flex h-48 w-full items-center justify-center">
              <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-slate-300 dark:border-slate-800" />
            </div>
          ) : (
            <VideoList
              videos={editorStore.videos}
              onAddButtonClick={(videoUrl) =>
                handleAddButtonClick(
                  videoUrl,
                  supabase,
                  (event: React.ChangeEvent<HTMLInputElement>) =>
                    handleFileChange(
                      event,
                      ffmpegRef,
                      frameRate,
                      quality,
                      editorStore,
                      setInputKey,
                      supabase,
                    ),
                )
              }
            />
          )} */}
        </div>
      </div>
    </ScrollArea>
  );
});
export default VideoResource;
