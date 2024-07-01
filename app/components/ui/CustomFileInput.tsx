'use client';
import { use, useCallback, useEffect, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { FaRegFileVideo, FaRegImage } from 'react-icons/fa6';
import { AiOutlineFileGif } from 'react-icons/ai';
import { debounce } from 'lodash';
interface InputFileProps {
  type: 'video' | 'image' | 'gif';
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: FileList;
}
export function CustomInputFile({ type, onChange }: InputFileProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isValidType, setIsValidType] = useState<boolean | null>(null);
  const { isOver, setNodeRef } = useDroppable({
    id: 'file-upload-droppable',
  });
  const acceptableTypes = {
    video: 'video/*',
    image: 'image/*',
    gif: 'image/gif',
  };
  const checkIfValidType = useCallback(
    (items: DataTransferItemList | null) => {
      if (!items || items.length === 0) return null;
      return Array.from(items).every((item) => {
        const mimeType = item.type;
        return mimeType && mimeType.match(new RegExp(acceptableTypes[type].replace('*', '.*')));
      });
    },
    [type, acceptableTypes, setIsValidType],
  );
  // Debounced function to set valid type
  const debounceSetIsValidType = debounce((isValid) => {
    setIsValidType(isValid);
  }, 100);
  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    debounceSetIsValidType.cancel();
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.items;
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
      if (files) {
        const isValid = checkIfValidType(files);
        debounceSetIsValidType(isValid);
      }
    } else if (event.type === 'dragleave') {
      setDragActive(false);
      debounceSetIsValidType(null);
    }
  };
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (onChange && event.dataTransfer.files.length > 0) {
      const files = event.dataTransfer.files;
      // Creating a new synthetic event
      const syntheticEvent = {
        ...event,
        target: {
          ...event.target,
          value: files[0],
          files: files,
        },
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };
  useEffect(() => {
    return () => {
      debounceSetIsValidType.cancel();
    };
  }, []);
  return (
    <div
      ref={setNodeRef}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={cn([
        'relative flex  max-h-40  max-w-xs  items-center justify-center gap-1.5 rounded border-2 transition-colors duration-300 ease-in-out',
        ,
        isValidType?.toString() === 'true'
          ? 'border-green-500'
          : isValidType?.toString() === 'false'
            ? 'border-red-500'
            : 'border-foreground',
        'hover:border-dashed hover:border-green-500 hover:border-opacity-50',
      ])}
    >
      <Label
        className={cn([
          'flex h-full w-full  cursor-pointer flex-col items-start justify-evenly gap-y-2 p-4 transition-colors duration-300',
          dragActive
            ? isValidType
              ? 'text-green-500'
              : isValidType === null
                ? 'text-foreground'
                : 'text-red-500'
            : 'text-foreground',
        ])}
        htmlFor="file-upload-droppable"
      >
        {LabelContent(type, isValidType)}
      </Label>
      <Input
        multiple
        id="file-upload-droppable"
        type="file"
        onChange={onChange}
        name="file-upload-droppable"
        className="absolute hidden h-full w-full "
        accept={acceptableTypes[type]}
      />
    </div>
  );
}
const LabelContent = (fileType: string, isValidFile: boolean | null) => {
  const Icon = ({ className }: { className: string }) => {
    switch (fileType) {
      case 'video':
        return <FaRegFileVideo className={className} size="30" />;
      case 'image':
        return <FaRegImage className={className} size="30" />;
      case 'gif':
        return <AiOutlineFileGif className={className} size="30" />;
      default:
        return null;
    }
  };
  const Text = () => {
    switch (fileType) {
      case 'video':
      case 'image':
      case 'gif':
        return isValidFile || isValidFile === null
          ? `Drop your ${fileType} here`
          : 'Invalid file type';
      default:
        return null;
    }
  };
  return (
    <div
      className={cn([
        ' flex h-full w-full flex-col items-start justify-evenly gap-y-2  ',
        isValidFile ? 'text-green-500' : isValidFile === null ? 'text-foreground' : 'text-red-500',
      ])}
    >
      <Icon className="text-2xl" />
      <span className="text-md"> {Text()}</span>
    </div>
  );
};
