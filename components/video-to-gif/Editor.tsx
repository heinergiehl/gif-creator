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
  UniqueIdentifier,
  rectIntersection,
  closestCorners,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { arrayMove } from '@dnd-kit/sortable';
import { CanvasProvider, useCanvas } from '@/app/components/canvas/canvasContext';
import { CustomAlertDialog } from '@/app/components/ui/CustomAlertDialog';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import CanvasComponent, { CanvasSettings } from '@/app/components/canvas/Canvas';
import EditResource from '../entity/EditResource';
import { set, throttle } from 'lodash';
import EditorCarousel from './carousel/EditorCarousel';
import { getUid } from '@/utils';
import { usePathname } from 'next/navigation';
import { Resources } from './Resources';
import { ClipboardProvider, useClipboard } from '@/app/hooks/useClipboard';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { fabric } from 'fabric';
import DraggableDrawer from './DraggableDrawer';
import { cn } from '@/lib/utils';
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
        activationConstraint: { distance: 5 },
      }),
    );
    const supabase = rootStore.supabase;
    const handleDragEnd = async (event: DragEndEvent) => {
      const { active, over } = event;
      store.isDragging = false;
      const overId = over?.id;
      const activeIndex = store.frames.findIndex((element) => element.id === active.id);
      const overIndex = store.frames.findIndex((frame) => frame.id === overId);
      // Move within frames if the active item is found in frames
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
        const activeDraggableRect = active?.rect;
        const overDraggableRect = over?.rect;
        if (!activeDraggableRect || !overDraggableRect) return;
        const activeCenter = {
          x:
            (activeDraggableRect.current.translated?.left || 0) +
            (activeDraggableRect.current.initial?.width || 0),
          y:
            (activeDraggableRect.current.translated?.top || 0) +
            (activeDraggableRect.current.initial?.height || 0),
        };
        const overCenter = {
          x: (overDraggableRect.left || 0) + (overDraggableRect.width || 0),
          y: (overDraggableRect.top || 0) + (overDraggableRect.height || 0),
        };
        const isDraggedToRightSideOfFirstFrame = activeCenter.x > overCenter.x;
        let insertIndex = 0;
        if (!isDraggedToRightSideOfFirstFrame && overIndex === 0) {
          insertIndex = 0;
        } else {
          insertIndex = isDraggedToRightSideOfFirstFrame ? overIndex + 1 : overIndex;
        }
        if (resourceType.startsWith('imageResource')) {
          const frameId = getUid();
          const newFrame = { id: frameId, src: active?.data?.current?.image };
          // if (store.frames.length < 2) {
          //   store.frames.push(newFrame);
          //   store.addImage(0, active?.data?.current?.image, true, frameId);
          //   return;
          // }
          if (!isDraggedToRightSideOfFirstFrame && overIndex === 0) {
            store.frames.unshift(newFrame);
            store.addImage(-1, active?.data?.current?.image, true, frameId);
            return;
          }
          // if (overIndex === store.frames.length) {
          //   store.frames.push(newFrame);
          //   store.addImage(store.frames.length, active?.data?.current?.image, true, frameId);
          //   return;
          // }
          store.frames.splice(insertIndex, 0, newFrame);
          store.addImage(insertIndex, active?.data?.current?.image, true, frameId);
          // make sure to upload to superbase frames bucket
          await supabase.storage
            .from('frames')
            .upload(frameId, new Blob([active?.data?.current?.image], { type: 'image/png' }), {
              upsert: true,
            });
        } else if (resourceType.startsWith('textResource')) {
          const textElement = document.getElementById(String(active.id));
          if (!textElement) {
            console.warn('No HTML text element found');
            return;
          }
          const newFrame = { id: getUid(), src: 'https://via.placeholder.com/150' };
          const fabricText = new fabric.Textbox(textElement.innerHTML, {
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
          store.frames.splice(insertIndex, 0, {
            ...newFrame,
            src,
          });
          store.addText({
            id: String(newFrame.id),
            text: textElement.innerHTML,
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
          const textElement = document.getElementById(String(active.id));
          if (!textElement) {
            console.warn('No HTML text element found');
            return;
          }
          store.addText({
            fill: store.fill,
            id: String(getUid()),
            text: textElement.innerHTML,
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
      setTouchAction(true);
    };
    const handleDragStart = (e: DragStartEvent) => {
      store.isDragging = true;
      store.activeDraggable = e;
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
    const handleDragOver = throttle((event: DragOverEvent) => {
      console.log('NONE!"§', event.over?.id);
      if (event.over?.id === 'canvas') {
        store.imageType = 'ObjectInFrame';
      } else if (store.frames.map((fr) => fr.id).includes(event.over?.id)) {
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
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const setTouchAction = useStores().setTouchActionEnabled;
    const touchActionEnabled = useStores().touchActionEnabled;
    return (
      <DndContext
        modifiers={[snapCenterToCursor]}
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        collisionDetection={rectIntersection}
      >
        <div
          className={cn([
            'flex  h-full  flex-col items-center justify-center   overflow-hidden md:h-screen md:flex-row',
            touchActionEnabled ? '' : 'touch-none',
          ])}
          draggable="false"
        >
          <div className="relative hidden  flex-row md:flex md:flex-col">
            <Sidebar />
            <div className=" top-0   ml-[90px] hidden h-full  md:flex">
              <Resources />
            </div>
          </div>
          <div className="flex h-full w-screen flex-col  items-center justify-center md:w-full">
            <EditResource />
            <div
              className="flex h-[calc(100svh-50px)] w-screen  flex-col items-center justify-center md:w-full"
              id="editor-container"
            >
              <CustomAlertDialog />
              <div
                className="relative  flex h-full  w-full flex-col items-start justify-start  md:h-[calc(100dvh-50px)] md:w-full"
                draggable="false"
              >
                <ScrollArea className="m-auto  flex h-[calc(100svh-50px)] flex-col items-center justify-center  gap-y-2 rounded-none md:h-full md:flex-row">
                  <div className="flex  flex-col items-center justify-center gap-4  md:flex-row">
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
                      {/* SIDEBAR */}
                    </div>
                    <CanvasComponent containerWidth={containerWidth} />
                  </div>
                  <ScrollArea className="h-[15vh]" draggable="false">
                    <EditorCarousel containerWidth={containerWidth} />
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
                  {/* RESOURCES */}{' '}
                  <ScrollArea className="h-[320px] w-full">
                    <Resources />
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
                  <div className="md:hidden">
                    <Sidebar />
                  </div>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </div>
            </div>
            {/* <ElementsHistoryPanel /> */}
          </div>
        </div>
      </DndContext>
    );
  }),
);
