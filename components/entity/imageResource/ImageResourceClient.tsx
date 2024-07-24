'use client';
import React, { useState, memo } from 'react';
import { observer } from 'mobx-react';
import { DndContext, useDraggable } from '@dnd-kit/core';
import Image from 'next/image';
import { useStores } from '@/store';
import { MagicCard, MagicContainer } from '@/components/magicui/magic-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { FrameIcon, ImageUpIcon, PlusIcon } from 'lucide-react';
import { PopoverClose } from '@radix-ui/react-popover';
import { getUid } from '@/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
interface ImageProps {
  id: string;
  webformatURL: string;
  previewWidth: number;
  previewHeight: number;
}
interface ImageResourceClientProps {
  images: ImageProps[];
}
const DraggableImage: React.FC<{ image: ImageProps; index: number | string }> = memo(
  ({ image, index }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: `imageResource-${index}`,
      data: {
        type: 'image',
        image: image.webformatURL,
        index,
        dragOverlay: () => (
          <Image
            id={`imageResource-${index}`}
            src={image.webformatURL}
            width={130}
            height={100}
            alt={'Draggable image resource'}
            className="h-full w-full cursor-pointer rounded-lg object-contain"
            crossOrigin="anonymous"
          />
        ),
      },
    });
    const style = transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          zIndex: 999,
        }
      : undefined;
    return (
      <div
        draggable="false"
        id={'imageResource-' + index}
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className="p-2"
      >
        <Image
          src={image.webformatURL}
          width={image.previewWidth}
          height={image.previewHeight}
          objectFit="cover"
          alt={'Resource'}
          className="rounded-lg object-fill"
          draggable={false} // It's important to disable the native HTML drag and drop
          crossOrigin="anonymous"
        />
      </div>
    );
  },
);
const PopoverMenu: React.FC<{
  image: ImageProps;
  handleClick: (url: string, isFrame: boolean) => void;
  setIsPopoverOpen: (isOpen: boolean) => void;
}> = memo(({ image, handleClick, setIsPopoverOpen }) => {
  return (
    <div className="absolute z-[99999] flex flex-col items-start gap-2">
      <Label className="flex items-center justify-center gap-x-4">
        Add as Frame
        <Button variant={'outline'} onClick={() => handleClick(image.webformatURL, true)}>
          <ImageUpIcon />
        </Button>
      </Label>
      <Label className="flex items-center justify-center gap-x-4">
        Add as Object in Frame
        <Button variant={'outline'} onClick={() => handleClick(image.webformatURL, false)}>
          <FrameIcon />
        </Button>
      </Label>
      <PopoverClose asChild>
        <Button variant="destructive" onClick={() => setIsPopoverOpen(false)}>
          Close
        </Button>
      </PopoverClose>
    </div>
  );
});
export const ImageResourceClient: React.FC<ImageResourceClientProps> = observer(({ images }) => {
  const store = useStores().editorStore;
  const [selectedImage, setSelectedImage] = useState<ImageProps | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const handleClick = (url: string, isFrame: boolean) => {
    let id: string;
    if (isFrame) {
      id = getUid();
      store.frames.push({
        id,
        src: url,
      });
    } else {
      id = '';
    }
    store.addImage(store.elements.length, url, isFrame, id);
    setIsPopoverOpen(false);
  };
  const openPopover = (image: ImageProps) => {
    setSelectedImage(image);
    setIsPopoverOpen(true);
  };
  return (
    <ScrollArea className=" h-[450px] w-full">
      <MagicContainer
        className={'z-[9999] flex w-full flex-wrap items-center justify-center gap-2'}
      >
        {images.map((image, index) => (
          <MagicCard key={image.id} className="group relative  h-auto w-full max-w-[130px] p-2">
            <div className="absolute left-[20%] top-[20%] translate-x-[-50%] translate-y-[-50%]">
              <Button
                onPointerDown={() => openPopover(image)}
                className="flex h-10 w-10 items-center justify-center p-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                <PlusIcon />
              </Button>
            </div>
            <DraggableImage key={image.id} image={image} index={image.id} />
            <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
          </MagicCard>
        ))}
      </MagicContainer>
      {selectedImage && (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <div />
          </PopoverTrigger>
          <PopoverContent className="fixed left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform flex-col items-start justify-center">
            <PopoverMenu
              image={selectedImage}
              handleClick={handleClick}
              setIsPopoverOpen={setIsPopoverOpen}
            />
          </PopoverContent>
        </Popover>
      )}
    </ScrollArea>
  );
});
