import { useDroppable, useDndContext } from '@dnd-kit/core';
import { cn } from '@/utils/cn';
import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/store';
import { Plus } from 'lucide-react';
interface DroppableProps {
  children: React.ReactNode;
  id: string;
  index: number;
  className: string;
  style?: React.CSSProperties;
}

/** Animated insertion indicator shown between frames during external drag */
const InsertionIndicator = () => (
  <div className="flex h-full w-10 flex-shrink-0 items-center justify-center">
    <div className="relative flex h-full items-center justify-center">
      {/* Vertical line */}
      <div className="h-[80%] w-[3px] animate-pulse rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
      {/* Plus badge */}
      <div className="absolute flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 shadow-lg">
        <Plus className="h-3 w-3 text-white" strokeWidth={3} />
      </div>
    </div>
  </div>
);

const Droppable: React.FC<DroppableProps> = observer(({ children, id, index, className, style }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: String(id),
    data: {
      type: 'Frame',
    },
  });
  const store = useStores().editorStore;
  const active = useDndContext().active;
  const isExternalDrag = !!active && String(active.id).includes('Resource');

  // insertIndex is a slot: 0 = before first frame, 1 = after first frame, etc.
  const insertIdx = store.insertIndex ?? -1;
  // Show indicator on left side when insertIndex equals this frame's index
  const showLeftIndicator = isExternalDrag && insertIdx === index;
  // Show indicator on right side when insertIndex equals index + 1
  const showRightIndicator = isExternalDrag && insertIdx === index + 1;

  return (
    <div className="flex items-center" ref={setNodeRef}>
      {/* Left insertion indicator (only for inserting before first frame) */}
      {showLeftIndicator && index === 0 && <InsertionIndicator />}
      <div
        data-id={id}
        style={{
          ...style,
          transition: 'transform 0.2s',
        }}
        className={cn([
          isOver && !isExternalDrag
            ? 'ring-2 ring-blue-400/60'
            : '',
          'transition-all duration-200 ease-in-out',
          className,
        ])}
      >
        {children}
      </div>
      {/* Right insertion indicator */}
      {showRightIndicator && <InsertionIndicator />}
    </div>
  );
});
export default Droppable;
