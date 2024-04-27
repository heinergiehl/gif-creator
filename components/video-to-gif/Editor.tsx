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
import { DndContext, DragEndEvent, DragOverEvent, useDroppable } from '@dnd-kit/core';
import EditResource from '../entity/EditResource';
import { getUid } from '@/utils';
import { EditorCarousel } from './carousel/EditorCarousel';
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
  //   // for testing, create a text object when the component mounts
  //   store.addText({
  //     text: "Hello World",
  //     fontSize: 20,
  //     fontWeight: 400,
  //     isFrame: false,
  //   })
  // }, [])
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    store.isDragging = false;
    //extract index from the id
    console.log(active.id, over?.id);
    const index = parseInt(String(active.id).split('-')[1]);
    const resourceType = String(active.id).split('-')[0];
    if (store.imageType === 'Frame' && String(over?.id).includes('carousel')) {
      if (resourceType.startsWith('imageResource')) {
        const src = document.getElementById(String(active.id))?.getAttribute('src');
        console.log(src, 'src', index, 'index', active.id);
        if (!src) return;
        const id = getUid();
        store.frames.push({
          id: id,
          src: src,
        });
        store.selectedElement = null;
        store.addImage(store.frames.length, String(active.id), true);
        console.log('ADDING IMAGE TO FRAME');
        store.currentKeyFrame = store.frames.length - 1;
        animationStore.addCurrentGifFrameToCanvas();
      } else if (resourceType.startsWith('textResource')) {
        const textElement = document.getElementById(String(active.id));
        if (!textElement) return;
        // make sure to add the text as a frame to frames, but also make sure that it appears in the carousel, meaning we must render it on canvas then take snapshot and put the dataurl in frames
        store.addText({
          text: textElement.innerHTML,
          fontColor: store.fontColor,
          fontSize: store.fontSize,
          fontWeight: store.fontWeight,
          textBackground: store.textBackground,
          fontFamily: store.fontFamily,
          fontStyle: store.fontStyle,
          isFrame: true,
        });
        store.currentKeyFrame = store.frames.length;
        store.selectedElement = null;
        animationStore.addCurrentGifFrameToCanvas();
        const dataUrl = store.canvas?.toDataURL();
        if (dataUrl) {
          const id = getUid();
          store.frames.push({
            id: id,
            src: dataUrl,
          });
        }
      } else {
        if (resourceType.startsWith('imageResource')) {
          store.addImage(index, String(active.id), false);
        }
      }
    } else if (
      store.imageType === 'ObjectInFrame' &&
      String(over?.id).includes('grid-canvas-container')
    ) {
      if (resourceType.startsWith('imageResource')) {
        const src = document.getElementById(String(active.id))?.getAttribute('src');
        if (!src) return;
        store.addImage(index, String(active.id), false);
      } else if (resourceType.startsWith('textResource')) {
        const textElement = document.getElementById(String(active.id));
        if (!textElement) return;
        if (store.frames.length > 0)
          store.addText({
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
  const handleDragStart = () => {
    store.isDragging = true;
  };
  const handleDragOver = (event: DragOverEvent) => {
    //check if over id is canvas-grid-container, if so set store.imageType to ObjectInFrame
    if (event.over?.id === 'grid-canvas-container') {
      store.imageType = 'ObjectInFrame';
    } else {
      store.imageType = 'Frame';
    }
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
  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} onDragOver={handleDragOver}>
      <main
        className="relative
        grid  grid-cols-[90px_200px_auto_150px]
        overflow-hidden   md:grid-cols-[90px_300px_200px_1fr_150px] 
      "
      >
        <div className="flex flex-col row-start-1 sm:col-span-1">
          <Sidebar />
        </div>
        <div className="row-span-4 sm:col-span-1">
          <Resources />
        </div>
        <div
          className="grid col-span-3 col-start-3 grid-cols-subgrid dark:bg-slate-900 "
          id="editor-container"
        >
          <div className="col-span-4 col-start-1 pt-[70px]">
            <EditResource />
          </div>
          <div className="items-center justify-center col-span-2 col-start-1 row-span-1 row-start-3 pt-16 lg:col-span-1 lg:row-start-2 ">
            <div className="flex flex-col items-center justify-center h-full">
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
                className="mt-8 play-button"
              >
                {store.isPlaying ? (
                  <FaStopCircle size={54} className="" />
                ) : (
                  <FaPlayCircle size={54} />
                )}
              </button>{' '}
            </div>
          </div>
          <div className="content-center justify-center h-full col-span-2 row-start-2 md:col-span-1 xl:col-span-2 xl:items-center xl:justify-center">
            <Canvas containerWidth={containerWidth} />
          </div>
          <div className="content-center justify-center col-span-2 row-start-4 lg:row-start-3">
            <EditorCarousel containerWidth={containerWidth} />
          </div>
          <div className="flex-col h-full col-span-1 col-start-5 row-span-5 row-start-1">
            <ElementsHistoryPanel />
          </div>
        </div>
      </main>
    </DndContext>
  );
});
const Canvas = observer(({ containerWidth }: { containerWidth: number }) => {
  const { setNodeRef } = useDroppable({
    id: 'grid-canvas-container',
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
      store.frames.length > 0 &&
      !editorCarouselStore.isCreatingGifs &&
      !store.isDragging &&
      editorCarouselStore.cardItemHeight > 0 &&
      editorCarouselStore.cardItemWidth > 0 &&
      uiStore.selectedMenuOption === 'Video'
    ) {
      store.addImages();
      console.log('ADD IMAGES');
      animationStore.addCurrentGifFrameToCanvas();
    }
  }, [
    store.frames.length,
    editorCarouselStore.cardItemWidth,
    editorCarouselStore.cardItemHeight,
    uiStore.selectedMenuOption,
    editorCarouselStore.isCreatingGifs,
    store.isDragging,
  ]);
  return (
    <div id="grid-canvas-container" ref={setNodeRef} className="p-4">
      <canvas id="canvas" className="justify-center border-2 drop-shadow-lg" />
    </div>
  );
});
