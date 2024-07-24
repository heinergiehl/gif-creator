'use client';
import React, { use, useEffect } from 'react';
import { observer } from 'mobx-react';
import { MdAdd } from 'react-icons/md';
import { useStores } from '@/store';
import { getUid } from '@/utils';
type TextResourceProps = {
  fontSize: number;
  fontWeight: number;
  sampleText: string;
};
export const TextResource = observer(({ fontSize, fontWeight, sampleText }: TextResourceProps) => {
  const store = useStores().editorStore;
  return (
    <div
      draggable={false}
      className="m-[15px] flex  h-[100px] w-[100px] flex-row items-center rounded-md border-2  border-blue-500 leading-tight shadow-current drop-shadow-xl dark:bg-slate-500"
    >
      <div
        className="flex-1 px-2 py-1 "
        style={{
          fontSize: `20px`,
          fontWeight: `${fontWeight}`,
          color: store.fill,
          fontFamily: store.fontFamily,
        }}
      >
        {sampleText}
      </div>
    </div>
  );
});
