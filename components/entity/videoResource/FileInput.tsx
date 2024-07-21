import React from 'react';
import { CustomInputFile } from '@/app/components/ui/CustomFileInput';
import { FileInputProps } from './types';
const FileInput: React.FC<FileInputProps> = ({ onChange }) => {
  return <CustomInputFile onChange={onChange} type="video" />;
};
export default FileInput;
