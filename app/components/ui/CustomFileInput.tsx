'use client';
import { useCallback, useMemo, useState } from 'react';
import { DropzoneRootProps, useDropzone } from 'react-dropzone';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { FaRegFileVideo, FaRegImage } from 'react-icons/fa6';
import { AiOutlineFileGif } from 'react-icons/ai';
import { color } from 'framer-motion';
interface InputFileProps {
  type: 'video' | 'image' | 'gif';
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: FileList;
}
const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  padding: '10px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  outline: 'none',
  transition: 'border .24s ease-in-out',
};
const focusedStyle = {
  borderColor: '#2196f3',
};
const acceptStyle = {
  borderColor: '#00e676',
};
const rejectStyle = {
  borderColor: '#ff1744',
};
export function CustomInputFile({ type, onChange }: InputFileProps) {
  console.log('CustomInputFile');
  const acceptableTypes = {
    video: 'video/*',
    image: 'image/*',
    gif: 'image/gif',
  };
  // acceptablesTypes mapping to the file ending
  const acceptableExtensions = {
    video: ['.mp4', '.webm', '.mov', '.avi'],
    image: ['.jpg', '.jpeg', '.png'],
    gif: ['gif'],
  };
  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject, isDragActive } =
    useDropzone({
      accept: { [acceptableTypes[type]]: acceptableExtensions[type] },
      onDrop: (acceptedFiles) => {
        if (onChange) {
          const event = {
            target: {
              files: acceptedFiles,
            },
          } as unknown as React.ChangeEvent<HTMLInputElement>;
          onChange(event);
        }
      },
      multiple: true,
    });
  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject],
  );
  return (
    <div className="container ">
      <div
        {...getRootProps({ style })}
        className={cn([
          'relative flex h-full max-w-xs items-center justify-center gap-1.5 rounded transition-colors duration-300 ease-in-out',
        ])}
      >
        <Label
          onClick={(e) => {
            e.preventDefault();
          }}
          className={cn([
            'flex h-full w-full cursor-pointer flex-col items-start justify-evenly gap-y-2  transition-colors duration-300',
          ])}
          htmlFor="file-upload-droppable"
        >
          {LabelContent(type, style, isDragReject, isDragAccept, isDragActive, isFocused)}
        </Label>
        <Input
          {...getInputProps()}
          id="file-upload-droppable"
          name="file-upload-droppable"
          className="absolute hidden h-full w-full"
        />
      </div>
    </div>
  );
}
const LabelContent = (
  fileType: string,
  style: DropzoneRootProps['style'],
  isDragReject: boolean,
  isDragAccept: boolean,
  isDragActive: boolean,
  isFocused: boolean,
) => {
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
  const Text = useCallback(() => {
    switch (fileType) {
      case 'video':
      case 'image':
      case 'gif':
        return isDragAccept
          ? `Drop it like it's hot!`
          : isDragReject
            ? 'Invalid file type'
            : `Drop your ${fileType} here`;
      default:
        return null;
    }
  }, [fileType, isDragAccept, isDragReject, isFocused]);
  return (
    <div
      className={cn([
        'flex h-full w-full flex-col items-start justify-evenly gap-y-2',
        isDragAccept ? 'text-green-500' : isDragReject ? 'text-red-500' : 'text-foreground',
      ])}
    >
      <Icon className="text-2xl" />
      <span className="text-md ">{Text()}</span>
    </div>
  );
};
