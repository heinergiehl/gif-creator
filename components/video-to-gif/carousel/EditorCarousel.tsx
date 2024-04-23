'use client';
import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import React from 'react';
import { useStores } from '@/store';
import Timeline from './Timeline';
import {
  useCarouselState,
  useCarouselEffects,
  useFrameSelection,
} from '@/components/video-to-gif/carousel-hooks/hooks';
import CarouselSkeleton from './CarouselSkeleton';
import CarouselButton from './CarouselButton';
import { CSS } from '@dnd-kit/utilities';
import {
  DndContext,
  useDroppable,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragMoveEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import {
  CarouselItem,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
  Carousel,
  CarouselApi,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
gsap.registerPlugin(ScrollToPlugin);
interface EditorCarouselProps {
  containerWidth: number;
}
export const EditorCarousel = observer(({ containerWidth }: EditorCarouselProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'carousel',
  });
  const store = useStores().editorStore;
  const editorCarouselStore = useStores().editorCarouselStore;
  const animationStore = useStores().animationStore;
  gsap.registerPlugin(ScrollToPlugin);
  const handleSelectFrame = (index: number) => {
    if (index === store.currentKeyFrame) return;
    if (index < 0 || index >= store.frames.length) return;
    store.currentKeyFrame = index;
    animationStore.addCurrentGifFrameToCanvas();
  };
  const handleDeleteFrame = (index: number): void => {
    store.deleteFrame(index); // Assuming this method exists on the store
    if (index === store.currentKeyFrame || index === store.frames.length - 1) {
      const newSelectedIndex = (index === 0 ? 0 : index - 1) % store.frames.length;
      store.currentKeyFrame = newSelectedIndex;
    }
  };
  const [api, setApi] = React.useState<CarouselApi>();
  const handleNextFrame = () => {
    if (api) {
      const currentlySelectedFrame = store.currentKeyFrame;
      if (currentlySelectedFrame < store.frames.length) {
        store.currentKeyFrame = currentlySelectedFrame + 1;
        animationStore.addCurrentGifFrameToCanvas();
        api.scrollNext();
      }
    }
  };
  const handlePrevFrame = () => {
    if (api) {
      const currentlySelectedFrame = store.currentKeyFrame;
      if (currentlySelectedFrame > 0) {
        store.currentKeyFrame = currentlySelectedFrame - 1;
        animationStore.addCurrentGifFrameToCanvas();
        api.scrollPrev();
      }
    }
  };
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
      },
    }),
  );
  const frames = store.frames;
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over) {
      const oldIndex = frames.findIndex((frame) => frame.id === active.id);
      const newIndex = frames.findIndex((frame) => frame.id === over.id);
      console.log(oldIndex, newIndex);
      store.currentKeyFrame = oldIndex;
      store.updateFramesOrder(oldIndex, newIndex);
      store.currentKeyFrame = newIndex;
      // animationStore.addCurrentGifFrameToCanvas();
      animationStore.editorStore.canvas.renderAll();
    }
  };
  //while dragging an element out of the carousel, the carousel should scroll
  const handleDragMove = (event: DragMoveEvent) => {
    if (api) {
      const { over, active } = event;
      if (over) {
        const visibleIndexes = api.slidesInView();
        const nonVisibleIndexes = api.slidesNotInView();
        const firstVisibleIndex = visibleIndexes[0];
        const lastVisibleIndex = visibleIndexes[visibleIndexes.length - 1];
        const firstNonVisibleIndex = nonVisibleIndexes[0];
        // calculate the index of the  element where the dragged element is over
        const newIndex = frames.findIndex((frame) => frame.id === over?.id);
        // if the dragged element is over the first visible element, scroll to the left
        if (newIndex === firstVisibleIndex) {
          api.scrollPrev();
        }
        // if the dragged element is over the last visible element, scroll to the right
        if (newIndex === lastVisibleIndex) {
          api.scrollNext();
        }
        // if the dragged element is over the first non visible element, scroll to the left
        if (newIndex === firstNonVisibleIndex) {
          api.scrollPrev();
        }
      }
    }
  };
  // whenever the currently selected frame is out of view, scroll to it. use api to scroll to the selected frame
  useEffect(() => {
    if (api) {
      const visibleIndexes = api.slidesInView();
      const lastVisibleIndex = visibleIndexes[visibleIndexes.length - 1];
      const currentlySelectedFrame = store.currentKeyFrame;
      if (currentlySelectedFrame >= lastVisibleIndex) {
        api.scrollTo(currentlySelectedFrame);
      }
      if (currentlySelectedFrame <= lastVisibleIndex) {
        api.scrollTo(currentlySelectedFrame);
      }
    }
  }, [store.currentKeyFrame, api]);
  // const [carouselWidth, setCarouselWidth] = useState(0);
  // useEffect(() => {
  //   if (api) {
  //     editorCarouselStore.cardItemWidth =
  //       api.containerNode()?.clientWidth / api.slidesInView().length;
  //     editorCarouselStore.cardItemHeight = api.containerNode()?.clientHeight;
  //     setCarouselWidth(api.containerNode()?.clientWidth || 0);
  //   }
  // }, [store.currentKeyFrame, store.frames.length, api]);
  // for dve purpose of carousel populate the carousel with placeholder images by populating the frames array with placeholder images
  // useEffect(() => {
  //   if (frames.length === 0) {
  //     store.frames = Array.from({ length: 14 }, (_, i) => ({
  //       id: i.toString(),
  //       src: 'https://via.placeholder.com/100',
  //     }));
  //   }
  // }, [store.frames.length, store.frames, store.currentKeyFrame, store.currentKeyFrame]);
  const getBasisOfCardItem = () => {
    const carouselWidth = containerWidth - 150;
    if (carouselWidth <= 600) {
      // Small carousel
      return `basis-1/[${(api?.slidesInView() ? api.slidesInView().length : 1) || 1}]`;
    } else if (carouselWidth <= 900) {
      // Medium carousel
      return `basis-1/[${(api?.slidesInView() ? api.slidesInView().length : 2) || 1}]`;
    } else {
      // Large carousel
      return `basis-1/[${(api?.slidesInView() ? api.slidesInView().length : 3) || 1}]`;
    }
  };
  return (
    <div className=" flex flex-col  items-center justify-center gap-y-4">
      <Timeline
        width={containerWidth - 150}
        currentFrame={store.currentKeyFrame}
        onSelectFrame={() => handleSelectFrame(store.currentKeyFrame)}
        totalFrames={store.frames.length}
      />
      <div className="flex flex-col items-start justify-start ">
        <Skeleton className="bg-gray-200 " />
        <Carousel
          style={{
            maxWidth: containerWidth - 150 + 'px',
            minWidth: containerWidth - 150 + 'px',
            minHeight: '120px',
          }}
          ref={setNodeRef}
          setApi={setApi}
          opts={{
            align: 'center',
            dragFree: true,
            watchDrag: false,
          }}
          className="flex   items-start justify-start  rounded-lg bg-gray-400"
          orientation="horizontal"
        >
          <DndContext
            onDragOver={handleDragMove}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={store.frames.map((frame) => frame.id)}>
              <CarouselContent>
                {store.frames.map((frame, index) => (
                  <SortableItem
                    basisOfCardItem={getBasisOfCardItem()}
                    key={index}
                    id={frame.id}
                    src={frame.src}
                    index={index}
                    onFrameSelect={handleSelectFrame}
                    onFrameDelete={handleDeleteFrame}
                    isSelected={index === store.currentKeyFrame}
                  />
                ))}
              </CarouselContent>
            </SortableContext>
          </DndContext>
          <CarouselPrevious onClick={handlePrevFrame} />
          <CarouselNext onClick={handleNextFrame} />
        </Carousel>
      </div>
    </div>
  );
});
interface Frame {
  id: string;
  src: string;
  index: number; // Add index if necessary for handling specific interactions
}
interface SortableItemProps extends Frame {
  onFrameSelect: (index: number) => void;
  onFrameDelete: (index: number) => void;
  basisOfCardItem: string;
  index: number;
  isSelected: boolean;
}
const SortableItem: React.FC<SortableItemProps> = observer(
  ({ id, src, index, onFrameSelect, onFrameDelete, isSelected, basisOfCardItem }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    const store = useStores().editorCarouselStore;
    return (
      <CarouselItem
        key={index}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn([
          'flex h-full  cursor-pointer items-center justify-center p-0 transition-colors duration-200 ease-in-out ',
          basisOfCardItem,
        ])}
        onMouseDown={(e) => {
          e.stopPropagation();
          onFrameSelect(index);
        }}
      >
        <div className="p-1">
          <Card className="relative flex h-full items-center justify-center">
            {isSelected && (
              <div className="absolute inset-0 rounded-lg bg-primary opacity-50 transition-all duration-300"></div>
            )}
            <CardContent className="flex h-full items-center justify-center p-0">
              <Image
                src={src}
                alt={`Frame ${index}`}
                onLoad={(image) => {
                  store.cardItemHeight = image.currentTarget.naturalHeight;
                  store.cardItemWidth = image.currentTarget.naturalWidth;
                }}
                id={id}
                width={100}
                height={100}
                className="min-h-[100px] min-w-[100px] rounded-lg "
              />
              <button
                onMouseDown={(e) => {
                  e.stopPropagation(); // Prevent triggering onSelect when clicking delete
                  onFrameDelete(index);
                }}
                className="absolute right-2 top-2 z-20 text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </CardContent>
          </Card>
        </div>
      </CarouselItem>
    );
  },
);
