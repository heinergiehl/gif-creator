// allows to add images to a specific gif frame (nested object)
// Compare this snippet from components/panels/TexResourcesPanel.tsx:
'use client';
import React, { Suspense, use, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import Image from 'next/image';
import { useStores } from '@/store';
import { CustomInputFile } from '@/app/components/ui/CustomFileInput';
import { useDraggable } from '@dnd-kit/core';
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
import CardSkeleton from '@/components/video-to-gif/carousel/CardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MagicCard, MagicContainer } from '@/components/magicui/magic-card';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
const DraggableImage = observer(({ image, index }: { image: string; index: number }) => {
  console.log('DRAGGABLEIMAGE', image, index);
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: `imageResource-${index}`,
    data: {
      image,
      index,
      dragOverlay: () => (
        <Image
          id={`imageResource-${index}`}
          src={image}
          width={130}
          height={170}
          alt={'Draggable image resource'}
          className="h-full w-full cursor-pointer rounded-lg object-contain"
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
        width={130}
        height={170}
        alt={'Draggable image resource'}
        className="
            h-full w-full cursor-pointer rounded-lg object-contain
          "
      />
    </div>
  );
});
const ImageResource = observer(() => {
  const [query, setQuery] = useState('smilies');
  const [imageType, setImageType] = useState('vector');
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        store.progress.conversion = 0;
        store.images.push(reader.result as string);
        store.progress.conversion = 100;
      };
    }
  };
  const magicContainerRef = React.useRef<HTMLDivElement>(null);
  const [fileUploadScrollAreaHeight, setFileUploadScrollAreaHeight] = useState(0);
  useEffect(() => {
    if (magicContainerRef.current) {
      setFileUploadScrollAreaHeight(magicContainerRef.current.clientHeight);
    }
    console.log('magicContainerRef.current?.clientHeight', magicContainerRef.current?.clientHeight);
  }, [magicContainerRef.current?.clientHeight]);
  return (
    <>
      <div className="auto h-screen space-y-2 p-4" draggable="false">
        <Label className="flex flex-col items-center justify-center gap-y-4">
          Upload Images
          <CustomInputFile onChange={handleImageChange} type="image" />
        </Label>
        <ScrollArea
          className={cn([
            ' max-h-[450px] w-full overflow-y-auto overflow-x-hidden',
            fileUploadScrollAreaHeight > 450 ? 'h-[450px] ' : '',
          ])}
          id="scroll-area"
        >
          <MagicContainer
            id="magic-container"
            className={'group relative flex flex-wrap  items-stretch justify-center gap-2'}
          >
            {store.images.map((image, index) => (
              <MagicCard key={index} className="h-auto w-full max-w-[130px] p-1">
                <DraggableImage image={image} index={index} />
                <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
              </MagicCard>
            ))}
          </MagicContainer>
        </ScrollArea>
        <Separator orientation={'horizontal'} className="w-full" />
        <div className="flex flex-col items-center justify-center space-y-4">
          <Label className="flex flex-col gap-y-4">
            <div> Search for Images online</div>
            <div className="flex gap-x-4">
              <CustomTextInput
                value={query}
                onChange={(value) => setQuery(value)}
                name="search"
                inputTooltip='Search for images like "smilies" or "cats"'
              />
              <Select value={imageType} onValueChange={(value) => setImageType(value)}>
                <SelectTrigger className="w-[180px]">
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
          <div className="flex gap-x-4"></div>
          <ImageSearchSuspended query={query} imageType={imageType} />
        </div>
      </div>
    </>
  );
});
const Fallback = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      {Array.from({ length: 100 }).map((_, index) => (
        <Skeleton key={index} className="h-20 max-w-[130px]" />
      ))}
    </div>
  );
};
export default ImageResource;
