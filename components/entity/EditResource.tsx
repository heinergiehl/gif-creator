'use client';
import { useStores } from '@/store';
import { observer } from 'mobx-react';
import React, { useCallback, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { Button } from '../ui/button';
import { FabricObjectFactory } from '@/utils/fabric-utils';
import { useCanvas } from '@/app/components/canvas/canvasContext';
import { TextEditorElement } from '@/types';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { AlignLeft, Move, SunDim, Type } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

/* ── compact inline number field ── */
const Field = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  className,
  suffix,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  className?: string;
  suffix?: string;
}) => (
  <label
    className={cn(
      'group relative flex h-7 items-center gap-1 rounded-md border border-slate-300 bg-white px-1.5 text-xs transition-colors',
      'hover:border-slate-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30',
      'dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500 dark:focus-within:border-blue-500',
      className,
    )}
  >
    <span className="pointer-events-none select-none font-medium text-slate-400 dark:text-slate-500">
      {label}
    </span>
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-full w-[46px] bg-transparent text-xs font-medium tabular-nums text-slate-800 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none dark:text-slate-200"
    />
    {suffix && (
      <span className="pointer-events-none select-none text-[10px] text-slate-400 dark:text-slate-500">
        {suffix}
      </span>
    )}
  </label>
);

/* ── thin divider ── */
const Divider = () => (
  <div className="mx-0.5 h-5 w-px shrink-0 bg-slate-300 dark:bg-slate-700" />
);

/* ── colour swatch + popover ── */
const SWATCHES = [
  '#000000', '#ffffff', '#E2E2E2', '#ff75c3', '#ffa647', '#ffe83f',
  '#9fff5b', '#70e2ff', '#cd93ff', '#09203f', '#ff0000', '#0000ff',
];

const InlineColorPicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) => {
  const [local, setLocal] = React.useState(value);
  React.useEffect(() => setLocal(value), [value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex h-7 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-1.5 text-xs transition-colors hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500"
          title="Text color"
        >
          <div
            className="h-3.5 w-3.5 rounded-sm border border-slate-300 dark:border-slate-600"
            style={{ background: local }}
          />
          <span className="hidden font-mono text-[10px] text-slate-600 dark:text-slate-400 sm:inline">
            {local}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-3" side="bottom" align="start">
        <div className="flex flex-wrap gap-1.5">
          {SWATCHES.map((s) => (
            <button
              key={s}
              className={cn(
                'h-6 w-6 rounded-md border transition-transform hover:scale-110',
                s === local
                  ? 'border-blue-500 ring-2 ring-blue-500/30'
                  : 'border-slate-300 dark:border-slate-600',
              )}
              style={{ background: s }}
              onClick={() => { setLocal(s); onChange(s); }}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="color"
            className="h-7 w-7 cursor-pointer rounded border-none bg-transparent p-0"
            value={local.startsWith('#') ? local : '#000000'}
            onChange={(e) => { setLocal(e.target.value); onChange(e.target.value); }}
          />
          <Input
            className="h-7 flex-1 font-mono text-xs"
            value={local}
            onChange={(e) => { setLocal(e.target.value); onChange(e.target.value); }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

/* ════════════════════════════════════════════════════════════════════════ */
/*  EditResource                                                          */
/* ════════════════════════════════════════════════════════════════════════ */
const EditResource = observer(() => {
  const store = useStores().editorStore;
  const { canvasRef } = useCanvas();
  const uiStore = useStores().uiStore;
  const scrollRef = useRef<HTMLDivElement>(null);

  const sel = store.selectedElements;
  const has = sel.length > 0;
  const isText = has && sel.every((el) => FabricObjectFactory.isTextEditorElement(el));

  const first = has ? sel[0] : null;
  const firstText = isText ? (sel[0] as TextEditorElement) : null;

  const text = firstText?.properties?.text ?? '';
  const fill = (firstText?.properties?.fill as string) ?? '#000000';
  const fontSize = Number(firstText?.properties?.fontSize ?? 14);
  const fontWeight = Number(firstText?.properties?.fontWeight ?? 400);
  const x = Math.round(first?.placement?.x ?? 0);
  const y = Math.round(first?.placement?.y ?? 0);
  const rot = Math.round(first?.placement?.rotation ?? 0);
  const opacity = Math.round(((first?.opacity ?? 1) as number) * 100);
  const w = Math.round((first?.placement?.width ?? 0) * (first?.placement?.scaleX ?? 1));
  const h = Math.round((first?.placement?.height ?? 0) * (first?.placement?.scaleY ?? 1));

  const fabricObj = useCallback(
    (id: string) => canvasRef.current?.getObjects().find((o) => o.id === id) ?? null,
    [canvasRef],
  );

  const setPlacement = useCallback(
    (prop: 'x' | 'y' | 'rotation' | 'width' | 'height' | 'opacity', raw: number) => {
      const c = canvasRef.current;
      if (!c || !sel.length || Number.isNaN(raw)) return;
      sel.forEach((el) => {
        const obj = fabricObj(el.id);
        if (!obj) return;
        switch (prop) {
          case 'x':    obj.set({ left: raw }); store.updateElement(el.id, { placement: { x: raw } }); break;
          case 'y':    obj.set({ top: raw }); store.updateElement(el.id, { placement: { y: raw } }); break;
          case 'rotation': obj.set({ angle: raw }); store.updateElement(el.id, { placement: { rotation: raw } }); break;
          case 'opacity': { const o = Math.max(0, Math.min(1, raw / 100)); obj.set({ opacity: o }); store.updateElement(el.id, { opacity: o }); break; }
          case 'width':  { const bw = obj.width ?? el.placement.width ?? 1; const sx = bw > 0 ? raw / bw : 1; obj.set({ scaleX: sx }); store.updateElement(el.id, { placement: { width: bw, scaleX: sx } }); break; }
          case 'height': { const bh = obj.height ?? el.placement.height ?? 1; const sy = bh > 0 ? raw / bh : 1; obj.set({ scaleY: sy }); store.updateElement(el.id, { placement: { height: bh, scaleY: sy } }); break; }
        }
        obj.setCoords();
      });
      c.requestRenderAll();
    },
    [canvasRef, fabricObj, sel, store],
  );

  const setTextProp = useCallback(
    (prop: keyof fabric.ITextOptions, v: string | number | boolean) => {
      if (!isText) return;
      sel.forEach((el) => {
        if (!FabricObjectFactory.isTextEditorElement(el)) return;
        store.updateElement(el.id, { properties: { ...el.properties, [prop]: v } });
      });
      store.setTextOptionsUpdated(true);
    },
    [isText, sel, store],
  );

  useEffect(() => { store.setAllOptionsToFalse(); }, [uiStore.selectedMenuOption]);

  /* horizontal wheel scroll */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if (el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div
      className={cn(
        'flex w-full shrink-0 items-center border-b px-3',
        'border-slate-200 bg-slate-100/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95',
        has ? 'h-11' : 'h-9',
      )}
    >
      {!has ? (
        <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <Move size={13} />
          Select an object on the canvas to edit it
        </span>
      ) : (
        <div
          ref={scrollRef}
          className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto overflow-y-hidden pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {isText && (
            <>
              <label className="flex h-7 items-center gap-1 rounded-md border border-slate-300 bg-white px-1.5 dark:border-slate-700 dark:bg-slate-900">
                <Type size={12} className="shrink-0 text-slate-400" />
                <input
                  type="text"
                  className="w-[90px] bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200 sm:w-[130px]"
                  value={text}
                  onChange={(e) => setTextProp('text', e.target.value)}
                  placeholder="Text…"
                />
              </label>
              <InlineColorPicker value={fill} onChange={(c) => setTextProp('fill', c)} />
              <Field label="Sz" value={fontSize} min={1} max={300} onChange={(v) => setTextProp('fontSize', v)} className="w-[72px]" />
              <Field label="Wt" value={fontWeight} min={100} max={900} step={100} onChange={(v) => setTextProp('fontWeight', v)} className="w-[72px]" />
              <Button size="sm" variant="ghost" onClick={() => store.toggleOption('textStyleOptions')} className="h-7 px-2 text-xs">
                <AlignLeft size={13} className="mr-1" /> Style
              </Button>
              <Divider />
            </>
          )}

          <Field label="X" value={x} onChange={(v) => setPlacement('x', v)} className="w-[68px]" />
          <Field label="Y" value={y} onChange={(v) => setPlacement('y', v)} className="w-[68px]" />
          <Field label="W" value={Math.max(w, 1)} min={1} onChange={(v) => setPlacement('width', Math.max(v, 1))} className="w-[68px]" />
          <Field label="H" value={Math.max(h, 1)} min={1} onChange={(v) => setPlacement('height', Math.max(v, 1))} className="w-[68px]" />
          <Field label="" value={rot} min={-360} max={360} onChange={(v) => setPlacement('rotation', v)} className="w-[62px]" suffix="°" />
          <Field label="" value={opacity} min={0} max={100} onChange={(v) => setPlacement('opacity', Math.max(0, Math.min(v, 100)))} className="w-[62px]" suffix="%" />

          <Divider />

          <Button size="sm" variant="ghost" onClick={() => store.toggleOption('editOptions')} className="h-7 px-2 text-xs">
            <Move size={13} className="mr-1" /> Arrange
          </Button>
          <Button size="sm" variant="ghost" onClick={() => store.toggleOption('shadowOptions')} className="h-7 px-2 text-xs">
            <SunDim size={13} className="mr-1" /> Shadow
          </Button>
        </div>
      )}
    </div>
  );
});

export default EditResource;
