import { useEffect } from 'react';
import { fabric } from 'fabric';
import { throttle } from 'lodash';
import { useStores } from '@/store';
import { AlignGuidelines } from 'fabric-guideline-plugin';
import {
  mouseRotateIcon,
  rotationStyleHandler,
  treatAngle,
  hoveredControlMap,
  renderDeleteControl,
  renderCopyControl,
  renderCopiedSuccessControl,
  renderRotateControl,
  renderCornerControl,
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
    /* ── Modern Action Controls ─────────────────────── */
    const setupCustomControls = (_store: any) => {
      // Delete — red circle, top-left
      const deleteControl = new fabric.Control({
        actionName: 'remove',
        x: -0.5,
        y: -0.5,
        offsetY: -40,
        cursorStyleHandler: () => 'pointer',
        mouseUpHandler: handleDelete,
        render: renderDeleteControl,
        visible: true,
      });
      // Copy — blue circle, top-right
      const copyControl = new fabric.Control({
        actionName: 'copy',
        x: 0.5,
        y: -0.5,
        offsetY: -40,
        cursorStyleHandler: () => 'pointer',
        mouseUpHandler: handleCopy,
        render: renderCopyControl,
        visible: true,
      });
      // Copied success — green check, same slot as copy
      const copiedSuccessControl = new fabric.Control({
        actionName: 'copiedSuccess',
        x: 0.5,
        y: -0.5,
        offsetY: -40,
        cursorStyleHandler: () => 'copiedSuccess',
        render: renderCopiedSuccessControl,
        visible: false,
      });

      fabric.Object.prototype.controls.remove = deleteControl;
      fabric.Object.prototype.controls.copy = copyControl;
      fabric.Object.prototype.controls.copiedSuccess = copiedSuccessControl;
      fabric.Textbox.prototype.controls.remove = deleteControl;
      fabric.Textbox.prototype.controls.copy = copyControl;
      fabric.Textbox.prototype.controls.copiedSuccess = copiedSuccessControl;
    };

    // Rotate — slate circle, top-center
    const mtrControl = new fabric.Control({
      x: 0,
      y: -0.5,
      offsetX: 0,
      offsetY: -40,
      cursorStyleHandler: rotationStyleHandler,
      //@ts-ignore
      actionHandler: fabric.controlsUtils.rotationWithSnapping,
      actionName: 'rotate',
      render: renderRotateControl,
    });
    fabric.Object.prototype.controls.mtr = mtrControl;
    fabric.Textbox.prototype.controls.mtr = mtrControl;

    /* ── Modern corner handles ───────────────────────── */
    // Override corner rendering for all standard resize handles
    const cornerNames = ['tl', 'tr', 'bl', 'br', 'ml', 'mt', 'mr', 'mb'];
    cornerNames.forEach((name) => {
      const existing = fabric.Object.prototype.controls[name];
      if (existing) {
        existing.render = renderCornerControl;
      }
      const existingText = fabric.Textbox.prototype.controls[name];
      if (existingText) {
        existingText.render = renderCornerControl;
      }
    });
    const handleDelete = (
      eventData: MouseEvent,
      transform: fabric.Transform,
      x: number,
      y: number,
    ) => {
      if (!transform.target?.id) return true;
      store.deleteElementsByIds([transform.target.id]);
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
        store.duplicateElement(selectedElement.id, {
          dataUrl,
          placement: {
            ...selectedElement.placement,
            x: clonedObj?.left || 0,
            y: clonedObj?.top || 0,
          },
          properties:
            selectedElement && isTextEditorElement(selectedElement) && clonedObj instanceof fabric.Textbox
              ? {
                  ...selectedElement.properties,
                  text: clonedObj.text || '',
                }
              : undefined,
        });
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
        // Skip render-loop redraws while the user is actively drawing.
        // The brush handles its own rendering on contextTop; calling
        // requestRenderAll here can interfere with real-time stroke
        // visibility on some browsers / Fabric.js builds.
        if (!canvas.isDrawingMode) {
          canvas.requestRenderAll();
        }
        fabric.util.requestAnimFrame(renderLoop);
      };
      fabric.util.requestAnimFrame(renderLoop);
    };
    const updateElementState = (modifiedObject: fabric.Object) => {
      if (!modifiedObject?.id) {
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
        store.updateCurrentFrameSource(framdeDataUrl);
      }
      if (isFrame) {
        const dataUrl = canvasRef.current?.toDataURL({
          multiplier: 0.1,
          format: 'png',
        });
        store.updateFrameSource(modifiedObject.id, dataUrl);
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
            renderOrder: canvasRef.current
              ?.getObjects()
              .map((obj) => obj.id)
              .filter((id) => id !== undefined),
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
        renderOrder: canvasRef.current
          ?.getObjects()
          .map((obj) => obj.id)
          .filter((id) => id !== undefined),
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
        if (hasChanged) {
          store.setSelectedElements(newSelectedElementIds);
        }
      }, 300);
      canvas.on('object:modified', (e) => {
        if (!e?.target) return;
        updateElementState(e.target);
        rootStore.historyStore.addState();
      });

      // Update frame thumbnail when a freehand drawing stroke is completed
      canvas.on('path:created', () => {
        if (store.frames.length === 0) return;
        // Small delay to ensure the path is fully rendered on canvas
        requestAnimationFrame(() => {
          const dataUrl = canvas.toDataURL({ multiplier: 0.1, format: 'png' });
          store.updateCurrentFrameSource(dataUrl);
        });
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
        handleSelectionChange(e.selected || []);
      });
      canvas.on('selection:updated', (e) => {
        handleSelectionChange(e.selected || []);
      });
      canvas.on('selection:cleared', (e) => {
        store.setSelectedElements([]);
      });
      canvas.on('object:selected', (e) => {
        e.target?.set('stroke', 'none');
        const selectedElement = store.selectedElements.find((el) => el.id === e.target?.id);
        if (!selectedElement && e.target?.id) {
          store.setSelectedElements([e.target?.id]);
        }
      });
      /* ── Hover tracking for modern control animations ── */
      canvas.on('mouse:move', (e) => {
        const activeObj = canvas.getActiveObject();
        if (!activeObj || canvas.isDrawingMode) {
          if (activeObj) hoveredControlMap.delete(activeObj);
          return;
        }
        try {
          const pointer = canvas.getPointer(e.e, true);
          // @ts-ignore — _findTargetCorner is internal but stable in Fabric 5
          const corner = activeObj._findTargetCorner?.(pointer);
          if (corner) {
            hoveredControlMap.set(activeObj, corner);
          } else {
            hoveredControlMap.delete(activeObj);
          }
        } catch {
          // Ignore pointer errors
        }
      });

      canvas.on('mouse:down', (e) => {
        // Never interfere with drawing mode — Fabric handles brush strokes
        if (canvas.isDrawingMode) return;
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
          canvas.off('mouse:move');
          guideline?.clearGuideline();
          const rect = canvas.getObjects().find((obj) => obj.id === 'selection-rectangle');
          if (!rect) return;
          canvas.remove(...canvas.getObjects().filter((obj) => obj.id === 'selection-rectangle'));
        });
      });
    };
    if (canvasRef.current === null) {
      const isMobile = window.innerWidth < 768;
      const width = isMobile ? window.innerWidth : canvasStore.width;
      const height = isMobile ? window.innerHeight / 2.5 : canvasStore.height;
      const c = new fabric.Canvas('canvas', {
        backgroundColor: canvasStore.backgroundColor,
        hoverCursor: 'pointer',
        allowTouchScrolling: true,
        selection: true,
        selectionBorderColor: 'rgba(59,130,246,0.6)',
        selectionDashArray: [6, 3],
        selectionLineWidth: 1.5,
        width,
        height,
        enableRetinaScaling: true,
        imageSmoothingEnabled: true,
        stateful: true,
        snapThreshold: 1,
        centeredScaling: true,
        preserveObjectStacking: true,
      });
      canvasRef.current = c;
      rootStore.canvasRef.current = c;
      canvasStore.height = height;
      canvasStore.width = width;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      /* ── Sleek selection styling ── */
      fabric.Object.prototype.transparentCorners = true;
      fabric.Object.prototype.cornerColor = '#3b82f6';
      fabric.Object.prototype.cornerStrokeColor = '#3b82f6';
      fabric.Object.prototype.cornerStyle = 'circle';
      fabric.Object.prototype.centeredScaling = true;
      fabric.Object.prototype.cornerSize = 10;
      fabric.Object.prototype.borderScaleFactor = 1.8;
      fabric.Object.prototype.borderColor = 'rgba(59,130,246,0.6)';
      fabric.Object.prototype.borderDashArray = [6, 3];
      fabric.Object.prototype.id = '';
      interface ObjectOptions {
        zIndex?: number;
      }
      fabric.Object.prototype.zIndex = 0;
      fabric.Object.prototype.selectable = true;
      fabric.Object.prototype.drawSelectionBackground = function (ctx: CanvasRenderingContext2D) {
        return this;
      };
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
      canvas.off('path:created');
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
  }, [canvasRef.current, store]);
};
