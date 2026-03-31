import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/utils/cn';
import { observer } from 'mobx-react-lite';
import { Plus } from 'lucide-react';

const CarouselDroppable: React.FC = observer(() => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'carousel-container',
    data: {
      type: 'Frame',
    },
  });
  return (
    <div
      ref={setNodeRef}
      className={cn([
        'absolute inset-0 flex items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200',
        isOver
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-slate-400/50 bg-transparent dark:border-slate-600/50',
      ])}
    >
      <div
        className={cn([
          'flex items-center gap-2 text-sm transition-colors',
          isOver
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-slate-400 dark:text-slate-500',
        ])}
      >
        <Plus className="h-4 w-4" />
        <span className="font-medium">
          {isOver ? 'Drop here to add frame' : 'Drag frames here'}
        </span>
      </div>
    </div>
  );
});
export default CarouselDroppable;
