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
    <div className="m-[15px] flex h-full flex-row items-center bg-secondary">
      <div
        className="flex-1 px-2 py-1 "
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: `${fontWeight}`,
          color: store.textColor,
          fontFamily: store.fontFamily,
        }}
      >
        {sampleText}
      </div>
      <button className=" z-10 flex h-[32px] w-[32px] items-center justify-center rounded py-1 font-bold ">
        <MdAdd size="25" />
      </button>
    </div>
  );
});
