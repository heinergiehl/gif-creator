import { useEffect } from 'react';
import { fabric } from 'fabric';
import { throttle } from 'lodash';
import { useStores } from '@/store';
import { AlignGuidelines } from 'fabric-guideline-plugin';
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
import {
  isImageEditorElement,
  isTextEditorElement,
  stringToShadowOptions,
} from '@/utils/fabric-utils';
import { EditorElement } from '@/types';
import { EditorStore } from '@/store/EditorStore';
import { getUid } from '@/utils';
import { usePathname } from 'next/navigation';
export const useInitializeCanvas = () => {
  const rootStore = useStores();
  const store = useStores().editorStore;
  const canvasRef = useCanvas().canvasRef;
  const canvasStore = useStores().canvasOptionsStore;
  const timelineStore = useStores().timelineStore;
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
      // const selectedObjIds = canvasRef.current?.getActiveObjects().map((obj) => obj.id);
      // store.elements = store.elements.filter((el: any) => !selectedObjIds?.includes(el.id));
      canvasRef.current?.remove(transform.target);
      store.elements = store.elements.filter((el) => el.id !== transform.target?.id);
      store.frames = store.frames.filter((frame) => frame.id !== transform.target?.id);
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
      target.clone((clonedObj: fabric.Object) => {
        const id = `element-${Date.now()}`;
        clonedObj.set({
          left: clonedObj?.left || 0 + 10,
          top: clonedObj.top || 0 + 10,
          id,
        });
        const selectedElement = store.elements.find((el: EditorElement) => el.id === target.id);
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
        if (selectedElement && isImageEditorElement(selectedElement)) {
          store.elements = [
            ...store.elements,
            {
              ...selectedElement,
              order: store.elements.length,
              index: store.elements.length,
              dataUrl,
              id: id,
              isFrame: false,
              properties: {
                ...selectedElement.properties,
                elementId: id,
              },
              placement: {
                ...selectedElement.placement,
                x: clonedObj?.left || 0,
                y: clonedObj?.top || 0,
              },
            },
          ];
        } else if (
          selectedElement &&
          isTextEditorElement(selectedElement) &&
          clonedObj instanceof fabric.Textbox
        ) {
          store.elements = [
            ...store.elements,
            {
              ...selectedElement,
              order: store.elements.length,
              index: store.elements.length,
              dataUrl,
              id: id,
              isFrame: false,
              properties: {
                ...selectedElement.properties,
                text: clonedObj.text || '',
              },
              placement: {
                ...selectedElement.placement,
                x: clonedObj?.left || 0,
                y: clonedObj?.top || 0,
              },
            },
          ];
        }
        clonedObj.set('id', id);
        clonedObj.set('zIndex', store.elements.length);
        clonedObj.setCoords();
        canvasRef.current?.add(clonedObj);
        canvasRef.current?.setActiveObject(clonedObj);
      });
      const timeFrame = store.elements.find((el: EditorElement) => el.id === target.id)?.timeFrame;
      const ele = store.elements.find((el: EditorElement) => el.id === target.id);
      if (!timeFrame || !ele) return;
      timelineStore.updateEditorElementTimeFrame(ele, timeFrame);
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
      // if fabricobject is text, we need to update the text property
      if (modifiedObject instanceof fabric.Textbox) {
        const textElement = store.elements.find((el) => el.id === modifiedObject.id);
        if (textElement) {
          store.updateElement(modifiedObject.id, {
            dataUrl,
            text: modifiedObject.text || '',
            properties: {
              ...textElement.properties,
              text: modifiedObject.text || '',
            },
            placement: {
              zIndex: modifiedObject.zIndex || 0,
              x: modifiedObject.left || 0,
              y: modifiedObject.top || 0,
              scaleX: modifiedObject.scaleX || 1,
              scaleY: modifiedObject.scaleY || 1,
              width: modifiedObject.width || 200,
              height: modifiedObject.height || 200,
              rotation: modifiedObject.angle || 0,
            },
            shadow,
          });
        }
        return;
      }
      store.updateElement(modifiedObject.id, {
        dataUrl,
        placement: {
          zIndex: modifiedObject.zIndex || 0,
          x: modifiedObject.left || 0,
          y: modifiedObject.top || 0,
          scaleX: modifiedObject.scaleX || 1,
          scaleY: modifiedObject.scaleY || 1,
          width: modifiedObject.width || 200,
          height: modifiedObject.height || 200,
          rotation: modifiedObject.angle || 0,
        },
        shadow,
      });
      store.fabricObjectUpdated = false;
    };
    const setupEventHandlers = (canvas: fabric.Canvas, store: EditorStore) => {
      const getObjectCenter = (obj: fabric.Object) => {
        const { left, top, width, height } = obj.getBoundingRect();
        return {
          x: left + width / 2,
          y: top + height / 2,
        };
      };
      const handleSelectionChange = throttle((selectedObjects: fabric.Object[]) => {
        const newSelectedElementIds = selectedObjects.map((obj) => obj.id || '');
        const currentSelectedIds = store.selectedElements.map((el) => el.id);
        const hasChanged =
          newSelectedElementIds.length !== currentSelectedIds.length ||
          !newSelectedElementIds.every((id) => currentSelectedIds.includes(id));
        console.log(
          'Selection changed!!!!,',
          newSelectedElementIds,
          currentSelectedIds,
          hasChanged,
        );
        if (hasChanged) {
          store.setSelectedElements(newSelectedElementIds);
          console.log('Selected elements in handleSelectionChange:', store.selectedElements);
        }
      }, 300);
      canvas.on('object:modified', (e) => {
        if (!e?.target) return;
        updateElementState(e.target);
      });
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
      // canvas.on('object:removed', (e) => {
      //   console.log('object:removed', e.target);
      //   const target = e.target;
      //   if (!target?.id) return;
      //   store.elements = store.elements.filter((el) => el.id !== target.id);
      //   store.frames = store.frames.filter((frame) => frame.id !== target.id);
      // });
      canvas.on('object:scaling', (e) => {
        const activeObject = e.target;
        if (activeObject?.height && activeObject?.width) {
          const widthAndHeightHtmlElement = document.getElementById('widthAndHeight');
          if (widthAndHeightHtmlElement) {
            widthAndHeightHtmlElement.innerText = `${Math.round(activeObject.getScaledWidth())}x${Math.round(activeObject.getScaledHeight())}`;
          }
          // Update overlay position
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
      canvas.on('selection:created', (e) => {
        console.log('selectionCreated', e);
        handleSelectionChange(e.selected || []);
      });
      canvas.on('selection:updated', (e) => {
        console.log('SelectionUpdated', e || []);
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
          console.log('OBJECT SELECTED: ', e.target);
          store.setSelectedElements([e.target?.id]);
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
        });
        canvas.on('mouse:up', (e) => {
          console.log('mouse:up');
          canvas.off('mouse:move');
          guideline?.clearGuideline();
          const rect = canvas.getObjects().find((obj) => obj.id === 'selection-rectangle');
          if (!rect) return;
          canvas.remove(...canvas.getObjects().filter((obj) => obj.id === 'selection-rectangle'));
        });
      });
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
        centeredScaling: true,
        preserveObjectStacking: true,
      });
      canvasRef.current = c;
      rootStore.canvasRef.current = c;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      fabric.Object.prototype.transparentCorners = false;
      fabric.Object.prototype.cornerColor = 'blue';
      fabric.Object.prototype.cornerStyle = 'circle';
      fabric.Object.prototype.centeredScaling = true;
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
    return () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.off('object:modified');
      canvas.off('selection:created');
      canvas.off('selection:updated');
      canvas.off('selection:cleared');
      canvas.off('object:selected');
      canvas.off('mouse:out');
      canvas.off('mouse:down');
      canvas.off('object:rotating');
      canvas.off('object:scaling');
      canvas.off('object:moving');
      canvas.off('object:removed');
    };
  }, [
    canvasRef.current,
    canvasStore.backgroundColor,
    canvasStore.height,
    canvasStore.width,
    store,
    canvasRef.current?._objects,
  ]);
};
