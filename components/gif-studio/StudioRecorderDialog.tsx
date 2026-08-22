'use client';

import * as React from 'react';
import { CircleStop, MonitorUp, RotateCcw, Video } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useScreenRecorder } from '@/app/components/recorder/useScreenRecorder';

function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const remainder = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${remainder}`;
}

export function StudioRecorderDialog({
  open,
  onOpenChange,
  onUseRecording,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseRecording: (blob: Blob) => void;
}) {
  const [recording, setRecording] = React.useState<{ blob: Blob; url: string } | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const { startRecording, stopRecording, previewStream, status, error } = useScreenRecorder({
    onStop: (url, blob) => setRecording({ url, blob }),
  });

  React.useEffect(() => {
    if (status !== 'recording') return;
    const started = Date.now();
    const timer = window.setInterval(() => setElapsed((Date.now() - started) / 1000), 250);
    return () => window.clearInterval(timer);
  }, [status]);

  React.useEffect(() => {
    return () => {
      if (recording) URL.revokeObjectURL(recording.url);
    };
  }, [recording]);

  React.useEffect(() => {
    const video = document.getElementById(
      'studio-recorder-live-preview',
    ) as HTMLVideoElement | null;
    if (video && previewStream && status === 'recording') {
      video.srcObject = previewStream;
      void video.play().catch(() => {});
    }
  }, [previewStream, status]);

  const reset = () => {
    if (recording) URL.revokeObjectURL(recording.url);
    setRecording(null);
    setElapsed(0);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && status === 'recording') stopRecording();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-2xl border-slate-800 bg-slate-950 text-slate-100">
        <DialogHeader>
          <DialogTitle>Record a product demo</DialogTitle>
          <DialogDescription className="text-slate-400">
            Your browser asks which tab, window, or screen to share. The recording stays local and
            opens directly in this editor.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-lg border border-slate-800 bg-black">
          {recording ? (
            <video
              src={recording.url}
              controls
              className="aspect-video h-auto w-full object-contain"
            />
          ) : status === 'recording' ? (
            <div className="relative">
              <video
                id="studio-recorder-live-preview"
                muted
                playsInline
                className="aspect-video h-auto w-full object-contain"
              />
              <span className="absolute left-3 top-3 flex items-center gap-2 rounded bg-black/75 px-2.5 py-1.5 font-mono text-xs text-white">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                REC {formatClock(elapsed)}
              </span>
            </div>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center px-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-slate-400">
                <MonitorUp className="h-5 w-5" />
              </span>
              <p className="mt-4 text-sm font-medium text-slate-200">Ready when you are</p>
              <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                Keep demos short. After recording, trim idle frames and add manual click highlights,
                callouts, zoom, or redaction.
              </p>
            </div>
          )}
        </div>

        {error ? (
          <Alert variant="destructive">
            <Video className="h-4 w-4" />
            <AlertTitle>Screen recording is unavailable</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-0">
          {recording ? (
            <>
              <Button type="button" variant="outline" onClick={reset} className="border-slate-700">
                <RotateCcw className="mr-2 h-4 w-4" /> Record again
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onUseRecording(recording.blob);
                  onOpenChange(false);
                }}
                className="bg-sky-400 text-slate-950 hover:bg-sky-300"
              >
                Use this recording
              </Button>
            </>
          ) : status === 'recording' ? (
            <Button type="button" variant="destructive" onClick={stopRecording}>
              <CircleStop className="mr-2 h-4 w-4" /> Stop recording
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => void startRecording()}
              className="bg-red-500 text-white hover:bg-red-400"
            >
              <MonitorUp className="mr-2 h-4 w-4" /> Choose screen and record
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
