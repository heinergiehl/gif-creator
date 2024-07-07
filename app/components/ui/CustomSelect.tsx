import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
interface CustomSelectProps {
  options: {
    value: string;
    label: string;
  }[];
  trigger: string;
  value: string | null;
  onChange: (filterType: string) => void;
}
export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  trigger,
  onChange,
  value,
}) => {
  return (
    <Select onValueChange={(e) => onChange(e)} value={value || ''}>
      <SelectTrigger
        className={
          'ring-0" className="h-[2.5rem]" max-w-[70%] rounded-none focus:outline-none focus:ring-0    active:outline-none'
        }
      >
        {value !== '' ? value : trigger}
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
