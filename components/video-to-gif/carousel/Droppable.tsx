import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/utils/cn';
import React from 'react';
import { observer } from 'mobx-react-lite';
interface DroppableProps {
  children: React.ReactNode;
  id: string;
  className: string;
  style?: React.CSSProperties;
}
const Droppable: React.FC<DroppableProps> = observer(({ children, id, className, style }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: String(id),
    data: {
      type: 'Frame',
    },
  });
  return (
    <div
      data-id={id}
      style={style}
      ref={setNodeRef}
      className={cn([
        isOver ? 'border-r-8 border-blue-500' : 'border-r-4 border-transparent',
        'transition-colors duration-200 ease-in-out',
        className,
      ])}
    >
      {children}
    </div>
  );
});
export default Droppable;
