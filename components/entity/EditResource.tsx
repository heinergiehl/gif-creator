'use client';
import { useStores } from '@/store';
import { observer } from 'mobx-react';

import React, { useEffect, useLayoutEffect, useState } from 'react';
import { fabric } from 'fabric';
import { DebounceInput } from 'react-debounce-input';
// allows to edit all fabric objects, including text, images, shapes, etc.
//  once a fabric object is selected, the user can edit the object's properties
const EditResource = observer(() => {
  const store = useStores().editorStore;
  const fabricElement = store.selectedElement?.fabricObject;
  return (
    <div className="h-[75px] w-full bg-gray-300">
      {store.selectedElement !== null && store.selectedElement?.fabricObject !== undefined && (
        <div className="flex h-full flex-row items-center">
          {store.selectedElement.type === 'text' && (
            <label htmlFor="textColor" className="mr-4 text-center text-xs text-gray-500">
              Edit Text
            </label>
          )}
          <div className="flex flex-row items-center">
            <label htmlFor="textColor" className="mr-4 text-center text-xs text-gray-500">
              Color
            </label>
            <DebounceInput
              className="z-10 flex  h-[32px]  w-[32px]  items-center  justify-center rounded-full font-bold"
              type="color"
              id="textColor"
              name="textColor"
              debounceTimeout={500}
              value={(fabricElement as fabric.Text).fill}
              onChange={(e) => store.updateTextProperties('fill', e.target.value)}
            />
          </div>
          {store.selectedElement.type === 'text' && fabricElement !== undefined && (
            <div className="flex space-x-4">
              <div className="flex flex-row items-center">
                <label htmlFor="fontSize" className="mr-4 text-center text-xs text-gray-500">
                  Font Size
                </label>
                <DebounceInput
                  className=""
                  type="number"
                  id="fontSize"
                  name="fontSize"
                  debounceTimeout={500}
                  value={(fabricElement as fabric.Text).fontSize || 16}
                  onChange={(e) => {
                    store.updateTextProperties('fontSize', parseFloat(e.target.value));
                  }}
                />
              </div>
              <div className="flex flex-row items-center">
                <label htmlFor="fontWeight" className="mr-4 text-xs text-gray-500">
                  Font Weight
                </label>
                <DebounceInput
                  type="number"
                  id="fontWeight"
                  name="fontWeight"
                  debounceTimeout={500}
                  value={(fabricElement as fabric.Text).fontWeight || 400}
                  onChange={(e) => {
                    store.updateTextProperties('fontWeight', e.target.value);
                  }}
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
