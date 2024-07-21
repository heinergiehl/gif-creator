import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/utils/cn';
import { observer } from 'mobx-react-lite';
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
        isOver ? 'border-8 border-blue-500' : 'border-4 border-transparent',
        'transition-colors duration-200 ease-in-out',
        'h-full rounded-lg bg-gray-100 bg-inherit text-inherit dark:bg-slate-900',
        'absolute inset-0',
      ])}
    />
  );
});
export default CarouselDroppable;
