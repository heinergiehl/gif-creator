'use client';
import React, { useState, useCallback, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/store';
import { fabric } from 'fabric';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { getUid } from '@/utils';
import { useDraggable } from '@dnd-kit/core';
import { Layers, MousePointerClick, Hexagon } from 'lucide-react';

/* ─── shape helpers ──────────────────────────────────────────────────── */

function regularPolygonPoints(sides: number, radius: number): fabric.Point[] {
  const pts: fabric.Point[] = [];
  const startAngle = -Math.PI / 2;
  for (let i = 0; i < sides; i++) {
    const a = startAngle + (i * Math.PI * 2) / sides;
    pts.push(new fabric.Point(radius + radius * Math.cos(a), radius + radius * Math.sin(a)));
  }
  return pts;
}

function starPoints(outer: number, inner: number, count: number): fabric.Point[] {
  const pts: fabric.Point[] = [];
  const step = Math.PI / count;
  const startAngle = -Math.PI / 2;
  for (let i = 0; i < count * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    pts.push(
      new fabric.Point(
        outer + r * Math.cos(startAngle + i * step),
        outer + r * Math.sin(startAngle + i * step),
      ),
    );
  }
  return pts;
}

const HEART_PATH =
  'M 50 30 C 50 25 45 0 25 0 C 10 0 0 12 0 25 C 0 40 10 55 25 70 L 50 95 L 75 70 C 90 55 100 40 100 25 C 100 12 90 0 75 0 C 55 0 50 25 50 30 Z';
const ARROW_PATH = 'M 0 40 L 60 40 L 60 20 L 100 50 L 60 80 L 60 60 L 0 60 Z';
const SPEECH_PATH =
  'M 10 0 L 90 0 Q 100 0 100 10 L 100 60 Q 100 70 90 70 L 40 70 L 20 90 L 25 70 L 10 70 Q 0 70 0 60 L 0 10 Q 0 0 10 0 Z';

/* ─── shape definitions ──────────────────────────────────────────────── */

type ShapeType =
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'star'
  | 'diamond'
  | 'heart'
  | 'arrow'
  | 'line'
  | 'pentagon'
  | 'hexagon'
  | 'ellipse'
  | 'ring'
  | 'speech';

interface ShapeDef {
  type: ShapeType;
  label: string;
  /** preview SVG path (16×16 viewBox) */
  preview: string;
}

const SHAPES: ShapeDef[] = [
  { type: 'rect', label: 'Rectangle', preview: 'M2 2h12v12H2z' },
  { type: 'circle', label: 'Circle', preview: 'M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2z' },
  { type: 'triangle', label: 'Triangle', preview: 'M8 2L14 14H2z' },
  {
    type: 'star',
    label: 'Star',
    preview: 'M8 1l2.2 4.5 5 .7-3.6 3.5.8 5L8 12.5 3.6 14.7l.8-5L.8 6.2l5-.7z',
  },
  { type: 'diamond', label: 'Diamond', preview: 'M8 1L15 8 8 15 1 8z' },
  {
    type: 'heart',
    label: 'Heart',
    preview:
      'M8 14s-5.5-4-5.5-7.5C2.5 4 4 2.5 5.5 2.5c1 0 2 .7 2.5 1.5C8.5 3.2 9.5 2.5 10.5 2.5 12 2.5 13.5 4 13.5 6.5 13.5 10 8 14 8 14z',
  },
  { type: 'arrow', label: 'Arrow', preview: 'M1 7h10l-3-3h2l4 4-4 4h-2l3-3H1z' },
  { type: 'line', label: 'Line', preview: 'M2 8h12' },
  { type: 'pentagon', label: 'Pentagon', preview: 'M8 1L14.5 5.5 12 13H4L1.5 5.5z' },
  { type: 'hexagon', label: 'Hexagon', preview: 'M4.5 1.5h7L15 8l-3.5 6.5h-7L1 8z' },
  {
    type: 'ellipse',
    label: 'Ellipse',
    preview: 'M8 4c3.3 0 6 1.8 6 4s-2.7 4-6 4S2 10.2 2 8s2.7-4 6-4z',
  },
  {
    type: 'speech',
    label: 'Speech',
    preview:
      'M3 2h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7l-3 3 .5-3H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z',
  },
];

/* ─── quick fill swatches ───────────────────────────────────────────── */

const FILL_SWATCHES = [
  '#3b82f6',
  '#ef4444',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
  '#000000',
  '#ffffff',
  'transparent',
];

/* ─── shape config type (passed via drag data, rendered lazily on drop) */

export interface ShapeConfig {
  shapeType: ShapeType;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  shapeOpacity: number;
  cornerRadius: number;
}

/**
 * Render a shape to a PNG dataURL.
 * Exported so Editor.tsx can call it lazily on drop — never during drag/render.
 */
export function renderShapeToDataURL(config: ShapeConfig, size: number): string | null {
  const { shapeType, fillColor, strokeColor, strokeWidth, shapeOpacity, cornerRadius } = config;
  const common: fabric.IObjectOptions = {
    fill: fillColor === 'transparent' ? '' : fillColor,
    stroke: strokeColor,
    strokeWidth,
    opacity: shapeOpacity / 100,
  };

  let obj: fabric.Object;
  switch (shapeType) {
    case 'rect':
      obj = new fabric.Rect({
        ...common,
        width: size,
        height: size * 0.7,
        rx: cornerRadius,
        ry: cornerRadius,
      });
      break;
    case 'circle':
      obj = new fabric.Circle({ ...common, radius: size / 2 });
      break;
    case 'ellipse':
      obj = new fabric.Ellipse({ ...common, rx: size / 2, ry: size / 3 });
      break;
    case 'triangle':
      obj = new fabric.Triangle({ ...common, width: size, height: size * 0.866 });
      break;
    case 'star':
      obj = new fabric.Polygon(starPoints(size / 2, size / 5, 5), common);
      break;
    case 'diamond':
      obj = new fabric.Polygon(
        [
          new fabric.Point(size / 2, 0),
          new fabric.Point(size, size / 2),
          new fabric.Point(size / 2, size),
          new fabric.Point(0, size / 2),
        ],
        common,
      );
      break;
    case 'pentagon':
      obj = new fabric.Polygon(regularPolygonPoints(5, size / 2), common);
      break;
    case 'hexagon':
      obj = new fabric.Polygon(regularPolygonPoints(6, size / 2), common);
      break;
    case 'heart':
      obj = new fabric.Path(HEART_PATH, {
        ...common,
        scaleX: size / 100,
        scaleY: size / 100,
      });
      break;
    case 'arrow':
      obj = new fabric.Path(ARROW_PATH, {
        ...common,
        scaleX: size / 100,
        scaleY: size / 100,
      });
      break;
    case 'speech':
      obj = new fabric.Path(SPEECH_PATH, {
        ...common,
        scaleX: size / 100,
        scaleY: size / 100,
      });
      break;
    case 'line':
      obj = new fabric.Line([0, 0, size, 0], {
        stroke: strokeColor,
        strokeWidth: Math.max(strokeWidth, 3),
        opacity: shapeOpacity / 100,
      });
      break;
    case 'ring':
      obj = new fabric.Circle({
        ...common,
        radius: size / 2,
        fill: 'transparent',
        strokeWidth: Math.max(strokeWidth, size / 10),
      });
      break;
    default:
      return null;
  }

  const pad = (strokeWidth || 0) * 2 + 4;
  const tempCanvas = new fabric.StaticCanvas(null as any, {
    width: (obj.getScaledWidth?.() ?? size) + pad,
    height: (obj.getScaledHeight?.() ?? size) + pad,
  });
  obj.set({ left: pad / 2, top: pad / 2 });
  tempCanvas.add(obj);
  tempCanvas.renderAll();

  const dataUrl = tempCanvas.toDataURL({ format: 'png', quality: 1 });
  tempCanvas.dispose();
  return dataUrl;
}

/* ─── draggable shape card ───────────────────────────────────────────
   PERF: Does NOT call renderShapeToDataURL during render.
   Passes lightweight ShapeConfig via ref → resolved lazily on drop.
   ──────────────────────────────────────────────────────────────────── */

const DraggableShape = React.memo(function DraggableShape({
  shapeDef,
  isSelected,
  onSelect,
  configRef,
  index,
}: {
  shapeDef: ShapeDef;
  isSelected: boolean;
  onSelect: () => void;
  configRef: React.RefObject<ShapeConfig | null>;
  index: number;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `shapeResource-${index}`,
    data: {
      type: 'shape',
      shapeType: shapeDef.type,
      /** Read lazily on drop — always has latest fill/stroke/opacity values, but
       *  overrides shapeType with THIS specific shape (not the selected one) */
      getShapeConfig: (): ShapeConfig | null => {
        const base = configRef.current;
        if (!base) return null;
        return { ...base, shapeType: shapeDef.type };
      },
      dragOverlay: () => (
        <div
          draggable="false"
          className="flex items-center gap-2.5 rounded-xl border border-blue-400/40 bg-slate-900/95 px-4 py-2.5 shadow-2xl shadow-black/50 backdrop-blur-md"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/20">
            <Hexagon className="h-4 w-4 text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wider text-blue-400/70">
              Shape
            </span>
            <span className="max-w-[140px] truncate text-sm font-medium text-white">
              {shapeDef.label}
            </span>
          </div>
        </div>
      ),
    },
  });

  return (
    <div
      className="touch-none"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <button
        title={`${shapeDef.label} — drag or click to select`}
        onClick={(e) => {
          e.preventDefault();
          onSelect();
        }}
        className={cn(
          'group flex w-full flex-col items-center gap-1.5 rounded-xl border-2 bg-white p-2.5 transition-colors duration-100',
          'cursor-grab active:cursor-grabbing',
          'dark:bg-slate-800',
          isSelected
            ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-500/10 dark:border-blue-400 dark:bg-blue-950/40'
            : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-700 dark:hover:border-blue-500/50 dark:hover:bg-blue-950/20',
        )}
      >
        <svg
          viewBox="0 0 16 16"
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <path
            d={shapeDef.preview}
            className={cn(
              isSelected
                ? 'fill-blue-200 stroke-blue-600 dark:fill-blue-800 dark:stroke-blue-400'
                : 'fill-slate-200 stroke-slate-500 group-hover:fill-blue-100 group-hover:stroke-blue-500 dark:fill-slate-700 dark:stroke-slate-400',
            )}
          />
        </svg>
        <span
          className={cn(
            'text-[9px] font-semibold leading-none',
            isSelected
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-400 group-hover:text-blue-500 dark:text-slate-500',
          )}
        >
          {shapeDef.label}
        </span>
      </button>
    </div>
  );
});

