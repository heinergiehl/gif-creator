import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/store';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';
const DraggedImagePreview = observer(({ src }: { src: string }) => {
  const store = useStores().editorCarouselStore;
  return (
    <Card
      className={cn([' pointer-events-none absolute ', 'transition-all duration-300 ease-in-out'])}
    >
      <CardContent className="z-[9999] flex h-full items-center justify-center p-0">
        <Image
          src={src}
          alt={`DragOverlay`}
          id={'DragOverlay'}
          width={80}
          height={80}
          className="min-h-[70px] min-w-[70px]   rounded-lg md:min-h-[100px] md:min-w-[100px]"
        />
      </CardContent>
    </Card>
  );
});
export default DraggedImagePreview;
