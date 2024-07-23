'use client';
import { useHotkeys } from 'react-hotkeys-hook';
import React, { Suspense, use, useCallback, useEffect, useState } from 'react';
import { StoreProvider, useStores } from '@/store';
import { observer } from 'mobx-react';
import { Sidebar } from './Sidebar';
import ElementsHistoryPanel from '../panels/ElementsHistoryPanel';
import { FaPlayCircle, FaStopCircle } from 'react-icons/fa';
import { Resizable } from 're-resizable';
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
import CanvasComponent from '@/app/components/canvas/Canvas';
import EditResource from '../entity/EditResource';
import { throttle } from 'lodash';
import EditorCarousel from './carousel/EditorCarousel';
import { getUid } from '@/utils';
import { usePathname } from 'next/navigation';
import { Resources } from './Resources';
import { ClipboardProvider, useClipboard } from '@/app/hooks/useClipboard';
import { ScrollArea } from '../ui/scroll-area';
import { fabric } from 'fabric';
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
    const handleDragEnd = async (event) => {
      // ... existing code ...
    };
    const handleDragStart = (e) => {
      store.isDragging = true;
      store.activeDraggable = e;
    };
    const [containerWidth, setContainerWidth] = useState(0);
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
    ]);
    const handleDragOver = throttle((event) => {
      if (event.over?.id === 'canvas') {
        store.imageType = 'ObjectInFrame';
      } else if (store.frames.map((fr) => fr.id).includes(event.over?.id)) {
        store.imageType = 'Frame';
      }
    }, 100);
    const handleDragMove = throttle((event) => {
      const { active } = event;
      if (active) {
        store.isDragging = true;
      }
    }, 200);
    const canvasRef = useCanvas().canvasRef;
    const [isDrawerOpen, setDrawerOpen] = useState(false);
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
          className="flex h-screen w-screen flex-col items-center justify-center overflow-hidden md:flex-row"
          draggable="false"
        >
          <div className="hidden h-full w-full flex-row md:flex">
            <Sidebar />
            <div className="z-[998] ml-[90px] hidden h-screen w-[300px] md:block">
              <Resources />
            </div>
          </div>
          <div className="flex h-screen w-screen flex-col items-center justify-center md:w-full">
            <EditResource />
            <ScrollArea
              className="flex h-screen flex-col items-center justify-center"
              id="editor-container"
            >
              <CustomAlertDialog />
              <div
                className="flex h-full w-full flex-col items-center justify-center"
                draggable="false"
              >
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center justify-center pt-16">
                    <div className="flex h-[85%] flex-col items-center justify-center">
                      <label htmlFor="speed" className="flex flex-col font-semibold">
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
                        className="play-button mt-8"
                      >
                        {store.isPlaying ? (
                          <FaStopCircle size={54} className="" />
                        ) : (
                          <FaPlayCircle size={54} />
                        )}
                      </button>
                    </div>
                  </div>
                  <CanvasComponent containerWidth={containerWidth} />
                </div>
                <EditorCarousel containerWidth={containerWidth} />
                <div className="absolute bottom-0 z-[1002] w-full">
                  <Resizable
                    defaultSize={{
                      width: '100%',
                      height: '300px',
                    }}
                    minHeight="100px"
                    maxHeight="80vh"
                    className="resources-drawer"
                  >
                    <ScrollArea className="h-full">
                      <Resources />
                    </ScrollArea>
                  </Resizable>
                </div>
                <div className="w-screen md:hidden">
                  <Sidebar />
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DndContext>
    );
  }),
);
