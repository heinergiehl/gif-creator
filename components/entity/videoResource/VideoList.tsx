import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MdAddCircle } from 'react-icons/md';
import { VideoListProps } from './types';
const VideoList: React.FC<VideoListProps> = ({ videos, onAddButtonClick }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <div className="flex h-full w-full flex-wrap gap-4">
      {videos.map((video) => (
        <div
          key={video.id}
          className={cn(
            'card group relative mx-auto flex h-[80px] w-[120px] cursor-pointer flex-col overflow-hidden rounded-md shadow-xl',
            'dark:border-neutral-800",rounded-md justify-end  shadow-xl dark:border-neutral-800',
            'bg-cover bg-center',
            'before:fixed before:inset-0 before:z-[-1] before:opacity-0',
            'transition-all duration-500',
          )}
        >
          <Image
            width="120"
            height="80"
            alt="video thumbnail"
            src={video.thumbnail_url || ''}
            objectFit="cover"
            className="absolute inset-0 h-full w-full"
          />
          <video
            muted
            ref={videoRef}
            onMouseEnter={(e) => {
              setIsHovered(true);
              (e.target as HTMLVideoElement)?.play();
            }}
            onMouseLeave={(e) => {
              setIsHovered(false);
              (e.target as HTMLVideoElement)?.pause();
            }}
            poster={video.thumbnail_url}
            width={120}
            height={80}
            crossOrigin="anonymous"
            src={video.video_url || ''}
            className="absolute inset-0 z-[100] h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
          <Button
            onClick={() => onAddButtonClick(video.video_url)}
            variant="default"
            className="absolute left-2 top-2 z-[999] h-8 w-8 rounded-full p-1 opacity-0 group-hover:opacity-100"
          >
            <MdAddCircle />
          </Button>
          <div className="absolute z-50 text-gray-50">
            <p className="m-1 text-xs font-normal">
              {video.duration ? `${video.duration.toFixed(1)} seconds` : 'No duration'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
export default VideoList;
