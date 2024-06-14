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
  const animtationStore = useStores().animationStore;
  const timelineStore = useStores().timelineStore;
  const { element } = props;
  const { canvasRef } = useCanvas();
  const disabled = element.type === 'audio';
  const isSelected = useCallback(() => {
    return store.selectedElements.includes(element) ? true : false;
  }, [store.selectedElements]);
  const bgColorOnSelected = isSelected() ? 'bg-slate-800' : 'bg-slate-600';
  const disabledCursor = disabled ? 'cursor-no-drop' : 'cursor-ew-resize';
  return (
    <div
      onClick={() => {
        store.setSelectedElements([element.id]);
      }}
      key={element.id}
      className={`relative my-2 flex h-[25px] overflow-hidden ${
        isSelected() ? 'border-2 border-indigo-600 bg-slate-200' : ''
      }`}
    >
      <DragableView
        className=" z-10"
        value={element.timeFrame.start}
        total={store.maxTime}
        disabled={disabled}
        onChange={(value) => {
          console.log('DraggableView;start: ', value);
          timelineStore.updateEditorElementTimeFrame(element, {
            start: value,
          });
        }}
      >
        <div
          className={` mt-[calc(25px/2)] h-[10px] w-[10px] translate-x-[-50%] translate-y-[-50%] transform border-2 border-blue-400 bg-white ${disabledCursor}`}
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
          timelineStore.updateEditorElementTimeFrame(element, {
            start: value,
            end: value + (end - start),
          });
        }}
      >
        <div
          className={`${bgColorOnSelected} flex h-full w-full min-w-[0px] items-center gap-x-4 px-2 text-xs leading-[25px] text-white`}
        >
          {element.name}
          <Image src={element.dataUrl} alt="element" width={20} height={20} />
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
        </div>
      </DragableView>
      <DragableView
        className="z-10"
        disabled={disabled}
        value={element.timeFrame.end}
        total={store.maxTime}
        onChange={(value) => {
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
