import React, { useState, useRef, ChangeEvent } from 'react';
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
import { Loader2, Images, Settings2, Film, ArrowRight, Plus } from 'lucide-react';
import { MediaImportStatusCard } from '@/components/entity/media/MediaImportStatusCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const GifResource = observer(() => {
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const editorCarouselStore = useStores().editorCarouselStore;
  const [frameRate, setFrameRate] = useState<number>(1);
  const [quality, setQuality] = useState<number>(1);
  const [inputKey, setInputKey] = useState<number>(Date.now());
  const [openModal, setOpenModal] = useState<boolean>(false);
  const editorStore = useStores().editorStore;

  // ── Settings confirmation modal state ──────────────────────
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pendingFile = useRef<File | null>(null);

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

  /** Intercept file selection — stash the file and open settings modal */
  const handleFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    pendingFile.current = file;
    setSettingsOpen(true);
  };

  /** User confirms settings → run extraction */
  const handleConfirmExtract = () => {
    setSettingsOpen(false);
    if (pendingFile.current) {
      extractFrames(pendingFile.current);
      pendingFile.current = null;
    }
  };

  /** User cancels → discard the file selection */
  const handleCancelExtract = () => {
    setSettingsOpen(false);
    pendingFile.current = null;
    setInputKey(Date.now());
  };

  const isImporting = editorCarouselStore.isCreatingGifs || store.progress.active;
  const showReadyMessage = !isImporting && store.progress.stage === 'ready' && store.progress.message;

  return (
    <ScrollArea className="mb-[90px] h-[85vh] w-full bg-slate-300 dark:bg-slate-900 md:h-full">
      <div className="flex w-full flex-col items-center justify-center gap-4">
        {/* Add-more-frames dialog for when frames already exist */}
        <CustomDialog
          header="Add more frames from another GIF"
          open={openModal}
          onClose={() => setOpenModal(false)}
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-900 dark:text-white">
                  Frame sampling rate
                </label>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  every {frameRate === 1 ? '' : `${frameRate}`} frame{frameRate > 1 ? 's' : ''}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                step="1"
                value={frameRate}
                onChange={(e) => setFrameRate(Number(e.target.value))}
                disabled={isImporting}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 dark:bg-slate-700"
              />
            </div>
            {!isImporting && <CustomInputFile key={inputKey} onChange={handleFileSelected} type="gif" />}
            {isImporting && <CustomProgress />}
          </div>
        </CustomDialog>

        {/* ── Settings confirmation modal ──────────────────── */}
        <Dialog open={settingsOpen} onOpenChange={(open) => !open && handleCancelExtract()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-blue-500" />
                GIF extraction settings
              </DialogTitle>
              <DialogDescription>
                Adjust frame sampling and resolution before extracting.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Frame sampling rate */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">
                    Frame sampling rate
                  </label>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {frameRate} fps
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="24"
                  step="1"
                  value={frameRate}
                  onChange={(e) => setFrameRate(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 dark:bg-slate-700"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 fps — fewer frames</span>
                  <span>24 fps — smoother</span>
                </div>
              </div>

              {/* Quality */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">
                    Resolution quality
                  </label>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600 dark:bg-slate-700"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>10% — small &amp; fast</span>
                  <span>100% — full quality</span>
                </div>
              </div>

              {/* Quick summary */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <Film className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span>
                    <strong>{frameRate} fps</strong> · <strong>{Math.round(quality * 100)}%</strong> quality · processed locally
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleCancelExtract}>
                Cancel
              </Button>
              <Button onClick={handleConfirmExtract} className="gap-1.5">
                Start extraction
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Header ── */}
        <div className="w-full bg-slate-300 text-sm dark:bg-slate-900 md:h-full">
          <span className="flex h-[42px] items-center justify-center font-medium">
            Import GIF
          </span>
        </div>

        {/* ── Main content ── */}
        <div className="flex w-full flex-col items-center justify-center bg-slate-300 px-4 py-4 text-sm dark:bg-slate-900">
          <MediaImportStatusCard
            title={
              isImporting
                ? store.progress.title || 'Importing frames'
                : 'Import editable GIF'
            }
            description={
              isImporting
                ? store.progress.message || 'Extracting frames…'
                : 'Extract frames from any animated GIF for editing'
            }
            icon={isImporting ? Loader2 : Images}
            iconClassName={isImporting ? 'animate-spin text-blue-500' : 'text-emerald-500'}
            className="mb-3 mt-2"
          />

          {isImporting && <CustomProgress />}

          {showReadyMessage && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200">
              {store.progress.message}
            </div>
          )}

          <Separator />
        </div>

        {/* ── Start with blank frame — quick-start alternative ── */}
        {!isImporting && store.frames.length === 0 && (
          <div className="w-full px-4 pb-2">
            <Button
              onClick={() => store.addBlankFrame()}
              variant="outline"
              className="w-full gap-1.5 border-dashed text-sm"
            >
              <Plus className="h-4 w-4" /> Start with blank frame
            </Button>
          </div>
        )}
        {/* ── File input — only shown when not importing and no frames yet ── */}
        {!isImporting && store.frames.length === 0 && store.elements.length === 0 && (
          <div className="w-full">
            <CustomInputFile key={inputKey} onChange={handleFileSelected} type="gif" />
          </div>
        )}

        {/* ── Actions when frames exist ── */}
        {store.frames.length > 0 && store.elements.length > 0 && !isImporting && (
          <div className="flex w-full flex-col gap-3 px-4 pb-4">
            <Button
              onClick={() => setOpenModal(true)}
              variant="outline"
              className="gap-1.5"
            >
              <Images className="h-4 w-4" /> Add more frames from another GIF
            </Button>
            <Button
              onClick={() => store.resetDocument()}
              variant="ghost"
              className="gap-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
            >
              <MdDelete className="h-4 w-4" /> Clear all frames
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  );
});
export default GifResource;
