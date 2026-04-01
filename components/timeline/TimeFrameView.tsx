'use client';
import React, { useCallback } from 'react';
import { EditorElement } from '@/types';
import { observer } from 'mobx-react';
import DragableView from './DraggableView';
import { useStores } from '@/store';
import { useCanvas } from '@/app/components/canvas/canvasContext';
import { Button } from '../ui/button';
import { Trash2, Type, ImageIcon, Film, Music, Box } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { CustomTooltip } from '@/app/components/ui/CustomTooltip';

/** Icon for the element type */
function ElementTypeIcon({ type }: { type: string }) {
  const cls = 'h-3 w-3 shrink-0 opacity-70';
  switch (type) {
    case 'text':
      return <Type className={cls} />;
    case 'image':
      return <ImageIcon className={cls} />;
    case 'video':
      return <Film className={cls} />;
    case 'audio':
      return <Music className={cls} />;
    default:
      return <Box className={cls} />;
  }
}

export const TimeFrameView = observer((props: { element: EditorElement }) => {
  const store = useStores().editorStore;
  const rootStore = useStores();
  const timelineStore = useStores().timelineStore;
  const { element } = props;

  const framesTotal = store.frames.length;
  const timeFrame = element.timeFrame;
  const maxTime = store.maxTime;
  const timePerFrame = maxTime / framesTotal;
  const frameNumberStart = Math.round(timeFrame.start / timePerFrame) + 1;
  const frameNumberEnd = Math.round(timeFrame.end / timePerFrame);

  const disabled = element.type === 'audio';
  const isSelected = store.selectedElements.includes(element);
  const disabledCursor = disabled ? 'cursor-not-allowed' : 'cursor-ew-resize';

  const handleRemove = useCallback(() => {
    store.removeElement(element.id);
  }, [store, element.id]);

  return (
    <div
      onClick={() => store.setSelectedElements([element.id])}
      key={element.id}
      className={cn(
        'group relative my-0.5 flex h-7 overflow-hidden rounded-md transition-colors',
        isSelected
          ? 'bg-indigo-100 ring-1 ring-indigo-500 dark:bg-indigo-950/40 dark:ring-indigo-400'
          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700',
      )}
    >
      {/* ── Start handle ── */}
      <DragableView
        className="z-10"
        value={element.timeFrame.start}
        total={store.maxTime}
        disabled={disabled}
        onChange={(value) => {
          const minSpan = timePerFrame || 1;
          const clamped = Math.min(value, element.timeFrame.end - minSpan);
          rootStore.setRerunUseManageFabricObjects(true);
          timelineStore.updateEditorElementTimeFrame(element, { start: Math.max(0, clamped) });
        }}
      >
        <div
          className={cn(
            'absolute top-1/2 h-5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors',
            disabled
              ? 'cursor-not-allowed bg-slate-300 dark:bg-slate-600'
              : 'cursor-ew-resize bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-400 dark:hover:bg-indigo-300',
          )}
        />
      </DragableView>

      {/* ── Body (draggable range) ── */}
      <DragableView
        className={disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
        value={element.timeFrame.start}
        disabled={disabled}
        style={{
          width: `${((element.timeFrame.end - element.timeFrame.start) / store.maxTime) * 100}%`,
          minWidth: '40px',
        }}
        total={store.maxTime}
        onChange={(value) => {
          const { start, end } = element.timeFrame;
          rootStore.setRerunUseManageFabricObjects(true);
          timelineStore.updateEditorElementTimeFrame(element, {
            start: value,
            end: value + (end - start),
          });
        }}
      >
        <div
          className={cn(
            'flex h-full min-w-0 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium leading-7 transition-colors',
            isSelected
              ? 'bg-indigo-500 text-white dark:bg-indigo-600'
              : 'bg-slate-400 text-white dark:bg-slate-600',
          )}
        >
          {/* Frame start */}
          <span className="shrink-0 tabular-nums opacity-80">{frameNumberStart}</span>

          {/* Type icon */}
          <ElementTypeIcon type={element.type} />

          {/* Element preview or name */}
          {element.dataUrl ? (
            <Image
              src={element.dataUrl}
              alt=""
              width={18}
              height={18}
              className="shrink-0 rounded-sm object-cover"
            />
          ) : null}
          <span className="min-w-0 flex-1 truncate">{element.name}</span>

          {/* Delete button with hotkey tooltip */}
          <CustomTooltip content="Delete (Del)">
            <Button
              variant="ghost"
              className="m-0 h-5 w-5 shrink-0 rounded-full p-0 text-white/80 opacity-0 transition-opacity hover:bg-red-500/80 hover:text-white group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </CustomTooltip>

          {/* Frame end */}
          <span className="shrink-0 tabular-nums opacity-80">{frameNumberEnd}</span>
        </div>
      </DragableView>

      {/* ── End handle ── */}
      <DragableView
        className="z-10"
        disabled={disabled}
        value={element.timeFrame.end}
        total={store.maxTime}
        onChange={(value) => {
          const minSpan = timePerFrame || 1;
          const clamped = Math.max(value, element.timeFrame.start + minSpan);
          rootStore.setRerunUseManageFabricObjects(true);
          timelineStore.updateEditorElementTimeFrame(element, { end: Math.min(store.maxTime, clamped) });
        }}
      >
        <div
          className={cn(
            'absolute top-1/2 h-5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors',
            disabled
              ? 'cursor-not-allowed bg-slate-300 dark:bg-slate-600'
              : 'cursor-ew-resize bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-400 dark:hover:bg-indigo-300',
          )}
        />
      </DragableView>
    </div>
  );
});
