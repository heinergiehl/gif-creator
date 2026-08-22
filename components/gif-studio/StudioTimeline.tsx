'use client';

import * as React from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckSquare2, Copy, GripVertical, Pause, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDuration, getProjectDuration } from '@/components/gif-studio/model';
import type { StudioFrame, StudioProject } from '@/components/gif-studio/types';

function useFrameUrls(frames: StudioFrame[]): Map<string, string> {
  const [urls, setUrls] = React.useState<Map<string, string>>(new Map());

  React.useEffect(() => {
    const next = new Map(frames.map((frame) => [frame.id, URL.createObjectURL(frame.blob)]));
    setUrls(next);
    return () => next.forEach((url) => URL.revokeObjectURL(url));
  }, [frames]);

  return urls;
}

function SortableFrame({
  frame,
  index,
  url,
  selected,
  current,
  onSelect,
}: {
  frame: StudioFrame;
  index: number;
  url?: string;
  selected: boolean;
  current: boolean;
  onSelect: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: frame.id,
  });
  return (
    <button
      ref={setNodeRef}
      type="button"
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={onSelect}
      className={cn(
        'group relative flex h-[86px] w-[112px] shrink-0 flex-col overflow-hidden rounded-md border bg-slate-900 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        selected ? 'border-sky-400/90' : 'border-slate-800 hover:border-slate-600',
        current && 'ring-1 ring-inset ring-white/40',
        isDragging && 'z-20 opacity-60 shadow-2xl',
      )}
      {...attributes}
      {...listeners}
      aria-pressed={selected}
      aria-label={`Frame ${index + 1}, ${frame.durationMs} milliseconds`}
    >
      <span className="relative h-[62px] w-full overflow-hidden bg-slate-950">
        {url ? (
          // Frame thumbnails use local object URLs and cannot use Next's image optimizer.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-contain" draggable={false} />
        ) : null}
        <span className="absolute left-1 top-1 flex h-5 min-w-5 items-center justify-center rounded bg-black/70 px-1 font-mono text-[10px] text-white">
          {index + 1}
        </span>
        <GripVertical
          className="absolute right-1 top-1 h-4 w-4 text-white/70 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          aria-hidden="true"
        />
      </span>
      <span className="flex flex-1 items-center justify-between px-2 font-mono text-[10px] text-slate-400">
        <span>{frame.durationMs} ms</span>
        {selected ? (
          <span className="h-1.5 w-1.5 rounded-full bg-sky-300" aria-hidden="true" />
        ) : null}
      </span>
    </button>
  );
}

export function StudioTimeline({
  project,
  selectedIds,
  currentFrameIndex,
  currentTimeMs,
  playing,
  onPlayingChange,
  onSeek,
  onSelectionChange,
  onReorder,
  onDuplicate,
  onDelete,
}: {
  project: StudioProject;
  selectedIds: Set<string>;
  currentFrameIndex: number;
  currentTimeMs: number;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
  onSeek: (timeMs: number) => void;
  onSelectionChange: (ids: Set<string>) => void;
  onReorder: (activeId: string, overId: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const urls = useFrameUrls(project.frames);
  const lastAnchorRef = React.useRef<number | null>(null);
  const duration = getProjectDuration(project);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over && event.active.id !== event.over.id) {
      onReorder(String(event.active.id), String(event.over.id));
    }
  };

  const selectFrame = (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    const id = project.frames[index].id;
    const additive = event.metaKey || event.ctrlKey;
    if (event.shiftKey && lastAnchorRef.current !== null) {
      const start = Math.min(lastAnchorRef.current, index);
      const end = Math.max(lastAnchorRef.current, index);
      const range = project.frames.slice(start, end + 1).map((frame) => frame.id);
      onSelectionChange(new Set(additive ? [...selectedIds, ...range] : range));
    } else if (additive) {
      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onSelectionChange(next);
      lastAnchorRef.current = index;
    } else {
      onSelectionChange(new Set([id]));
      lastAnchorRef.current = index;
    }
    const startMs = project.frames
      .slice(0, index)
      .reduce((total, frame) => total + frame.durationMs, 0);
    onSeek(startMs);
  };

  return (
    <section
      aria-label="Frame timeline"
      className="flex h-[176px] shrink-0 flex-col border-t border-slate-800 bg-slate-950 text-slate-100"
    >
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-slate-800 px-3">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => onPlayingChange(!playing)}
          className="h-8 w-8 text-slate-300"
          aria-label={playing ? 'Pause preview' : 'Play preview'}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <span className="w-[92px] font-mono text-[11px] tabular-nums text-slate-400">
          {formatDuration(currentTimeMs)} / {formatDuration(duration)}
        </span>
        <input
          type="range"
          min={0}
          max={Math.max(1, duration)}
          step={10}
          value={Math.min(currentTimeMs, duration)}
          onChange={(event) => onSeek(Number(event.target.value))}
          className="min-w-0 flex-1 accent-sky-400"
          aria-label="Animation playhead"
        />
        <span className="hidden text-xs text-slate-500 sm:inline">
          {project.frames.length} frames
        </span>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => onSelectionChange(new Set(project.frames.map((frame) => frame.id)))}
          className="h-8 w-8 text-slate-400"
          aria-label="Select all frames"
        >
          <CheckSquare2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onDuplicate}
          disabled={selectedIds.size === 0}
          className="h-8 w-8 text-slate-400"
          aria-label="Duplicate selected frames"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onDelete}
          disabled={selectedIds.size === 0 || selectedIds.size >= project.frames.length}
          className="h-8 w-8 text-slate-400 hover:text-red-300"
          aria-label="Delete selected frames"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={project.frames.map((frame) => frame.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex min-w-max gap-2 p-3">
              {project.frames.map((frame, index) => (
                <SortableFrame
                  key={frame.id}
                  frame={frame}
                  index={index}
                  url={urls.get(frame.id)}
                  selected={selectedIds.has(frame.id)}
                  current={currentFrameIndex === index}
                  onSelect={(event) => selectFrame(index, event)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
