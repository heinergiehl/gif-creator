'use client';
import { useMemo } from 'react';
import { DropzoneRootProps, useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { FaRegFileVideo, FaRegImage } from 'react-icons/fa6';
import { AiOutlineFileGif } from 'react-icons/ai';
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
  const acceptableTypes = {
    video: 'video/*',
    image: 'image/*',
    gif: 'image/gif',
  };
  // acceptablesTypes mapping to the file ending
  const acceptableExtensions = {
    video: ['.mp4', '.webm', '.mov', '.avi', '.mkv'],
    image: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'],
    gif: ['.gif'],
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
    <div className="flex w-full justify-center px-4">
      <div
        {...getRootProps({ style })}
        className={cn([
          'relative flex h-full w-full cursor-pointer items-center justify-center gap-1.5 rounded transition-colors duration-300 ease-in-out',
        ])}
      >
        <div
          className={cn([
            'flex h-full w-full cursor-pointer flex-col items-center justify-evenly gap-y-2 transition-colors duration-300',
          ])}
        >
          {LabelContent(type, style, isDragReject, isDragAccept, isDragActive, isFocused)}
        </div>
        <input
          {...getInputProps()}
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
        return <FaRegFileVideo className={className} size="22" />;
      case 'image':
        return <FaRegImage className={className} size="22" />;
      case 'gif':
        return <AiOutlineFileGif className={className} size="22" />;
      default:
        return null;
    }
  };
  const Text = () => {
    switch (fileType) {
      case 'video':
      case 'image':
      case 'gif':
        return isDragAccept
          ? 'Drop here!'
          : isDragReject
            ? 'Invalid file'
            : `Drop ${fileType} here`;
      default:
        return null;
    }
  };
  return (
    <div
      className={cn([
        'flex h-full w-full items-center justify-center gap-3',
        isDragAccept ? 'text-green-500' : isDragReject ? 'text-red-500' : 'text-foreground',
      ])}
    >
      <Icon className="text-xl opacity-60" />
      <span className="text-sm">{Text()}</span>
    </div>
  );
};
