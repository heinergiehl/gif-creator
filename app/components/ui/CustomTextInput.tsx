import React, { useMemo, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { Input } from '@/components/ui/input';
import { CustomTooltip } from './CustomTooltip';
import { cn } from '@/lib/utils';
interface CustomTextInputProps {
  name: string;
  inputTooltip: string;
  onChange: (value: string) => void;
  value: string;
  className?: string;
}
const CustomTextInput: React.FC<CustomTextInputProps> = ({
  value,
  inputTooltip,
  name,
  onChange,
  className,
}) => {
  const debouncedHandleChange = useMemo(
    () =>
      debounce((value: string) => {
        onChange(value);
      }, 5), // 500ms delay
    [onChange],
  );
  useEffect(() => {
    return () => {
      debouncedHandleChange.cancel();
    };
  }, [debouncedHandleChange]);
  return (
    <div className={cn(['m-0 flex p-0', className])}>
      <CustomTooltip content={inputTooltip}>
        <Input
          onChange={(e) => debouncedHandleChange(e.target.value)}
          className=" bg-background-slate-400 rounded-md 
            border
               bg-slate-50 ring-0 transition-colors duration-300 ease-in-out focus:border-0 focus:border-none focus:outline-none focus:ring-0 focus:ring-offset-0  focus-visible:border-none focus-visible:ring-0 active:border-none active:ring-0 dark:border-input dark:bg-background dark:hover:bg-slate-800 dark:focus:outline-none dark:focus:ring-0 dark:focus-visible:bg-slate-900 dark:focus-visible:ring-0 dark:focus-visible:ring-offset-0"
          id={name}
          name={name}
          type="text"
          value={value}
        />
      </CustomTooltip>
    </div>
  );
};
export default CustomTextInput;
