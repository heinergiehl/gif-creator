'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { toTimeString } from './processing';

interface RecorderTrimRangeProps {
  thumbnails: string[];
  rangeEnd: number;
  rangeStart: number;
  onRangeStartChange: (value: number) => void;
  onRangeEndChange: (value: number) => void;
  loading: boolean;
  videoDuration: number;
  canvasRef: React.RefObject<fabric.Canvas>;
}

const RANGE_MAX = 100;

export function RecorderTrimRange({
  thumbnails,
  rangeEnd,
  rangeStart,
  onRangeStartChange,
  onRangeEndChange,
  loading,
  videoDuration,
  canvasRef,
}: RecorderTrimRangeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<null | 'start' | 'end' | 'range'>(
    null,
  );
  const [startPos, setStartPos] = useState<number | null>(null);

  // Playhead position (percentage)
  const [playheadPos, setPlayheadPos] = useState(0);

  const canvas = canvasRef.current;
  const videoElement = canvas
    ? ((
        canvas
          .getObjects()
          .find((o) => o.type === 'image') as fabric.Image | undefined
      )?.getElement() as HTMLVideoElement)
    : null;

  // Track current playback position for the playhead
  useEffect(() => {
    if (!videoElement || !videoDuration) return;
    const interval = setInterval(() => {
      const pct = (videoElement.currentTime / videoDuration) * 100;
      setPlayheadPos(pct);
    }, 50);
    return () => clearInterval(interval);
  }, [videoElement, videoDuration]);

  // Mouse drag logic for trim handles
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging || startPos === null || !trackRef.current) return;
      const delta = e.clientX - startPos;
      const trackWidth = trackRef.current.getBoundingClientRect().width;
      const deltaPct = (delta / trackWidth) * 100;

      if (dragging === 'start') {
        const next = Math.max(
          0,
          Math.min(rangeStart + deltaPct, rangeEnd - 1),
        );
        onRangeStartChange(next);
        setStartPos(e.clientX);
      } else if (dragging === 'end') {
        const next = Math.min(
          RANGE_MAX,
          Math.max(rangeEnd + deltaPct, rangeStart + 1),
        );
        onRangeEndChange(next);
        setStartPos(e.clientX);
      } else if (dragging === 'range') {
        const newStart = rangeStart + deltaPct;
        const newEnd = rangeEnd + deltaPct;
        if (newStart >= 0 && newEnd <= RANGE_MAX) {
          onRangeStartChange(newStart);
          onRangeEndChange(newEnd);
          setStartPos(e.clientX);
        }
      }
    };
    const handleMouseUp = () => {
      setDragging(null);
      setStartPos(null);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    dragging,
    startPos,
    rangeStart,
    rangeEnd,
    onRangeStartChange,
    onRangeEndChange,
  ]);

  // Click anywhere on the track to seek
  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      if (!trackRef.current || !videoElement || !videoDuration) return;
      const rect = trackRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      const time = (pct / 100) * videoDuration;
      videoElement.currentTime = time;
    },
    [videoElement, videoDuration],
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-600 border-t-slate-300" />
          Generating timeline…
        </div>
      </div>
    );
  }

  if (thumbnails.length === 0) return null;

  // Generate ruler marks
  const rulerMarks = Array.from({ length: 11 }, (_, i) => {
    const pct = (i / 10) * 100;
    const time = (i / 10) * videoDuration;
    return { pct, label: toTimeString(time, false) };
  });

  const trimStartTime = toTimeString(
    (rangeStart / RANGE_MAX) * videoDuration,
    false,
  );
  const trimEndTime = toTimeString(
    (rangeEnd / RANGE_MAX) * videoDuration,
    false,
  );

  return (
    <div className="flex h-full flex-col select-none">
      {/* ── Ruler ─────────────────────────────────────────── */}
      <div className="relative h-5 shrink-0 border-b border-white/[0.04]">
        {rulerMarks.map(({ pct, label }) => (
          <div
            key={pct}
            className="absolute top-0 flex h-full flex-col items-start"
            style={{ left: `${pct}%` }}
          >
            <div className="h-2 w-px bg-white/10" />
            <span className="ml-0.5 text-[9px] tabular-nums text-slate-600">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Track (filmstrip + trim + playhead) ───────────── */}
      <div
        ref={trackRef}
        className="relative flex-1 cursor-pointer overflow-hidden"
        onClick={handleTrackClick}
      >
        {/* Thumbnail filmstrip */}
        <div className="absolute inset-0 flex">
          {thumbnails.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              className="h-full flex-1 object-cover opacity-40"
              draggable={false}
            />
          ))}
        </div>

        {/* Dimmed regions outside trim range */}
        <div
          className="absolute inset-y-0 left-0 bg-black/60"
          style={{ width: `${rangeStart}%` }}
        />
        <div
          className="absolute inset-y-0 right-0 bg-black/60"
          style={{ width: `${RANGE_MAX - rangeEnd}%` }}
        />

        {/* Selected range — drag to move */}
        <div
          className="absolute inset-y-0 cursor-grab border-y-2 border-amber-500/80 active:cursor-grabbing"
          style={{
            left: `${rangeStart}%`,
            width: `${rangeEnd - rangeStart}%`,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setDragging('range');
            setStartPos(e.clientX);
          }}
        />

        {/* Start handle */}
        <div
          className="group absolute inset-y-0 z-20 flex w-3 -translate-x-1/2 cursor-ew-resize items-center"
          style={{ left: `${rangeStart}%` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setDragging('start');
            setStartPos(e.clientX);
          }}
        >
          <div className="h-full w-1 rounded-l bg-amber-500 shadow-sm shadow-amber-500/30 transition-all group-hover:w-1.5 group-hover:bg-amber-400" />
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-medium tabular-nums text-black opacity-0 transition-opacity group-hover:opacity-100">
            {trimStartTime}
          </div>
        </div>

        {/* End handle */}
        <div
          className="group absolute inset-y-0 z-20 flex w-3 -translate-x-1/2 cursor-ew-resize items-center justify-end"
          style={{ left: `${rangeEnd}%` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setDragging('end');
            setStartPos(e.clientX);
          }}
        >
          <div className="h-full w-1 rounded-r bg-amber-500 shadow-sm shadow-amber-500/30 transition-all group-hover:w-1.5 group-hover:bg-amber-400" />
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-medium tabular-nums text-black opacity-0 transition-opacity group-hover:opacity-100">
            {trimEndTime}
          </div>
        </div>

        {/* Playhead */}
        <div
          className="pointer-events-none absolute inset-y-0 z-30 w-px bg-red-500"
          style={{ left: `${playheadPos}%` }}
        >
          <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-red-500" />
        </div>
      </div>

      {/* ── Trim info bar ─────────────────────────────────── */}
      <div className="flex h-6 shrink-0 items-center justify-between border-t border-white/[0.04] px-3">
        <span className="text-[10px] tabular-nums text-slate-500">
          IN {trimStartTime}
        </span>
        <span className="text-[10px] tabular-nums text-slate-500">
          Duration{' '}
          {toTimeString(
            ((rangeEnd - rangeStart) / RANGE_MAX) * videoDuration,
            false,
          )}
        </span>
        <span className="text-[10px] tabular-nums text-slate-500">
          OUT {trimEndTime}
        </span>
      </div>
    </div>
  );
}
