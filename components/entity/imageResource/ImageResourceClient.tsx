'use client';
import React, { useState, memo, useEffect } from 'react';
import { observer } from 'mobx-react';
import { DndContext, DragOverlay, useDndContext, useDraggable } from '@dnd-kit/core';
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
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';
import { Separator } from '@/components/ui/separator';
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
    const { attributes, listeners, setNodeRef, transform, setActivatorNodeRef } = useDraggable({
      id: `imageResource-${index}`,
      data: {
        type: 'image',
        image: image.webformatURL,
        index,
        dragOverlay: () => {
          const style = transform
            ? {
                transform: `translate3d(${transform?.x}px, ${transform?.y}px, 0)`,
                zIndex: 99999,
              }
            : undefined;
          return (
            <Image
              id={`imageResource-${index}`}
              src={image.webformatURL}
              width={80}
              height={80}
              alt={'Draggable image resource'}
              className=" h-[80px] w-[80px] cursor-pointer touch-none rounded-lg object-contain"
              crossOrigin="anonymous"
            />
          );
        },
      },
    });
    const style = transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          zIndex: 99999,
        }
      : undefined;
    const isDragging = transform != null;
    return (
      <div
        id={'imageResource-' + index}
        ref={setNodeRef}
        className="group h-[100px] w-[100px] touch-none bg-gray-100 bg-inherit text-inherit opacity-100 transition-colors duration-500 ease-in-out hover:opacity-100 dark:bg-slate-700 dark:hover:bg-slate-900"
      >
        {/* drag handle, nice looking */}
        <div {...attributes} {...listeners} ref={setActivatorNodeRef} className="relative">
          <Button
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            className={`absolute left-1/2 flex h-4 w-full translate-x-[-50%] items-center justify-center rounded-none transition-opacity duration-300 dark:bg-slate-800 ${
              window.innerWidth < 768 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {/* gray thick div symbolizing drag handle */}
            <div className="h-1 w-6 rounded-lg bg-gray-500" />
          </Button>
        </div>
        <div className="relative m-2 border-b" />
        <div className="flex h-full w-full items-center justify-center">
          <Image
            src={image.webformatURL}
            width={80}
            height={80}
            objectFit="cover"
            alt={'Resource'}
            className=" h-[80px] w-[80px] touch-none rounded-lg object-fill"
            draggable={false} // It's important to disable the native HTML drag and drop
            crossOrigin="anonymous"
          />
        </div>
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
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    console.log('isMobile', isMobile);
  }, [window.innerWidth, isMobile, setIsMobile]);
  const active = useDndContext().active;
  return (
    <ScrollArea className=" h-[450px] w-full">
      <div className={cn(' relative flex flex-wrap items-center justify-center gap-2 ')}>
        {images.map((image, index) => (
          <div key={image.id} className=" h-auto w-full p-2 md:w-[100px]">
            {/* <div className="absolute left-[20%] top-[20%] translate-x-[-50%] translate-y-[-50%]">
              <Button
                onPointerDown={() => openPopover(image)}
                className="flex h-10 w-10 items-center justify-center p-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                <PlusIcon />
              </Button>
            </div> */}
            <DraggableImage key={image.id} image={image} index={image.id} />
          </div>
        ))}
        {createPortal(
          <DragOverlay
            dropAnimation={null}
            style={{
              opacity: 1,
            }}
          >
            {active &&
              (active?.data?.current?.dragOverlay ? active?.data?.current?.dragOverlay() : null)}
          </DragOverlay>,
          document.body,
        )}
      </div>
      {/* {selectedImage && (
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
      )} */}
    </ScrollArea>
  );
});
