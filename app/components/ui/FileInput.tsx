import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
interface InputFileProps {
  type: 'video' | 'image' | 'gif';
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: FileList;
}
export function InputFile({ type, onChange }: InputFileProps) {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5 ">
      <Label id="file-upload">
        {type === 'video'
          ? 'Select a video'
          : type === 'image'
            ? 'Select an image'
            : 'Select a gif'}
      </Label>
      <Input
        id="file-upload"
        type="file"
        onChange={onChange}
        accept={type === 'video' ? 'video/*' : type === 'image' ? 'image/*' : 'image/gif'}
      />
    </div>
  );
}
