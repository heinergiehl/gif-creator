'use client';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Button } from '../ui/button';
import { Separator } from '@/components/ui/separator';
import { useStores } from '@/store';
import { useCanvas } from '@/app/components/canvas/canvasContext';
import {
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalSpaceAround,
  AlignVerticalSpaceAroundIcon,
  AlignHorizontalDistributeEnd,
  AlignVerticalDistributeEnd,
  AlignCenterVerticalIcon,
  AlignCenterHorizontalIcon,
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
interface EditOptionsPanelProps {}
export const EditOptionsPanel: React.FC<EditOptionsPanelProps> = observer(
  function EditOptionsPanel() {
    const { canvasRef } = useCanvas();
    const store = useStores().editorStore;
    const selectedElements = store.selectedElements;
    if (selectedElements.length === 0) return <div>No Selected Element</div>;
    const canvas = canvasRef.current;
    if (!canvas) return <div>No Canvas</div>;
    const frameElements = store.elements.filter(
      (el) => el.timeFrame.start === selectedElements[0].timeFrame.start,
    );
    const maxZIndex = frameElements.length - 1;
    const isAtFront = selectedElements.every((element) => element.placement.zIndex === maxZIndex);
    const isAtBack = selectedElements.every((element) => element.placement.zIndex === 0);
    return (
      <div className="flex flex-col items-center justify-center px-4">
        {/* <div className="my-4">Arrange</div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => store.increaseZIndexOfSelectedElements(canvas)}
            disabled={isAtFront}
          >
            <div className="flex items-center justify-center gap-x-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.75 5.82v8.43a.75.75 0 1 1-1.5 0V5.81L8.99 8.07A.75.75 0 1 1 7.93 7l2.83-2.83a1.75 1.75 0 0 1 2.47 0L16.06 7A.75.75 0 0 1 15 8.07l-2.25-2.25zM15 10.48l6.18 3.04a1 1 0 0 1 0 1.79l-7.86 3.86a3 3 0 0 1-2.64 0l-7.86-3.86a1 1 0 0 1 0-1.8L9 10.49v1.67L4.4 14.4l6.94 3.42c.42.2.9.2 1.32 0l6.94-3.42-4.6-2.26v-1.67z"
                ></path>
              </svg>
              Forward
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => store.decreaseZIndexOfSelectedElements(canvas)}
            disabled={isAtBack}
          >
            <div className="flex items-center justify-center gap-x-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.75 18.12V9.75a.75.75 0 1 0-1.5 0v8.37l-2.26-2.25a.75.75 0 0 0-1.06 1.06l2.83 2.82c.68.69 1.79.69 2.47 0l2.83-2.82A.75.75 0 0 0 15 15.87l-2.25 2.25zM15 11.85v1.67l6.18-3.04a1 1 0 0 0 0-1.79l-7.86-3.86a3 3 0 0 0-2.64 0L2.82 8.69a1 1 0 0 0 0 1.8L9 13.51v-1.67L4.4 9.6l6.94-3.42c.42-.2.9-.2 1.32 0L19.6 9.6 15 11.85z"
                ></path>
              </svg>
              Backward
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => store.bringToFrontSelectedElements(canvas)}
            disabled={isAtFront}
          >
            <div className="flex items-center justify-center gap-x-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.75 18.12V9.75a.75.75 0 1 0-1.5 0v8.37l-2.26-2.25a.75.75 0 0 0-1.06 1.06l2.83 2.82c.68.69 1.79.69 2.47 0l2.83-2.82A.75.75 0 0 0 15 15.87l-2.25 2.25zM15 11.85v1.67l6.18-3.04a1 1 0 0 0 0-1.79l-7.86-3.86a3 3 0 0 0-2.64 0L2.82 8.69a1 1 0 0 0 0 1.8L9 13.51v-1.67L4.4 9.6l6.94-3.42c.42-.2.9-.2 1.32 0L19.6 9.6 15 11.85z"
                ></path>
              </svg>
              To Front
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => store.sendToBackSelectedElements(canvas)}
            disabled={isAtBack}
          >
            <div className="flex items-center justify-center gap-x-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.75 18.12V9.75a.75.75 0 1 0-1.5 0v8.37l-2.26-2.25a.75.75 0 0 0-1.06 1.06l2.83 2.82c.68.69 1.79.69 2.47 0l2.83-2.82A.75.75 0 0 0 15 15.87l-2.25 2.25zM15 11.85v1.67l6.18-3.04a1 1 0 0 0 0-1.79l-7.86-3.86a3 3 0 0 0-2.64 0L2.82 8.69a1 1 0 0 0 0 1.8L9 13.51v-1.67L4.4 9.6l6.94-3.42c.42-.2.9-.2 1.32 0L19.6 9.6 15 11.85z"
                ></path>
              </svg>
              To Back
            </div>
          </Button>
        </div> */}
        {selectedElements.every((el) => el.type === 'text') && (
          <div className="flex flex-col items-center justify-center gap-4">
            <Separator className="my-4" />
            <span>Align Object To Canvas</span>
            <div className="flex flex-col items-center justify-center">
              <Separator className="my-4" />
              <div className="flex flex-wrap items-center justify-center gap-4">
                <ToggleGroup type="multiple" className="flex flex-wrap items-center justify-center">
                  <ToggleGroupItem
                    data-state={
                      selectedElements.every((element) =>
                        store.isElementAligned(element, 'top', canvas),
                      )
                        ? 'on'
                        : 'off'
                    }
                    aria-label="top"
                    value="top"
                    onClick={() => store.alignSelectedElements('top', canvas)}
                  >
                    <AlignStartHorizontal size={20} />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    data-state={
                      selectedElements.every((element) =>
                        store.isElementAligned(element, 'left', canvas),
                      )
                        ? 'on'
                        : 'off'
                    }
                    aria-label="left"
                    value="left"
                    onClick={() => store.alignSelectedElements('left', canvas)}
                  >
                    <AlignStartVertical size={20} />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    data-state={
                      selectedElements.every((element) =>
                        store.isElementAligned(element, 'middle', canvas),
                      )
                        ? 'on'
                        : 'off'
                    }
                    value="middle"
                    onClick={() => store.alignSelectedElements('middle', canvas)}
                  >
                    <AlignCenterVerticalIcon size={20} />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    data-state={
                      selectedElements.every((element) =>
                        store.isElementAligned(element, 'center', canvas),
                      )
                        ? 'on'
                        : 'off'
                    }
                    value="center"
                    onClick={() => store.alignSelectedElements('center', canvas)}
                  >
                    <AlignCenterHorizontalIcon size={20} />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    data-state={
                      selectedElements.every((element) =>
                        store.isElementAligned(element, 'bottom', canvas),
                      )
                        ? 'on'
                        : 'off'
                    }
                    aria-label="bottom"
                    value="bottom"
                    onClick={() => store.alignSelectedElements('bottom', canvas)}
                  >
                    <AlignEndHorizontal size={20} />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    data-state={
                      selectedElements.every((element) =>
                        store.isElementAligned(element, 'right', canvas),
                      )
                        ? 'on'
                        : 'off'
                    }
                    aria-label="right"
                    value="right"
                    onClick={() => store.alignSelectedElements('right', canvas)}
                  >
                    <AlignEndVertical size={20} />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
            <Separator className="my-4" />
            <span>Distribute Objects</span>
            <div className="flex flex-col items-center justify-center gap-4">
              <Separator className="my-4" />
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => store.distributeElements('horizontal', canvas)}
                >
                  <AlignHorizontalDistributeEnd size={20} />
                  Horizontal
                </Button>
                <Button
                  variant="outline"
                  onClick={() => store.distributeElements('vertical', canvas)}
                >
                  <AlignVerticalDistributeEnd size={20} />
                  Vertical
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);
