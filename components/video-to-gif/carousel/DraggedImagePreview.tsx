import { observer } from 'mobx-react-lite';
import { useStores } from '@/store';
import { cn } from '@/utils/cn';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
const DraggedImagePreview = observer(({ src }: { src: string }) => {
  const store = useStores().editorCarouselStore;
  return (
    <Card
      className={cn([
        'pointer-events-none absolute z-50',
        'transition-all duration-300 ease-in-out',
        'scale-125 opacity-65',
      ])}
    >
      <CardContent className="flex h-full items-center justify-center p-0">
        <Image
          src={src}
          alt={`DragOverlay`}
          onLoad={(image) => {
            store.cardItemHeight = image.currentTarget.naturalHeight;
            store.cardItemWidth = image.currentTarget.naturalWidth;
          }}
          id={'DragOverlay'}
          width={100}
          height={100}
          className="max-h-[100px] min-h-[100px]  min-w-[100px] rounded-lg"
        />
      </CardContent>
    </Card>
  );
});
export default DraggedImagePreview;
