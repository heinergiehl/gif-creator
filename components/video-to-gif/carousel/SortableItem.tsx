import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/store';
interface Frame {
  id: string;
  src: string;
  index?: number;
}
interface SortableItemProps extends Frame {
  onFrameSelect: (id: string, multiSelect?: boolean) => void;
  onFrameDelete: (index: number) => void;
  basisOfCardItem: string;
  index: number;
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
    const [showHoverCard, setShowHoverCard] = useState(false);
    const store = useStores().editorCarouselStore;
    const editorStore = useStores().editorStore;
    return (
      <div
        key={index}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn([
          'flex h-full cursor-pointer select-none items-center justify-center p-0 transition-colors duration-200 ease-in-out',
          basisOfCardItem,
        ])}
        onClick={() => onFrameSelect(id)}
        onMouseEnter={() => onMouseEnter(index)}
        onMouseLeave={onMouseLeave}
      >
        <div className="p-1">
          <Card
            className="relative"
            onMouseEnter={() => setShowHoverCard(true)}
            onMouseLeave={() => setShowHoverCard(false)}
          >
            <div
              className={cn([
                'absolute inset-0 rounded-lg opacity-50 transition-all duration-300 dark:hover:bg-slate-700',
                isSelected && 'border-2 border-accent-foreground bg-slate-600 dark:bg-slate-800',
              ])}
            >
              <span
                className={cn([
                  'absolute text-xs transition-opacity duration-500',
                  showHoverCard ? 'opacity-100' : 'opacity-0',
                ])}
              >{`Frame ${index + 1}/${editorStore.frames.length}`}</span>
            </div>
            <CardContent className="flex h-full items-center justify-center p-0">
              <Image
                src={src}
                alt={`Frame ${index + 1}`}
                onLoad={(image) => {
                  store.cardItemHeight = image.currentTarget.naturalHeight;
                  store.cardItemWidth = image.currentTarget.naturalWidth;
                }}
                id={id}
                width={100}
                height={100}
                className="max-h-[100px] min-h-[100px] min-w-[100px] rounded-lg"
              />
              <Button
                variant={'outline'}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onFrameDelete(index);
                }}
                className={cn([
                  'absolute right-2 top-2 z-20 m-0 h-5 w-5 rounded-full p-0 transition duration-500',
                  showHoverCard ? 'opacity-100' : 'opacity-0',
                ])}
              >
                <XIcon />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  },
);
export default SortableItem;
