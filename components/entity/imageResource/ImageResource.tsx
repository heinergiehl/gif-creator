'use client';
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import Image from 'next/image';
import { useStores } from '@/store';
import { CustomInputFile } from '@/app/components/ui/CustomFileInput';
import { DragOverlay, useDndContext, useDraggable } from '@dnd-kit/core';
import { ImageSearchSuspended } from './ImageSearch';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CustomTextInput from '@/app/components/ui/CustomTextInput';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MagicCard, MagicContainer } from '@/components/magicui/magic-card';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import imageCompression from 'browser-image-compression';
import ShinyButton from '@/components/magicui/shiny-button';
import { DeleteIcon, LucideDelete, RemoveFormattingIcon, Trash2Icon } from 'lucide-react';
const DraggableImage = observer(({ image, index }: { image: string; index: number }) => {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: `imageResource-${index}`,
    data: {
      image,
      index,
      dragOverlay: () => (
        <Image
          id={`imageResource-${index}`}
          src={image}
          height={60}
          width={80}
          alt={'Draggable image resource'}
          className=" cursor-pointer rounded-lg "
        />
      ),
    },
  });
  const style = transform
    ? {
        zIndex: isDragging ? 999 : undefined,
      }
    : undefined;
  return (
    <div
      draggable="false"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="h-full w-full"
    >
      <Image
        id={`imageResource-${index}`}
        src={image}
        width={80}
        height={60}
        alt={'Draggable image resource'}
        className="h-full w-full cursor-pointer rounded-lg object-contain"
      />
    </div>
  );
});
const ImageResource = observer(() => {
  const [query, setQuery] = useState('smilies');
  const [imageType, setImageType] = useState('vector');
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 0.5, // Maximum file size
          maxWidthOrHeight: 1024, // Maximum width or height
          useWebWorker: true,
        });
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onloadend = () => {
          store.progress.conversion = 0;
          store.images.push(reader.result as string);
          store.progress.conversion = 100;
        };
      } catch (error) {
        console.error('Error compressing image:', error);
      }
    }
  };
  const magicContainerRef = React.useRef<HTMLDivElement>(null);
  const [fileUploadScrollAreaHeight, setFileUploadScrollAreaHeight] = useState(0);
  useEffect(() => {
    // height of magContainerRef.current based on the number of children
    let overAllHeight = 0;
    if (magicContainerRef.current) {
      const height = magicContainerRef.current?.offsetHeight;
      if (height < 200) magicContainerRef.current.style.height = 'auto';
      setFileUploadScrollAreaHeight(height);
    }
  }, [
    store.images,
    fileUploadScrollAreaHeight,
    magicContainerRef.current?.offsetHeight,
    magicContainerRef.current?.children.length,
  ]);
  const handleDeleteImage = (index: number) => {
    store.images.splice(index, 1);
    // check if it has been added as element already, if so, remove it as well
  };
  const active = useDndContext().active;
  return (
    <ScrollArea className={cn('h-screen w-full')} draggable="false">
      <div className="flex max-h-[550px]  w-full flex-col space-y-2 ">
        <div className="flex h-[50px] w-full items-center justify-center bg-slate-200 text-sm dark:bg-slate-900">
          Upload Images
        </div>
        <CustomInputFile onChange={handleImageChange} type="image" />
        <Separator orientation={'horizontal'} className="w-full" />
        {fileUploadScrollAreaHeight < 200 && (
          <div style={{}} className={`flex h-full  w-[95%]`} ref={magicContainerRef}>
            <MagicContainer
              id="magic-container"
              className={`h-[${fileUploadScrollAreaHeight}px] group relative flex  flex-wrap items-stretch justify-center  gap-2`}
            >
              {store.images.map((image, index) => (
                <MagicCard key={index} className="relative z-[9999]  h-[100px] max-w-[130px] p-1">
                  <ShinyButton
                    onClick={() => handleDeleteImage(index)}
                    className="right-100 absolute top-0 rounded-full bg-inherit bg-red-500 p-1 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600"
                  >
                    <Trash2Icon className="rounded-full" />
                  </ShinyButton>
                  <DraggableImage image={image} index={index} />
                  <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                </MagicCard>
              ))}
            </MagicContainer>
          </div>
        )}
        {/* if magiccontainerRef higher than 200px, use ScrollArea */}
        {fileUploadScrollAreaHeight >= 200 && store.images.length > 0 && (
          <ScrollArea className="h-[200px]" ref={magicContainerRef}>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {store.images.map((image, index) => (
                <MagicCard key={index} className="relative  h-[100px] max-w-[130px] p-1">
                  <ShinyButton
                    onClick={() => handleDeleteImage(index)}
                    className="right-100 absolute top-0 rounded-full bg-inherit bg-red-500 p-1 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600"
                  >
                    <Trash2Icon className="rounded-full" />
                  </ShinyButton>
                  <DraggableImage image={image} index={index} />
                  <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                </MagicCard>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
      {store.images.length > 0 && <Separator orientation={'horizontal'} className="w-full" />}
      <div className="flex h-full w-full flex-col space-y-4 p-4">
        <Label className="flex flex-col gap-y-4">
          <div> Search for Images online</div>
          <div className="flex gap-x-4">
            <CustomTextInput
              className="min-w-[100px]"
              value={query}
              onChange={(value) => setQuery(value)}
              name="search"
              inputTooltip='Search for images like "smilies" or "cats"'
            />
            <Select value={imageType} onValueChange={(value) => setImageType(value)}>
              <SelectTrigger className="ring-none rounded-none focus:outline-none focus:ring-0">
                <SelectValue placeholder="Select an image type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Image Type</SelectLabel>
                  <SelectItem value="vector">Vector</SelectItem>
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="illustration">Illustration</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </Label>
        <Separator orientation={'horizontal'} className="w-full" />
        <ImageSearchSuspended query={query} imageType={imageType} />
      </div>
    </ScrollArea>
  );
});
export default ImageResource;
