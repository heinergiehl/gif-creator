'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/store';
import { useCanvas } from '@/app/components/canvas/canvasContext';
import { fabric } from 'fabric';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Paintbrush,
  SprayCan,
  Circle,
  Eraser,
  Power,
  PowerOff,
  Layers,
  Copy,
  Plus,
  Undo2,
} from 'lucide-react';

type BrushType = 'pencil' | 'spray' | 'circle';

const BRUSH_TYPES: { type: BrushType; label: string; icon: React.ElementType; desc: string }[] = [
  { type: 'pencil', label: 'Pencil', icon: Paintbrush, desc: 'Smooth freehand strokes' },
  { type: 'spray', label: 'Spray', icon: SprayCan, desc: 'Spray paint effect' },
  { type: 'circle', label: 'Dots', icon: Circle, desc: 'Dotted circle brush' },
];

const QUICK_COLORS = [
  '#000000',
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#a855f7',
  '#f43f5e',
];

export const DrawingPanel = observer(function DrawingPanel() {
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const { canvasRef } = useCanvas();
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushType, setBrushType] = useState<BrushType>('pencil');
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushOpacity, setBrushOpacity] = useState(100);
  const prevKeyFrame = useRef(store.currentKeyFrame);

  const hasFrames = store.frames.length > 0;

  const configureBrush = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let brush: fabric.BaseBrush;
    switch (brushType) {
      case 'spray': {
        const spray = new (fabric.SprayBrush as any)(canvas);
        spray.density = 20;
        spray.dotWidthVariance = 3;
        brush = spray;
        break;
      }
      case 'circle': {
        brush = new (fabric.CircleBrush as any)(canvas);
        break;
      }
      case 'pencil':
      default:
        brush = new fabric.PencilBrush(canvas);
        break;
    }

    brush.width = brushSize;

    // Apply color with opacity via rgba
    const hex = brushColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    brush.color = `rgba(${r},${g},${b},${brushOpacity / 100})`;

    canvas.freeDrawingBrush = brush;
  }, [canvasRef, brushType, brushSize, brushColor, brushOpacity]);

  // Reconfigure brush whenever settings change while drawing
  useEffect(() => {
    if (isDrawing) {
      configureBrush();
    }
  }, [isDrawing, configureBrush]);

  // Auto-disable drawing mode when switching frames
  useEffect(() => {
    if (store.currentKeyFrame !== prevKeyFrame.current) {
      prevKeyFrame.current = store.currentKeyFrame;
      const canvas = canvasRef.current;
      if (canvas && canvas.isDrawingMode) {
        canvas.isDrawingMode = false;
        setIsDrawing(false);
      }
    }
  }, [store.currentKeyFrame, canvasRef]);

  // Clean up drawing mode when the panel unmounts (user switched tabs)
  useEffect(() => {
    return () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.isDrawingMode) {
        canvas.isDrawingMode = false;
      }
    };
  }, [canvasRef]);

  const toggleDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasFrames) return;

    if (isDrawing) {
      canvas.isDrawingMode = false;
      canvas.discardActiveObject();
      canvas.renderAll();
      setIsDrawing(false);
    } else {
      canvas.isDrawingMode = true;
      configureBrush();
      setIsDrawing(true);
    }
  }, [canvasRef, isDrawing, hasFrames, configureBrush]);

  const flattenToFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasFrames) return;

    const wasDrawing = canvas.isDrawingMode;
    canvas.isDrawingMode = false;
    canvas.discardActiveObject();

    // Get IDs of non-frame overlay elements so we can hide them
    const overlayIds = new Set(store.elementsInCurrentFrame.map((el) => el.id));

    // Hide overlays, keep only frame image + drawing paths visible
    const hiddenObjects: fabric.Object[] = [];
    canvas.getObjects().forEach((obj) => {
      if (overlayIds.has((obj as any).id)) {
        obj.visible = false;
        hiddenObjects.push(obj);
      }
    });

    canvas.renderAll();
    const dataUrl = canvas.toDataURL({ format: 'png', quality: 1 });

    // Restore overlay visibility
    hiddenObjects.forEach((obj) => {
      obj.visible = true;
    });

    // Remove untracked objects (drawing paths) from canvas
    const allTrackedIds = new Set(store.elements.map((el) => el.id));
    const pathsToRemove = canvas
      .getObjects()
      .filter((obj) => !(obj as any).id || !allTrackedIds.has((obj as any).id));
    pathsToRemove.forEach((obj) => canvas.remove(obj));

    // Update both frame thumbnail and element src
    store.updateCurrentFrameImageAndElement(dataUrl);

    if (wasDrawing) {
      canvas.isDrawingMode = true;
      configureBrush();
    }
    canvas.renderAll();
  }, [canvasRef, hasFrames, store, configureBrush]);

  const clearDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const allTrackedIds = new Set(store.elements.map((el) => el.id));
    const pathsToRemove = canvas
      .getObjects()
      .filter((obj) => !(obj as any).id || !allTrackedIds.has((obj as any).id));
    pathsToRemove.forEach((obj) => canvas.remove(obj));
    canvas.renderAll();
  }, [canvasRef, store]);

  return (
    <div className="flex h-[70dvh] w-full flex-col bg-slate-50 text-foreground dark:bg-slate-900 md:h-screen">
      {/* Header */}
      <div className="flex h-[42px] items-center justify-center border-b border-slate-200 dark:border-slate-800">
        <span className="text-sm font-medium">Draw</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-5 p-5">
          {/* ── Start with blank frame (shown first when no frames) ── */}
          {!hasFrames && (
            <Button
              onClick={() => store.addBlankFrame()}
              variant="default"
              className="w-full gap-1.5 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" /> Start with blank frame
            </Button>
          )}

          {/* ── Drawing Toggle ── */}
          <Button
            onClick={toggleDrawing}
            disabled={!hasFrames}
            variant={isDrawing ? 'destructive' : 'default'}
            className={cn('w-full gap-2 text-sm font-semibold transition-all', isDrawing && 'animate-pulse')}
          >
            {isDrawing ? (
              <>
                <PowerOff className="h-4 w-4" /> Stop Drawing
              </>
            ) : (
              <>
                <Power className="h-4 w-4" /> Start Drawing
              </>
            )}
          </Button>

          <Separator />

          {/* ── Brush Type ── */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {BRUSH_TYPES.map(({ type, label, icon: Icon, desc }) => (
                <button
                  key={type}
                  onClick={() => setBrushType(type)}
                  title={desc}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all hover:scale-105 active:scale-95',
                    brushType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-lg dark:bg-blue-950/60 dark:text-blue-400'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* ── Brush Size ── */}
          <Label className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Brush Size</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {brushSize}px
              </span>
            </div>
            <Slider min={1} max={100} step={1} value={[brushSize]} onValueChange={(v) => setBrushSize(v[0])} />
          </Label>

          {/* ── Opacity ── */}
          <Label className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Opacity</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {brushOpacity}%
              </span>
            </div>
            <Slider min={5} max={100} step={5} value={[brushOpacity]} onValueChange={(v) => setBrushOpacity(v[0])} />
          </Label>

          <Separator />

          {/* ── Color ── */}
          <Label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Color
            </span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-9 w-9 cursor-pointer rounded-lg border-2 border-slate-200 bg-transparent p-0.5 transition hover:border-blue-400 dark:border-slate-700"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
              />
              <Input
                className="h-9 flex-1 font-mono text-xs"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
              />
            </div>
            {/* Quick color swatches */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_COLORS.map((c) => (
                <button
                  key={c}
                  className={cn(
                    'h-6 w-6 rounded-full border-2 transition-all hover:scale-125 active:scale-95',
                    brushColor === c
                      ? 'border-blue-500 ring-2 ring-blue-300 dark:ring-blue-700'
                      : 'border-slate-300 dark:border-slate-600',
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setBrushColor(c)}
                />
              ))}
            </div>
          </Label>

          <Separator />

          {/* ── Flatten / Clear ── */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs"
                onClick={flattenToFrame}
                disabled={!hasFrames}
                title="Bake your drawing into the current frame image"
              >
                <Layers className="h-3.5 w-3.5" />
                Flatten
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                onClick={clearDrawing}
                title="Remove all un-flattened strokes"
              >
                <Eraser className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
          </div>

          <Separator />

          {/* ── Frame Building ── */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs"
                onClick={() => store.addBlankFrame()}
                title="Add a blank colored frame at the end"
              >
                <Plus className="h-3.5 w-3.5" />
                Blank Frame
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs"
                onClick={() => store.duplicateCurrentFrame()}
                disabled={!hasFrames}
                title="Duplicate the current frame after it"
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicate
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
});
