import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
interface CustomRangeInputProps {
  value: string | number; // Adjusted the type to be more generic
  onChange: (value: number) => void;
  label: string;
  name: string;
  min: number;
  max: number;
}
const CustomRangeInput = ({ value, onChange, label, name, min, max }: CustomRangeInputProps) => {
  console.log('CUSTOM RANGE INPUT', value);
  return (
    <div className={cn(['flex flex-col items-center justify-center '])}>
      <Label
        htmlFor={name}
        className="mx-2 mt-2 text-center text-xs lowercase first-letter:uppercase"
      >
        {label}
      </Label>
      <Input
        className={'h-8 w-16 p-0'}
        type={'range'}
        id={name}
        name={name}
        step={max / 10}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
};
export default CustomRangeInput;
