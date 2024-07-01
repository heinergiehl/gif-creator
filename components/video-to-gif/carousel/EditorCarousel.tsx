'use client';
import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useStores } from '@/store';
import {
  DndContext,
  useDroppable,
  useSensor,
  useSensors,
  PointerSensor,
  useDndMonitor,
  useDndContext,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
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
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { useClipboard } from '@/app/hooks/useClipboard';
import { useHotkeys } from 'react-hotkeys-hook';
import Timeline from './Timeline';
import { CSS } from '@dnd-kit/utilities';
import { EditorElement } from '@/types';
import SelectionArea from '@viselect/vanilla';
import { useToast } from '@/components/ui/use-toast';
import { throttle } from 'lodash';
const Droppable = ({
  children,
  id,
  className,
  style,
}: {
  children: React.ReactNode;
  id: string;
  className: string;
  style?: React.CSSProperties;
}) => {
  const { isOver, setNodeRef, active } = useDroppable({
    id: String(id),
    data: {
      type: 'Frame',
    },
  });
  return (
    <div
      data-id={id}
      style={style}
      ref={setNodeRef}
      className={cn([
        isOver ? ' border-r-8 border-blue-500' : 'border-r-4 border-transparent',
        'transition-colors duration-200 ease-in-out',
        className,
      ])}
    >
      {children}
    </div>
  );
};
interface EditorCarouselProps {
  containerWidth: number;
}
export const EditorCarousel = observer(function EditorCarousel({
  containerWidth,
}: EditorCarouselProps) {
  const store = useStores().editorStore;
  const { clipboard, setClipboard } = useClipboard();
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [pasteIndicatorPosition, setPasteIndicatorPosition] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const ctx = useDndContext();
  const active = ctx.active;
  const handleSelectFrame = (id: string, multiSelect = false) => {
    const selectedFrameIdx = store.frames.findIndex((frame) => frame.id === id);
    if (multiSelect) {
      const currentSelection = store.selectedElements.map((el) => el.id);
      if (currentSelection.includes(id)) {
        store.setSelectedElements(currentSelection.filter((selectedId) => selectedId !== id));
      } else {
        store.setSelectedElements([...currentSelection, id]);
      }
    } else {
      store.setSelectedElements([id]);
    }
    store.currentKeyFrame = selectedFrameIdx;
  };
  const selectionRef = useRef<SelectionArea>();
  useEffect(() => {
    if (active?.id) {
      selectionRef.current?.cancel();
      return;
    }
    if (selectionRef.current === undefined && store.elements.length > 0) {
      selectionRef.current = new SelectionArea({
        selectables: ['.selectable'],
        boundaries: ['#carousel-container'],
      })
        .on('beforedrag', (e) => {
          selectionRef.current?.clearSelection();
        })
        .on('start', ({ event, selection }) => {
          if (active?.id) return;
          // check if clicked on item with id timeline, if so, return
          selectionRef.current?.clearSelection();
          // remove all selected elements, meaning  selectedElements = [] and classList.remove('selected')
          if (!event?.ctrlKey && !event?.metaKey) {
          }
        })
        .on(
          'move',
          ({
            store: {
              changed: { added, removed },
              stored,
            },
          }) => {
            const changed = { added, removed };
            changed.added.forEach((el) => {
              el.classList.add('selected');
            });
            changed.removed.forEach((el) => {
              el.classList.remove('selected');
            });
          },
        )
        .on('stop', (ev) => {
          const selected = ev.selection.getSelection();
          const selectedIds = selected
            .map((el) => el.getAttribute('data-id'))
            .filter((e) => e !== null) as string[];
          // remove  selected class
          selected.forEach((el) => {
            el.classList.remove('selected');
          });
          store.setSelectedElements([...selectedIds]);
        });
      return () => {
        selectionRef.current?.clearSelection();
      };
    }
  }, [store.selectedElements, selectionRef.current, active?.id]);
  const handleDeleteFrame = (index: number): void => {
    store.deleteFrame(index);
    if (index === store.currentKeyFrame || index === store.frames.length - 1) {
      const newSelectedIndex = (index === 0 ? 0 : index - 1) % store.frames.length;
      store.currentKeyFrame = newSelectedIndex;
    }
  };
  const getBasisOfCardItem = () => {
    const carouselWidth = containerWidth;
  };
  const [shiftDirection, setShiftDirection] = useState<'left' | 'right' | null>(null);
  useDndMonitor({
    onDragOver: (event) => {
      const newIndex = store.frames.findIndex((frame) => frame.id === event.over?.id);
      console.log('Drag69', event);
      updateHoverIndex(newIndex);
    },
    onDragEnd: () => {
      store.activeDraggable = null;
      store.isDragging = false;
    },
    onDragMove: (event) => {
      // set shift direction based on the active over the over item
      const carouselContent = document.getElementById('carousel-container');
      if (!carouselContent) return;
      const carouselContentRect = carouselContent.getBoundingClientRect();
      // check if being on the edge, meaning left or right of the carousel content. if so, return and dont set shift direction
      if (!event.active) return;
      if (!event.active.rect.current.translated) return;
      const draggedItemIsOnEdge =
        event.active?.rect.current.translated?.left < carouselContentRect.left ||
        event.active?.rect.current.translated?.right > carouselContentRect.right;
      if (draggedItemIsOnEdge) return;
      const sortableItems = document.querySelectorAll('.selectable');
      if (sortableItems.length === 0) return;
      const activeDraggable = document.getElementById(event.active?.id as string);
      if (!activeDraggable) return;
      const activeDraggableRect = activeDraggable.getBoundingClientRect();
      if (!event.over) return;
      // determine over index without the use of the overId, because this shall work with the overId being null for the case that the dragged item is not over any item but left or right of the over item
      // get the nearest over element based on the position of the active draggable
      const overElement = Array.from(sortableItems).reduce((prev, curr) => {
        const currRect = curr.getBoundingClientRect();
        const prevRect = prev.getBoundingClientRect();
        const prevDistance = Math.abs(
          activeDraggableRect.left - prevRect.left + prevRect.width / 2,
        );
        const currDistance = Math.abs(
          activeDraggableRect.left - currRect.left + currRect.width / 2,
        );
        return prevDistance > currDistance ? prev : curr;
      });
      const overElementRect = overElement.getBoundingClientRect();
      const overElementLeft = overElementRect.left;
      const overElementRight = overElementRect.right;
      const overElementWidth = overElementRect.width;
      const overElementCenter = overElementLeft + overElementWidth / 2;
      const mousePosition = event.active.rect.current.translated?.left;
      if (!mousePosition) return;
      const mousePositionRelativeToCarousel = mousePosition - carouselContentRect.left;
      const shiftThreshold = overElementWidth / 2;
      if (mousePositionRelativeToCarousel < overElementCenter - shiftThreshold) {
        setShiftDirection('left');
      } else if (mousePositionRelativeToCarousel > overElementCenter + shiftThreshold) {
        setShiftDirection('right');
      } else {
        setShiftDirection(null);
      }
    },
  });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const updateHoverIndex = (newIndex: number) => {
    setHoverIndex(newIndex);
  };
  const calculateTransform = useCallback(
    (index: number, hoverIndex: number) => {
      if (store.elements.find((el) => active?.id === el.id)) return 'translateX(0px)';
      if (!store.isDragging || !ctx.over?.id) return 'translateX(0px)';
      const activeRect = active?.rect.current.translated;
      const overRect = ctx.over?.rect.left;
      if (!activeRect || !overRect) return 'translateX(0px)';
      if (activeRect.left === overRect) return 'translateX(0px)';
      // if (shiftDirection === 'right' && hoverIndex === 0) {
      //   return 'translateX(-100%)';
      // }
      // check if the active draggable is over the first element, and if so, check if its on the left or right side of the first element
      // depending on the side, return the corresponding transform
      const activeDraggable = document.getElementById(active?.id as string);
      if (!activeDraggable) return 'translateX(0px)';
      const carouselContent = document.getElementById('carousel-container');
      if (!carouselContent) return 'translateX(0px)';
      const carouselContentRect = carouselContent.getBoundingClientRect();
      // check if active draggable is on the edge of the carousel content on the left side, if so make sure to not shift the elements so it can be placed on the first position
      const activeDraggableLeft = activeRect.left;
      const activeDraggableRight = activeRect.right;
      const carouselContentLeft = carouselContentRect.left;
      const carouselContentRight = carouselContentRect.right;
      const activeDraggableIsOnLeftEdge = activeDraggableLeft < carouselContentLeft;
      const activeDraggableIsOnRightEdge = activeDraggableRight > carouselContentRight;
      if (activeDraggableIsOnLeftEdge) return 'translateX(100px)';
      else if (shiftDirection === 'right' && index >= hoverIndex) {
        return 'translateX(100%)';
      } else if (shiftDirection === 'left' && index <= hoverIndex) {
        return 'translateX(-100%)';
      } else return 'translateX(0px)';
    },
    [
      store.isDragging,
      ctx.over?.id,
      shiftDirection,
      hoverIndex,
      store.frames.length,
      store.activeDraggable,
    ],
  );
  useEffect(() => {
    if (store.frames.length > 0 && store.progress.conversion === 100) {
      store.progress.conversion = 0;
    }
  }, [store.frames, store.progress.conversion]);
  const handleCut = useCallback(() => {
    if (store.selectedElements.length > 0) {
      selectionRef.current?.clearSelection();
      const selectedFrames = store.frames.filter((frame) =>
        store.selectedElements.map((el) => el.id).includes(frame.id),
      );
      // Identify elements corresponding to the selected frames
      const elementsToCut = store.elements.filter((element) =>
        selectedFrames.map((frame) => frame.id).includes(element.id),
      );
      // Set clipboard with elements and action
      setClipboard({
        elements: [...elementsToCut],
        frames: [...selectedFrames],
        action: 'cut',
      });
      // Delete frames and corresponding elements
      // selectedFrames.forEach((frame) => {
      //   store.deleteFrame(store.frames.indexOf(frame));
      // });
      elementsToCut.forEach((element) => {
        store.removeElement(element.id);
        store.removeFrame(element.id);
      });
      // Clear selected elements
      store.setSelectedElements([]);
      // Update currentKeyFrame
      const selectedFramesStartIndex = store.selectedElements.findIndex(
        (frame) => frame.id === store.selectedElements[0]?.id,
      );
      store.currentKeyFrame = selectedFramesStartIndex !== -1 ? selectedFramesStartIndex : 0;
      toast({
        title: 'Cut',
        description: 'Elements cut to clipboard',
        variant: 'default',
        duration: 3000,
      });
      console.log(
        'Cut to clipboard',
        clipboard,
        store.elements.map((e) => e.id),
        store.frames.map((f) => f.id),
      );
    }
  }, [store.selectedElements, setClipboard, store.frames, store.elements]);
  const { toast } = useToast();
  const handleCopy = useCallback(() => {
    if (store.selectedElements.length > 0) {
      setClipboard({
        elements: store.selectedElements,
        frames: store.frames.filter((frame) =>
          store.selectedElements.map((el) => el.id).includes(frame.id),
        ),
        action: 'copy',
      });
      console.log('Copied to clipboard', clipboard);
      toast({
        title: 'Copied',
        description: 'Elements copied to clipboard',
        variant: 'default',
        duration: 3000,
      });
    }
  }, [store.selectedElements, setClipboard, store.frames, store.elements]);
  const handlePaste = useCallback(
    (index: number, pasteBefore: boolean) => {
      if (clipboard && clipboard.elements) {
        const pastedElements: EditorElement[] = [];
        const pastedFrames: Frame[] = [];
        const framesCopy = [...store.frames];
        clipboard.frames.forEach((frame, idx) => {
          const id = clipboard.action === 'cut' ? frame.id : getUid();
          const newFrame = { ...frame, id };
          framesCopy.splice(pasteBefore ? index + idx : index + idx + 1, 0, newFrame);
          pastedFrames.push(newFrame);
        });
        clipboard.elements.forEach((element) => {
          const id = clipboard.action === 'cut' ? element.id : getUid();
          const newElement = {
            ...element,
            id,
            properties: { ...element.properties, elementId: id },
          };
          pastedElements.push(newElement);
        });
        if (clipboard.action === 'cut') {
          // clipboard.elements.forEach((element) => store.removeElement(element.id));
        }
        store.frames = framesCopy;
        store.elements = store.elements.concat(pastedElements);
        setClipboard(null);
        store.currentKeyFrame = store.frames.findIndex((frame) => frame.id === pastedFrames[0].id);
        store.setSelectedElements([...pastedElements.map((el) => el.id)]);
        console.log(
          'Pasted elements',
          store.elements.map((el) => el.id),
          store.frames.map((el) => el.id),
        );
      }
    },
    [clipboard, store.elements, setClipboard, getUid],
  );
  const editorStore = useStores().editorStore;
  const handlePasteHotkey = useCallback(
    (event: KeyboardEvent) => {
      const selectedElementIndex = store.frames.findIndex(
        (el) =>
          el.id ===
          (editorStore.selectedElements.length > 0
            ? editorStore.selectedElements[editorStore.selectedElements.length - 1].id
            : ''),
      );
      const elementId = store.frames[selectedElementIndex]?.id;
      const element = document.getElementById(elementId);
      const { left, width } = element?.getBoundingClientRect() ?? { left: 0, width: 0 };
      const pasteBefore = mousePosition!.x < left + width / 2;
      handlePaste(selectedElementIndex + (pasteBefore ? 0 : 1), pasteBefore);
    },
    [clipboard, editorStore.selectedElements, handlePaste, store.frames, mousePosition],
  );
  useHotkeys('ctrl+c', handleCopy);
  useHotkeys('ctrl+x', handleCut);
  useHotkeys('ctrl+v', handlePasteHotkey);
  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };
  const handleMouseEnter = (index: number) => {
    setPasteIndicatorPosition(index);
  };
  const handleMouseLeave = () => {
    setPasteIndicatorPosition(null);
  };
  useEffect(() => {
    // scroll right or left depending on the mouse position or over index using the id of carousel content
    const carouselContent = document.getElementById('carousel-container');
    const positionOfActiveDraggable = active?.rect.current.translated;
    if (!positionOfActiveDraggable || !carouselContent) return;
    const carouselContentRect = carouselContent.getBoundingClientRect();
    const carouselContentWidth = carouselContentRect.width;
    const carouselContentLeft = carouselContentRect.left;
    const carouselContentRight = carouselContentRect.right;
    const activeDraggableLeft = positionOfActiveDraggable.left;
    const activeDraggableRight = positionOfActiveDraggable.right;
    // scroll speed based on how much the mouse is left or right of the carousel content
    // make scroll speed faster if the mouse is further away from the carousel content
    const scrollSpeedRight =
      (100 * Math.abs(activeDraggableRight - carouselContentRight)) / carouselContentWidth;
    const scrollSpeedLeft =
      (100 * Math.abs(carouselContentLeft - activeDraggableLeft)) / carouselContentWidth;
    if (activeDraggableRight > carouselContentRight) {
      carouselContent.scrollLeft += scrollSpeedRight;
    } else if (activeDraggableLeft < carouselContentLeft) {
      carouselContent.scrollLeft -= scrollSpeedLeft;
    }
  }, [active?.rect.current.translated]);
  // set shift direction  based on position of active draggable relative to over index
  // only set shift direction when its not scrolling as
  const width = `${containerWidth - 100}px`;
  return (
    <div
      draggable="false"
      className=" flex select-none flex-col items-center  justify-center gap-y-4"
      onMouseMove={handleMouseMove}
    >
      <Timeline
        maxWidth={containerWidth}
        minWidth={containerWidth}
        currentFrame={store.currentKeyFrame}
        onSelectFrame={() => handleSelectFrame(store.frames[store.currentKeyFrame].id)}
        totalFrames={store.frames.length}
      />
      <div
        style={{
          width,
          minHeight: '120px',
          minWidth: width,
        }}
        id="carousel-container"
        className="relative  flex   items-center justify-start overflow-auto rounded-lg bg-muted"
      >
        {store.frames.length === 0 && <CarouselDroppable />}
        <SortableContext
          items={store.frames.map((frame) => frame.id)}
          strategy={rectSortingStrategy}
        >
          {store.frames.map((frame, index) => (
            <Droppable
              id={frame.id}
              key={index}
              className=" selectable relative mx-4    rounded-md border-2 transition-all duration-300"
              style={{
                transform: calculateTransform(index, hoverIndex!),
                transition: 'transform 0.2s',
              }}
              data-id={frame.id}
            >
              <div>
                {pasteIndicatorPosition === index && (
                  <div
                    className="absolute inset-y-0 left-0 w-1 bg-blue-500"
                    style={{ height: '100%', zIndex: 10 }}
                  />
                )}
                <SortableItem
                  basisOfCardItem={getBasisOfCardItem()}
                  id={frame.id}
                  src={frame.src}
                  index={index}
                  onFrameSelect={handleSelectFrame}
                  onFrameDelete={handleDeleteFrame}
                  isSelected={store.selectedElements.map((el) => el.id).includes(frame.id)}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                />
              </div>
            </Droppable>
          ))}
        </SortableContext>
      </div>
      {active && (
        <DragOverlay>
          {active?.data?.current?.dragOverlay ? (
            active?.data?.current?.dragOverlay()
          ) : (
            <DraggedImagePreview
              src={store.frames.find((frame) => frame.id === active?.id)?.src || ''}
            />
          )}
        </DragOverlay>
      )}
    </div>
  );
});
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
    const store = useStores().editorCarouselStore;
    const editorStore = useStores().editorStore;
    const [showHoverCard, setShowHoverCard] = useState(false);
    return (
      <div
        key={index}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn([
          'flex h-full w-full cursor-pointer select-none items-center justify-center p-0 transition-colors duration-200 ease-in-out',
          ,
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
                ' absolute inset-0 rounded-lg opacity-50 transition-all duration-300 dark:hover:bg-slate-700',
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
            <CardContent className="flex h-full w-full items-center justify-center p-0">
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
                className="min-h-[100px] min-w-[100px] rounded-lg"
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
          className="min-h-[100px] min-w-[100px] rounded-lg"
        />
      </CardContent>
    </Card>
  );
});
const CarouselDroppable = () => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'carousel-container',
    data: {
      type: 'Frame',
    },
  });
  return (
    <div
      ref={setNodeRef}
      className={cn([
        isOver ? ' border-8 border-blue-500' : ' border-4 border-transparent',
        'transition-colors duration-200 ease-in-out',
        'h-full  rounded-lg bg-gray-100 bg-inherit text-inherit dark:bg-slate-900',
        'absolute inset-0 ',
      ])}
    />
  );
};
