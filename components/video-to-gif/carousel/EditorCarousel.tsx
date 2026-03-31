import React, { memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useDndContext } from '@dnd-kit/core';
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
import { EditorElement, Frame } from '@/types';
import useDragAndDropAndCarousel from './hooks/';
import { VList } from 'virtua';
import SortableItem from './SortableItem';
import Droppable from './Droppable';
import { getUid } from '@/utils';
import { throttle } from 'lodash';
import SelectionArea from '@viselect/vanilla';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
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
      store.deleteFramesByIds(elementsToCut.map((element) => element.id));
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
        const insertionIndex = pasteBefore ? index : index + 1;
        const pastedIds = store.pasteFramesAt(
          insertionIndex,
          clipboard.frames,
          clipboard.elements,
          clipboard.action,
        );
        setClipboard(null);
        store.setSelectedElements(pastedIds);
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
      handlePaste(selectedElementIndex, pasteBefore);
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
  const active = useDndContext()?.active;
  useEffect(() => {
    if (active?.id || over?.id) {
      selectionRef.current?.cancel();
      return;
    }
    // check if being on small screen, if so, return
    if (window.innerWidth < 768) {
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
          if (active?.id || over?.id) return;
        })
        .on('start', ({ event, selection }) => {
          if (active?.id || over?.id) return;
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
            if (active?.id || over?.id) {
              selectionRef.current?.cancel();
              return;
            }
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
          store.setSelectedElements([...selectedIds]);
          store.setCurrentKeyFrame(
            store.frames.findIndex((frame) => frame.id === selectedIds[0]),
          );
        });
      return () => {
        selectionRef.current?.clearSelection();
      };
    }
  }, [store.selectedElements, store.elements, active]);
  const handleDeleteFrame = (index: number): void => {
    store.deleteFrame(index);
  };
  const vListRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const currentFrameId = store.frames[store.currentKeyFrame]?.id;
    const currentFrameElement = document.getElementById(currentFrameId);
    if (currentFrameElement && !currentFrameElement.classList.contains('selected')) {
      currentFrameElement.classList.add('selected');
    } else {
      document.getElementsByClassName('selected')[0]?.classList.remove('selected');
    }
  }, [store.currentKeyFrame, document.getElementsByClassName('selected')]);
  const over = useDndContext()?.over;
  const isDraggingResource = active && String(active.id).includes('Resource');
  const isOverCarousel =
    isDraggingResource &&
    (over?.id === 'carousel-container' ||
      store.frames.some((fr) => fr.id === over?.id));
  const frames = useMemo(() => {
    return store.frames.map((frame, index) => {
      return (
        <Droppable
          id={frame.id}
          index={index}
          key={index}
          className={cn([
            'selectable relative flex h-[74px] w-full items-center  justify-center  rounded-md border-2  transition-all duration-300 ',
            index === store.currentKeyFrame ? 'border-blue-500' : 'border-transparent',
          ])}
          style={{
            transform: calculateTransform(index, hoverIndex!),
            transition: 'transform 0.2s',
          }}
          data-id={frame.id}
        >
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
        </Droppable>
      );
    });
  }, [store.frames, store.currentKeyFrame, calculateTransform, hoverIndex]);
  return (
    <div
      onPointerDown={() => selectionRef.current?.clearSelection()}
      draggable="false"
      className="flex w-screen select-none flex-col  items-center justify-center gap-y-4 dark:bg-slate-800 md:w-full md:max-w-[900px] md:items-start"
      onMouseMove={debouncedHandleMouseMove}
    >
      <Timeline
        maxWidth={containerWidth + 100}
        minWidth={containerWidth + 100}
        currentFrame={store.currentKeyFrame}
        onSelectFrame={() => handleSelectFrame(store.frames[store.currentKeyFrame].id)}
        totalFrames={store.frames.length}
      />
      <div
        style={{
          width,
          minWidth: width,
        }}
        draggable="false"
        id="carousel-container"
        className={cn([
          'relative flex w-screen items-center justify-start gap-4 overflow-y-hidden rounded-lg bg-muted bg-slate-200 transition-all duration-200 dark:bg-slate-900 md:w-full',
          isOverCarousel && 'ring-2 ring-inset ring-blue-500/60',
        ])}
        ref={carouselRef}
      >
        {store.frames.length === 0 && <CarouselDroppable />}
        <SortableContext
          items={store.frames.map((frame) => frame.id)}
          strategy={horizontalListSortingStrategy}
        >
          <VList
            style={{
              width: containerWidth,
              height: 140,
              padding: '25px ',
            }}
            className=""
            horizontal
          >
            {frames}
          </VList>
        </SortableContext>

      </div>
    </div>
  );
});
export default memo(EditorCarousel);
