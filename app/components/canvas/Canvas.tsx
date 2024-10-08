'use client';
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { useStores } from '@/store';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { useCanvas } from './canvasContext';
import { useCanvasResize } from './useCanvasResize';
import { useInitializeCanvas } from './useInitializeCanvas';
import { useManageFabricObjects } from './useManageFabricObjects';
import { Button } from '@/components/ui/button';
import { ScalingIcon } from 'lucide-react';
import { CustomTooltip } from '../ui/CustomTooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import CustomTextInput from '../ui/CustomTextInput';
import { SelectSeparator } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import CustomColorPicker from '../ui/CustomColorPicker';
import { Input } from '@/components/ui/input';
import { fabric } from 'fabric';
import { useMousePosition } from './useMousePosition';
import { Card, CardContent } from '@/components/ui/card';
import { FabricObjectFactory } from '@/utils/fabric-utils';
interface CanvasProps {
  containerWidth: number;
  children?: React.ReactNode;
}
const CanvasComponent: React.FC<CanvasProps> = observer(function CanvasComponent({
  containerWidth,
}) {
  const { canvasRef } = useCanvas();
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const canvasStore = useStores().canvasOptionsStore;
  const { isOver, setNodeRef } = useDroppable({
    id: 'canvas',
    data: { type: 'ObjectInFrame' },
  });
  // useCanvasResize(canvasRef, containerWidth);
  useInitializeCanvas();
  useManageFabricObjects(); // Updated usage
  // useUpdateFabricObjects(canvasRef, store);
  // useUpdateSelectedObject(canvasRef, store);
  // useSyncCanvasWithStore(canvasRef, store);
  const [backgroundColor, setBackgroundColor] = useState(canvasStore.backgroundColor);
  const [close, setClose] = useState(true);
  const hasAlreadyFrames = store.frames.length > 0;
  const getObjectCenter = (obj: fabric.Object) => {
    const boundingRect = obj.getBoundingRect(true, true);
    return {
      x: boundingRect.left + boundingRect.width / 2,
      y: boundingRect.top + boundingRect.height / 2,
    };
  };
  const activeObject = canvasRef.current?.getActiveObject();
  useEffect(() => {
    if (window.innerWidth < 768) {
      canvasRef.current?.setWidth(window.innerWidth);
      // make sure to set hight to auto
      const objs = canvasRef.current?.getObjects();
      if (!objs) return;
      objs.forEach((obj) => {
        obj.scaleToWidth(canvasRef.current?.getWidth() ?? 0);
        obj.scaleToHeight(canvasRef.current?.getHeight() ?? 0);
        obj.setCoords();
      });
    } else {
      canvasRef.current?.setWidth(canvasStore.width);
      const objs = canvasRef.current?.getObjects();
      if (!objs) return;
      objs.forEach((obj) => {
        const element = store.elements.find((el) => el.id === obj.id);
        if (element?.isFrame) {
          obj.scaleToWidth(canvasRef.current?.getWidth() ?? 0);
          obj.scaleToHeight(canvasRef.current?.getHeight() ?? 0);
          obj.setCoords();
        }
      });
    }
  }, [window.innerWidth, window.innerHeight, store.currentKeyFrame]);
  return (
    <div id="grid-canvas-container" className="relative  flex items-center justify-center">
      <canvas
        id="canvas"
        ref={setNodeRef}
        className={cn([
          'relative flex  transform justify-center drop-shadow-lg transition-all duration-300 ease-in-out',
          isOver && hasAlreadyFrames
            ? 'border-4 border-blue-500'
            : isOver && !hasAlreadyFrames
              ? 'border-4 border-red-500'
              : 'border-4 border-transparent',
        ])}
      />
      {activeObject && (
        <>
          {/* Card for displaying size */}
          <div
            id="size-overlay"
            style={{
              position: 'absolute',
              top: getObjectCenter(activeObject).y + 20,
              left: getObjectCenter(activeObject).x - 20,
              pointerEvents: 'none',
            }}
            className={cn(['flex'])}
          >
            <Card
              className={cn([
                'rounded-sm',
                canvasRef.current?.getActiveObjects().length === 0 ? 'hidden' : 'visible',
              ])}
            >
              <CardContent className="flex h-full w-full items-center justify-center px-1 py-0">
                <span className="flex items-center justify-center text-center" id="widthAndHeight">
                  {Math.round(activeObject.getScaledWidth() ?? 0)} x{' '}
                  {Math.round(activeObject.getScaledHeight() ?? 0)}
                </span>
              </CardContent>
            </Card>
          </div>
          {/* Card for displaying angle */}
          <div
            id="angle-overlay"
            style={{
              position: 'absolute',
              top: getObjectCenter(activeObject).y,
              left: getObjectCenter(activeObject).x - 20,
              pointerEvents: 'none',
            }}
            className={cn(['flex'])}
          >
            <Card
              className={cn([
                'rounded-sm',
                canvasRef.current?.getActiveObjects().length === 0 ? 'hidden' : 'visible',
              ])}
            >
              <CardContent className="flex h-full w-full items-center justify-center px-1 py-0">
                <span className="flex items-center justify-center text-center" id="angle">
                  {Math.round(activeObject.angle ?? 0)}°
                </span>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
});
export default CanvasComponent;
export const CanvasSettings = observer(() => {
  const canvasStore = useStores().canvasOptionsStore;
  const [backgroundColor, setBackgroundColor] = useState(canvasStore.backgroundColor);
  const [close, setClose] = useState(true);
  const canvasRef = useCanvas().canvasRef;
  const rootStore = useStores();
  const applyChanges = () => {
    canvasRef.current?.setWidth(canvasStore.width);
    canvasRef.current?.setHeight(canvasStore.height);
    canvasStore.setBackgroundColor(backgroundColor);
    canvasRef.current?.renderAll();
    setClose(true);
  };
  const store = useStores().editorStore;
  useEffect(() => {
    applyChanges();
    canvasRef.current?.requestRenderAll();
  }, [
    canvasRef.current?.width,
    canvasRef.current?.height,
    canvasStore.width,
    canvasStore.height,
    store.currentKeyFrame,
  ]);
  return (
    <Popover open={!close}>
      <PopoverTrigger asChild>
        <Button variant="outline" onClick={() => setClose(!close)}>
          <CustomTooltip content="Resize Canvas">
            <ScalingIcon />
          </CustomTooltip>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="grid w-full grid-cols-2 items-center justify-center gap-4">
        <Label>
          <div className="flex flex-col gap-y-2">
            Width
            <CustomTextInput
              onChange={(value) => {
                canvasStore.setWidth(parseInt(value));
              }}
              className="w-20"
              name="width"
              inputTooltip="Adjust the width of the canvas"
              value={String(canvasStore.width)}
            />
          </div>
        </Label>
        <Label>
          <div className="flex flex-col gap-y-2">
            <span> Height</span>
            <CustomTextInput
              onChange={(value) => {
                canvasStore.setHeight(parseInt(value));
              }}
              className=" w-20"
              name="height"
              inputTooltip="Adjust the height of the canvas"
              value={String(canvasStore.height)}
            />
          </div>
        </Label>
        <SelectSeparator className="col-span-2" />
        <Label>
          <div className="flex flex-col gap-y-2">
            <span>Background Color</span>
            <Input
              type="color"
              name="backgroundColor"
              onChange={(e) => {
                setBackgroundColor(e.target.value);
              }}
              value={backgroundColor}
            />
          </div>
        </Label>
        <SelectSeparator className="col-span-2" />
        <Button onClick={applyChanges} variant="outline">
          Apply
        </Button>
      </PopoverContent>
    </Popover>
  );
});
