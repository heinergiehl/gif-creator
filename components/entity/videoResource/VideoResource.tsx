'use client';
import React, { useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { useStores } from '@/store';
import { CustomProgress } from '@/components/ui/CustomProgress';
import { CustomDialog } from '@/app/components/ui/CustomDialog';
import { handleFileChange } from './utils';
import FrameSettings from './FrameSettings';
import FileInput from './FileInput';
import { VideoResourceProps } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Loader2, Video, Wand2, Settings2, Film, ArrowRight } from 'lucide-react';
import { ffmpegStore } from '@/store/FFmpegStore';
import { MediaImportStatusCard } from '@/components/entity/media/MediaImportStatusCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
const VideoResource: React.FC<VideoResourceProps> = observer(() => {
  const { editorStore } = useStores();
  const [frameRate, setFrameRate] = useState<number>(1);
  const [quality, setQuality] = useState<number>(1);
  const [inputKey, setInputKey] = useState(Date.now());
  const [openModal, setOpenModal] = useState<boolean>(false);
  const ffmpeg = ffmpegStore.ffmpeg;
  const isPreparingEngine = ffmpegStore.loading || !ffmpeg?.loaded;
  const isImporting = editorStore.progress.active;
  const progressLabel = editorStore.progress.title || 'Preparing your video';
  const progressMessage =
    editorStore.progress.message ||
    'Uploading, extracting, and loading frames into the editor…';
  const showReadyMessage =
    !isImporting && editorStore.progress.stage === 'ready' && editorStore.progress.message;

  // ── Settings confirmation modal state ──────────────────────
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pendingFileEvent = useRef<React.ChangeEvent<HTMLInputElement> | null>(null);

  /** Intercept file selection — stash the event and open settings modal */
  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    pendingFileEvent.current = event;
    setSettingsOpen(true);
  };

  /** User confirms settings → run extraction */
  const handleConfirmExtract = () => {
    setSettingsOpen(false);
    if (pendingFileEvent.current) {
      handleFileChange(pendingFileEvent.current, ffmpeg, frameRate, quality, editorStore, setInputKey);
      pendingFileEvent.current = null;
    }
  };

  /** User cancels → discard the file selection */
  const handleCancelExtract = () => {
    setSettingsOpen(false);
    pendingFileEvent.current = null;
    setInputKey(Date.now()); // reset file input so the same file can be re-selected
  };

  return (
    <ScrollArea className=" mb-[90px]  h-[85vh] w-screen  bg-slate-300 dark:bg-slate-900  md:h-full md:w-full">
      <div className="  flex w-full flex-col items-center justify-center gap-4 ">
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
            disabled={isImporting}
          />
          {isPreparingEngine ? (
            <div className="rounded-xl border border-dashed border-slate-400 p-4 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300">
              Preparing the local video processing engine. You’ll be able to upload a video in a moment.
            </div>
          ) : isImporting ? (
            <div className="w-full rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <Loader2 className="h-4 w-4 animate-spin" />
                {progressLabel}
              </div>
              <p className="mb-3 text-xs text-slate-600 dark:text-slate-300">{progressMessage}</p>
              <CustomProgress />
            </div>
          ) : (
            <FileInput
              key={inputKey}
              onChange={(event) =>
                handleFileChange(event, ffmpeg, frameRate, quality, editorStore, setInputKey)
              }
            />
          )}
          <CustomProgress />
        </CustomDialog>

        {/* ── Settings confirmation modal ──────────────────── */}
        <Dialog open={settingsOpen} onOpenChange={(open) => !open && handleCancelExtract()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-blue-500" />
                Frame extraction settings
              </DialogTitle>
              <DialogDescription>
                Choose how frames are extracted from your video. A higher frame rate captures
                more detail but creates more frames. Lower resolution saves memory.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Frame rate */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">
                    Frame extraction rate
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

              {/* Resolution scale */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">
                    Resolution scale
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
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Film className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span>
                    Extracting at <strong>{frameRate} fps</strong> and{' '}
                    <strong>{Math.round(quality * 100)}%</strong> resolution. Processing runs
                    entirely in your browser — nothing is uploaded.
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

        <div className="w-full bg-slate-300 text-sm dark:bg-slate-900 md:h-full">
          <span className="flex h-[50px] items-center justify-center font-medium">
            Upload Video
          </span>
        </div>
        <div className="flex w-full flex-col items-start justify-center bg-slate-300 p-8 text-sm dark:bg-slate-900">
          <MediaImportStatusCard
            title={
              isPreparingEngine
                ? 'Preparing local video engine'
                : isImporting
                  ? progressLabel
                  : 'Import a video into frames'
            }
            description={
              isPreparingEngine
                ? 'This runs entirely in your browser. Upload becomes available automatically once FFmpeg finishes loading.'
                : isImporting
                  ? progressMessage
                  : 'Upload a video and confirm the frame rate and quality before extraction begins. Everything runs locally — nothing is uploaded.'
            }
            icon={isPreparingEngine ? Wand2 : isImporting ? Loader2 : Video}
            iconClassName={
              isPreparingEngine
                ? 'text-violet-500'
                : isImporting
                  ? 'animate-spin text-blue-500'
                  : 'text-emerald-500'
            }
            className="mb-4 mt-2"
          />
          {isPreparingEngine && (
            <div className="mb-4 rounded-xl border border-dashed border-slate-400 p-4 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300">
              Preparing the local video processing engine. Keep this panel open and upload will become available automatically.
            </div>
          )}
          {isImporting && <CustomProgress />}
          {showReadyMessage && !isPreparingEngine && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200">
              {editorStore.progress.message}
            </div>
          )}
          <Separator />
        </div>
        {!isPreparingEngine && !isImporting && (
          <FileInput key={inputKey} onChange={handleFileSelected} />
        )}
      </div>
    </ScrollArea>
  );
});
export default VideoResource;
