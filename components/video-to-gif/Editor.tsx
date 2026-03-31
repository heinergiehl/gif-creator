'use client';
import React, { useEffect, useRef, useState } from 'react';
import { StoreProvider, useStores } from '@/store';
import { observer } from 'mobx-react';
import { Sidebar } from './Sidebar';
import { FaPlayCircle, FaStopCircle } from 'react-icons/fa';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  PointerSensor,
  DragEndEvent,
  DragStartEvent,
  DragMoveEvent,
  DragOverEvent,
  closestCorners,
  Active,
} from '@dnd-kit/core';
import { CanvasProvider, useCanvas } from '@/app/components/canvas/canvasContext';
import { CustomAlertDialog } from '@/app/components/ui/CustomAlertDialog';
import CanvasComponent, { CanvasSettings } from '@/app/components/canvas/Canvas';
import EditResource from '../entity/EditResource';
import EditorCarousel from './carousel/EditorCarousel';
import DraggedImagePreview from './carousel/DraggedImmagePreview';
import { getUid } from '@/utils';
import { usePathname } from 'next/navigation';
import { Resources } from './Resources';
import { ClipboardProvider } from '@/app/hooks/useClipboard';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { fabric } from 'fabric';
import { cn } from '@/lib/utils';
import LoadingOverlay from './LoadingOverlay';
import { MenuOption } from '@/types';
import { EditorEmptyState } from './EditorEmptyState';
import { getEditorModeConfig, getEditorRouteMode } from './editor-mode';
import { useHotkeys } from 'react-hotkeys-hook';
// make sure the getActiveObject return type is correct and includes the id
declare module 'fabric' {
  interface Canvas {
    getActiveObject(): fabric.Object | null;
  }
  interface Object {
    id: string;
  }
}
type EditorWithStoreProps = {
  initialMenuOption?: MenuOption;
};

