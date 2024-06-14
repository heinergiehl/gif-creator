'use client';
import { useHotkeys } from 'react-hotkeys-hook';
import React, { Suspense, use, useCallback, useEffect, useState } from 'react';
import { StoreProvider, useStores } from '@/store';
import { observer } from 'mobx-react';
import { Sidebar } from './Sidebar';
import ElementsHistoryPanel from '../panels/ElementsHistoryPanel';
import { FaPlayCircle, FaStopCircle } from 'react-icons/fa';
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  DragMoveEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { CanvasProvider, useCanvas } from '@/app/components/canvas/canvasContext';
import { CustomAlertDialog } from '@/app/components/ui/CustomAlertDialog';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import CanvasComponent from '@/app/components/canvas/Canvas';
import EditResource from '../entity/EditResource';
import { throttle } from 'lodash';
import { EditorCarousel } from './carousel/EditorCarousel';
import { getUid } from '@/utils';
import { usePathname } from 'next/navigation';
import { Resources } from './Resources';
import { ClipboardProvider, useClipboard } from '@/app/hooks/useClipboard';
import { useInitializeCanvas } from '@/app/components/canvas/useInitializeCanvas';
import { useManageFabricObjects } from '@/app/components/canvas/useManageFabricObjects';
import { useUpdateFabricObjects } from '@/app/components/canvas/useUpdateFabricObjects';
import { useUpdateSelectedObject } from '@/app/components/canvas/useUpdateSelectedObject';
import { useSyncCanvasWithStore } from '@/app/components/canvas/useSyncCanvasWithStore';
// make sure the getActiveObject return type is correct and includes the id
declare module 'fabric' {
  interface Canvas {
    getActiveObject(): fabric.Object | null;
  }
  interface Object {
    id: string;
  }
}
const EditorWithStore = () => {
  return (
    <ClipboardProvider>
      <CanvasProvider>
        <StoreProvider>
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
    const sensors = useSensors(
      useSensor(MouseSensor),
      useSensor(TouchSensor),
      useSensor(KeyboardSensor),
      useSensor(PointerSensor, {
        activationConstraint: { distance: 10 },
      }),
    );
    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      store.isDragging = false;
      const overId = over?.id;
      const activeIndex = store.frames.findIndex((element) => element.id === active.id);
      const overIndex = store.frames.findIndex((frame) => frame.id === overId);
      if (activeIndex !== -1) {
        store.frames = arrayMove(store.frames, activeIndex, overIndex);
        store.elements = arrayMove(store.elements, activeIndex, overIndex);
        return;
      }
      const resourceType = String(active.id).split('-')[0];
      const isCarousel = over?.data?.current?.type === 'Frame';
      const isCanvas = over?.data?.current?.type === 'ObjectInFrame';
      store.updateMaxTime();
      store.updateEditorElementsForFrames();
      if (isCarousel) {
        if (resourceType.startsWith('imageResource')) {
          const frameId = getUid();
          const newFrame = { id: frameId, src: active?.data?.current?.image };
          if (store.frames.length < 2) {
            store.frames.push(newFrame);
            store.addImage(0, active?.data?.current?.image, true, frameId);
            return;
          }
          store.frames.splice(overIndex, 0, newFrame);
          store.addImage(overIndex, active?.data?.current?.image, true, frameId);
        } else if (resourceType.startsWith('textResource')) {
          const textElement = document.getElementById(String(active.id));
          if (!textElement) {
            console.warn('No HTML text element found');
            return;
          }
          const newFrame = { id: getUid(), src: 'https://via.placeholder.com/150' };
          store.frames.splice(overIndex, 0, newFrame);
          store.addText({
            id: String(newFrame.id),
            text: textElement.innerHTML,
            fontColor: store.fontColor,
            fontSize: store.fontSize,
            fontWeight: store.fontWeight,
            textBackground: store.textBackground,
            fontFamily: store.fontFamily,
            fontStyle: store.fontStyle,
            isFrame: true,
            index: overIndex,
            fill: store.textColor,
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
          const textElement = document.getElementById(String(active.id));
          if (!textElement) {
            console.warn('No HTML text element found');
            return;
          }
          store.addText({
            fill: store.textColor,
            id: String(getUid()),
            text: textElement.innerHTML,
            fontColor: store.fontColor,
            fontSize: store.fontSize,
            fontWeight: store.fontWeight,
            textBackground: store.textBackground,
            fontFamily: store.fontFamily,
            fontStyle: store.fontStyle,
            isFrame: false,
            index: store.elements.length,
          });
        }
      }
    };
    const handleDragStart = (e: DragStartEvent) => {
      store.isDragging = true;
      store.activeDraggable = e;
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
    const handleDragOver = throttle((event: DragOverEvent) => {
      if (event.over?.id === 'canvas') {
        store.imageType = 'ObjectInFrame';
      } else {
        store.imageType = 'Frame';
      }
    }, 100);
    const handleDragMove = throttle((event: DragMoveEvent) => {
      const { active } = event;
      if (active) {
        store.isDragging = true;
      }
    }, 200);
    const canvasRef = useCanvas().canvasRef;
    // useInitializeCanvas(canvasRef, store);
    // useManageFabricObjects(canvasRef, store); // Updated usage
    // useUpdateFabricObjects(canvasRef, store);
    // useUpdateSelectedObject(canvasRef, store);
    // useSyncCanvasWithStore(canvasRef, store);
    return (
      <DndContext
        autoScroll={{ layoutShiftCompensation: { x: true, y: false } }}
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        collisionDetection={closestCenter}
      >
        <ResizablePanelGroup direction="horizontal">
          <>
            <ResizablePanel defaultSize={5} id="sidebar" order={1}>
              <Sidebar />
            </ResizablePanel>
          </>
          <ResizablePanel defaultSize={95} order={2}>
            <ResizablePanelGroup
              direction="horizontal"
              onLayout={(e) => {
                setPercentageWidthOfEditorContainer(e[1]);
              }}
            >
              <>
                <ResizablePanel defaultSize={12} id="resources" order={3}>
                  <Resources />
                </ResizablePanel>
                <ResizableHandle withHandle={true} />
              </>
              <>
                <ResizablePanel defaultSize={78} id="editor" order={4}>
                  <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={6} order={5}>
                      <EditResource />
                    </ResizablePanel>
                    <ResizablePanel defaultSize={94} id="editor-container" order={6}>
                      <div
                        className="m-auto flex h-full w-[90%] flex-col items-center justify-center"
                        id="editor-container"
                      >
                        <CustomAlertDialog />
                        <div className="flex h-full w-full justify-center">
                          <div className="col-span-1 col-start-1 row-span-1 row-start-3 items-center justify-center pt-16 lg:col-span-1 lg:row-start-2 ">
                            <div className="flex h-full flex-col items-center justify-center">
                              <label htmlFor="speed" className="flex flex-col font-semibold ">
                                <span className="text-sm text-gray-600">FPS of your GIF</span>
                                <span className="text-xs text-gray-700">
                                  {animationStore.fps}fps
                                </span>
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
                                className="play-button mt-8"
                              >
                                {store.isPlaying ? (
                                  <FaStopCircle size={54} className="" />
                                ) : (
                                  <FaPlayCircle size={54} />
                                )}
                              </button>{' '}
                            </div>
                          </div>
                          <CanvasComponent containerWidth={containerWidth} />
                        </div>
                        <div className="flex h-full w-full items-center justify-center">
                          <EditorCarousel containerWidth={containerWidth} />
                        </div>
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>
                <ResizableHandle withHandle={true} />
                <>
                  <ResizablePanel defaultSize={10} order={7}>
                    <ElementsHistoryPanel />
                  </ResizablePanel>
                </>
              </>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </DndContext>
    );
  }),
);
