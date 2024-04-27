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
  value: string;
  onChange: (event: string) => void;
}
export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  trigger,
  onChange,
  value,
}) => {
  return (
    <Select onValueChange={(e) => onChange(e)} value={value}>
      <SelectTrigger>
        <SelectValue>{trigger}</SelectValue>
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
