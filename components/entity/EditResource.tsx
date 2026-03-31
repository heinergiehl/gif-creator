'use client';
import { useStores } from '@/store';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { fabric } from 'fabric';
import CustomTextInput from '@/app/components/ui/CustomTextInput';
import CustomColorPicker from '@/app/components/ui/CustomColorPicker';
import CustomNumberInput from '@/app/components/ui/CustomNumberInput';
import { Button } from '../ui/button';
import { FabricObjectFactory } from '@/utils/fabric-utils';
import { useCanvas } from '@/app/components/canvas/canvasContext';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { TextEditorElement } from '@/types';

const EditResource = observer(() => {
  const store = useStores().editorStore;
  const { canvasRef } = useCanvas();
  const rootStore = useStores();
  const uiStore = useStores().uiStore;

  const selectedElements = store.selectedElements;
  const isTextSelection =
    selectedElements.length > 0 &&
    selectedElements.every((el) => FabricObjectFactory.isTextEditorElement(el));

  // Get properties from the STORE element (not the fabric object)
  const firstTextEl = isTextSelection
    ? (selectedElements[0] as TextEditorElement)
    : null;

  const textValue = firstTextEl?.properties?.text ?? '';
  const fillValue = (firstTextEl?.properties?.fill as string) ?? '#000000';
  const fontSizeValue = Number(firstTextEl?.properties?.fontSize ?? 14);
  const fontWeightValue = Number(firstTextEl?.properties?.fontWeight ?? 400);

  /** Update a text property in both the MobX store and fabric canvas */
  const handleChange = (property: keyof fabric.ITextOptions, value: string | number | boolean) => {
    if (!firstTextEl) return;
    // Update the store element with the correct property spread
    store.updateElement(firstTextEl.id, {
      properties: {
        ...firstTextEl.properties,
        [property]: value,
      },
    });
    store.setTextOptionsUpdated(true);
  };

  const toggleEditOptionsPanel = () => store.toggleOption('editOptions');
  const toggleShadowOptionsPanel = () => store.toggleOption('shadowOptions');
  const toggleTextStyleOptionsPanel = () => store.toggleOption('textStyleOptions');

  useEffect(() => {
    store.setAllOptionsToFalse();
  }, [uiStore.selectedMenuOption]);

  /** Shared text editing controls */
  const TextControls = ({ compact = false }: { compact?: boolean }) => (
    <div className={compact ? 'flex w-full justify-between' : 'flex w-full justify-between gap-x-4'}>
      <CustomTextInput
        className={compact ? 'w-[180px] md:w-full' : 'w-[180px] md:w-full'}
        inputTooltip="Text"
        value={textValue}
        name="text"
        onChange={(value) => handleChange('text', value)}
      />
      <CustomColorPicker
        label="Text Color"
        name="fill"
        value={fillValue}
        onChange={(color) => handleChange('fill', color)}
      />
      <div className={compact ? 'flex flex-row items-center justify-evenly' : 'flex flex-row items-center'}>
        <CustomNumberInput
          inputTooltip="Font Size"
          increaseButtonTooltip="Increase Font Size"
          decreaseButtonTooltip="Decrease Font Size"
          value={fontSizeValue}
          name="fontSize"
          onChange={(value) => handleChange('fontSize', value)}
        />
        <CustomNumberInput
          inputTooltip="Font Weight"
          increaseButtonTooltip="Increase Font Weight"
          decreaseButtonTooltip="Decrease Font Weight"
          value={fontWeightValue}
          name="fontWeight"
          onChange={(value) => handleChange('fontWeight', value)}
        />
      </div>
      <div className="flex flex-row items-center justify-evenly">
        <Button onClick={toggleTextStyleOptionsPanel} variant="outline">
          Style
        </Button>
      </div>
    </div>
  );

  /** Position & Shadow buttons */
  const ActionButtons = ({ compact = false }: { compact?: boolean }) => (
    <div className={compact ? 'flex' : 'flex gap-x-2'}>
      <div className="flex flex-row items-center justify-evenly">
        <Button onClick={toggleEditOptionsPanel} variant="outline">
          Position
        </Button>
      </div>
      <div className="flex flex-row items-center justify-evenly">
        <Button onClick={toggleShadowOptionsPanel} variant="outline">
          Shadow
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-[90px] w-full flex-row items-center justify-start bg-inherit bg-slate-300 text-inherit dark:bg-slate-900">
      {/* Mobile layout */}
      <ScrollArea className="flex h-full w-screen items-center justify-center md:hidden">
        <div className="flex h-full w-full">
          {isTextSelection && <TextControls compact />}
          {isTextSelection && <ActionButtons compact />}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {/* Desktop layout */}
      <ScrollArea className="hidden md:flex md:w-full">
        <div className="flex w-[110%] justify-between gap-x-4">
          {isTextSelection && <TextControls />}
          {isTextSelection && <ActionButtons />}
          <ScrollBar orientation="horizontal" />
        </div>
      </ScrollArea>
    </div>
  );
});
export default EditResource;
