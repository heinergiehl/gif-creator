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
  AlignHorizontalDistributeEnd,
  AlignVerticalDistributeEnd,
  AlignCenterVerticalIcon,
  AlignCenterHorizontalIcon,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';

interface EditOptionsPanelProps {}

export const EditOptionsPanel: React.FC<EditOptionsPanelProps> = observer(
  function EditOptionsPanel() {
    const { canvasRef } = useCanvas();
    const store = useStores().editorStore;
    const selectedElements = store.selectedElements;
    if (selectedElements.length === 0)
      return (
        <div className="flex h-24 items-center justify-center text-sm text-slate-500">
          No element selected
        </div>
      );
    const canvas = canvasRef.current;
    if (!canvas)
      return (
        <div className="flex h-24 items-center justify-center text-sm text-slate-500">
          No canvas
        </div>
      );
    const frameElements = store.elements.filter(
      (el) => el.timeFrame.start === selectedElements[0].timeFrame.start,
    );
    const maxZIndex = frameElements.length - 1;
    const isAtFront = selectedElements.every((el) => el.placement.zIndex === maxZIndex);
    const isAtBack = selectedElements.every((el) => el.placement.zIndex === 0);
    const canDistribute = selectedElements.length > 1;

    return (
      <div className="flex w-full flex-col gap-4 p-4">
        {/* ── Z-order ── */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Layer Order
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={() => store.increaseZIndexOfSelectedElements(canvas)} disabled={isAtFront}>
              <ArrowUp size={14} className="mr-1" /> Forward
            </Button>
            <Button size="sm" variant="outline" onClick={() => store.decreaseZIndexOfSelectedElements(canvas)} disabled={isAtBack}>
              <ArrowDown size={14} className="mr-1" /> Backward
            </Button>
            <Button size="sm" variant="outline" onClick={() => store.bringToFrontSelectedElements(canvas)} disabled={isAtFront}>
              <ChevronsUp size={14} className="mr-1" /> To Front
            </Button>
            <Button size="sm" variant="outline" onClick={() => store.sendToBackSelectedElements(canvas)} disabled={isAtBack}>
              <ChevronsDown size={14} className="mr-1" /> To Back
            </Button>
          </div>
        </div>

        <Separator />

        {/* ── Alignment ── */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Align to Canvas
          </h4>
          <ToggleGroup type="multiple" className="flex flex-wrap justify-center gap-1">
            <ToggleGroupItem
              data-state={selectedElements.every((el) => store.isElementAligned(el, 'top', canvas)) ? 'on' : 'off'}
              aria-label="top"
              value="top"
              onClick={() => store.alignSelectedElements('top', canvas)}
            >
              <AlignStartHorizontal size={16} />
            </ToggleGroupItem>
            <ToggleGroupItem
              data-state={selectedElements.every((el) => store.isElementAligned(el, 'left', canvas)) ? 'on' : 'off'}
              aria-label="left"
              value="left"
              onClick={() => store.alignSelectedElements('left', canvas)}
            >
              <AlignStartVertical size={16} />
            </ToggleGroupItem>
            <ToggleGroupItem
              data-state={selectedElements.every((el) => store.isElementAligned(el, 'middle', canvas)) ? 'on' : 'off'}
              value="middle"
              onClick={() => store.alignSelectedElements('middle', canvas)}
            >
              <AlignCenterVerticalIcon size={16} />
            </ToggleGroupItem>
            <ToggleGroupItem
              data-state={selectedElements.every((el) => store.isElementAligned(el, 'center', canvas)) ? 'on' : 'off'}
              value="center"
              onClick={() => store.alignSelectedElements('center', canvas)}
            >
              <AlignCenterHorizontalIcon size={16} />
            </ToggleGroupItem>
            <ToggleGroupItem
              data-state={selectedElements.every((el) => store.isElementAligned(el, 'bottom', canvas)) ? 'on' : 'off'}
              aria-label="bottom"
              value="bottom"
              onClick={() => store.alignSelectedElements('bottom', canvas)}
            >
              <AlignEndHorizontal size={16} />
            </ToggleGroupItem>
            <ToggleGroupItem
              data-state={selectedElements.every((el) => store.isElementAligned(el, 'right', canvas)) ? 'on' : 'off'}
              aria-label="right"
              value="right"
              onClick={() => store.alignSelectedElements('right', canvas)}
            >
              <AlignEndVertical size={16} />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Separator />

        {/* ── Distribution ── */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Distribute
          </h4>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => store.distributeElements('horizontal', canvas)} disabled={!canDistribute}>
              <AlignHorizontalDistributeEnd size={14} className="mr-1" />
              <span className="text-xs">Horizontal</span>
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={() => store.distributeElements('vertical', canvas)} disabled={!canDistribute}>
              <AlignVerticalDistributeEnd size={14} className="mr-1" />
              <span className="text-xs">Vertical</span>
            </Button>
          </div>
        </div>
      </div>
    );
  },
);
