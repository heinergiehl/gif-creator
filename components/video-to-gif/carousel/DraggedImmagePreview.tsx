import React, { memo } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/store';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';
const DraggedImagePreview = ({ src }: { src: string }) => {
  console.log('DraggedImagePreview', src);
  return (
    <div className=" flex h-full w-full items-center justify-center p-0 shadow-2xl shadow-black drop-shadow-2xl">
      <Image
        src={src}
        alt={`DragOverlay`}
        id={'DragOverlay'}
        width={80}
        height={80}
        className="min-h-[70px] min-w-[70px]   rounded-lg md:min-h-[80px] md:min-w-[80px]"
      />
    </div>
  );
};
export default DraggedImagePreview;
