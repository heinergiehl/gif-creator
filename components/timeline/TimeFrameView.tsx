'use client';
import React, { useCallback, useEffect } from 'react';
import { EditorElement } from '@/types';
import { observer } from 'mobx-react';
import DragableView from './DraggableView';
import { useStores } from '@/store';
import { useCanvas } from '@/app/components/canvas/canvasContext';
import { Button } from '../ui/button';
import { CircleEllipsis, OptionIcon } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { MdRemoveCircleOutline } from 'react-icons/md';
import Image from 'next/image';
export const TimeFrameView = observer((props: { element: EditorElement }) => {
  const store = useStores().editorStore;
  const framesTotal = store.frames.length;
  const timeFrame = props.element.timeFrame;
  const maxTime = store.maxTime;
  const timePerFrame = maxTime / framesTotal;
  const frameNumberStart = Math.round(timeFrame.start / timePerFrame) + 1;
  const frameNumberEnd = Math.round(timeFrame.end / timePerFrame) + 1;
  const timelineStore = useStores().timelineStore;
  const { element } = props;
  const disabled = element.type === 'audio';
  const isSelected = store.selectedElements.includes(element) ? true : false;
  const bgColorOnSelected = isSelected ? 'bg-slate-800' : 'bg-slate-600';
  const disabledCursor = disabled ? 'cursor-no-drop' : 'cursor-ew-resize';
  const rootStore = useStores();
  const canvas = useCanvas().canvasRef.current;
  return (
    <div
      onClick={() => {
        store.setSelectedElements([element.id]);
      }}
      key={element.id}
      className={`relative my-2 flex h-[25px]    overflow-hidden ${
        isSelected ? 'border-2 border-indigo-600 bg-slate-200 dark:bg-slate-500' : ''
      }`}
    >
      <DragableView
        className=" z-10"
        value={element.timeFrame.start}
        total={store.maxTime}
        disabled={disabled}
        onChange={(value) => {
          rootStore.setRerunUseManageFabricObjects(true);
          timelineStore.updateEditorElementTimeFrame(element, {
            start: value,
          });
        }}
      >
        {' '}
        <div
          className={`absolute  mt-[calc(25px/2)] h-[10px] w-[10px] translate-x-[-50%] translate-y-[-50%] transform border-2 border-blue-400 bg-white ${disabledCursor}`}
        ></div>
      </DragableView>
      <DragableView
        className={disabled ? 'cursor-no-drop' : 'cursor-col-resize'}
        value={element.timeFrame.start}
        disabled={disabled}
        style={{
          width: `${((element.timeFrame.end - element.timeFrame.start) / store.maxTime) * 100}%`,
        }}
        total={store.maxTime}
        onChange={(value) => {
          const { start, end } = element.timeFrame;
          rootStore.setRerunUseManageFabricObjects(true);
          timelineStore.updateEditorElementTimeFrame(element, {
            start: value,
            end: value + (end - start),
          });
        }}
      >
        <div
          className={`${bgColorOnSelected} flex h-full  min-w-[0px] items-center gap-x-4 px-2 text-xs leading-[25px] text-white`}
        >
          <span className="left-30 "> {frameNumberStart}</span>
          <span className="w-full leading-3"> {element.name}</span>
          <Image src={element.dataUrl || ''} alt="element" width={20} height={20} />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={'outline'} className="m-0 h-5 w-5 rounded-full p-0">
                <CircleEllipsis size="20" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="flex w-[300px] flex-col">
              <span className="text-xs text-gray-500">
                Do you want to remove this element from the timeline? This action cannot be undone.
              </span>
              <Button
                className=""
                variant={'destructive'}
                onClick={() => {
                  store.removeElement(element.id);
                }}
              >
                <MdRemoveCircleOutline size={20} />
              </Button>
            </PopoverContent>
          </Popover>
          <span className="w-full text-end">{frameNumberEnd}</span>
        </div>
      </DragableView>
      <DragableView
        className="z-10 "
        disabled={disabled}
        value={element.timeFrame.end}
        total={store.maxTime}
        onChange={(value) => {
          rootStore.setRerunUseManageFabricObjects(true);
          timelineStore.updateEditorElementTimeFrame(element, {
            end: value,
          });
        }}
      >
        <div
          className={`mt-[calc(25px/2)] h-[10px] w-[10px] translate-x-[-50%] translate-y-[-50%] transform border-2 border-blue-400 bg-white ${disabledCursor}`}
        ></div>
      </DragableView>
    </div>
  );
});
