import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FrameSettingsProps } from './types';
const FrameSettings: React.FC<FrameSettingsProps> = ({
  frameRate,
  setFrameRate,
  quality,
  setQuality,
}) => {
  return (
    <>
      <Label className="flex w-full max-w-xs flex-col gap-y-4">
        <span>Frame extraction rate (frames per second):</span>
        <span className="text-xs font-semibold">{frameRate} fps</span>
        <Input
          type="range"
          step="1"
          min="1"
          max="24"
          value={frameRate}
          onChange={(e) => setFrameRate(parseFloat(e.target.value))}
          className=""
        />
      </Label>
      <Label className="w-full max-w-xs space-y-4">
        <div className="label flex flex-col items-start space-y-4">
          <span>Resolution scale (1 for full, 0.5 for half, etc.):</span>
          <span className="font-semibold">{quality}</span>
        </div>
        <Input
          type="range"
          step="0.1"
          max={1}
          min={0.1}
          value={quality}
          onChange={(e) => setQuality(parseFloat(e.target.value))}
          className=""
        />
      </Label>
    </>
  );
};
export default FrameSettings;
