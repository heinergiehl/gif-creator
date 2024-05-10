// allows to add images to a specific gif frame (nested object)
// Compare this snippet from components/panels/TexResourcesPanel.tsx:
'use client';
import React, { use } from 'react';
import { observer } from 'mobx-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useStores } from '@/store';
import { CustomInputFile } from '@/app/components/ui/CustomFileInput';
import { useDraggable } from '@dnd-kit/core';
const DraggableImage = observer(({ image, index }: { image: string; index: number }) => {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: `imageResource-${index}`,
    data: {
      image,
      index,
    },
  });
  const style = transform
    ? {
        zIndex: isDragging ? 999 : undefined,
      }
    : undefined;
  return (
    <div style={style} ref={setNodeRef} {...listeners} {...attributes}>
      <Image
        id={`imageResource-${index}`}
        src={image}
        width={100}
        height={100}
        alt={'Draggable image resource'}
        className="max-h-[100px] max-w-[100px]
            cursor-pointer rounded-lg object-cover
          "
      />
    </div>
  );
});
const ImageResource = observer(() => {
  const pathName = usePathname();
  const isVideoToGif = pathName.includes('video-to-gif');
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        if (isVideoToGif && !store.isDragging) {
          store.progress.conversion = 0;
          store.images.push(reader.result as string);
          store.progress.conversion = 100;
        }
      };
    }
  };
  return (
    <>
      <div className="h-screen space-y-2 p-4">
        <CustomInputFile onChange={handleImageChange} type="image" />
        <div className="mb-4 flex w-full flex-col items-center justify-center space-y-4">
          {store.images.map((image, index) => (
            <DraggableImage key={index} image={image} index={index} />
          ))}
        </div>
      </div>
    </>
  );
});
export default ImageResource;
