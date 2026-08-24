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
import { ImagePlus, Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomProgress } from '@/components/ui/CustomProgress';
import { MediaImportStatusCard } from '@/components/entity/media/MediaImportStatusCard';
import { getUid } from '@/utils';
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
  const [query, setQuery] = useState('');
  const [imageType, setImageType] = useState('vector');
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    store.setProgressState({
      active: true,
      stage: 'optimizing',
      title: 'Preparing images',
      message: 'Compressing and loading your images for drag-and-drop editing…',
      conversion: 5,
      rendering: 0,
    });

    const importedImages: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });

        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
              return;
            }
            reject(new Error('Failed to read image file as data URL'));
          };
          reader.onerror = () => reject(reader.error ?? new Error('Failed to read image file'));
          reader.readAsDataURL(compressedFile);
        });

        importedImages.push(dataUrl);
        const progress = ((i + 1) / files.length) * 100;
        store.setProgressState({
          conversion: progress,
          rendering: progress,
          message: `Loaded ${i + 1} of ${files.length} images into your resource tray…`,
        });
      }

      store.appendImageResources(importedImages);

      // ── Auto-create frames when none exist yet ──────────────────
      const hasNoFrames = store.frames.length === 0 && store.elements.length === 0;
      if (hasNoFrames && importedImages.length > 0) {
        const newFrames = importedImages.map((src) => ({ id: getUid(), src }));
        store.appendFrames(newFrames);
        store.setProgressState({
          active: false,
          stage: 'ready',
          title: 'GIF started!',
          message:
            importedImages.length === 1
              ? '1 image was added as your first frame. Add more to build your GIF!'
              : `${importedImages.length} images were added as frames. Edit, reorder, and add overlays!`,
          conversion: 100,
          rendering: 100,
        });
      } else {
        store.setProgressState({
          active: false,
          stage: 'ready',
          title: 'Images ready',
          message:
            importedImages.length === 1
              ? '1 image is ready to drag onto the canvas.'
              : `${importedImages.length} images are ready to drag onto the canvas.`,
          conversion: 100,
          rendering: 100,
        });
      }
    } catch (error) {
      console.error('Error compressing image:', error);
      store.setProgressState({
        active: false,
        stage: 'error',
        title: 'Image import failed',
        message: 'One or more images could not be prepared. Please try again with smaller files or a different format.',
        conversion: 0,
        rendering: 0,
      });
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
    store.removeImageResourceAt(index);
    // check if it has been added as element already, if so, remove it as well
  };
  const isImporting = store.progress.active;
  const showReadyMessage = !isImporting && store.progress.stage === 'ready' && store.progress.message;
  const hasFrames = store.frames.length > 0;
  const active = useDndContext().active;
  return (
    <ScrollArea className={cn('h-screen w-full bg-slate-300 dark:bg-slate-900 ')} draggable="false">
      <div className="flex max-h-[450px]  w-full flex-col space-y-2 ">
        <div className="flex h-[42px] w-full items-center justify-center text-sm font-medium ">
          Images
        </div>
        {!hasFrames && !isImporting && (
          <div className="w-full px-4">
            <Button
              onClick={() => store.addBlankFrame()}
              variant="outline"
              className="w-full gap-1.5 border-dashed text-sm"
            >
              <Plus className="h-4 w-4" /> Start with blank frame
            </Button>
          </div>
        )}
        <div className="flex w-full flex-col items-center px-4">
          <MediaImportStatusCard
            title={isImporting ? store.progress.title || 'Preparing images' : 'Upload images'}
            description={
              isImporting
                ? store.progress.message || 'Loading images…'
                : 'PNG, JPG, WebP, AVIF, GIF — drag onto canvas or timeline'
            }
            icon={isImporting ? Loader2 : ImagePlus}
            iconClassName={isImporting ? 'animate-spin text-blue-500' : 'text-emerald-500'}
          />
        </div>
        <div className="w-full px-4">
          {!isImporting && <CustomInputFile onChange={handleImageChange} type="image" />}
        </div>
        <div className="px-4">{(isImporting || showReadyMessage) && <CustomProgress />}</div>
        <Separator orientation={'horizontal'} className="w-full" />
        {fileUploadScrollAreaHeight < 200 && (
          <div style={{}} className={`flex h-full  w-[95%]`} ref={magicContainerRef}>
            <MagicContainer
              id="magic-container"
              className={`h-[${fileUploadScrollAreaHeight}px] group relative flex  flex-wrap items-stretch justify-center  gap-2`}
            >
              {store.images.map((image, index) => (
                <MagicCard key={index} className="relative z-[9999]  h-[100px] max-w-[130px] p-1">
                  <button
                    onClick={() => handleDeleteImage(index)}
                    className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800/70 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-red-500 group-hover:opacity-100"
                    title="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
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
                <MagicCard key={index} className="group/card relative  h-[100px] max-w-[130px] p-1">
                  <button
                    onClick={() => handleDeleteImage(index)}
                    className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800/70 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-red-500 group-hover/card:opacity-100"
                    title="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
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
        <Label className="flex flex-col gap-y-3">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-300">Search online</div>
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
