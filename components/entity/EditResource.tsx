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
const EditResource = observer(() => {
  const store = useStores().editorStore;
  const canvas = useCanvas().canvasRef.current;
  const handleChange = (property: keyof fabric.ITextOptions, value: string | number | boolean) => {
    console.log('handleChange', property, value);
    const activeObject = canvas?.getActiveObject();
    canvas?.fire('object:modified', {
      target: activeObject,
    });
    store.updateTextProperties(property, value);
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
    <div className="flex h-[50px] w-full flex-row items-center justify-start bg-gray-100 bg-inherit text-inherit dark:bg-slate-900">
      <div className="flex h-full w-full flex-row items-center justify-center">
        {selectedElements.length > 0 &&
          selectedElements?.every((element, index, array) =>
            FabricObjectFactory.isTextEditorElement(element),
          ) && (
            <>
              <div className="ml-8 flex  basis-1/3 flex-row items-center">
                <CustomTextInput
                  className="w-full"
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
              <div className="flex h-full w-full flex-row items-center">
                <div className="flex h-full w-[240px] basis-1/4 flex-row items-center justify-evenly">
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
                </div>
                <div className="flex basis-1/4 flex-row items-center">
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
                </div>
                <div className="flex basis-1/4 flex-row items-center">
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
                <div className="flex basis-1/4 flex-row items-center justify-evenly">
                  <Button onClick={toggleTextStyleOptionsPanel} variant="outline">
                    Style
                  </Button>
                </div>
              </div>
            </>
          )}
        {selectedElements.length > 0 && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
});
export default EditResource;
