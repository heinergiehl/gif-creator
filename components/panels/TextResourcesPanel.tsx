'use client';
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { TextResource } from '../entity/TextResource';
import { useStores } from '@/store';
import { useDraggable } from '@dnd-kit/core';
import { set } from 'animejs';
import { Label } from '../ui/label';
import { CustomSelect } from '@/app/components/ui/CustomSelect';
import { Input } from '../ui/input';
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
          <TextResource fontSize={fontSize} fontWeight={fontWeight} sampleText={sampleText} />
        ),
      },
    });
    const style = transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          zIndex: 999,
          cursor: 'grab',
        }
      : { cursor: 'grab' };
    const store = useStores().editorStore;
    return (
      <div ref={setNodeRef} {...listeners} {...attributes}>
        <div
          className="text-start "
          id={`textResource-${index}`}
          style={{
            fontSize: `${fontSize}px`,
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
    <div className="flex flex-col items-center ">
      <Label htmlFor="fontPicker" className="space-y-4 ">
        <span className="">Font</span>
        <CustomSelect
          options={fontOptions}
          trigger={store.fontFamily}
          value={store.fontFamily}
          onChange={handleFontChange}
        />
      </Label>
    </div>
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
  return (
    <div className="flex h-full w-full flex-col space-y-8 bg-slate-100 p-8 text-foreground dark:bg-slate-900 ">
      <div className="flex w-full flex-col items-start justify-between space-y-8">
        <FontPicker />
        {/* Additional controls like color picker and font size range */}
        <Label htmlFor="fill" className="mb-2 flex flex-col">
          <span className="pb-4">Text Color</span>
          <Input
            type="color"
            id="fill"
            name="fill"
            value={fill}
            onChange={(e) => setfill(e.target.value)}
          />
        </Label>
        {/* <input
          type="range"
          min="10"
          max="100"
          value={fontSize}
          onChange={(e) => setFontSize(parseFloat(e.target.value))}
        /> */}
        <Label htmlFor="fontSize" className="mb-2 flex flex-col">
          <span className="pb-4">Font Size</span>
          <Input
            type="range"
            id="fontSize"
            name="fontSize"
            min="10"
            max="100"
            value={fontSize}
            onChange={(e) => setFontSize(parseFloat(e.target.value))}
          />
        </Label>
      </div>
      <div className="flex flex-col space-y-4">
        {TEXT_RESOURCES.map((resource, index) => (
          <DraggableText
            key={resource.name}
            fontSize={fontSize}
            fontFamily={store.fontFamily}
            fill={store.fill}
            fontStyle="normal"
            textBackground="dark:bg-inherit dark:text-white bg-inherit text-black"
            fontWeight={resource.fontWeight}
            sampleText={resource.name}
            fill={fill}
            index={store.frames.length - 1}
          />
        ))}
      </div>
    </div>
  );
});
