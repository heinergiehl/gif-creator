import React, { Suspense, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/store';
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
    const handleImageLoad = () => {
      setImageLoaded(true);
    };
    const handleImageError = () => {
      console.log(`Failed to load image: ${id}`);
    };
    const store = useStores().editorStore;
    return (
      <div
        key={id}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn([
          'flex  w-full  cursor-pointer  select-none items-center justify-center p-0 transition-colors duration-200  ease-in-out ',
        ])}
        onPointerDown={() => onFrameSelect(id)}
        onMouseEnter={() => onMouseEnter(index)}
        onMouseLeave={onMouseLeave}
      >
        <Card className="relative flex  h-full w-full items-center justify-center rounded-lg">
          <div
            className={cn([
              'group absolute inset-0 h-full w-full  rounded-lg opacity-50 transition-all duration-300  dark:hover:bg-slate-700',
              isSelected && 'border-2 border-accent-foreground bg-slate-600 dark:bg-slate-900',
            ])}
          >
            <span
              className={cn([
                'absolute text-xs opacity-0 transition-opacity duration-500 group-hover:opacity-100',
              ])}
            >{`${index + 1}`}</span>
          </div>
          <CardContent className="flex   items-center justify-center  rounded-lg p-0  ">
            <Suspense fallback={<SkeletonLoader />}>
              <Image
                className="h-[70px] w-[70px] rounded-lg"
                loading="eager"
                src={src}
                alt={`Frame ${index + 1}`}
                id={id}
                width={70}
                height={70}
                style={{
                  display: imageLoaded ? 'block' : 'none',
                }}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="skeleton-loader h-[70px] w-[70px] animate-pulse rounded-lg bg-gray-300"></div>
              )}
              <Button
                variant={'outline'}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onFrameDelete(index);
                }}
                className={cn([
                  'absolute right-1 top-1 z-20 m-0 h-5 w-5 rounded-full p-0 transition duration-500',
                ])}
              >
                <XIcon size={10} />
              </Button>
            </Suspense>
          </CardContent>
        </Card>
      </div>
    );
  },
);
export default React.memo(SortableItem);
const SkeletonLoader = () => (
  <div className="skeleton-loader h-[80px] w-[120px] animate-pulse rounded-lg bg-gray-300"></div>
);
