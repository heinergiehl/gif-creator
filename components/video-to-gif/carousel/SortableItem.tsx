import React, { Suspense, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, Layers, CopyPlus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/store';
import { CustomTooltip } from '@/app/components/ui/CustomTooltip';
import { getUid } from '@/utils';
interface SortableItemProps {
  id: string;
  src: string;
  index: number;
  onFrameSelect: (id: string, multiSelect?: boolean) => void;
  onFrameDelete: (index: number) => void;
  basisOfCardItem: string;
  isSelected: boolean;
  onMouseEnter: (index: number) => void;
  onMouseLeave: () => void;
}
const SortableItem: React.FC<SortableItemProps> = observer(
  ({
    id,
    src,
    index,
    onFrameSelect,
    onFrameDelete,
    isSelected,
    basisOfCardItem,
    onMouseEnter,
    onMouseLeave,
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    const [imageLoaded, setImageLoaded] = useState(false);
    const store = useStores().editorStore;

    const handleDuplicate = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const frame = store.frames[index];
      if (!frame) return;
      const newId = String(getUid());
      const newFrame = { id: newId, src: frame.src };
      store.frames.splice(index + 1, 0, newFrame);
      store.addImage(index + 1, frame.src, true, newId);
      store.syncFramesTimeline();
    };

    const handleCopyToCanvas = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const frame = store.frames[index];
      if (!frame || store.frames.length === 0) return;
      const newId = String(getUid());
      store.addImage(store.elements.length, frame.src, false, newId);
      store.setSelectedElements([newId]);
    };

    return (
      <div
        key={id}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn([
          'flex w-full cursor-pointer select-none items-center justify-center p-0 transition-colors duration-200 ease-in-out',
        ])}
        onPointerDown={() => onFrameSelect(id)}
        onMouseEnter={() => onMouseEnter(index)}
        onMouseLeave={onMouseLeave}
      >
        <Card className="group relative flex items-center justify-center rounded-md border-0 shadow-sm">
          {/* Selection ring */}
          <div
            className={cn([
              'absolute inset-0 z-10 rounded-md transition-all duration-200',
              isSelected && 'bg-indigo-500/20 ring-2 ring-inset ring-indigo-500',
            ])}
          />

          <CardContent className="flex items-center justify-center rounded-md p-0">
            <Suspense fallback={<SkeletonLoader />}>
              <Image
                className="h-[68px] w-[68px] rounded-md object-cover"
                loading="eager"
                src={src}
                alt={`Frame ${index + 1}`}
                id={id}
                width={68}
                height={68}
                style={{ display: imageLoaded ? 'block' : 'none' }}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && <SkeletonLoader />}
            </Suspense>
          </CardContent>

          {/* ── Hover overlay ── */}
          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-between rounded-md bg-black/0 p-1 opacity-0 transition-all duration-200 group-hover:bg-black/40 group-hover:opacity-100">
            {/* Top: frame number */}
            <span className="self-start rounded bg-black/50 px-1 py-0.5 text-[9px] font-semibold tabular-nums text-white">
              {index + 1}
            </span>

            {/* Bottom: action buttons */}
            <div className="pointer-events-auto flex gap-1">
              <CustomTooltip content="Duplicate frame">
                <Button
                  variant="ghost"
                  className="h-5 w-5 rounded-full bg-white/80 p-0 text-slate-700 shadow-sm hover:bg-white hover:text-indigo-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700"
                  onMouseDown={handleDuplicate}
                >
                  <CopyPlus className="h-3 w-3" />
                </Button>
              </CustomTooltip>
              <CustomTooltip content="Copy as overlay">
                <Button
                  variant="ghost"
                  className="h-5 w-5 rounded-full bg-white/80 p-0 text-slate-700 shadow-sm hover:bg-white hover:text-indigo-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700"
                  onMouseDown={handleCopyToCanvas}
                >
                  <Layers className="h-3 w-3" />
                </Button>
              </CustomTooltip>
              <CustomTooltip content="Delete frame (Del)">
                <Button
                  variant="ghost"
                  className="h-5 w-5 rounded-full bg-white/80 p-0 text-slate-700 shadow-sm hover:bg-red-500 hover:text-white dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-red-500"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onFrameDelete(index);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </CustomTooltip>
            </div>
          </div>
        </Card>
      </div>
    );
  },
);
export default React.memo(SortableItem);
const SkeletonLoader = () => (
  <div className="h-[68px] w-[68px] animate-pulse rounded-md bg-slate-300 dark:bg-slate-700" />
);
