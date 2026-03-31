'use client';

import { useEffect } from 'react';
import { fabric } from 'fabric';

interface RecorderPreviewPanelProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  stoppedRecording: boolean;
  previewStream: MediaStream | null;
  cropPreviewVideo: string;
  canvas: fabric.Canvas;
  finalCanvas: fabric.Canvas;
  canvasReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  videoDuration: number;
  onPlayVideo: () => void;
}

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '00:00.00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${secs.toFixed(2).padStart(5, '0')}`;
}

export function RecorderPreviewPanel({
  videoRef,
  stoppedRecording,
  previewStream,
  cropPreviewVideo,
  canvas,
  finalCanvas,
  canvasReady,
  isPlaying,
  currentTime,
  videoDuration,
  onPlayVideo,
}: RecorderPreviewPanelProps) {
  // Sync crop rectangle to the program (final) canvas
  useEffect(() => {
    if (!canvas || !finalCanvas) return;

    const activeCropRect = canvas
      .getObjects()
      .find((obj) => obj.type === 'rect') as fabric.Rect | undefined;
    const video = canvas
      .getObjects()
      .find((obj) => obj.type === 'image') as fabric.Image | undefined;

    if (!video || !activeCropRect) return;

    const videoElement = video.getElement() as HTMLVideoElement;
    const scaleFactorX = videoElement.videoWidth / canvas.width!;
    const scaleFactorY = videoElement.videoHeight / canvas.height!;
    const cropWidth = activeCropRect.getScaledWidth() * scaleFactorX;
    const cropHeight = activeCropRect.getScaledHeight() * scaleFactorY;
    const cropX = activeCropRect.left! * scaleFactorX;
    const cropY = activeCropRect.top! * scaleFactorY;

    const fabricVideo = new fabric.Image(videoElement, {
      width: cropWidth,
      height: cropHeight,
      cropX,
      cropY,
      selectable: false,
    });

    finalCanvas.clear();
    fabricVideo.scaleToHeight(finalCanvas.height!);
    fabricVideo.scaleToWidth(finalCanvas.width!);
    fabricVideo.setCoords();
    finalCanvas.add(fabricVideo);
  }, [canvas, cropPreviewVideo, finalCanvas]);

  return (
    <div className="flex h-full flex-col">
      {/* Live preview during recording */}
      <video
        ref={videoRef}
        controls={false}
        autoPlay
        loop
        muted
        playsInline
        style={{
          display: !stoppedRecording && previewStream ? 'block' : 'none',
        }}
        className="mx-auto h-full max-h-full w-auto object-contain"
      />

      {/* Canvas workspace (Source + Program monitors) */}
      {stoppedRecording && (
        <div className="flex h-full flex-col">
          {/* Monitors */}
          <div className="flex flex-1 items-stretch gap-px overflow-hidden bg-black/20 p-2">
            {/* Source Monitor */}
            <div className="flex flex-1 flex-col overflow-hidden rounded border border-white/[0.06] bg-black/40">
              <div className="flex h-7 shrink-0 items-center border-b border-white/[0.06] bg-white/[0.02] px-3">
                <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                  Source
                </span>
              </div>
              <div className="flex flex-1 items-center justify-center overflow-hidden p-2">
                <canvas id="record-canvas" className="max-h-full max-w-full" />
              </div>
            </div>

            {/* Program Monitor */}
            <div className="flex flex-1 flex-col overflow-hidden rounded border border-white/[0.06] bg-black/40">
              <div className="flex h-7 shrink-0 items-center border-b border-white/[0.06] bg-white/[0.02] px-3">
                <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                  Program
                </span>
              </div>
              <div className="flex flex-1 items-center justify-center overflow-hidden p-2">
                <canvas id="final-canvas" className="max-h-full max-w-full" />
              </div>
            </div>
          </div>

          {/* Transport bar */}
          <div className="flex h-9 shrink-0 items-center justify-center gap-4 border-t border-white/[0.06] bg-[#0e0e18] px-4">
            <button
              onClick={onPlayVideo}
              className="flex h-6 w-8 items-center justify-center rounded text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? (
                <svg
                  width="12"
                  height="14"
                  viewBox="0 0 12 14"
                  fill="currentColor"
                >
                  <rect x="1" y="1" width="3.5" height="12" rx="1" />
                  <rect x="7.5" y="1" width="3.5" height="12" rx="1" />
                </svg>
              ) : (
                <svg
                  width="12"
                  height="14"
                  viewBox="0 0 12 14"
                  fill="currentColor"
                >
                  <path d="M1 1.5v11l10-5.5z" />
                </svg>
              )}
            </button>

            <div className="font-mono text-xs tracking-wider text-slate-500">
              <span className="text-slate-200">{formatTime(currentTime)}</span>
              <span className="mx-1.5 text-slate-700">/</span>
              <span>{formatTime(videoDuration)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
