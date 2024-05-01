'use client';
import { useCallback, useState } from 'react';
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
  DragOverlay,
  useDndMonitor,
  useDndContext,
  closestCorners,
  Active,
  rectIntersection,
  DragOverEvent,
  Over,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  rectSwappingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CarouselItem,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
  Carousel,
  CarouselApi,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { getUid } from '@/utils';
import { createPortal } from 'react-dom';
import { set } from 'lodash';
const Droppable = (
  props:
    | {
        children: React.ReactNode;
        className?: string;
        id: string;
        active: Active | null;
      }
    | {
        children: React.ReactNode;
        className?: string;
        id: string;
        active: Active | null;
      },
) => {
  const { isOver, setNodeRef, active } = useDroppable({
    id: String(props.id),
    data: {
      type: 'Frame',
    },
  });
  // make sure to animate the droppable element when the dragged element is over it, so it moves to the left or right
  return (
    <div
      ref={setNodeRef}
      className={cn([
        isOver ? ' border-r-8 border-blue-500' : 'border-r-4 border-transparent',
        'transition-colors duration-200 ease-in-out',
      ])}
    >
      {props.children}
    </div>
  );
};
interface EditorCarouselProps {
  containerWidth: number;
}
export const EditorCarousel = observer(({ containerWidth }: EditorCarouselProps) => {
  const store = useStores().editorStore;
  const animationStore = useStores().animationStore;
  const handleSelectFrame = (index: number) => {
    if (index === store.currentKeyFrame) {
      console.warn('Frame already selected');
      return;
    }
    if (index < 0 || index >= store.frames.length) {
      console.error('Invalid frame index');
      return;
    }
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
  const handleNextFrame = useCallback(() => {
    if (api) {
      const currentlySelectedFrame = store.currentKeyFrame;
      if (currentlySelectedFrame < store.frames.length - 1) {
        store.currentKeyFrame = currentlySelectedFrame + 1;
        api.scrollNext();
        animationStore.addCurrentGifFrameToCanvas();
      }
    }
  }, [api, store.currentKeyFrame, store.frames.length]);
  const handlePrevFrame = useCallback(() => {
    if (api) {
      const currentlySelectedFrame = store.currentKeyFrame;
      if (currentlySelectedFrame > 0) {
        store.currentKeyFrame = currentlySelectedFrame - 1;
        animationStore.addCurrentGifFrameToCanvas();
        api.scrollPrev();
      }
    }
  }, [api, store.currentKeyFrame, store.frames.length]);
  const frames = store.frames;
  // useEffect(() => {
  //   if (api) {
  //     const visibleIndexes = api.slidesInView();
  //     const lastVisibleIndex = visibleIndexes[visibleIndexes.length - 1];
  //     const currentlySelectedFrame = store.currentKeyFrame;
  //     if (currentlySelectedFrame + 1 === lastVisibleIndex) {
  //       api.scrollNext();
  //     }
  //     if (currentlySelectedFrame - 1 === visibleIndexes[0]) {
  //       api.scrollPrev();
  //     }
  //   }
  // }, [store.currentKeyFrame, api, api?.slidesInView()]);
  const getBasisOfCardItem = () => {
    const carouselWidth = containerWidth;
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
  const [hoverIndex, setHoverIndex] = useState(-1);
  const over = useDndContext().over;
  // useEffect(() => {
  //   if (api) {
  //     if (!store.isDragging) return;
  //     const visibleIndexes = api.slidesInView();
  //     if (!visibleIndexes.includes(hoverIndex)) {
  //       // If not visible, scroll to make it visible
  //       api.scrollTo(visibleIndexes[visibleIndexes.length - 1]);
  //     }
  //   }
  // }, [hoverIndex, api]);
  // useeffect auto scroll if current slide not in view
  // useEffect(() => {
  //   if (api) {
  //     api.scrollTo(store.currentKeyFrame);
  //   }
  // }, [store.currentKeyFrame, api]);
  // Attach event listeners to the carousel API
  // useEffect(() => {
  //   if (api) {
  //     const handleSlidesInViewChange = () => {
  //       const visibleIndexes = api.slidesInView();
  //       // Optionally adjust hoverIndex based on some custom logic
  //       setHoverIndex((prev) => {
  //         if (prev === null) return null;
  //         if (visibleIndexes.includes(prev)) return prev;
  //         // If the hoverIndex is not visible, set it to the first visible index
  //         return visibleIndexes[0];
  //       });
  //     };
  //     api.on('slidesInView', handleSlidesInViewChange);
  //     return () => {
  //       // Clean up listener when component unmounts or api changes
  //       api.off('slidesInView', handleSlidesInViewChange);
  //     };
  //   }
  // }, [api, over]);
  const [shiftDirection, setShiftDirection] = useState<'left' | 'right' | null>(null);
  // update frames order, after reordering the frames in the carousel
  // const updateFramesOrder = (active: Active, over: Over | null) => {
  //   const frames = store.frames;
  //   if (frames.length === 0) return;
  //   if (frames.length === 1) return;
  //   if (frames.length === 0) return;
  //   if (active && over) {
  //     let oldIndex = frames.findIndex((frame) => frame.id === active.id);
  //     let newIndex = frames.findIndex((frame) => frame.id === over.id);
  //     if (oldIndex === -1 || newIndex === -1) return;
  //     if (oldIndex === newIndex) return;
  //     //edge case when a dragged element is added , use the shift direction to determine the new index
  //     if (shiftDirection === 'left') {
  //       newIndex = newIndex - 1 === -1 ? 0 : newIndex - 1;
  //     } else if (shiftDirection === 'right') {
  //       newIndex = newIndex === frames.length - 1 ? frames.length - 1 : newIndex;
  //     }
  //     oldIndex = oldIndex === -1 ? 0 : oldIndex;
  //     store.updateFramesOrder(oldIndex, newIndex);
  //     store.currentKeyFrame = newIndex;
  //   }
  //   store.updateEditorElementsForFrames();
  //   animationStore.addCurrentGifFrameToCanvas();
  // };
  useDndMonitor({
    // onDragOver: (event) => {
    //   updateOnDrag(event.over?.rect, event.over.id);
    // },
    onDragOver: (event) => {
      const newIndex = frames.findIndex((frame) => frame.id === event.over?.id);
      updateHoverIndex(newIndex);
    },
    onDragEnd: (e) => {
      store.activeDraggable = null;
      store.isDragging = false;
      // updateFramesOrder(e.active, e.over);
      // animationStore.addCurrentGifFrameToCanvas();
      console.log('drag end', store.currentKeyFrame);
    },
    onDragMove: (event) => {
      const visibleIndexes = api?.slidesInView();
      const firstVisibleIndex = visibleIndexes ? visibleIndexes[0] : 0;
      const activeRect = event.active?.rect.current.translated;
      const firstVisibleRect = api?.slideNodes()[firstVisibleIndex]?.getBoundingClientRect();
      if (activeRect && firstVisibleRect) {
        if (activeRect.left < firstVisibleRect.left) {
          setShiftDirection('left');
        } else if (activeRect.right > firstVisibleRect.right) {
          setShiftDirection('right');
        } else {
          setShiftDirection(null);
        }
      }
    },
  });
  const ctx = useDndContext();
  const active = ctx.active;
  // Function to update hover indices
  const updateHoverIndex = (newIndex: number) => {
    // setHoverIndex(newIndex);
  };
  const calculateTransform = (index: number, hoverIndex: number) => {
    if (!store.isDragging || !ctx.over?.id) return 'translateX(0px)';
    if (shiftDirection === 'right' && index >= hoverIndex) {
      return 'translateX(100%)';
    } else if (shiftDirection === 'left' && index <= hoverIndex) {
      return 'translateX(-100%)';
    }
    return 'translateX(0px)';
  };
  useEffect(() => {
    if (store.frames.length > 0 && store.progress.conversion === 100) {
      // animationStore.addCurrentGifFrameToCanvas();
      console.log('ADDING IMAGES TO CANVAS');
      store.progress.conversion = 0;
    }
  }, [store.frames, store.progress.conversion]);
  // for case that being with the dragged element on the edge of the carousel, we need to scroll to the left or right
  // useEffect(() => {
  //   if (api) {
  //     const activeRect = active?.rect.current.translated;
  //     const carouselRect = document.getElementById('carousel')?.getBoundingClientRect();
  //     const overIndex = over?.id ? store.frames.findIndex((frame) => frame.id === over.id) : -1;
  //     const scrollProgress = api.scrollProgress();
  //     if (activeRect) {
  //       console.log(activeRect.left < carouselRect.left, activeRect.right, carouselRect.right);
  //       if (activeRect.left < carouselRect.left) {
  //         api.scrollTo(api.slidesInView()[0]);
  //         setHoverIndex(api.slidesInView()[0]);
  //         store.currentKeyFrame = api.slidesInView()[0];
  //       } else if (activeRect.right > carouselRect.right) {
  //         api.scrollTo(api.slidesInView()[api.slidesInView().length - 1]);
  //         setHoverIndex(api.slidesInView()[api.slidesInView().length - 1]);
  //         store.currentKeyFrame = api.slidesInView()[api.slidesInView().length - 1];
  //       }
  //     }
  //     console.log('HOVERINDEX', hoverIndex, store.currentKeyFrame, api.slidesInView());
  //   }
  // }, [
  //   active?.rect.current.translated,
  //   api?.slidesInView(),
  //   hoverIndex,
  //   api,
  //   store.currentKeyFrame,
  //   store.frames,
  //   over?.id,
  // ]);
  return (
    <div className="flex flex-col items-center justify-center gap-y-4 px-16">
      <Timeline
        maxWidth={containerWidth}
        minWidth={containerWidth}
        currentFrame={store.currentKeyFrame}
        onSelectFrame={() => handleSelectFrame(store.currentKeyFrame)}
        totalFrames={store.frames.length}
      />
      <div
        className="flex flex-col items-center justify-center "
        style={{
          maxWidth: containerWidth + 'px',
          minWidth: containerWidth + 'px',
          minHeight: '120px',
        }}
      >
        <Carousel
          style={{
            maxWidth: containerWidth + 'px',
            minWidth: containerWidth + 'px',
            minHeight: '120px',
          }}
          setApi={setApi}
          opts={{
            dragFree: true,
            watchDrag: false,
            watchSlides: true,
            watchResize: true,
          }}
          id="carousel"
          className="flex w-full items-start justify-start overflow-hidden rounded-lg bg-muted"
          orientation="horizontal"
        >
          {store.frames.length === 0 && <CarouselDroppable />}
          <CarouselContent
            style={{
              overflowX: 'scroll',
            }}
          >
            <SortableContext
              items={store.frames.map((frame) => frame.id)}
              strategy={rectSortingStrategy}
            >
              {store.frames.map((frame, index) => (
                <Droppable id={frame.id} active={active} key={index}>
                  <div key={index}>
                    <SortableItem
                      basisOfCardItem={getBasisOfCardItem()}
                      id={frame.id}
                      src={frame.src}
                      index={index}
                      onFrameSelect={handleSelectFrame}
                      onFrameDelete={handleDeleteFrame}
                      isSelected={index === store.currentKeyFrame}
                    />
                  </div>
                </Droppable>
              ))}
            </SortableContext>
          </CarouselContent>
          <DragOverlay>
            <DraggedImagePreview
              src={store.frames.find((frame) => frame.id === active?.id)?.src || ''}
            />
          </DragOverlay>
          <div>
            <CarouselPrevious onClick={handlePrevFrame} />
            <CarouselNext onClick={handleNextFrame} />
          </div>
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
    // move sortable item to the left or right when a dragged element is over it
    const active = useDndContext().active;
    const over = useDndContext().over;
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
          active?.id === id ? 'border-4 border-blue-500' : 'border-4 border-transparent',
        ])}
        onMouseDown={(e) => {
          e.stopPropagation();
          onFrameSelect(index);
        }}
      >
        <div className="p-1">
          <Card className="relative flex h-full items-center justify-center">
            {isSelected && (
              <div className="absolute inset-0 rounded-lg bg-slate-600 opacity-50 transition-all duration-300"></div>
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
const DraggedImagePreview = ({ src }: { src: string }) => {
  const active = useDndContext().active;
  return (
    <Card className="m-0 p-0">
      <CardContent className="flex h-full items-center justify-center p-0">
        <Image
          src={src}
          alt="Dragged frame"
          width={100}
          height={100}
          className="min-h-[100px] min-w-[100px] "
        />
      </CardContent>
    </Card>
  );
};
// for the case that there are no frames, we dont have many droppables but only one droppable, which will be
// the whole carousel
const CarouselDroppable = () => {
  const { isOver, setNodeRef, active, over } = useDroppable({
    id: 'carousel',
    data: {
      type: 'Frame',
    },
  });
  console.log('isOver', isOver, active, over);
  return (
    <div
      ref={setNodeRef}
      className={cn([
        isOver ? 'absolute inset-0 border-8 border-blue-500' : 'border-4 border-transparent',
        'transition-colors duration-200 ease-in-out',
        'h-full w-full rounded-lg bg-gray-100 bg-inherit text-inherit dark:bg-slate-900',
      ])}
    />
  );
};
