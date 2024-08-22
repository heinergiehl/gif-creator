import React from 'react';
import { Button } from '../ui/button';
import { ItalicIcon, StrikethroughIcon, UnderlineIcon } from 'lucide-react';
import { Separator } from '../ui/separator';
import { useStores } from '@/store';
import { TextEditorElement } from '@/types';
import { observer } from 'mobx-react-lite';
import { Toggle } from '../ui/toggle';
import { MdFormatOverline } from 'react-icons/md';
import { useCanvas } from '@/app/components/canvas/canvasContext';
const TextStyleOptions = observer(function TextStyleOptions() {
  const store = useStores().editorStore;
  const rootStore = useStores();
  const selectedElements = store.selectedElements.filter(
    (element): element is TextEditorElement => element.type === 'text',
  );
  const areAllElementsActive = (property: keyof TextEditorElement['properties'], value: any) =>
    selectedElements.every((element) => element.properties[property] === value);
  const handleToggle = (property: keyof TextEditorElement['properties'], value: any) => {
    selectedElements.forEach((element) => {
      store.updateElement(element.id, {
        properties: {
          ...element.properties,
          [property]: value,
        },
      });
    });
    store.setTextOptionsUpdated(true);
  };
  if (selectedElements.length === 0) return null;
  return (
    <div className="">
      <span className="font-md my-auto flex h-[50px] w-full  items-center justify-center bg-slate-300 text-sm dark:bg-slate-900">
        Text Style
      </span>
      <div className="my-4 flex p-4">
        <Toggle
          aria-label="underline-icon"
          onClick={() => handleToggle('underline', !areAllElementsActive('underline', true))}
        >
          <UnderlineIcon size={24} />
        </Toggle>
        <Toggle
          aria-label="italic-icon"
          onClick={() =>
            handleToggle(
              'fontStyle',
              areAllElementsActive('fontStyle', 'italic') ? 'normal' : 'italic',
            )
          }
        >
          <ItalicIcon size={24} />
        </Toggle>
        <Toggle
          aria-label="strikethrough-icon"
          onClick={() => handleToggle('linethrough', !areAllElementsActive('linethrough', true))}
        >
          <StrikethroughIcon size={24} />
        </Toggle>
        <Toggle
          aria-label="overline-icon"
          onClick={() => handleToggle('overline', !areAllElementsActive('overline', true))}
        >
          <MdFormatOverline size={24} />
        </Toggle>
      </div>
    </div>
  );
});
export default TextStyleOptions;
