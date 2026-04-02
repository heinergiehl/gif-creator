'use client';
import React from 'react';
import { observer } from 'mobx-react';
import { useStores } from '@/store';
import { Button } from '../ui/button';
import { XIcon, Type, ImageIcon, Film, Box, Layers } from 'lucide-react';
import { EditorElement } from '@/types';
import Image from 'next/image';
import { useCanvas } from '@/app/components/canvas/canvasContext';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { CustomTooltip } from '@/app/components/ui/CustomTooltip';

function ElementIcon({ type }: { type: string }) {
  const cls = 'h-3.5 w-3.5 shrink-0 text-slate-400';
  switch (type) {
    case 'text': return <Type className={cls} />;
    case 'image': return <ImageIcon className={cls} />;
    case 'video': return <Film className={cls} />;
    default: return <Box className={cls} />;
  }
}

const ElementsHistoryPanel = observer(() => {
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const canvasRef = useCanvas().canvasRef;

  const handleRemove = (elementId: string) => {
    store.removeElement(elementId);
    const objectToRemove = canvasRef.current
      ?.getObjects()
      .find((obj) => obj.id === elementId);
    if (!objectToRemove) return;
    canvasRef.current?.remove(objectToRemove);
    canvasRef.current?.renderAll();
  };

  return (
    <div className="flex w-full flex-col" id="history">
      <div className="flex h-[42px] items-center justify-center border-b border-slate-200 dark:border-slate-800">
        <span className="text-sm font-medium">Objects</span>
      </div>
      <ScrollArea className="h-screen">
        <div className="flex flex-col gap-1 p-3">
          {store.elementsInCurrentFrame?.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Box className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              <span className="text-xs text-slate-400 dark:text-slate-500">
                No objects in this frame
              </span>
            </div>
          )}
          {store.elementsInCurrentFrame?.map((element) => (
            <div
              key={element.id}
              onClick={() => store.setSelectedElements([element.id])}
              className={cn(
                'group flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 transition-all',
                store.selectedElements.includes(element)
                  ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/40'
                  : 'border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800/50',
              )}
            >
              {/* Preview */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                <Content element={element} />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <ElementIcon type={element.type} />
                  <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
                    {element.name || element.type}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <CustomTooltip content="Delete">
                  <Button
                    variant="ghost"
                    className="h-6 w-6 rounded-full p-0 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(element.id);
                    }}
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                </CustomTooltip>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
});
export default ElementsHistoryPanel;

const Content = observer(({ element }: { element: EditorElement }) => {
  switch (element.type) {
    case 'text':
      return (
        <span
          className="max-w-[36px] truncate text-[10px] font-medium text-slate-600 dark:text-slate-300"
          style={{ fontFamily: element.properties.fontFamily }}
        >
          {element.properties.text}
        </span>
      );
    case 'image':
      return <Image src={element.properties.src} height={36} width={36} alt="item" className="object-cover" />;
    default:
      return <Box className="h-4 w-4 text-slate-400" />;
  }
});
