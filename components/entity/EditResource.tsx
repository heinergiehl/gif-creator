'use client';
import { useStores } from '@/store';
import { observer } from 'mobx-react';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { fabric } from 'fabric';
import { DebounceInput } from 'react-debounce-input';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

import debounce from 'lodash.debounce';

const DEBOUNCE_TIME_IN_MS = 500;
const EditResource = observer(() => {
  const store = useStores().editorStore;
  const fabricElement = store.selectedElement?.fabricObject;
  console.log(fabricElement);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleChange', e.target.value);
    switch (e.target.name) {
      case 'textColor':
        store.updateTextProperties('fill', e.target.value);
        break;
      case 'fontSize':
        store.updateTextProperties('fontSize', parseInt(e.target.value));
        break;
      case 'fontWeight':
        store.updateTextProperties('fontWeight', parseInt(e.target.value));
        break;
    }
  };

  return (
    <div
      className="
    h-[75px] w-full
    bg-gray-100 bg-inherit text-inherit  dark:bg-slate-900 "
    >
      {store.selectedElement !== null && store.selectedElement?.fabricObject !== undefined && (
        <div className="flex flex-row items-center h-full">
          {store.selectedElement.type === 'text' && (
            <Label htmlFor="textColor" className="mr-4 text-xs text-center ">
              Edit Text
            </Label>
          )}
          <div className="flex flex-row items-center">
            <Label htmlFor="textColor" className="mr-4 text-xs text-center ">
              Color
            </Label>
            <Input
              className=""
              type="color"
              id="textColor"
              name="textColor"
              value={store.selectElement?.fabricObject?.fill || '#000000'}
              onChange={debounce((e) => handleChange(e), DEBOUNCE_TIME_IN_MS)}
            />
          </div>
          {store.selectedElement.type === 'text' && fabricElement !== undefined && (
            <div className="flex space-x-4">
              <div className="flex flex-row items-center">
                <Label htmlFor="fontSize" className="mr-4 text-xs text-center ">
                  Font Size
                </Label>
                <Input
                  className=""
                  type="number"
                  id="fontSize"
                  name="fontSize"
                  value={(store.selectedElement?.fabricObject as fabric.Text).fontSize || 16}
                  onChange={debounce(handleChange, DEBOUNCE_TIME_IN_MS)}
                />
              </div>
              <div className="flex flex-row items-center">
                <Label htmlFor="fontWeight" className="mr-4 text-xs ">
                  Font Weight
                </Label>
                <Input
                  type="number"
                  id="fontWeight"
                  name="fontWeight"
                  value={(store.selectedElement?.fabricObject as fabric.Text).fontWeight || 400}
                  onChange={debounce(handleChange, DEBOUNCE_TIME_IN_MS)}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
export default EditResource;
