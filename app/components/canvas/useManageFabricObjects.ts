import { useEffect, useRef } from 'react';
import { FabricObjectFactory } from '@/utils/fabric-utils';
import { EditorElement } from '@/types';
import { useStores } from '@/store';
import { fabric } from 'fabric';
import { useCanvas } from './canvasContext';
export const useManageFabricObjects = () => {
  const store = useStores().editorStore;
  const canvasRef = useCanvas().canvasRef;
  const canvasStore = useStores().canvasOptionsStore;
  const rootStore = useStores();
  const syncIdRef = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Increment sync ID so stale async runs can bail out
    const currentSyncId = ++syncIdRef.current;
    const syncCanvasObjects = async () => {
      // If another sync was triggered while we were queued, bail
      if (currentSyncId !== syncIdRef.current) return;

      FabricObjectFactory.setCanvas(canvas);
      const selectedFrame = store.frames[store.currentKeyFrame];
      const frame = selectedFrame
        ? store.elements.find((element) => element.id === selectedFrame.id) || null
        : null;
      const elementsInFrame = store.elementsInCurrentFrame;
      const desiredElements = frame ? [frame, ...elementsInFrame] : [];
      const desiredIds = new Set(desiredElements.map((element) => element.id));

      canvas.setBackgroundColor(canvasStore.backgroundColor, () => {
        canvas.requestRenderAll();
      });

      if (!frame) {
        const canvasObjects = canvas
          .getObjects()
          .filter((object) => object.id !== 'selection-rectangle');
        canvasObjects.forEach((object) => {
          if (object.id) {
            canvas.remove(object);
          }
        });
        rootStore.setRerunUseManageFabricObjects(false);
        store.setShadowUpdated(false);
        store.setTextOptionsUpdated(false);
        return;
      }

      try {
        // Remove stale objects IMMEDIATELY (before async load) to prevent
        // old content flashing during frame transitions.
        // During drawing mode, preserve untracked drawing paths (empty id)
        // so in-progress / un-flattened strokes stay visible.
        if (!canvas.isDrawingMode) {
          const staleCanvasObjects = canvas
            .getObjects()
            .filter(
              (object) =>
                object.id !== 'selection-rectangle' && object.id && !desiredIds.has(object.id),
            );
          staleCanvasObjects.forEach((object) => {
            canvas.remove(object);
          });
          canvas.requestRenderAll();
        }

        const fabricObjects = (
          await Promise.all(
            desiredElements.map((element) => FabricObjectFactory.manageFabricObject(element)),
          )
        ).filter((object): object is fabric.Object => Boolean(object));

        // Bail if a newer sync has been triggered while we were loading
        if (currentSyncId !== syncIdRef.current) return;

        fabricObjects.sort((a, b) => {
          const elementA = store.elements.find((element) => element.id === a.id);
          const elementB = store.elements.find((element) => element.id === b.id);
          const zIndexA = elementA?.placement.zIndex ?? 0;
          const zIndexB = elementB?.placement.zIndex ?? 0;
          return zIndexA - zIndexB;
        });

        fabricObjects.forEach((object, index) => {
          const existingObject = canvas.getObjects().find((canvasObject) => canvasObject.id === object.id);
          if (!existingObject) {
            canvas.add(object);
          }
          const targetObject = existingObject || object;

          // Frame background images must never be selectable or evented
          const element = store.elements.find((el) => el.id === targetObject.id);
          if (element?.isFrame) {
            targetObject.selectable = false;
            targetObject.evented = false;
            targetObject.hoverCursor = 'default';
          }

          if (typeof targetObject.moveTo === 'function') {
            targetObject.moveTo(index);
          }
          targetObject.setCoords();
        });

        canvas.requestRenderAll();
      } catch (error) {
        console.error('Failed to sync fabric objects', error);
      } finally {
        rootStore.setRerunUseManageFabricObjects(false);
        store.setShadowUpdated(false);
        store.setTextOptionsUpdated(false);
      }
    };

    syncCanvasObjects();
  }, [
    store.currentKeyFrame,
    store.elements,
    rootStore.rerunUseManageFabricObjects,
    store.shadowUpdated,
    store.textOptionsUpdated,
    canvasRef,
    canvasStore.backgroundColor,
    store.frames,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const selectedObjects = store.selectedElements
      .map((element) => canvas.getObjects().find((object) => object.id === element.id))
      .filter((object): object is fabric.Object => Boolean(object));
    const activeObjects = canvas.getActiveObjects();
    const activeIds = activeObjects.map((object) => object.id).filter(Boolean);
    const selectedIds = selectedObjects.map((object) => object.id).filter(Boolean);
    const selectionChanged =
      activeIds.length !== selectedIds.length ||
      !selectedIds.every((id) => activeIds.includes(id));

    if (!selectionChanged) {
      return;
    }

    if (selectedObjects.length === 0) {
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      return;
    }

    if (selectedObjects.length === 1) {
      canvas.setActiveObject(selectedObjects[0]);
    } else {
      const selection = new fabric.ActiveSelection(selectedObjects, { canvas });
      canvas.setActiveObject(selection);
    }

    canvas.requestRenderAll();
  }, [canvasRef, store.selectedElements]);
};
