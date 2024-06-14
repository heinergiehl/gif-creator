import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterType } from '@/store/EditorStore';
interface CustomSelectProps {
  options: {
    value: string;
    label: string;
  }[];
  trigger: string;
  value: string | null;
  onChange: (filterType: FilterType) => void;
}
export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  trigger,
  onChange,
  value,
}) => {
  return (
    <Select onValueChange={(e) => onChange(e)} value={value || ''}>
      <SelectTrigger className={'max-w-[70%]'}>{value !== '' ? value : trigger}</SelectTrigger>
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