/* ─── component ──────────────────────────────────────────────────────── */

export const ShapesPanel = observer(function ShapesPanel() {
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const canvasOptions = rootStore.canvasOptionsStore;

  const [fillColor, setFillColor] = useState('#3b82f6');
  const [strokeColor, setStrokeColor] = useState('#1e40af');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [shapeOpacity, setShapeOpacity] = useState(100);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('rect');

  const hasFrames = store.frames.length > 0;
  const canvasSize = Math.min(canvasOptions.width || 400, canvasOptions.height || 400);

  // Mutable ref always holding the latest config — read lazily by drag data on drop
  const configRef = useRef<ShapeConfig | null>(null);
  configRef.current = {
    shapeType: selectedShape,
    fillColor,
    strokeColor,
    strokeWidth,
    shapeOpacity,
    cornerRadius,
  };

  const selectedDef = SHAPES.find((s) => s.type === selectedShape)!;

  /* ── add shape to canvas as image overlay (click "As Object") ── */
  const handleAddToCanvas = useCallback(
    (shapeType: ShapeType) => {
      if (!hasFrames) return;
      const size = canvasSize * 0.3;
      const dataUrl = renderShapeToDataURL(
        { shapeType, fillColor, strokeColor, strokeWidth, shapeOpacity, cornerRadius },
        size,
      );
      if (!dataUrl) return;

      const newId = String(getUid());
      store.addImage(store.elements.length, dataUrl, false, newId);
      requestAnimationFrame(() => {
        store.setSelectedElements([newId]);
      });
    },
    [hasFrames, fillColor, strokeColor, strokeWidth, shapeOpacity, cornerRadius, store, canvasSize],
  );

  /* ── add shape as a new frame in the timeline (click "As Frame") ── */
  const handleAddToTimeline = useCallback(
    (shapeType: ShapeType) => {
      const size = canvasSize * 0.3;
      const dataUrl = renderShapeToDataURL(
        { shapeType, fillColor, strokeColor, strokeWidth, shapeOpacity, cornerRadius },
        size,
      );
      if (!dataUrl) return;

      const frameId = getUid();
      const newFrame = { id: frameId, src: dataUrl };
      store.frames.push(newFrame);
      store.addImage(store.frames.length - 1, dataUrl, true, frameId);
      store.syncFramesTimeline();
    },
    [fillColor, strokeColor, strokeWidth, shapeOpacity, cornerRadius, store, canvasSize],
  );

  return (
    <div className="flex h-[70dvh] w-full flex-col bg-slate-50 text-foreground dark:bg-slate-900 md:h-screen">
      {/* Header */}
      <div className="flex h-[42px] shrink-0 items-center justify-center border-b border-slate-200 dark:border-slate-800">
        <span className="text-sm font-medium">Shapes</span>
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="flex flex-col gap-4 p-4">
          {/* ── Start with blank frame (shown first when no frames) ── */}
          {!hasFrames && (
            <Button
              variant="default"
              className="w-full gap-1.5 text-sm font-semibold"
              onClick={() => store.addBlankFrame()}
            >
              <Layers className="h-4 w-4" /> Start with blank frame
            </Button>
          )}

          {/* ── Shape grid (draggable + selectable) ── */}
          <div className="grid grid-cols-4 gap-1.5">
            {SHAPES.map((shapeDef, index) => (
              <DraggableShape
                key={shapeDef.type}
                shapeDef={shapeDef}
                isSelected={selectedShape === shapeDef.type}
                onSelect={() => setSelectedShape(shapeDef.type)}
                configRef={configRef}
                index={index}
              />
            ))}
          </div>

          {/* ── Click-to-add buttons ── */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs"
                onClick={() => handleAddToCanvas(selectedShape)}
                disabled={!hasFrames}
                title={
                  hasFrames
                    ? `Add ${selectedDef.label} as overlay on current frame`
                    : 'Add a frame first (use "As Frame" or import media)'
                }
              >
                <MousePointerClick className="h-3.5 w-3.5" />
                As Object
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs"
                onClick={() => handleAddToTimeline(selectedShape)}
                title={`Add ${selectedDef.label} as a new frame`}
              >
                <Layers className="h-3.5 w-3.5" />
                As Frame
              </Button>
            </div>
            {!hasFrames && (
              <p className="text-center text-[10px] text-amber-600 dark:text-amber-400">
                No frames yet — use &ldquo;As Frame&rdquo; or drag a shape to the timeline
              </p>
            )}
            <p className="text-center text-[10px] text-slate-400 dark:text-slate-500">
              Or drag any shape onto canvas / timeline
            </p>
          </div>

          <Separator />

          {/* ── Fill Color ── */}
          <div className="space-y-3">
            <Label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Fill</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border-2 border-slate-200 bg-transparent p-0 transition hover:border-blue-400 dark:border-slate-700"
                  value={fillColor === 'transparent' ? '#ffffff' : fillColor}
                  onChange={(e) => setFillColor(e.target.value)}
                />
                <Input
                  className="h-8 flex-1 font-mono text-xs"
                  value={fillColor}
                  onChange={(e) => setFillColor(e.target.value)}
                />
              </div>
              {/* Quick swatches */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {FILL_SWATCHES.map((c) => (
                  <button
                    key={c}
                    className={cn(
                      'h-5 w-5 rounded-full border-2 transition-all hover:scale-125 active:scale-95',
                      c === 'transparent'
                        ? 'bg-[repeating-conic-gradient(#ccc_0%_25%,#fff_0%_50%)] bg-[length:8px_8px]'
                        : '',
                      fillColor === c
                        ? 'border-blue-500 ring-1 ring-blue-300'
                        : 'border-slate-300 dark:border-slate-600',
                    )}
                    style={{ backgroundColor: c === 'transparent' ? undefined : c }}
                    onClick={() => setFillColor(c)}
                    title={c === 'transparent' ? 'No fill' : c}
                  />
                ))}
              </div>
            </Label>

            {/* ── Stroke Color ── */}
            <Label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Stroke Color
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border-2 border-slate-200 bg-transparent p-0 transition hover:border-blue-400 dark:border-slate-700"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                />
                <Input
                  className="h-8 flex-1 font-mono text-xs"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                />
              </div>
            </Label>
          </div>

          <Separator />

          {/* ── Stroke Width ── */}
          <Label className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Stroke Width
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {strokeWidth}px
              </span>
            </div>
            <Slider
              min={0}
              max={20}
              step={1}
              value={[strokeWidth]}
              onValueChange={(v) => setStrokeWidth(v[0])}
            />
          </Label>

          {/* ── Opacity ── */}
          <Label className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Opacity
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {shapeOpacity}%
              </span>
            </div>
            <Slider
              min={5}
              max={100}
              step={5}
              value={[shapeOpacity]}
              onValueChange={(v) => setShapeOpacity(v[0])}
            />
          </Label>

          {/* ── Corner Radius ── */}
          <Label className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Corner Radius
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {cornerRadius}px
              </span>
            </div>
            <Slider
              min={0}
              max={50}
              step={1}
              value={[cornerRadius]}
              onValueChange={(v) => setCornerRadius(v[0])}
            />
          </Label>
        </div>
      </ScrollArea>
    </div>
  );
});
