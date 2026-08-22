'use client';

import * as React from 'react';
import { LoaderCircle, Move } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StudioOverlay, StudioProject, StudioTool } from '@/components/gif-studio/types';
import { drawStudioFrame } from '@/lib/gif-studio-engine';

interface Size {
  width: number;
  height: number;
}

function useElementSize(ref: React.RefObject<HTMLElement | null>): Size {
  const [size, setSize] = React.useState<Size>({ width: 900, height: 600 });

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => {
      const rect = element.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

export function StudioStage({
  project,
  frameIndex,
  currentTimeMs,
  activeTool,
  selectedOverlay,
  isBusy,
  onOverlayMove,
}: {
  project: StudioProject;
  frameIndex: number;
  currentTimeMs: number;
  activeTool: StudioTool;
  selectedOverlay: StudioOverlay | null;
  isBusy: boolean;
  onOverlayMove: (x: number, y: number) => void;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const bounds = useElementSize(stageRef);
  const drawSequence = React.useRef(0);
  const [renderError, setRenderError] = React.useState('');
  const [dragging, setDragging] = React.useState(false);

  const scale = Math.max(
    0.05,
    Math.min(
      1,
      (bounds.width - 48) / project.canvas.width,
      (bounds.height - 48) / project.canvas.height,
    ),
  );
  const displayWidth = Math.max(1, Math.round(project.canvas.width * scale));
  const displayHeight = Math.max(1, Math.round(project.canvas.height * scale));
  const canMoveOverlay =
    Boolean(selectedOverlay) && ['text', 'redact', 'annotate', 'demo'].includes(activeTool);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sequence = ++drawSequence.current;
    setRenderError('');
    void drawStudioFrame(canvas, project, frameIndex, currentTimeMs, { preview: true }).catch(
      (error: unknown) => {
        if (sequence !== drawSequence.current) return;
        setRenderError(
          error instanceof Error ? error.message : 'The frame preview could not render.',
        );
      },
    );
  }, [currentTimeMs, frameIndex, project]);

  const moveFromPointer = React.useCallback(
    (clientX: number, clientY: number) => {
      if (!canMoveOverlay || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      onOverlayMove(Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
    },
    [canMoveOverlay, onOverlayMove],
  );

  return (
    <div
      ref={stageRef}
      className="relative flex h-full min-h-[280px] w-full items-center justify-center overflow-hidden bg-[#090d14] p-6"
    >
      <div
        className="relative shrink-0 overflow-hidden rounded-sm shadow-2xl shadow-black/40 ring-1 ring-white/10"
        style={{ width: displayWidth, height: displayHeight }}
      >
        <div className="gif-checkerboard absolute inset-0" aria-hidden="true" />
        <canvas
          ref={canvasRef}
          tabIndex={canMoveOverlay ? 0 : -1}
          aria-label={`Preview of frame ${frameIndex + 1} of ${project.frames.length}`}
          className={cn(
            'relative block h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400',
            canMoveOverlay ? 'cursor-move touch-none' : 'cursor-default',
          )}
          onPointerDown={(event) => {
            if (!canMoveOverlay) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
            moveFromPointer(event.clientX, event.clientY);
          }}
          onPointerMove={(event) => {
            if (dragging) moveFromPointer(event.clientX, event.clientY);
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
            setDragging(false);
          }}
          onKeyDown={(event) => {
            if (!selectedOverlay) return;
            const step = event.shiftKey ? 5 : 1;
            const delta = {
              ArrowLeft: [-step, 0],
              ArrowRight: [step, 0],
              ArrowUp: [0, -step],
              ArrowDown: [0, step],
            }[event.key];
            if (!delta) return;
            event.preventDefault();
            onOverlayMove(
              Math.max(0, Math.min(100, selectedOverlay.x + delta[0])),
              Math.max(0, Math.min(100, selectedOverlay.y + delta[1])),
            );
          }}
        />
        {selectedOverlay && canMoveOverlay ? (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 border border-sky-300/80 outline outline-1 outline-black/50"
            style={{
              left: `${selectedOverlay.x}%`,
              top: `${selectedOverlay.y}%`,
              width: `${selectedOverlay.width}%`,
              height: `${selectedOverlay.height}%`,
              transform: `translate(-50%, -50%) rotate(${selectedOverlay.rotation}deg)`,
            }}
            aria-hidden="true"
          >
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-sky-300 text-slate-950">
              <Move className="h-2.5 w-2.5" />
            </span>
          </div>
        ) : null}
      </div>

      {renderError ? (
        <div
          role="alert"
          className="absolute bottom-5 left-1/2 max-w-md -translate-x-1/2 rounded-md border border-red-500/30 bg-red-950/90 px-4 py-3 text-center text-xs text-red-200"
        >
          {renderError}
        </div>
      ) : null}

      {isBusy ? (
        <div
          className="absolute inset-0 flex items-center justify-center bg-slate-950/55 backdrop-blur-[1px]"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 rounded-md border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-200 shadow-xl">
            <LoaderCircle className="h-4 w-4 animate-spin text-sky-300" aria-hidden="true" />
            Updating animation…
          </div>
        </div>
      ) : null}
    </div>
  );
}
