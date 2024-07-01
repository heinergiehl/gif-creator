import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/utils/cn';
const CarouselDroppable = ({
  children,
  id,
  className = '',
  style = {},
}: {
  children: React.ReactNode;
  id: string;
  className?: string;
  style?: React.CSSProperties;
}) => {
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
        isOver ? 'border-4 border-blue-500' : 'border-4 border-transparent',
        'transition-colors duration-200 ease-in-out',
        className,
      ])}
    >
      {children}
    </div>
  );
};
export default CarouselDroppable;
