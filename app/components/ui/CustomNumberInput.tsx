import React, { useMemo, useEffect } from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';
import debounce from 'lodash.debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomTooltip } from './CustomTooltip';
interface CustomNumberInputPropbs {
  value: number;
  name: string;
  decreaseButtonTooltip: string;
  increaseButtonTooltip: string;
  inputTooltip: string;
  onChange: (value: number) => void;
}
const CustomNumberInput: React.FC<CustomNumberInputPropbs> = ({
  value,
  onChange,
  decreaseButtonTooltip,
  increaseButtonTooltip,
  inputTooltip,
  name,
}) => {
  const handleIncrement = () => {
    onChange(value + 1);
  };
  const handleDecrement = () => {
    if (value > 1) {
      onChange(value - 1);
    }
  };
  const debouncedHandleChange = useMemo(
    () =>
      debounce((value: number) => {
        onChange(value);
      }, 500), // 500ms delay
    [onChange],
  );
  useEffect(() => {
    return () => {
      debouncedHandleChange.cancel();
    };
  }, [debouncedHandleChange]);
  return (
    <div className="m-0 flex p-0">
      <CustomTooltip content={decreaseButtonTooltip}>
        <Button variant="outline" className="rounded-r-none" onClick={handleDecrement}>
          <MinusIcon size={20} />
        </Button>
      </CustomTooltip>
      <CustomTooltip content={inputTooltip}>
        <Input
          onChange={(e) => debouncedHandleChange(Number(e.target.value))}
          className="w-[60px] rounded-l-none rounded-r-none border
            bg-slate-400
                  ring-0 transition-colors duration-300 ease-in-out focus:border-0 focus:outline-none focus:ring-0 focus:ring-offset-0 dark:border-input dark:bg-background dark:hover:bg-slate-800 dark:focus:outline-none dark:focus:ring-0 dark:focus-visible:bg-slate-900 dark:focus-visible:ring-0 dark:focus-visible:ring-offset-0"
          id={name}
          name={name}
          type="text"
          value={value}
        />
      </CustomTooltip>
      <CustomTooltip content={increaseButtonTooltip}>
        <Button variant="outline" className="rounded-l-none" onClick={handleIncrement}>
          <PlusIcon size={20} />
        </Button>
      </CustomTooltip>
    </div>
  );
};
export default CustomNumberInput;
