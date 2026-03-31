import React, { useState, ChangeEvent } from 'react';
import { observer } from 'mobx-react';
import { SuperGif } from '@wizpanda/super-gif';
import { useStores } from '@/store';
import { Frame } from '@/store/EditorStore';
import { getUid } from '@/utils';
import { CustomInputFile } from '@/app/components/ui/CustomFileInput';
import { CustomDialog } from '@/app/components/ui/CustomDialog';
import { CustomProgress } from '../ui/CustomProgress';
import { Button } from '../ui/button';
import { MdDelete } from 'react-icons/md';
import { FaRemoveFormat } from 'react-icons/fa';
import FrameSettings from './videoResource/FrameSettings';
import { Loader2, Images } from 'lucide-react';
import { MediaImportStatusCard } from '@/components/entity/media/MediaImportStatusCard';
const GifResource = observer(() => {
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const editorCarouselStore = useStores().editorCarouselStore;
  const [frameRate, setFrameRate] = useState<number>(1);
  const [quality, setQuality] = useState<number>(1);
  const [inputKey, setInputKey] = useState<number>(Date.now());
  const [openModal, setOpenModal] = useState<boolean>(false);
  const editorStore = useStores().editorStore;
  const extractFrames = async (file: File) => {
    store.setProgressState({
      active: true,
      stage: 'extracting',
      title: 'Reading GIF frames',
      message: 'Extracting frames from your GIF and preparing them for the timeline…',
      conversion: 10,
      rendering: 0,
    });
    editorCarouselStore.isCreatingGifs = true;
    const image = new Image();
    const imageUrl = URL.createObjectURL(file);
    image.src = imageUrl;
    const superGif = new SuperGif(image, {});
    superGif.load(async () => {
      const frames: Frame[] = [];
      try {
        const length = superGif.getLength();
        const interval = Math.max(1, Math.round(length / Math.max(frameRate, 1)));
        store.setProgressState({
          conversion: 35,
          title: 'Sampling GIF frames',
          message: `Found ${length} source frames. Building your editable timeline now…`,
        });
        let importedCount = 0;
        for (let i = 0; i < length; i += interval) {
          superGif.moveTo(i);
          const canvas = superGif.getCanvas();
          const src = canvas.toDataURL('image/png', quality);
          const id = getUid();
          frames.push({ id, src });
          importedCount += 1;
          store.setProgressState({
            rendering: Math.min(100, (importedCount / Math.ceil(length / interval)) * 100),
            message: `Imported ${importedCount} GIF frames into the editor…`,
          });
        }
        editorStore.appendFrames(frames);
        store.setProgressState({
          active: false,
          stage: 'ready',
          title: 'GIF ready',
          message: `${frames.length} frames are ready to edit.`,
          conversion: 100,
          rendering: 100,
        });
        setInputKey(Date.now());
      } catch (error) {
        console.error('Failed to extract GIF frames:', error);
        store.setProgressState({
          active: false,
          stage: 'error',
          title: 'GIF import failed',
          message: 'The selected GIF could not be converted into editable frames. Please try another file.',
          conversion: 0,
          rendering: 0,
        });
      } finally {
        URL.revokeObjectURL(imageUrl);
        editorCarouselStore.isCreatingGifs = false;
      }
    });
  };
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await extractFrames(file);
    }
  };
  const isImporting = editorCarouselStore.isCreatingGifs || store.progress.active;
  const showReadyMessage = !isImporting && store.progress.stage === 'ready' && store.progress.message;
  return (
    <div className="relative  h-full w-screen md:w-full">
      <CustomDialog
        header="Add more frames from another GIF"
        open={openModal}
        onClose={() => setOpenModal(false)}
      >
        <FrameSettings
          frameRate={frameRate}
          setFrameRate={setFrameRate}
          quality={quality}
          setQuality={setQuality}
          disabled={isImporting}
        />
        {!isImporting && <CustomInputFile key={inputKey} onChange={handleFileChange} type="gif" />}
        <CustomProgress />
      </CustomDialog>
      <div className="bg-slate-300 dark:bg-slate-900 md:h-full">
        <div className="flex h-[50px] w-full items-center justify-center  text-sm font-medium ">
          Upload GIF
        </div>
        <div className="flex w-full flex-col items-start justify-center gap-y-4 p-8  text-xs">
          <MediaImportStatusCard
            title={isImporting ? store.progress.title || 'Importing GIF frames' : 'Import an editable GIF'}
            description={
              isImporting
                ? store.progress.message || 'Extracting frames from your GIF…'
                : 'Upload an animated GIF, choose sampling and quality, then edit the extracted frames like any other project.'
            }
            icon={isImporting ? Loader2 : Images}
            iconClassName={isImporting ? 'animate-spin text-blue-500' : 'text-emerald-500'}
          />
          {store.frames.length === 0 && store.elements.length === 0 && (
            <>
              <FrameSettings
                frameRate={frameRate}
                setFrameRate={setFrameRate}
                quality={quality}
                setQuality={setQuality}
                disabled={isImporting}
              />
              {!isImporting && (
                <CustomInputFile key={inputKey} onChange={handleFileChange} type="gif" />
              )}
            </>
          )}
          {store.frames.length > 0 && store.elements.length > 0 && (
            <div className="mb-4 flex w-full flex-col gap-y-4">
              <Button
                onClick={() => {
                  store.resetDocument();
                }}
                variant={'destructive'}
                disabled={isImporting}
              >
                <MdDelete className="mr-2" /> Delete Frames
              </Button>
              <Button
                onClick={() => {
                  setOpenModal(true);
                }}
                variant={'outline'}
                disabled={isImporting}
              >
                <FaRemoveFormat className="mr-2" /> Add more frames
              </Button>
            </div>
          )}
          {showReadyMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200">
              {store.progress.message}
            </div>
          )}
          <CustomProgress />
        </div>
      </div>
    </div>
  );
});
export default GifResource;
