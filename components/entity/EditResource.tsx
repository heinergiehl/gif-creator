'use client';
import { useStores } from '@/store';
import { observer } from 'mobx-react';
import React, { useEffect, useMemo } from 'react';
import { fabric } from 'fabric';
import debounce from 'lodash.debounce';
import CustomTextInput from '@/app/components/ui/CustomTextInput';
import CustomColorPicker from '@/app/components/ui/CustomColorPicker';
import CustomNumberInput from '@/app/components/ui/CustomNumberInput';
import { Button } from '../ui/button';
import { FabricObjectFactory } from '@/utils/fabric-utils';
import { useCanvas } from '@/app/components/canvas/canvasContext';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
const EditResource = observer(() => {
  const store = useStores().editorStore;
  const canvas = useCanvas().canvasRef.current;
  const rootStore = useStores();
  const handleChange = (property: keyof fabric.ITextOptions, value: string | number | boolean) => {
    const activeObject = canvas?.getActiveObject();
    store.updateElement(activeObject?.id, {
      properties: {
        ...activeObject,
        [property]: value,
      },
    });
    store.setTextOptionsUpdated(true);
  };
  const selectedElements = store.selectedElements;
  const toggleEditOptionsPanel = () => {
    store.toggleOption('editOptions');
  };
  const toggleShadowOptionsPanel = () => {
    store.toggleOption('shadowOptions');
  };
  const toggleTextStyleOptionsPanel = () => {
    store.toggleOption('textStyleOptions');
  };
  const uiStore = useStores().uiStore;
  useEffect(() => {
    store.setAllOptionsToFalse();
  }, [uiStore.selectedMenuOption]);
  return (
    <div className="flex h-[90px] w-full flex-row items-center justify-start bg-inherit bg-slate-300 text-inherit dark:bg-slate-900 ">
      <ScrollArea className="flex h-full w-screen items-center justify-center md:hidden ">
        <div className="flex h-full w-full">
          {selectedElements.length > 0 &&
            selectedElements?.every((element, index, array) =>
              FabricObjectFactory.isTextEditorElement(element),
            ) && (
              <div className="flex w-full justify-between">
                <div className=" flex   flex-row items-center">
                  <CustomTextInput
                    className="w-[180px]  md:w-full"
                    inputTooltip="Text"
                    value={
                      'text' in selectedElements[0].properties
                        ? selectedElements[0].properties.text
                        : ''
                    }
                    name="text"
                    onChange={(value) => handleChange('text', value)}
                  />
                </div>
                <div className="flex h-full flex-row items-center gap-x-4 md:w-full">
                  <CustomColorPicker
                    label="Text Color"
                    name="fill"
                    value={
                      'fill' in selectedElements[0].properties
                        ? selectedElements[0].properties.fill
                        : '#000000'
                    }
                    onChange={(color) => handleChange('fill', color)}
                  />
                  <div className="flex flex-row items-center justify-evenly ">
                    <CustomNumberInput
                      inputTooltip="Font Size"
                      increaseButtonTooltip="Increase Font Size"
                      decreaseButtonTooltip="Decrease Font Size"
                      value={
                        'fontSize' in selectedElements[0].properties
                          ? Number(selectedElements[0].properties.fontSize)
                          : 14
                      }
                      name="fontSize"
                      onChange={(value) => handleChange('fontSize', value)}
                    />
                    <CustomNumberInput
                      inputTooltip="Font Weight"
                      increaseButtonTooltip="Increase Font Weight"
                      decreaseButtonTooltip="Decrease Font Weight"
                      value={
                        'fontWeight' in selectedElements[0].properties
                          ? Number(selectedElements[0].properties.fontWeight)
                          : 400
                      }
                      name="fontWeight"
                      onChange={(value) => handleChange('fontWeight', value)}
                    />
                  </div>
                  <div className="flex  flex-row items-center justify-evenly">
                    <Button onClick={toggleTextStyleOptionsPanel} variant="outline">
                      Style
                    </Button>
                  </div>
                </div>
              </div>
            )}
          {selectedElements.length > 0 && selectedElements.every((el) => el.type === 'text') && (
            <div className="flex ">
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
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <ScrollArea className=" hidden md:flex md:w-full">
        <div className="flex w-[110%] justify-between gap-x-4">
          {selectedElements.length > 0 &&
            selectedElements?.every((element, index, array) =>
              FabricObjectFactory.isTextEditorElement(element),
            ) && (
              <div className="flex w-full justify-between gap-x-4">
                <CustomTextInput
                  className="w-[180px]  md:w-full"
                  inputTooltip="Text"
                  value={
                    'text' in selectedElements[0].properties
                      ? selectedElements[0].properties.text
                      : ''
                  }
                  name="text"
                  onChange={(value) => handleChange('text', value)}
                />
                <CustomColorPicker
                  label="Text Color"
                  name="fill"
                  value={
                    'fill' in selectedElements[0].properties
                      ? selectedElements[0].properties.fill
                      : '#000000'
                  }
                  onChange={(color) => handleChange('fill', color)}
                />
                <CustomNumberInput
                  inputTooltip="Font Size"
                  increaseButtonTooltip="Increase Font Size"
                  decreaseButtonTooltip="Decrease Font Size"
                  value={
                    'fontSize' in selectedElements[0].properties
                      ? Number(selectedElements[0].properties.fontSize)
                      : 14
                  }
                  name="fontSize"
                  onChange={(value) => handleChange('fontSize', value)}
                />
                <CustomNumberInput
                  inputTooltip="Font Weight"
                  increaseButtonTooltip="Increase Font Weight"
                  decreaseButtonTooltip="Decrease Font Weight"
                  value={
                    'fontWeight' in selectedElements[0].properties
                      ? Number(selectedElements[0].properties.fontWeight)
                      : 400
                  }
                  name="fontWeight"
                  onChange={(value) => handleChange('fontWeight', value)}
                />
                <div className="flex basis-1/4 flex-row items-center justify-evenly">
                  <Button onClick={toggleTextStyleOptionsPanel} variant="outline">
                    Style
                  </Button>
                </div>
              </div>
            )}
          {selectedElements.length > 0 && selectedElements.every((el) => el.type === 'text') && (
            <div className="flex gap-x-2">
              <div className="flex basis-1/4 flex-row items-center justify-evenly">
                <Button onClick={toggleEditOptionsPanel} variant="outline">
                  Position
                </Button>
              </div>
              <div className="flex basis-1/4 flex-row items-center justify-evenly">
                <Button onClick={toggleShadowOptionsPanel} variant="outline">
                  Shadow
                </Button>
              </div>
            </div>
          )}
          <ScrollBar orientation="horizontal" />
        </div>
      </ScrollArea>
    </div>
  );
});
export default EditResource;
