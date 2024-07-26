import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { DndContext, DragOverlay, useDndContext } from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useStores } from '@/store';
import { useClipboard } from '@/app/hooks/useClipboard';
import { useHotkeys } from 'react-hotkeys-hook';
import Timeline from './Timeline';
import CarouselDroppable from './CarouselDroppable';
import { useToast } from '@/components/ui/use-toast';
import DraggedImagePreview from './DraggedImmagePreview';
import { EditorElement, Frame } from '@/types';
import useDragAndDropAndCarousel from './hooks/';
import { VList } from 'virtua';
import SortableItem from './SortableItem';
import Droppable from './Droppable';
import { getUid } from '@/utils';
import { throttle } from 'lodash';
import SelectionArea from '@viselect/vanilla';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
export interface EditorCarouselProps {
  containerWidth: number;
}
const EditorCarousel: React.FC<EditorCarouselProps> = observer(({ containerWidth }) => {
  const {
    currentlySelectedFrame,
    setCurrentlySelectedFrame,
    cardWidth,
    carouselRef,
    calculateTransform,
    handleMouseMove,
    hoverIndex,
    handleSelectFrame,
    active,
    updateHoverIndex,
    setMousePosition,
  } = useDragAndDropAndCarousel();
  const store = useStores().editorStore;
  const { clipboard, setClipboard } = useClipboard();
  const [pasteIndicatorPosition, setPasteIndicatorPosition] = useState<number | null>(null);
  const [mousePosition, setMousePositionState] = useState<{ x: number; y: number } | null>(null);
  const { toast } = useToast();
  const handleCut = useCallback(() => {
    if (store.selectedElements.length > 0) {
      const selectedFrames = store.frames.filter((frame) =>
        store.selectedElements.map((el) => el.id).includes(frame.id),
      );
      const elementsToCut = store.elements.filter((element) =>
        selectedFrames.map((frame) => frame.id).includes(element.id),
      );
      setClipboard({
        elements: [...elementsToCut],
        frames: [...selectedFrames],
        action: 'cut',
      });
      elementsToCut.forEach((element) => {
        store.removeElement(element.id);
        store.removeFrame(element.id);
      });
      store.setSelectedElements([]);
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
    }
  }, [store.selectedElements, setClipboard, store.frames, store.elements]);
  const handleCopy = useCallback(() => {
    if (store.selectedElements.length > 0) {
      setClipboard({
        elements: store.selectedElements,
        frames: store.frames.filter((frame) =>
          store.selectedElements.map((el) => el.id).includes(frame.id),
        ),
        action: 'copy',
      });
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
          pastedElements.push(newElement as EditorElement);
        });
        store.frames = framesCopy;
        store.elements = store.elements.concat(pastedElements);
        setClipboard(null);
        store.setSelectedElements([...pastedElements.map((el) => el.id)]);
      }
    },
    [clipboard, store.frames, store.elements, store.selectedElements],
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
      console.log('PASTE BEFORE', editorStore.selectedElements);
      handlePaste(selectedElementIndex + (pasteBefore ? 0 : 1), pasteBefore);
    },
    [store.frames, store.selectedElements, mousePosition],
  );
  useHotkeys('ctrl+c', handleCopy);
  useHotkeys('ctrl+x', handleCut);
  useHotkeys('ctrl+v', handlePasteHotkey);
  const handleMouseEnter = (index: number) => {
    setPasteIndicatorPosition(index);
  };
  const handleMouseLeave = () => {
    setPasteIndicatorPosition(null);
  };
  const width = `${containerWidth - 0.0}px`;
  const itemCount = store.frames.length;
  const itemSize = 150; // Width of each item in the list
  const debouncedHandleMouseMove = (e) => {
    handleMouseMove(e);
    setMousePositionState({ x: e.clientX, y: e.clientY });
  };
  const selectionRef = useRef<SelectionArea>();
  useEffect(() => {
    if (active?.id) {
      selectionRef.current?.cancel();
      return;
    }
    // check if being on small screen, if so, return
    if (window.innerWidth < 768) {
      selectionRef.current?.cancel();
      console.log('SMALL SCREEN');
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
          // selected.forEach((el) => {
          //   el.classList.remove('selected');
          // });
          console.log('SELECTED IDS', selectedIds), store.selectedElements;
          store.setSelectedElements([...selectedIds]);
        });
      return () => {
        selectionRef.current?.clearSelection();
      };
    }
  }, [store.selectedElements]);
  const handleDeleteFrame = (index: number): void => {
    console.log('HANDLEDELETEFRAME', index, store.frames.length, store.elements.length);
    const frameToDelete = store.frames[index];
    // get the corresponding element to the frame
    store.elements = store.elements.filter((element) => element.id !== frameToDelete.id);
    store.frames = store.frames.filter((frame) => frame.id !== store.frames[index].id);
    if (index === store.currentKeyFrame || index === store.frames.length - 1) {
      const newSelectedIndex = (index === 0 ? 0 : index - 1) % store.frames.length;
      store.currentKeyFrame = newSelectedIndex;
    }
  };
  const vListRef = useRef<HTMLDivElement>(null);
  return (
    <div
      draggable="false"
      className="flex w-screen select-none  flex-col  items-center justify-center gap-y-4 md:w-full md:max-w-[900px] md:items-start"
      onMouseMove={debouncedHandleMouseMove}
    >
      <Timeline
        maxWidth={containerWidth + 100}
        minWidth={containerWidth + 100}
        currentFrame={store.currentKeyFrame}
        onSelectFrame={() => handleSelectFrame(store.frames[store.currentKeyFrame].id)}
        totalFrames={store.frames.length}
      />
      {store.frames.length === 0 && <CarouselDroppable />}
      <div
        style={{
          width,
          minWidth: width,
        }}
        id="carousel-container"
        className="flex w-screen  items-center justify-start gap-4 overflow-y-hidden rounded-lg bg-muted md:w-full"
        ref={carouselRef}
      >
        <SortableContext
          items={store.frames.map((frame) => frame.id)}
          strategy={horizontalListSortingStrategy}
        >
          <VList
            style={{
              width: containerWidth,
              height: 120,
              padding: '22px ',
            }}
            horizontal
            count={store.frames.length}
          >
            {store.frames.map((frame, index) => (
              <Droppable
                id={frame.id}
                key={index}
                className="selectable relative flex h-full items-center  justify-center  rounded-md border-2  transition-all duration-300 "
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
                    onMouseEnter={updateHoverIndex}
                    onMouseLeave={() => updateHoverIndex(-1)}
                    src={frame.src}
                    key={frame.id}
                    id={frame.id}
                    onFrameDelete={handleDeleteFrame}
                    onFrameSelect={() => handleSelectFrame(frame.id, true)}
                    index={index}
                    basisOfCardItem={''}
                    isSelected={false}
                  />
                </div>
              </Droppable>
            ))}
          </VList>
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
export default EditorCarousel;
