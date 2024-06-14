import { useEffect } from 'react';
import { FabricObjectFactory, createFilter } from '@/utils/fabric-utils';
import { EditorElement } from '@/types';
import { EditorStore } from '@/store/EditorStore';
import { useStores } from '@/store';
import { fabric } from 'fabric';
import { useCanvas } from './canvasContext';
export const useManageFabricObjects = () => {
  const store = useStores().editorStore;
  const canvasRef = useCanvas().canvasRef;
  const canvasStore = useStores().canvasOptionsStore;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const manageFabricObjects = async () => {
      console.log('useManageFabricObjects called');
      if (canvas) {
        FabricObjectFactory.setCanvas(canvas);
        let frame: EditorElement | null;
        try {
          const currentKeyFrame = store.currentKeyFrame;
          console.log('currentKeyFrame in useManageFabricObjects: ', currentKeyFrame);
          const selectedFrame = store.frames[currentKeyFrame];
          if (!selectedFrame) {
            return;
          }
          console.log('selectedFrame in useManageFabricObjects: ', selectedFrame);
          frame = store.elements.find((element) => element.id === selectedFrame.id) || null;
          console.log('frame in useManageFabricObjects: ', frame);
          if (!frame) {
            return;
          }
          const elementsInFrame = store.elementsInCurrentFrame;
          const frameFabricObject = await FabricObjectFactory.manageFabricObject(frame);
          // store.updateElement(frame?.id, {
          //   placement: {
          //     ...frame.placement,
          //     scaleX: frameFabricObject?.scaleX ?? 1,
          //     scaleY: frameFabricObject?.scaleY ?? 1,
          //     rotation: frameFabricObject?.angle ?? 0,
          //     x: frameFabricObject?.left ?? 0,
          //     y: frameFabricObject?.top ?? 0,
          //     width: frameFabricObject?.width ?? 0,
          //     height: frameFabricObject?.height ?? 0,
          //     originX: 'center',
          //     originY: 'center',
          //   },
          // });
          const prms = await Promise.allSettled(
            elementsInFrame.map((element) => {
              return FabricObjectFactory.manageFabricObject(element);
            }),
          );
          if (!frameFabricObject) {
            console.error('Failed to create frame in Canvas');
            return;
          }
          const fabricObjectsInFrameFullFilled = prms;
          const fabObjs: fabric.Object[] = [];
          fabObjs.push(frameFabricObject);
          fabricObjectsInFrameFullFilled.forEach((promiseObjSettled) => {
            if (promiseObjSettled.status === 'fulfilled') {
              const fabricObject = promiseObjSettled.value;
              if (fabricObject) {
                fabObjs.push(fabricObject);
              }
            }
          });
          fabObjs.sort((a, b) => {
            const elementA = store.elements.find((element) => element.id === a.id);
            const elementB = store.elements.find((element) => element.id === b.id);
            if (!elementA || !elementB) return 0;
            if (!elementA.placement.zIndex || !elementB.placement.zIndex) return 0;
            return elementA.placement.zIndex - elementB.placement.zIndex;
          });
          const selectedElements = store.selectedElements;
          const selectedFabricObjects = selectedElements
            .map((element) => {
              return canvas.getObjects().find((obj) => obj.id === element.id);
            })
            .filter((obj) => obj !== undefined) as fabric.Object[];
          // canvas.setActiveObject(selectedFabricObjects[0]);
          //only add them if they dont exist on canvas already
          if (
            !fabObjs.every((obj) =>
              canvas.getObjects().find((canvasObj) => canvasObj.id === obj.id),
            )
          ) {
            canvas.add(...fabObjs);
          }
          canvas?.requestRenderAll();
        } catch (error) {
          console.error('Failed to load image', error);
        }
      }
    };
    // check if  the objectsInCurrentFrame and the frame  are  the ones that are on the canvas, if not, update the canvas
    const canvasObjects = canvas?.getObjects();
    const elementsInFrame = store.elementsInCurrentFrame;
    const frame = store.frames[store.currentKeyFrame];
    const frameFabricObject = canvasObjects?.find((obj) => obj.id === frame?.id);
    // if (
    //   !frameFabricObject ||
    //   !elementsInFrame.every((element) => canvasObjects?.find((obj) => obj.id === element.id))
    // ) {
    //   console.log('Updating canvas objects', canvasObjects, elementsInFrame, frameFabricObject);
    // }
    canvas?.clear();
    canvas?.setBackgroundColor(canvasStore.backgroundColor, () => {
      manageFabricObjects();
      canvas?.requestRenderAll();
    });
  }, [store.currentKeyFrame, store.elementsInCurrentFrame, store.elements, store.frames]);
};
