'use client';
import React from 'react';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import CustomTextInput from '@/app/components/ui/CustomTextInput';
import { useStores } from '@/store';
import CustomColorPicker from '@/app/components/ui/CustomColorPicker';
import { observer } from 'mobx-react-lite';
const ShadowOptionsPanel = observer(function ShadowOptionsPanel() {
  const store = useStores().editorStore;
  const selectedElements = store.selectedElements;
  if (selectedElements.length === 0) return <div>No Selected Element</div>;
  const handleChange = (
    property: keyof fabric.IShadowOptions,
    value: string | number | boolean,
  ) => {
    console.log('handleChange', property, value);
    store.updateSelectedElementsShadow(property, value);
  };
  // Calculate average or default values for the selected elements' shadows
  const averageShadow = (property: keyof fabric.IShadowOptions) => {
    const total = selectedElements.reduce(
      (sum, el) => sum + ((el.shadow?.[property] as number) || 0),
      0,
    );
    return total / selectedElements.length || 0;
  };
  return (
    <div className="m-4">
      Shadow Options
      <Separator />
      <Label className="mt-4 flex flex-col">
        Offset X
        <div className="flex items-center justify-center gap-x-4">
          <Slider
            value={[averageShadow('offsetX')]}
            onValueChange={(e) => handleChange('offsetX', e[0])}
          />
          <CustomTextInput
            className="basis-1/4"
            name="offsetX"
            inputTooltip="Offset X"
            onChange={(value) => handleChange('offsetX', parseFloat(value))}
            value={String(averageShadow('offsetX'))}
          />
        </div>
      </Label>
      <Label className="mt-4 flex flex-col">
        Offset Y
        <div className="flex items-center justify-center gap-x-4">
          <Slider
            value={[averageShadow('offsetY')]}
            onValueChange={(value) => handleChange('offsetY', value[0])}
          />
          <CustomTextInput
            className="basis-1/4"
            name="offsetY"
            inputTooltip="Offset Y"
            onChange={(value) => handleChange('offsetY', parseFloat(value))}
            value={String(averageShadow('offsetY'))}
          />
        </div>
      </Label>
      <Label className="mt-4 flex flex-col">
        Blur
        <div className="flex items-center justify-center gap-x-4">
          <Slider
            value={[averageShadow('blur')]}
            onValueChange={(value) => handleChange('blur', value[0])}
          />
          <CustomTextInput
            className="basis-1/4"
            name="blur"
            inputTooltip="Blur"
            onChange={(value) => handleChange('blur', parseFloat(value))}
            value={String(averageShadow('blur'))}
          />
        </div>
      </Label>
      <Label className="mt-4 flex flex-col">
        Color
        <div className="flex items-center justify-start gap-x-4">
          <CustomColorPicker
            name="color"
            label="Color"
            onChange={(value) => handleChange('color', value)}
            value={String(averageShadow('color'))}
          />
        </div>
      </Label>
    </div>
  );
});
export default ShadowOptionsPanel;
