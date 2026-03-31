'use client';
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { TextResource } from '../entity/TextResource';
import { useStores } from '@/store';
import { useDraggable } from '@dnd-kit/core';
import { Label } from '../ui/label';
import { CustomSelect } from '@/app/components/ui/CustomSelect';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import CustomTextInput from '@/app/components/ui/CustomTextInput';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { GripVertical, Layers, MousePointerClick, Type } from 'lucide-react';
import { fabric } from 'fabric';
import { getUid } from '@/utils';

type TextResourceProps = {
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  fill: string;
  fontStyle: string;
  textBackground: string;
  sampleText: string;
};

/** Draggable text card */
const DraggableText = observer(
  ({
    fontSize,
    fontWeight,
    fontFamily,
    fill,
    fontStyle,
    textBackground,
    sampleText,
    index,
  }: TextResourceProps & { index: number }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id: `textResource-${index}`,
      data: {
        text: sampleText,
        fontSize,
        fontWeight,
        fontFamily,
        fill,
        fontStyle,
        textBackground,
        dragOverlay: () => (
          <div
            draggable="false"
            className="flex items-center gap-2.5 rounded-xl border border-blue-400/40 bg-slate-900/95 px-4 py-2.5 shadow-2xl shadow-black/50 backdrop-blur-md"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/20">
              <Type className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-wider text-blue-400/70">
                Text
              </span>
              <span
                className="max-w-[140px] truncate text-sm font-medium text-white"
                style={{
                  fontFamily: fontFamily,
                  fontStyle: fontStyle,
                }}
              >
                {sampleText}
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
        <div className="group relative flex cursor-grab items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-blue-400/50 hover:shadow-md active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-400/50">
          {/* Grip handle */}
          <GripVertical className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400" />

          {/* Text preview */}
          <div
            className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap leading-tight"
            style={{
              fontSize: `${Math.min(fontSize, 28)}px`,
              fontWeight: `${fontWeight}`,
              color: fill,
              fontFamily: fontFamily,
              fontStyle: fontStyle,
              backgroundColor: textBackground || undefined,
            }}
          >
            {sampleText}
          </div>

          {/* Drag hint */}
          <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-slate-700 dark:text-slate-500">
            drag
          </span>
        </div>
      </div>
    );
  },
);

// FontPicker component for selecting fonts
const FontPicker = observer(() => {
  const fontOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Comic Sans MS', label: 'Comic Sans MS' },
    { value: 'Impact', label: 'Impact' },
  ];
  const store = useStores().editorStore;
  const handleFontChange = (value: string) => {
    store.fontFamily = value;
  };
  return (
    <Label htmlFor="fontPicker" className="flex flex-col space-y-1.5">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Font</span>
      <CustomSelect
        options={fontOptions}
        trigger={store.fontFamily}
        value={store.fontFamily}
        onChange={handleFontChange}
      />
    </Label>
  );
});

// TextResourcesPanel component
export const TextResourcesPanel = observer(() => {
  const store = useStores().editorStore;
  const [fontSize, setFontSize] = useState(14);
  const [fontWeight, setFontWeight] = useState('400');
  const [fill, setFill] = useState('#000000');

  useEffect(() => {
    store.fill = fill;
    store.fontSize = fontSize;
  }, [fill, fontSize]);

  const [sampleText, setSampleText] = useState('Sample Text');
  const hasFrames = store.frames.length > 0;

  /** Click‑to‑add text as an overlay on the current frame */
  const handleAddToCanvas = () => {
    if (!hasFrames) return;
    const newTextId = String(getUid());
    store.addText({
      fill: store.fill,
      id: newTextId,
      text: sampleText,
      fontSize: store.fontSize,
      fontWeight: store.fontWeight,
      textBackground: store.textBackground,
      fontFamily: store.fontFamily,
      fontStyle: store.fontStyle,
      isFrame: false,
      index: store.elements.length,
    });
    // Auto-select so the edit bar appears
    store.setSelectedElements([newTextId]);
  };

  /** Click‑to‑add text as a new frame in the timeline */
  const handleAddToTimeline = () => {
    const frameId = getUid();
    const fabricText = new fabric.Textbox(sampleText, {
      id: String(frameId),
      fill: store.fill,
      fontSize: store.fontSize,
      fontWeight: store.fontWeight,
      textBackground: store.textBackground,
      fontFamily: store.fontFamily,
      fontStyle: store.fontStyle,
      isFrame: true,
      index: store.frames.length,
    });
    const src = fabricText.toDataURL({ format: 'png', quality: 1 });
    const newFrame = { id: frameId, src };
    store.frames.push(newFrame);
    store.addText({
      id: String(frameId),
      text: sampleText,
      fill: store.fill,
      fontSize: store.fontSize,
      fontWeight: store.fontWeight,
      textBackground: store.textBackground,
      fontFamily: store.fontFamily,
      fontStyle: store.fontStyle,
      isFrame: true,
      index: store.frames.length - 1,
    });
    store.syncFramesTimeline();
  };

  return (
    <div
      draggable="false"
      className="flex h-[70dvh] w-full flex-col bg-slate-50 text-foreground dark:bg-slate-900 md:h-screen"
    >
      {/* Header */}
      <div className="flex h-[50px] items-center justify-center border-b border-slate-200 dark:border-slate-800">
        <span className="text-sm font-medium">Add Text</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-5 p-5">
          {/* Font & Color */}
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <FontPicker />
            <Label htmlFor="fill" className="flex flex-col space-y-1.5">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Color</span>
              <Input
                className="h-9 w-10 cursor-pointer rounded-md border-slate-200 p-0.5 dark:border-slate-700"
                type="color"
                id="fill"
                name="fill"
                value={fill}
                onChange={(e) => setFill(e.target.value)}
              />
            </Label>
          </div>

          {/* Font size */}
          <Label className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Font Size
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {fontSize}px
              </span>
            </div>
            <input
              type="range"
              min="8"
              max="72"
              step="1"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 dark:bg-slate-700"
            />
          </Label>

          <Separator />

          {/* Sample text input */}
          <Label htmlFor="sampleText" className="flex flex-col space-y-1.5">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Your Text
            </span>
            <CustomTextInput
              name="sampleText"
              inputTooltip="Text content to add"
              value={sampleText}
              onChange={(value) => setSampleText(value)}
            />
          </Label>

          <Separator />

          {/* Click-to-add buttons */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Quick Add
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs"
                onClick={handleAddToCanvas}
                disabled={!hasFrames}
                title={hasFrames ? 'Add text as overlay on current frame' : 'Import frames first'}
              >
                <MousePointerClick className="h-3.5 w-3.5" />
                To Canvas
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs"
                onClick={handleAddToTimeline}
              >
                <Layers className="h-3.5 w-3.5" />
                To Timeline
              </Button>
            </div>
            {!hasFrames && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400">
                Import frames first to add text overlays to the canvas.
              </p>
            )}
          </div>

          <Separator />

          {/* Draggable preview */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Or Drag &amp; Drop
            </span>
            <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
              Drag onto the <strong>canvas</strong> to add a text overlay, or onto the{' '}
              <strong>timeline</strong> to create a new text frame.
            </p>
            <DraggableText
              fontSize={fontSize}
              fontFamily={store.fontFamily}
              fill={store.fill}
              fontStyle="normal"
              textBackground=""
              fontWeight={600}
              sampleText={sampleText}
              index={0}
            />
          </div>


        </div>
      </ScrollArea>
    </div>
  );
});
