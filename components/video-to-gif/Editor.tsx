'use client';
import { fabric } from 'fabric';
import React, { use, useEffect, useRef, useState } from 'react';
import { StoreProvider, useStores } from '@/store';
import { observer } from 'mobx-react';
import { Resources } from './Resources';
import { Sidebar } from './Sidebar';
import ElementsHistoryPanel from '../panels/ElementsHistoryPanel';
import { FaPlayCircle, FaStopCircle } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import RootNavigation from '@/app/RootNavigation';
import {
  Active,
  AutoScrollActivator,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  Over,
  PointerSensor,
  TouchSensor,
  closestCenter,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import EditResource from '../entity/EditResource';
import { getUid } from '@/utils';
import { EditorCarousel } from './carousel/EditorCarousel';
import { sortCollisionsAsc } from '@dnd-kit/core/dist/utilities/algorithms/helpers';
import Layout from '@/app/edit-gifs/Layout';
import { arrayMove } from '@dnd-kit/sortable';
const EditorWithStore = () => {
  return (
    <StoreProvider>
      <Editor></Editor>
    </StoreProvider>
  );
};
// make sure the getActiveObject return type is correct and includes the id
declare module 'fabric' {
  interface Canvas {
    getActiveObject(): fabric.Object | null;
  }
  interface Object {
    id: string;
  }
}
export default EditorWithStore;
const Editor = observer(() => {
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const editorStore = rootStore.editorStore;
  const editorCarouselStore = rootStore.editorCarouselStore;
  const animationStore = rootStore.animationStore;
  const pathName = usePathname();
  // useEffect(() => {
  //   if (store.canvas)
  //     store.addText({
  //       text: 'Hello World',
  //       fontSize: 20,
  //       fontWeight: 400,
  //       isFrame: false,
  //     });
  // }, []);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );
  // calculate the relative position (index) of the dragged element to the over element, meaning the index based on the object being left or right of the over element
  const calculateRelativePosition = (active: Active, over: Over) => {
    const overRect = over?.rect;
    const activeRect = active?.rect;
    if (!overRect || !activeRect) return 0;
    const overCenter = {
      x: overRect?.left + overRect.width / 2,
      y: overRect.top + overRect.height / 2,
    };
    if (!activeRect.current.translated) return 0;
    const activeCenter = {
      x: activeRect?.current?.translated?.left + activeRect.current.translated?.width / 2,
      y: activeRect?.current?.translated?.top + activeRect.current.translated?.height / 2,
    };
    const relativePosition = activeCenter.x > overCenter.x ? 1 : -1;
    return relativePosition;
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    store.isDragging = false;
    const overId = over?.id;
    const activeIndex = store.frames.findIndex((element) => element.id === active.id);
    const overIndex = store.frames.findIndex((frame) => frame.id === overId);
    console.log('HANDLEDRAGEND', activeIndex, overIndex);
    if (activeIndex !== -1) {
      store.frames = arrayMove(store.frames, activeIndex, overIndex);
      store.elements = arrayMove(store.elements, activeIndex, overIndex);
      return;
    }
    const resourceType = String(active.id).split('-')[0];
    const isCarousel = over?.data?.current?.type === 'Frame';
    const isCanvas = over?.data?.current?.type === 'ObjectInFrame';
    if (isCarousel) {
      if (resourceType.startsWith('imageResource')) {
        console.log('IMAGE RESOURCE', active?.data?.current?.image);
        const frameId = getUid();
        const newFrame = {
          id: frameId,
          src: active?.data?.current?.image,
        };
        if (store.frames.length < 2) {
          store.frames.push(newFrame);
          store.addImage(0, active?.data?.current?.image, true);
          console.log('STILL HERE');
          return;
        }
        const correctedIndex = overIndex + calculateRelativePosition(active, over);
        // console.log('correctedIndex', correctedIndex, 'overIndex', overIndex, 'active', active);
        store.frames.splice(correctedIndex, 0, newFrame);
        store.addImage(correctedIndex, active?.data?.current?.image, true);
        // based timeFrame start and end
        // store.elements = store.elements.sort((a, b) => {
        //   return a.timeFrame.start - b.timeFrame.start;
        // });
        store.updateEditorElementsForFrames();
      } else if (resourceType.startsWith('textResource')) {
        const textElement = document.getElementById(String(active.id));
        if (!textElement) {
          console.warn('No HTML text element found');
          return;
        }
        const newFrame = {
          id: getUid(),
          // for now just placeolder src
          src: 'https://via.placeholder.com/150',
        };
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
        });
      }
    } else if (isCanvas) {
      if (resourceType.startsWith('imageResource')) {
        store.addImage(store.elements.length, String(active.id), false);
        console.log('IMAGE ADDED', store.elements.length, String(active.id), store.elements);
      } else if (resourceType.startsWith('textResource')) {
        const textElement = document.getElementById(String(active.id));
        if (!textElement) return;
        store.addText({
          id: String(active.id),
          text: textElement.innerHTML,
          fontColor: store.fontColor,
          fontSize: store.fontSize,
          fontWeight: store.fontWeight,
          textBackground: store.textBackground,
          fontFamily: store.fontFamily,
          fontStyle: store.fontStyle,
          isFrame: false,
        });
      }
    }
  };
  useEffect(() => {
    store.frames = [];
    store.images = [];
    store.elements = [];
    store.selectedElement = null;
    store.currentKeyFrame = 0;
  }, []);
  const handleDragStart = (e: DragStartEvent) => {
    store.isDragging = true;
    console.log(e.active, 'active');
    store.activeDraggable = e;
    console.log(store.activeDraggable, 'activeDraggable');
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
  const handleDragOver = (event: DragOverEvent) => {
    if (event.over?.id === 'grid-canvas-container') {
      store.imageType = 'ObjectInFrame';
    } else {
      store.imageType = 'Frame';
      console.log('FRAME');
      // otherwise i just want to show a preview of the image in the carousel where its going to be dropped once dragend is called
    }
  };
  const handleDragMove = (event: DragMoveEvent) => {
    const { active, over } = event;
    if (active) {
      store.isDragging = true;
    }
  };
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
      <main
        className="relative
        grid  grid-cols-[90px_300px_200px_auto_150px]
        overflow-hidden   md:grid-cols-[90px_300px_200px_1fr_150px] 
      "
      >
        <div className="col-start-1 row-span-5 row-start-1 sm:col-span-1">
          <Sidebar />
        </div>
        <div className="col-span-4 col-start-2 grid grid-cols-subgrid dark:bg-slate-900 ">
          <div className="col-start-1 row-span-5 row-start-1 sm:col-span-1">
            <Resources />
          </div>
          <div className="col-span-2 col-start-2 row-start-1 items-start justify-start ">
            <EditResource />
          </div>
          <div className="col-span-1 col-start-1 row-span-1 row-start-3 items-center justify-center pt-16 lg:col-span-1 lg:row-start-2 ">
            <div className="flex h-full flex-col items-center justify-center">
              <label htmlFor="speed" className="flex flex-col font-semibold ">
                <span className="text-sm text-gray-600">FPS of your GIF</span>
                <span className="text-xs text-gray-700">{animationStore.fps}fps</span>
                <input
                  id="speed"
                  onChange={(e) => {
                    animationStore.fps = parseFloat(e.target.value);
                    if (editorCarouselStore?.timelineStore)
                      editorCarouselStore?.timelineStore.formatCurrentTime();
                  }}
                  type="range"
                  min="1"
                  max="30"
                />
              </label>
              <button
                onClick={() => {
                  if (store.isPlaying) store.isPaused = !store.isPaused;
                  if (editorCarouselStore.timelineStore)
                    editorCarouselStore.timelineStore.playSequence();
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
          <div
            className="col-span-2 col-start-1 row-start-1 h-full content-center justify-center md:col-span-1 xl:col-span-1 xl:row-start-2 xl:items-center xl:justify-center"
            id="editor-container"
          >
            <Canvas containerWidth={containerWidth} />
          </div>
          <div className="col-span-3 col-start-2 col-end-4 row-start-2 content-center justify-center lg:row-start-3">
            <EditorCarousel containerWidth={containerWidth} />
          </div>
          <div className="col-span-1 row-span-5 row-start-1 flex-col">
            <ElementsHistoryPanel />
          </div>
        </div>
      </main>
    </DndContext>
  );
});
const Canvas = observer(({ containerWidth }: { containerWidth: number }) => {
  const { setNodeRef } = useDroppable({
    id: 'canvas',
    data: { type: 'ObjectInFrame' },
  });
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const editorCarouselStore = rootStore.editorCarouselStore;
  const canvas = store.canvas;
  const resizeCanvas = () => {
    const canvasContainer = document.getElementById('grid-canvas-container');
    if (!canvasContainer || !canvas) return;
    const ratio = canvas.getWidth() / canvas.getHeight();
    const containerWidth = window.innerWidth / 3.2;
    const containerHeight = containerWidth / ratio;
    const scale = containerWidth / canvas.getWidth();
    canvas.setWidth(containerWidth);
    canvas.setHeight(containerHeight);
    // make sure to keep the position of the objects when resizing
    const objects = canvas.getObjects();
    objects.forEach((object) => {
      if (object.scaleX) {
        object.scaleX *= scale;
      }
      if (object.scaleY) {
        object.scaleY *= scale;
      }
      if (object.left) {
        object.left *= scale;
      }
      if (object.top) {
        object.top *= scale;
      }
      object.setCoords();
    });
    console.log('RESIZING!!!');
  };
  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Call it to ensure it sizes correctly initially
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [
    store.canvas,
    store.frames.length,
    editorCarouselStore.cardItemWidth,
    editorCarouselStore.cardItemHeight,
    containerWidth,
  ]); // Depend on the canvas to ensure it exists
  const animationStore = rootStore.animationStore;
  useEffect(() => {
    if (store.canvas === null) {
      const c = new fabric.Canvas('canvas', {
        backgroundColor: 'grey',
        hoverCursor: 'pointer',
        allowTouchScrolling: true,
        selection: true,
        selectionBorderColor: 'blue',
        width: 500,
        height: 350,
        preserveObjectStacking: true,
        enableRetinaScaling: true,
        imageSmoothingEnabled: true,
        stateful: true,
      });
      store.canvas = c;
    }
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerColor = 'blue';
    fabric.Object.prototype.cornerStyle = 'circle';
    const c = store.canvas;
    fabric.util.requestAnimFrame(function render() {
      c.requestRenderAll();
      fabric.util.requestAnimFrame(render);
    });
    c.on('object:modified', (e) => {
      console.log('object:modified', e.target, 'object:modified');
      store.onObjectModified(e);
      //
    });
    c.on('selection:created', (e) => {
      const selectedObject = e.target;
      if (!selectedObject) return;
      if (!store?.selectElement) return;
      store.selectedElement =
        store.elements.find((element) => element.id === selectedObject.id) || null;
      console.log(e, store.selectedElement);
    });
    c.on('selection:updated', (e) => {
      const selectedObject = e.target;
      if (!selectedObject) return;
      store.selectedElement =
        store.elements.find((element) => element.id === selectedObject.id) || null;
    });
    c.on('selection:cleared', (e) => {
      store.selectedElement = null;
    });
  }, []);
  const uiStore = rootStore.uiStore;
  useEffect(() => {
    if (
      store.currentKeyFrame !== 0 &&
      store.frames.length > 0 &&
      store.elements.length > 0 &&
      store.selectedElement !== null
    ) {
      animationStore.addCurrentGifFrameToCanvas();
    }
  }, [store.currentKeyFrame, store.frames.length, store.elements.length, store.selectedElement]);
  return (
    <div id="grid-canvas-container" ref={setNodeRef} className="p-4">
      <canvas id="canvas" className="justify-center border-2 drop-shadow-lg" />
    </div>
  );
});
