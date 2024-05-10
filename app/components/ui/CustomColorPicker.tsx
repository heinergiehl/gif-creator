import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
interface CustomColorPickerProps {
  value: string | number; // Adjusted the type to be more generic
  onChange: (value: string) => void;
  label: string;
  name: string;
}
const CustomColorPicker = ({ value, onChange, label, name }: CustomColorPickerProps) => {
  return (
    <div className={cn(['flex flex-col items-center justify-center '])}>
      <Label
        htmlFor={name}
        className="mx-2 my-2 text-center text-xs lowercase first-letter:uppercase"
      >
        {label}
      </Label>
      <Input
        className={'h-8 w-16 p-0'}
        type={'color'}
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
export default CustomColorPicker;
