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
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
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
const Droppable = ({
  children,
  id,
  className,
}: {
  children: React.ReactNode;
  id: string;
  className: string;
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: String(id),
    data: {
      type: 'Frame',
    },
  });
  return (
    <div
      data-id={id}
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
  const [api, setApi] = useState<CarouselApi>();
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
        .on('start', ({ event }) => {
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
  }, [store.selectedElements, selectionRef.current]);
  const handleDeleteFrame = (index: number): void => {
    store.deleteFrame(index);
    if (index === store.currentKeyFrame || index === store.frames.length - 1) {
      const newSelectedIndex = (index === 0 ? 0 : index - 1) % store.frames.length;
      store.currentKeyFrame = newSelectedIndex;
    }
  };
  const handleNextFrame = useCallback(() => {
    if (api) {
      const currentlySelectedFrame = store.currentKeyFrame;
      if (currentlySelectedFrame < store.frames.length - 1) {
        store.currentKeyFrame = currentlySelectedFrame + 1;
        api.scrollNext();
      }
    }
  }, [api, store.currentKeyFrame, store.frames.length]);
  const handlePrevFrame = useCallback(() => {
    if (api) {
      const currentlySelectedFrame = store.currentKeyFrame;
      if (currentlySelectedFrame > 0) {
        store.currentKeyFrame = currentlySelectedFrame - 1;
        api.scrollPrev();
      }
    }
  }, [api, store.currentKeyFrame, store.frames.length]);
  const getBasisOfCardItem = () => {
    const carouselWidth = containerWidth;
    if (carouselWidth <= 600) {
      return `basis-1/[${(api?.slidesInView() ? api.slidesInView().length : 1) || 1}]`;
    } else if (carouselWidth <= 900) {
      return `basis-1/[${(api?.slidesInView() ? api.slidesInView().length : 2) || 1}]`;
    } else {
      return `basis-1/[${(api?.slidesInView() ? api.slidesInView().length : 3) || 1}]`;
    }
  };
  const [shiftDirection, setShiftDirection] = useState<'left' | 'right' | null>(null);
  useDndMonitor({
    onDragOver: (event) => {
      const newIndex = store.frames.findIndex((frame) => frame.id === event.over?.id);
      updateHoverIndex(newIndex);
    },
    onDragEnd: () => {
      store.activeDraggable = null;
      store.isDragging = false;
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
  }, [store.selectedElements, setClipboard, store.frames]);
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
    [clipboard, store, setClipboard],
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
  const [selectionBox, setSelectionBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const handleMouseDrag = (event: React.MouseEvent) => {
    if (selectionBox) {
      const width = event.clientX - selectionBox.x;
      const height = event.clientY - selectionBox.y;
      setSelectionBox({ ...selectionBox, width, height });
      console.log(
        'Selection box',
        selectionBox,
        store.frames.map((frame) => frame.id),
        store.selectedElements.map((el) => el.id),
      );
    }
  };
  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
    // if (selectionBox) {
    //   const width = event.clientX - selectionBox.x;
    //   const height = event.clientY - selectionBox.y;
    //   setSelectionBox({ ...selectionBox, width, height });
    // }
  };
  const handleMouseEnter = (index: number) => {
    setPasteIndicatorPosition(index);
  };
  const handleMouseLeave = () => {
    setPasteIndicatorPosition(null);
  };
  const handleMouseDragEnd = (event: React.MouseEvent) => {
    if (selectionBox) {
      const selectionEnd = { x: event.clientX, y: event.clientY };
      const selectedFrames = store.frames
        .filter((frame) => {
          const frameElement = document.getElementById(frame.id);
          if (!frameElement) return false;
          const { left, top, right, bottom } = frameElement.getBoundingClientRect();
          return (
            left >= selectionBox.x &&
            right <= selectionEnd.x &&
            top >= selectionBox.y &&
            bottom <= selectionEnd.y
          );
        })
        .map((frame) => frame.id);
      console.log('Selected frames', selectedFrames);
      store.setSelectedElements(selectedFrames);
      store.currentKeyFrame = store.frames.findIndex((frame) => frame.id === selectedFrames[0]);
      setSelectionBox(null);
      setSelectionStart(null);
    }
  };
  const width = `${containerWidth - 100}px`;
  return (
    <div
      className="flex select-none flex-col items-center justify-center gap-y-4 px-16"
      draggable="false"
      id="carousel-container"
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
        className="flex flex-col items-center justify-center "
        style={{
          width,
          minHeight: '120px',
        }}
      >
        <Carousel
          style={{
            width,
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
              overflowX: api?.slidesNotInView()?.length > 0 ? 'scroll' : 'hidden',
              position: 'relative',
            }}
          >
            {/* {selectionBox && !active?.id && (
              <div
                className="absolute border border-blue-500 bg-blue-500 bg-opacity-20"
                style={{
                  left: `${selectionBox.x}px`,
                  top: `${selectionBox.y}px`,
                  width: `${selectionBox.width}px`,
                  height: `${selectionBox.height}px`,
                }}
              />
            )} */}
            <SortableContext
              items={store.frames.map((frame) => frame.id)}
              strategy={rectSortingStrategy}
            >
              {store.frames.map((frame, index) => (
                <Droppable
                  id={frame.id}
                  active={active}
                  key={index}
                  className=" selectable relative mx-4 rounded-md border-2"
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
          </CarouselContent>
          <DragOverlay>
            <DraggedImagePreview src={active?.data.current?.image} />
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
  index?: number;
}
interface SortableItemProps extends Frame {
  onFrameSelect: (id: string, multiSelect?: boolean) => void;
  onFrameDelete: (index: number) => void;
  onMouseDown: (id: string, e: React.MouseEvent) => void;
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
      <CarouselItem
        key={index}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn([
          'flex h-full cursor-pointer select-none items-center justify-center p-0 transition-colors duration-200 ease-in-out',
          basisOfCardItem,
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
            <CardContent className="flex h-full items-center justify-center p-0">
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
          className="min-h-[100px] min-w-[100px]"
        />
      </CardContent>
    </Card>
  );
};
const CarouselDroppable = () => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'carousel',
    data: {
      type: 'Frame',
    },
  });
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
