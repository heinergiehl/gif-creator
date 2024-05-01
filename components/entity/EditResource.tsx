'use client';
import { useStores } from '@/store';
import { observer } from 'mobx-react';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { fabric } from 'fabric';
import { DebounceInput } from 'react-debounce-input';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import debounce from 'lodash.debounce';
import CustomDebounceInput from '@/app/components/ui/CustomDebounceInput';
const DEBOUNCE_TIME_IN_MS = 500;
const EditResource = observer(() => {
  const store = useStores().editorStore;
  const fabricElement = store.selectedElement?.fabricObject;
  console.log(fabricElement);
  const handleChange = (property: keyof fabric.ITextOptions, value: string | number) => {
    store.updateTextProperties(property, value);
  };
  return (
    <div
      className="
    flex h-[75px]
    w-full flex-row items-center  justify-start bg-gray-100 bg-inherit text-inherit dark:bg-slate-900"
    >
      {store.selectedElement !== null && store.selectedElement?.fabricObject !== undefined && (
        <div className="flex h-full w-full flex-row items-center justify-center">
          <div className="ml-8 flex">
            {store.selectedElement.type === 'text' && (
              <Label htmlFor="textColor" className="mr-4 text-center text-xs ">
                Edit Text
              </Label>
            )}
          </div>
          <div className="flex w-full flex-row items-center">
            <div className="flex flex-row items-center">
              <Label htmlFor="textColor" className="mr-4 text-center text-xs ">
                Color
              </Label>
              <CustomDebounceInput
                handleChange={(value) => handleChange('fill', value)}
                label="Color"
                name="textColor"
                type="color"
                value={fabricElement?.fill}
              />
            </div>
            {store.selectedElement.type === 'text' && fabricElement !== undefined && (
              <div className="flex space-x-4">
                <div className="flex flex-row items-center">
                  <CustomDebounceInput
                    handleChange={(value) => handleChange('fontSize', value)}
                    label="Font Size"
                    name="fontSize"
                    type="number"
                    value={fabricElement.fontSize}
                  />
                </div>
                <div className="flex flex-row items-center">
                  <CustomDebounceInput
                    handleChange={(value) => handleChange('fontWeight', value)}
                    label="Font Weight"
                    name="fontWeight"
                    type="number"
                    value={fabricElement.fontWeight}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
export default EditResource;