const EditorWithStore = ({ initialMenuOption = 'Video' }: EditorWithStoreProps) => {
  return (
    <ClipboardProvider>
      <CanvasProvider>
        <StoreProvider initialMenuOption={initialMenuOption}>
          <Editor />
        </StoreProvider>
      </CanvasProvider>
    </ClipboardProvider>
  );
};
export default EditorWithStore;
const Editor = React.memo(
  observer(function Editor() {
    const rootStore = useStores();
    const store = rootStore.editorStore;
    const editorCarouselStore = rootStore.editorCarouselStore;
    const animationStore = rootStore.animationStore;
    const timelineStore = rootStore.timelineStore;
    const [isMobile, setIsMobile] = useState(false);
    const mouseSensor = useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    });
    const touchSensor = useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    });
    const pointerSensor = useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    });
    const keyboardSensor = useSensor(KeyboardSensor, {});
    const sensors = useSensors(pointerSensor, mouseSensor, touchSensor, keyboardSensor);
    const supabase = rootStore.supabase;
    const pathname = usePathname();
    const routeMode = getEditorRouteMode(pathname);
    const modeConfig = getEditorModeConfig(routeMode);
    const hasFrames = store.elements.some((el) => el.isFrame) || store.frames.length > 0;
    const insertIndex = store.insertIndex;
    const handleDragEnd = async (event: DragEndEvent) => {
      const { active, over } = event;
      store.isDragging = false;
      const overId = over?.id;
      const activeIndex = store.frames.findIndex((element) => element.id === active.id);
      const overIndex = store.frames.findIndex((frame) => frame.id === overId);
      // Move within frames if the active item is found in frames
      if (activeIndex !== -1) {
        if (overIndex !== -1) {
          store.reorderFrames(activeIndex, overIndex);
        }
        return;
      }
      const resourceType = String(active.id).split('-')[0];

      // Determine drop target — use insertIndex as primary signal for carousel,
      // fall back to over.id and store.imageType
      const hasValidInsertIndex = store.insertIndex != null && store.insertIndex >= 0;
      const isCanvas =
        !hasValidInsertIndex &&
        (over?.id === 'canvas' || store.imageType === 'ObjectInFrame');
      const isCarousel =
        hasValidInsertIndex ||
        (!isCanvas &&
          (over?.id === 'carousel-container' ||
            store.imageType === 'Frame' ||
            store.frames.some((fr) => fr.id === overId)));

      if (isCarousel) {
        // Use insertIndex from handleDragMove (already tracks left/right of hovered frame)
        const insertIndex =
          store.insertIndex != null && store.insertIndex >= 0
            ? store.insertIndex
            : store.frames.length;

        if (resourceType.startsWith('imageResource')) {
          const frameId = getUid();
          const newFrame = { id: frameId, src: active?.data?.current?.image };
          if (insertIndex === 0 && store.frames.length > 0) {
            store.frames.unshift(newFrame);
            store.addImage(-1, active?.data?.current?.image, true, frameId);
          } else {
            store.frames.splice(insertIndex, 0, newFrame);
            store.addImage(insertIndex, active?.data?.current?.image, true, frameId);
          }
        } else if (resourceType.startsWith('textResource')) {
          const textContent = active?.data?.current?.text;
          if (!textContent) return;
          const newFrame = { id: getUid(), src: '' };
          const fabricText = new fabric.Textbox(textContent, {
            id: String(newFrame.id),
            fill: store.fill,
            fontSize: store.fontSize,
            fontWeight: store.fontWeight,
            textBackground: store.textBackground,
            fontFamily: store.fontFamily,
            fontStyle: store.fontStyle,
            isFrame: true,
            index: insertIndex,
          });
          const src = fabricText.toDataURL({
            format: 'png',
            quality: 1,
          });
          newFrame.src = src;
          if (insertIndex === 0 && store.frames.length > 0) {
            store.frames.unshift(newFrame);
          } else {
            store.frames.splice(insertIndex, 0, newFrame);
          }
          store.addText({
            id: String(newFrame.id),
            text: textContent,
            fill: store.fill,
            fontSize: store.fontSize,
            fontWeight: store.fontWeight,
            textBackground: store.textBackground,
            fontFamily: store.fontFamily,
            fontStyle: store.fontStyle,
            isFrame: true,
            index: insertIndex,
          });
        }
      } else if (isCanvas) {
        if (store.frames.length === 0) {
          store.setInfo(
            'You have not provided any frames!',
            'Please add frames to create a GIF, then you can add objects to the frames.',
          );
          store.toggleAlertDialog();
          return;
        }
        if (resourceType.startsWith('imageResource')) {
          store.addImage(
            store.elements.length,
            active.data.current?.image,
            false,
            String(getUid()),
          );
        } else if (resourceType.startsWith('textResource')) {
          const textContent = active?.data?.current?.text;
          if (!textContent) {
            console.warn('No text content found in drag data');
            return;
          }
          const newTextId = String(getUid());
          store.addText({
            fill: store.fill,
            id: newTextId,
            text: textContent,
            fontSize: store.fontSize,
            fontWeight: store.fontWeight,
            textBackground: store.textBackground,
            fontFamily: store.fontFamily,
            fontStyle: store.fontStyle,
            isFrame: false,
            index: store.elements.length,
          });
          // Auto-select the new text so edit bar appears
          store.setSelectedElements([newTextId]);
        }
      }
      // Sync timeline state after any drop
      store.updateMaxTime();
      store.updateEditorElementsForFrames();
      setActiveDrag(null);
      store.setInsertIndex(-1);
      setTouchAction(true);
    };
    const handleDragStart = (e: DragStartEvent) => {
      store.isDragging = true;
      store.activeDraggable = e;
      setActiveDrag(e.active);
      setTouchAction(false);
    };
    const [containerWidth, setContainerWidth] = useState(0);
    const [percentageWidthOfEditorContainer, setPercentageWidthOfEditorContainer] = useState(0);
    const resizeEditor = () => {
      const editorContainer = document.getElementById('editor-container');
      if (!editorContainer) return;
      const containerWidth = editorContainer.clientWidth;
      setContainerWidth(containerWidth);
    };
    useEffect(() => {
      resizeEditor();
      window.addEventListener('resize', resizeEditor);
      return () => {
        window.removeEventListener('resize', resizeEditor);
      };
    }, [
      store.frames.length,
      editorCarouselStore.cardItemWidth,
      editorCarouselStore.cardItemHeight,
      containerWidth,
      percentageWidthOfEditorContainer,
    ]);
    useEffect(() => {
      rootStore.uiStore.setSelectedMenuOption(modeConfig.menuOption);
    }, [modeConfig.menuOption, pathname, rootStore.uiStore]);
    const handleDragOver = (event: DragOverEvent) => {
      // Use actual pointer position to detect canvas vs carousel
      const initEvent = event.activatorEvent as PointerEvent | MouseEvent | undefined;
      if (initEvent && 'clientX' in initEvent) {
        const pointerX = initEvent.clientX + (event.delta?.x ?? 0);
        const pointerY = initEvent.clientY + (event.delta?.y ?? 0);
        const carouselEl = document.getElementById('carousel-container');
        if (carouselEl) {
          const rect = carouselEl.getBoundingClientRect();
          if (
            pointerY >= rect.top - 40 &&
            pointerY <= rect.bottom + 40 &&
            pointerX >= rect.left - 20 &&
            pointerX <= rect.right + 20
          ) {
            store.imageType = 'Frame';
            return;
          }
        }
      }
      if (event.over?.id === 'canvas') {
        store.imageType = 'ObjectInFrame';
      } else if (
        event.over?.id === 'carousel-container' ||
        store.frames.map((fr) => fr.id).includes(event?.over?.id as string)
      ) {
        store.imageType = 'Frame';
      }
    };
    const handleDragMove = (event: DragMoveEvent) => {
      const { active, delta } = event;
      if (active) store.isDragging = true;
      if (!active) {
        store.setInsertIndex(-1);
        return;
      }

      // Compute pointer position
      const initEvent = event.activatorEvent as PointerEvent | MouseEvent | undefined;
      if (!initEvent || !('clientX' in initEvent)) {
        store.setInsertIndex(-1);
        return;
      }
      const pointerX = initEvent.clientX + delta.x;
      const pointerY = initEvent.clientY + delta.y;

      // Check if pointer is over the carousel area
      const carouselEl = document.getElementById('carousel-container');
      if (!carouselEl) {
        store.setInsertIndex(-1);
        return;
      }
      const carouselRect = carouselEl.getBoundingClientRect();
      // Allow some vertical tolerance (pointer doesn't need to be exactly inside)
      const isOverCarousel =
        pointerY >= carouselRect.top - 40 &&
        pointerY <= carouselRect.bottom + 40 &&
        pointerX >= carouselRect.left - 20 &&
        pointerX <= carouselRect.right + 20;

      if (!isOverCarousel) {
        store.setInsertIndex(-1);
        return;
      }

      // Scan all frame DOM elements to find insertion point
      let bestIndex = store.frames.length; // default: append at end
      for (let i = 0; i < store.frames.length; i++) {
        const frameEl = document.querySelector(`[data-id="${store.frames[i].id}"]`) as HTMLElement;
        if (!frameEl) continue;
        const rect = frameEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        if (pointerX < centerX) {
          bestIndex = i;
          break;
        }
      }
      store.setInsertIndex(bestIndex);
    };
    const canvasRef = useCanvas().canvasRef;
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const setTouchAction = useStores().setTouchActionEnabled;
    const touchActionEnabled = useStores().touchActionEnabled;
    const [activeDrag, setActiveDrag] = useState<Active | null>(null);
    const dragOverlayRef = useRef<HTMLDivElement>(null);

    // Track raw pointer position during drag and move the custom overlay via DOM
    useEffect(() => {
      if (!activeDrag) return;
      const onPointer = (e: PointerEvent) => {
        if (dragOverlayRef.current) {
          dragOverlayRef.current.style.transform = `translate(${e.clientX + 12}px, ${e.clientY - 20}px)`;
        }
      };
      window.addEventListener('pointermove', onPointer, { passive: true });
      return () => window.removeEventListener('pointermove', onPointer);
    }, [activeDrag]);

    // ── Hotkeys ──
    useHotkeys(
      'delete,backspace',
      () => {
        const ids = store.selectedElements.map((el) => el.id);
        if (ids.length === 0) return;
        store.deleteElementsByIds(ids);
      },
      { enableOnFormTags: false },
    );

    return (
      <>
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        collisionDetection={closestCorners}
      >
        <div
          className={cn([
            'relative  flex h-full w-screen  flex-col items-center justify-center   overflow-hidden md:h-screen md:flex-row',
          ])}
          draggable="false"
        >
          <LoadingOverlay />
          <div className="z-1 hidden  flex-row md:flex md:h-screen md:flex-col">
            <Sidebar />
            <div className="relative hidden h-full w-[350px]  md:ml-[90px] md:flex">
              <Resources />
            </div>
          </div>
          <div className=" flex h-screen w-screen flex-col  items-center justify-center bg-slate-100 dark:bg-slate-800">
            <EditResource />
            <div
              className="flex h-full flex-col items-center justify-center  md:h-[calc(100svh-50px)] md:w-full md:max-w-[900px]"
              id="editor-container"
            >
              <CustomAlertDialog />
              <div
                className="z-1 relative  flex h-full   flex-col items-start justify-start  md:h-[calc(100dvh-50px)] md:w-full md:items-center   md:justify-center"
                draggable="false"
              >
                <ScrollArea className="m-auto flex h-full w-screen flex-col items-center justify-center gap-y-2  rounded-none md:h-[calc(100svh-50px)] md:w-full md:flex-row">
                  <div className="flex w-full flex-col items-center justify-center gap-4  md:flex-row md:justify-start">
                    <ScrollArea className="h-[35dvh] w-screen md:h-full md:w-full">
                      {hasFrames ? (
                        <div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row">
                          <div className="flex flex-row items-center justify-center gap-4  md:flex-col">
                            <div className="flex flex-row items-center  justify-center gap-2 md:flex-col">
                              <label htmlFor="speed" className="flex flex-col font-semibold ">
                                <span className="text-sm text-gray-600">FPS of your GIF</span>
                                <span className="text-xs text-gray-700">{animationStore.fps}fps</span>
                                <input
                                  id="speed"
                                  onChange={(e) => {
                                    animationStore.fps = parseFloat(e.target.value);
                                    if (timelineStore) timelineStore.formatCurrentTime();
                                  }}
                                  type="range"
                                  min="1"
                                  max="30"
                                />
                              </label>
                              <button
                                onClick={() => {
                                  if (store.isPlaying) store.isPaused = !store.isPaused;
                                  if (timelineStore) timelineStore.playSequence();
                                }}
                                className="play-button "
                              >
                                {store.isPlaying ? (
                                  <FaStopCircle size={54} className="" />
                                ) : (
                                  <FaPlayCircle size={54} />
                                )}
                              </button>{' '}
                              <CanvasSettings />
                            </div>
                          </div>
                          <CanvasComponent containerWidth={containerWidth} />
                        </div>
                      ) : (
                        <EditorEmptyState
                          config={modeConfig}
                          selectedMenuOption={rootStore.uiStore.selectedMenuOption}
                          onSelectMenuOption={(option) => rootStore.uiStore.setSelectedMenuOption(option)}
                        />
                      )}
                    </ScrollArea>
                  </div>
                  {hasFrames && (
                    <ScrollArea className="h-[25dvh] w-screen md:h-full md:w-full" draggable="false">
                      <EditorCarousel containerWidth={containerWidth} />
                      <ScrollBar orientation="vertical" />
                    </ScrollArea>
                  )}
                  {/* RESOURCES */}{' '}
                  <ScrollArea className="h-[35dvh] w-full md:hidden">
                    <Resources />
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
                  <div className="z-999999  relative  w-screen md:hidden">
                    <Sidebar />
                  </div>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </div>
            </div>
            {/* <ElementsHistoryPanel /> */}
          </div>
        </div>
        {/* Hidden DragOverlay — keeps @dnd-kit collision detection working */}
        <DragOverlay dropAnimation={null} style={{ opacity: 0 }}>
          {activeDrag ? <div style={{ width: 1, height: 1 }} /> : null}
        </DragOverlay>
      </DndContext>
      {/* Custom pointer-following overlay — rendered outside DndContext for correct positioning */}
      {activeDrag && (
        <div
          ref={dragOverlayRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 99999,
            pointerEvents: 'none',
            willChange: 'transform',
          }}
        >
          {(() => {
            const isFrame = store.frames.some((fr) => fr.id === activeDrag.id);
            const frameSrc = isFrame ? store.frames.find((fr) => fr.id === activeDrag.id)?.src : null;
            if (isFrame && frameSrc) return <DraggedImagePreview src={frameSrc} />;
            if (!isFrame && activeDrag.data?.current?.dragOverlay) return activeDrag.data.current.dragOverlay();
            return null;
          })()}
        </div>
      )}
      </>
    );
  }),
);
