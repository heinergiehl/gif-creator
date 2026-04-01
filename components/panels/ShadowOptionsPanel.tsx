'use client';
import React from 'react';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';
import { useStores } from '@/store';
import { observer } from 'mobx-react-lite';

const ShadowOptionsPanel = observer(function ShadowOptionsPanel() {
  const store = useStores().editorStore;
  const selectedElements = store.selectedElements;

  if (selectedElements.length === 0)
    return (
      <div className="flex h-24 items-center justify-center text-sm text-slate-500">
        No element selected
      </div>
    );

  const handleChange = (property: keyof fabric.IShadowOptions, value: string | number | boolean) => {
    store.updateSelectedElementsShadow(property, value);
    store.setShadowUpdated(true);
  };

  const avg = (property: keyof fabric.IShadowOptions) => {
    const total = selectedElements.reduce((sum, el) => sum + ((el.shadow?.[property] as number) || 0), 0);
    return total / selectedElements.length || 0;
  };

  const shadowColor =
    (selectedElements[0]?.shadow?.color as string) || '#000000';

  const SliderRow = ({
    label,
    prop,
    min = -50,
    max = 50,
  }: {
    label: string;
    prop: keyof fabric.IShadowOptions;
    min?: number;
    max?: number;
  }) => (
    <Label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
      <div className="flex items-center gap-3">
        <Slider
          className="flex-1"
          min={min}
          max={max}
          value={[avg(prop)]}
          onValueChange={(v) => handleChange(prop, v[0])}
        />
        <Input
          type="number"
          className="h-7 w-16 text-xs"
          value={Math.round(avg(prop))}
          onChange={(e) => handleChange(prop, parseFloat(e.target.value) || 0)}
        />
      </div>
    </Label>
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Shadow
      </h4>
      <SliderRow label="Offset X" prop="offsetX" />
      <SliderRow label="Offset Y" prop="offsetY" />
      <SliderRow label="Blur" prop="blur" min={0} max={50} />
      <Label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Color</span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            className="h-7 w-7 cursor-pointer rounded border-none bg-transparent p-0"
            value={shadowColor.startsWith('#') ? shadowColor : '#000000'}
            onChange={(e) => handleChange('color', e.target.value)}
          />
          <Input
            className="h-7 flex-1 font-mono text-xs"
            value={shadowColor}
            onChange={(e) => handleChange('color', e.target.value)}
          />
        </div>
      </Label>
    </div>
  );
});

export default ShadowOptionsPanel;
