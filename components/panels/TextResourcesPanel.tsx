'use client';
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { TextResource } from '../entity/TextResource';
import { useStores } from '@/store';
import { DragOverlay, useDndContext, useDraggable } from '@dnd-kit/core';
import { set } from 'animejs';
import { Label } from '../ui/label';
import { CustomSelect } from '@/app/components/ui/CustomSelect';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import CustomTextInput from '@/app/components/ui/CustomTextInput';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';
const TEXT_RESOURCES = [
  {
    name: 'Title',
    fontSize: 28,
    fontWeight: 600,
  },
];
type TextResourceProps = {
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  fill: string;
  fontStyle: string;
  textBackground: string;
  sampleText: string;
};
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
    const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
      id: `textResource-${index}`,
      data: {
        dragOverlay: () => (
          <div
            draggable="false"
            className="relative flex h-[80px]  w-[80px] items-center justify-center rounded-lg shadow-xl shadow-black drop-shadow-xl"
          >
            <div
              className={cn([
                'group absolute inset-0 z-0 rounded-lg opacity-50 transition-all duration-300  dark:hover:bg-blue-500',
              ])}
            ></div>
            <div className="z-1  flex h-[70px] w-[70px]  items-center justify-center  rounded-lg p-0">
              <div
                className="leading-1  flex overflow-hidden text-ellipsis break-all  rounded-md p-1"
                id={`textResource-${index}`}
                style={{
                  fontSize: `15px`,
                  fontWeight: `${fontWeight}`,
                  color: fill,
                  fontFamily: fontFamily,
                  fontStyle: fontStyle,
                  backgroundColor: textBackground,
                  fill,
                }}
              >
                {sampleText}
              </div>
            </div>
          </div>
        ),
      },
    });
    const store = useStores().editorStore;
    return (
      <div className="touch-none" ref={setNodeRef} {...listeners} {...attributes}>
        <div
          className="flex  overflow-hidden break-all rounded-md bg-slate-200 p-1 leading-10 dark:bg-slate-800"
          id={`textResource-${index}`}
          style={{
            fontSize: `45px`,
            fontWeight: `${fontWeight}`,
            color: fill,
            fontFamily: fontFamily,
            fontStyle: fontStyle,
            backgroundColor: textBackground,
            fill,
          }}
        >
          {sampleText}
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
    <Label htmlFor="fontPicker" className="flex flex-col space-y-2">
      <span className="">Font</span>
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
  const [fill, setfill] = useState('#000000');
  useEffect(() => {
    store.fill = fill;
    store.fontSize = fontSize;
  }, [fill, fontSize]);
  const [sampleText, setSampleText] = useState('Sample Text');
  const active = useDndContext().active;
  return (
    <div
      draggable="false"
      className=" flex h-[70dvh] w-full flex-col bg-slate-300  text-foreground dark:bg-inherit  dark:bg-slate-900 md:h-screen "
    >
      <div>
        <span className="my-auto flex h-[50px] w-full items-center  justify-center  text-sm ">
          Add Text
        </span>
      </div>
      <div className="flex h-full flex-col p-8">
        <div className="flex w-full   flex-wrap">
          <FontPicker />
          {/* Additional controls like color picker and font size range */}
          <Label htmlFor="fill" className="space-y-2 ">
            <span className="">Text Color</span>
            <Input
              className="rounded-none"
              type="color"
              id="fill"
              name="fill"
              value={fill}
              onChange={(e) => setfill(e.target.value)}
            />
          </Label>
        </div>
        <Separator orientation="horizontal" className="my-4" />
        <Label htmlFor="sampleText" className="mb-2 flex flex-col space-y-2">
          <span className="">Sample Text</span>
          <CustomTextInput
            name="sampleText"
            inputTooltip="Sample Text"
            className="rounded-none"
            value={sampleText}
            onChange={(value) => setSampleText(value)}
          />
        </Label>
        <Separator orientation="horizontal" className="my-4" />
        <div className="flex w-[90%] flex-col space-y-4">
          <Label htmlFor="textResources" className="flex flex-col space-y-2">
            <span>Text Preview</span>
            {TEXT_RESOURCES.map((resource, index) => (
              <DraggableText
                key={resource.name}
                fontSize={fontSize}
                fontFamily={store.fontFamily}
                fill={store.fill}
                fontStyle="normal"
                textBackground="dark:bg-slate-800 "
                fontWeight={resource.fontWeight}
                sampleText={sampleText}
                index={store.frames.length - 1}
              />
            ))}
          </Label>
          {createPortal(
            <DragOverlay dropAnimation={null}>
              {active && (active.id as String).includes('textResource')
                ? active?.data?.current?.dragOverlay()
                : null}
            </DragOverlay>,
            document.body,
          )}
        </div>
      </div>
    </div>
  );
});
