import { useEffect } from 'react';
import { fabric } from 'fabric';
import { throttle } from 'lodash';
import { useStores } from '@/store';
import { AlignGuidelines } from 'fabric-guideline-plugin';
import { useHotkeys } from './useHotkeys';
import {
  copiedImg,
  copiedSuccessImg,
  deleteImg,
  mouseRotateIcon,
  renderIcon,
  rotationStyleHandler,
  treatAngle,
} from './customControls';
import { useCanvas } from './canvasContext';
import { isImageEditorElement, stringToShadowOptions } from '@/utils/fabric-utils';
import { EditorElement } from '@/types';
import { EditorStore } from '@/store/EditorStore';
export const useInitializeCanvas = () => {
  const store = useStores().editorStore;
  const canvasRef = useCanvas().canvasRef;
  useHotkeys(canvasRef);
  const canvasStore = useStores().canvasOptionsStore;
  useEffect(() => {
    const setupCustomControls = (store: any) => {
      fabric.Object.prototype.controls.remove = createCustomControl(
        deleteImg,
        store,
        true,
        handleDelete,
        () => 'remove',
        'remove',
        -0.5,
        -0.5,
      );
      fabric.Object.prototype.controls.copy = createCustomControl(
        copiedImg,
        store,
        true,
        handleCopy,
        () => 'copy',
        'copy',
        0.5,
        -0.5,
      );
      fabric.Textbox.prototype.controls.remove = createCustomControl(
        deleteImg,
        store,
        true,
        handleDelete,
        () => 'remove',
        'remove',
        -0.5,
        -0.5,
      );
      fabric.Textbox.prototype.controls.copy = createCustomControl(
        copiedImg,
        store,
        true,
        handleCopy,
        () => 'copy',
        'copy',
        0.5,
        -0.5,
      );
      fabric.Object.prototype.controls.copiedSuccess = createCustomControl(
        copiedSuccessImg,
        store,
        false,
        undefined,
        () => 'copiedSuccess',
        'copiedSuccess',
        0.5,
        -0.5,
      );
    };
    fabric.Object.prototype.controls.mtr = new fabric.Control({
      x: 0,
      y: -0.5,
      offsetX: 0,
      offsetY: -60,
      cursorStyleHandler: rotationStyleHandler,
      //@ts-ignore
      actionHandler: fabric.controlsUtils.rotationWithSnapping,
      actionName: 'rotate',
      render: renderIcon,
    });
    // also make sure every fabric object has this rotation control
    fabric.Textbox.prototype.controls.mtr = new fabric.Control({
      x: 0,
      y: -0.5,
      offsetX: 0,
      offsetY: -60,
      cursorStyleHandler: rotationStyleHandler,
      //@ts-ignore
      actionHandler: fabric.controlsUtils.rotationWithSnapping,
      actionName: 'rotate',
      render: renderIcon,
    });
    const createCustomControl = (
      img: HTMLImageElement | null,
      store: any,
      visible = true,
      mouseUpHandler:
        | ((eventData: MouseEvent, transform: fabric.Transform, x: number, y: number) => boolean)
        | undefined,
      cursorStyleHandler:
        | (() => 'pointer')
        | ((eventData: MouseEvent, control: fabric.Control, fabricObject: fabric.Object) => string),
      actionName: string,
      x = 0.5,
      y = -0.5,
    ) => {
      return new fabric.Control({
        actionName,
        x,
        y,
        offsetY: -60,
        mouseUpHandler,
        cursorStyleHandler,
        render: (ctx, left, top) => {
          if (img) {
            const size = 60;
            ctx.save();
            ctx.translate(left, top);
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
            ctx.restore();
          }
        },
        visible,
      });
    };
    const handleDelete = (
      eventData: MouseEvent,
      transform: fabric.Transform,
      x: number,
      y: number,
    ) => {
      const selectedObjIds = canvasRef.current?.getActiveObjects().map((obj) => obj.id);
      store.elements = store.elements.filter((el: any) => !selectedObjIds?.includes(el.id));
      return true;
    };
    const handleCopy = (
      eventData: MouseEvent,
      transform: fabric.Transform,
      x: number,
      y: number,
    ) => {
      // when clicking on the copy icon, the selected object should be copied
      const target = transform.target;
      if (!target) return true;
      const cloned = target.clone((clonedObj: fabric.Object) => {
        clonedObj.set({
          left: clonedObj?.left || 0 + 10,
          top: clonedObj.top || 0 + 10,
          id: `element-${Date.now()}`,
        });
        const selectedElement = store.elements.find((el: any) => el.id === target.id);
        let dataUrl = '';
        if (!selectedElement) return;
        if (isImageEditorElement(selectedElement)) {
          dataUrl = selectedElement.properties?.src;
        } else {
          dataUrl = target.toDataURL({
            multiplier: 0.5,
            format: 'png',
          });
        }
        if (selectedElement) {
          store.elements = [
            ...store.elements,
            {
              ...selectedElement,
              dataUrl,
              id: clonedObj.id ?? '',
              isFrame: false,
              placement: {
                ...selectedElement.placement,
                x: clonedObj?.left || 0,
                y: clonedObj?.top || 0,
              },
            },
          ];
        }
        canvasRef.current?.add(clonedObj);
        canvasRef.current?.setActiveObject(clonedObj);
      });
      return true;
    };
    let guideline: AlignGuidelines;
    const setupGuidelines = (canvas: fabric.Canvas) => {
      guideline = new AlignGuidelines({
        canvas: canvas,
        aligningOptions: {
          lineColor: '#32D10A',
          lineWidth: 2,
          lineMargin: 2,
        },
      });
      guideline.init();
    };
    const startRenderLoop = (canvas: fabric.Canvas) => {
      const renderLoop = () => {
        canvas.requestRenderAll();
        fabric.util.requestAnimFrame(renderLoop);
      };
      fabric.util.requestAnimFrame(renderLoop);
    };
    const updateElementState = (modifiedObject: fabric.Object) => {
      if (!modifiedObject?.id) {
        console.log('object:modified', 'no object found');
        return;
      }
      let dataUrl = '';
      const isFrame = store.frames.map((fr: any) => fr.id).includes(modifiedObject.id);
      if (!isFrame) {
        dataUrl = modifiedObject.toDataURL({
          multiplier: 0.5,
          format: 'png',
        });
        // but still update frames with the new dataUrl
        const framdeDataUrl = canvasRef.current?.toDataURL({
          multiplier: 0.1,
          format: 'png',
        });
        store.frames = store.frames.map((frame: any, index) => {
          if (index === store.currentKeyFrame) {
            return {
              ...frame,
              src: framdeDataUrl,
            };
          }
          return frame;
        });
      }
      if (isFrame) {
        const dataUrl = canvasRef.current?.toDataURL({
          multiplier: 0.1,
          format: 'png',
        });
        store.frames = store.frames.map((frame: any) => {
          if (frame.id === modifiedObject.id) {
            return {
              ...frame,
              src: dataUrl,
            };
          }
          return frame;
        });
      }
      let shadow: fabric.IShadowOptions | undefined;
      if (typeof modifiedObject.shadow === 'string') {
        shadow = stringToShadowOptions(modifiedObject.shadow);
      }
      store.updateElement(modifiedObject.id, {
        dataUrl,
        placement: {
          zIndex: modifiedObject.zIndex || 0,
          x: modifiedObject.left || 0,
          y: modifiedObject.top || 0,
          scaleX: modifiedObject.scaleX || 1,
          scaleY: modifiedObject.scaleY || 1,
          width: modifiedObject.width || 0,
          height: modifiedObject.height || 0,
          rotation: modifiedObject.angle || 0,
        },
        shadow,
      });
      store.fabricObjectUpdated = false;
    };
    const setupEventHandlers = (canvas: fabric.Canvas, store: EditorStore) => {
      canvas.on('object:modified', (e) => {
        if (!e?.target) return;
        updateElementState(e.target);
      });
      const getObjectCenter = (obj: fabric.Object) => {
        const { left, top, width, height } = obj.getBoundingRect();
        return {
          x: left + width / 2,
          y: top + height / 2,
        };
      };
      canvas.on('object:moving', (e) => {
        const activeObject = e.target;
        if (activeObject) {
          const sizeOverlay = document.getElementById('size-overlay');
          const angleOverlay = document.getElementById('angle-overlay');
          if (sizeOverlay && angleOverlay) {
            const { x, y } = getObjectCenter(activeObject);
            sizeOverlay.style.top = `${y + 20}px`;
            sizeOverlay.style.left = `${x - 20}px`;
            angleOverlay.style.top = `${y}px`;
            angleOverlay.style.left = `${x - 20}px`;
          }
        }
      });
      canvas.on('object:scaling', (e) => {
        const activeObject = e.target;
        if (activeObject?.height && activeObject?.width) {
          const widthAndHeightHtmlElement = document.getElementById('widthAndHeight');
          if (widthAndHeightHtmlElement) {
            widthAndHeightHtmlElement.innerText = `${Math.round(activeObject.getScaledWidth())}x${Math.round(activeObject.getScaledHeight())}`;
          }
          // make sure to update the overlay position
          const sizeOverlay = document.getElementById('size-overlay');
          const angleOverlay = document.getElementById('angle-overlay');
          if (sizeOverlay && angleOverlay) {
            const { x, y } = getObjectCenter(activeObject);
            sizeOverlay.style.top = `${y + 20}px`;
            sizeOverlay.style.left = `${x - 20}px`;
            angleOverlay.style.top = `${y}px`;
            angleOverlay.style.left = `${x - 20}px`;
          }
        }
      });
      canvas.on(
        'object:rotating',
        throttle((e) => {
          console.log('object:rotating', e.target?.angle);
          const target = e.target;
          if (!target?.angle) return;
          const angle = treatAngle(target.angle);
          canvas.setCursor(mouseRotateIcon(angle));
          const angleHTMLElement = document.getElementById('angle');
          if (angleHTMLElement) {
            angleHTMLElement.innerText = `${angle}°`;
          }
        }, 300),
      );
      const handleSelectionChange = throttle((selectedObjects: fabric.Object[]) => {
        console.log('Selection changed!!!!');
        const newSelectedElementIds = selectedObjects.map((obj) => obj.id || '');
        const currentSelectedIds = store.selectedElements.map((el) => el.id);
        const hasChanged =
          newSelectedElementIds.length !== currentSelectedIds.length ||
          !newSelectedElementIds.every((id) => currentSelectedIds.includes(id));
        if (hasChanged) {
          store.setSelectedElements(newSelectedElementIds);
          console.log('Selected elements in handleSelectionChange:', store.selectedElements);
        }
      }, 300);
      canvas.on('selection:created', (e) => {
        handleSelectionChange(e.selected || []);
      });
      canvas.on('selection:updated', (e) => {
        handleSelectionChange(e.selected || []);
      });
      canvas.on('selection:cleared', (e) => {
        console.log('Selection cleared');
        store.setSelectedElements([]);
      });
      canvas.on('object:selected', (e) => {
        e.target?.set('stroke', 'none');
        const selectedElement = store.selectedElements.find((el) => el.id === e.target?.id);
        if (!selectedElement && e.target?.id) {
          store.setSelectedElements([e.target?.id]);
        }
      });
      canvas.on('mouse:up', (e) => {
        const target = e.target;
        if (target) {
          target.set('stroke', 'none');
          console.log(
            'MOUSEUP: ',
            target.id,
            canvas.getActiveObjects().map((obj) => obj.id),
          );
          if (canvas.getObjects().find((obj) => obj.id === target.id)) return;
          if (!target?.id) {
            return;
          }
          store.setSelectedElements([target.id]);
        }
      });
      canvas.on('mouse:down', (e) => {
        const activeObjs = canvas.getActiveObjects();
        if (activeObjs.length > 0) return;
        const pointer = canvas.getPointer(e.e);
        const rect = new fabric.Rect({
          id: 'selection-rectangle',
          left: pointer.x,
          top: pointer.y,
          originX: 'left',
          originY: 'top',
          width: 0,
          height: 0,
          angle: 0,
          fill: 'rgba(0,0,0,0.3)',
          selectable: false,
          evented: false,
        });
        if (canvas.getObjects().find((obj) => obj.id === 'selection-rectangle')) return;
        canvas.add(rect);
        canvas.on('mouse:move', (e) => {
          const pointer = canvas.getPointer(e.e);
          if (!pointer) return;
          if (!rect.left || !rect.top) return;
          rect.set({ width: pointer.x - rect.left, height: pointer.y - rect.top });
          rect.setCoords();
          canvas.requestRenderAll();
        });
        canvas.on('mouse:up', (e) => {
          console.log('mouse:up');
          canvas.off('mouse:move');
          canvas.off('mouse:up');
          canvas.off('mouse:down');
          guideline?.clearGuideline();
          const rect = canvas.getObjects().find((obj) => obj.id === 'selection-rectangle');
          console.log('mouseUP: ', rect);
          if (!rect) return;
          canvas.remove(...canvas.getObjects().filter((obj) => obj.id === 'selection-rectangle'));
        });
      });
      return () => {
        canvas.off('object:modified');
        canvas.off('selection:created');
        canvas.off('selection:updated');
        canvas.off('selection:cleared');
        canvas.off('object:selected');
        canvas.off('mouse:up');
        canvas.off('mouse:out');
        canvas.off('object:rotating');
        canvas.off('object:scaling');
        canvas.off('object:moving');
      };
    };
    if (canvasRef.current === null) {
      const c = new fabric.Canvas('canvas', {
        backgroundColor: canvasStore.backgroundColor,
        hoverCursor: 'pointer',
        allowTouchScrolling: true,
        selection: true,
        selectionBorderColor: 'blue',
        selectionDashArray: [5, 5],
        width: canvasStore.width,
        height: canvasStore.height,
        enableRetinaScaling: true,
        imageSmoothingEnabled: true,
        stateful: true,
        snapThreshold: 1,
      });
      canvasRef.current = c;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      fabric.Object.prototype.transparentCorners = false;
      fabric.Object.prototype.cornerColor = 'blue';
      fabric.Object.prototype.cornerStyle = 'circle';
      fabric.Object.prototype.cornerSize = 20;
      fabric.Object.prototype.borderScaleFactor = 5;
      fabric.Object.prototype.id = '';
      interface ObjectOptions {
        zIndex?: number;
      }
      fabric.Object.prototype.zIndex = 0;
      fabric.Object.prototype.selectable = true;
      fabric.Object.prototype.selectionBackgroundColor = 'rgba(0, 0, 0, 0.3)';
      fabric.Object.prototype.borderColor = 'blue';
      fabric.Object.prototype.stateProperties?.push('id', 'zIndex');
      fabric.Object.prototype.statefullCache = true;
      fabric.filterBackend = new fabric.WebglFilterBackend();
      // @ts-ignore
      fabric.isWebglSupported(fabric.textureSize);
      setupCustomControls(store);
      setupGuidelines(canvas);
      startRenderLoop(canvas);
      setupEventHandlers(canvas, store);
    }
    // Cleanup on unmount
  }, [canvasRef, canvasStore.backgroundColor, canvasStore.height, canvasStore.width, store]);
};
