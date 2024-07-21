import { Video } from '@/store/EditorStore';
import { Dispatch, SetStateAction, ChangeEvent } from 'react';
export interface VideoResourceProps {}
export interface FrameSettingsProps {
  frameRate: number;
  setFrameRate: Dispatch<SetStateAction<number>>;
  quality: number;
  setQuality: Dispatch<SetStateAction<number>>;
}
export interface FileInputProps {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}
export interface VideoListProps {
  videos: Video[];
  onAddButtonClick: (videoUrl: string) => void;
}
