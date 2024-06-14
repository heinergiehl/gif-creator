import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { observer } from 'mobx-react';
interface CustomCheckboxProps {
  value: boolean;
  handleCheckedChange: (value: boolean | string) => void;
  label: string;
  name: string;
  checked?: boolean;
}
const CustomCheckBox = ({
  value,
  handleCheckedChange,
  label,
  name,
  checked,
}: CustomCheckboxProps) => {
  console.log('CustomCheckBox', value, checked);
  return (
    <div className={cn(['flex flex-col items-center justify-center '])}>
      <Label
        htmlFor={name}
        className="mx-2 my-2 text-center text-xs lowercase first-letter:uppercase"
      >
        {label}
      </Label>
      <Checkbox
        className={'h-4 w-4'}
        id={name}
        name={name}
        checked={checked}
        onCheckedChange={(bool) => handleCheckedChange(bool)}
      />
    </div>
  );
};
export default CustomCheckBox;
