import React, { useState, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { observer } from 'mobx-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
interface CustomDebounceInputProps {
  value: string; // Consider changing this to a more generic type if needed, like any or string | number
  handleChange: (value: string) => void; // Adjust the type as necessary
  label: string;
  name: string;
  type: string;
}
const DEBOUNCE_TIME_IN_MS = 3500;
const CustomDebounceInput = observer(
  ({ value, handleChange, label, name, type }: CustomDebounceInputProps) => {
    const [inputValue, setInputValue] = useState(value);
    useEffect(() => {
      const debounced = debounce(() => {
        handleChange(inputValue);
      }, DEBOUNCE_TIME_IN_MS);
      // Call the debounced function
      debounced();
      // Cleanup function to cancel the debounce on unmount or before the next effect
      return () => {
        debounced.cancel();
      };
    }, [inputValue, handleChange]);
    return (
      <div className="flex flex-row items-center">
        <Label htmlFor={name} className="mr-4 text-center text-xs">
          {label}
        </Label>
        <Input
          className=""
          type={type}
          id={name}
          name={name}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>
    );
  },
);
export default CustomDebounceInput;
