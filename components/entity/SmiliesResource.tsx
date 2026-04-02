import React, { useEffect, useState, useContext } from 'react';
import { observer } from 'mobx-react';
import { DndContext, useDraggable } from '@dnd-kit/core';
import Image from 'next/image';
import { useStores } from '@/store';
import { MagicCard, MagicContainer } from '../magicui/magic-card';
import { Button } from '../ui/button';
import { FrameIcon, ImageUp, ImageUpIcon, PlusIcon, Layers, MousePointerClick } from 'lucide-react';
import ShinyButton from '../magicui/shiny-button';
import { getUid } from '@/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Label } from '../ui/label';
import { PopoverClose } from '@radix-ui/react-popover';
import { CustomTooltip } from '@/app/components/ui/CustomTooltip';
const API_KEY = '43266925-5f9d4a4a69a0b1f37c83e9c7a';
interface ImageProps {
  image: {
    id: string;
    webformatURL: string;
    previewWidth: number;
    previewHeight: number;
  };
  index: number;
}
const DraggableImage = observer(({ image, index }: ImageProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `imageResource-${index}`,
    data: { type: 'image', image: image.webformatURL, index },
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
      }
    : undefined;
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="p-2">
      <Image
        id={'imageResource-' + index}
        src={image.webformatURL}
        width={image.previewWidth}
        height={image.previewHeight}
        alt={'Smiley'}
        style={style}
        className="rounded-lg object-cover"
        draggable={false} // It's important to disable the native HTML drag and drop
        crossOrigin="anonymous"
      />
    </div>
  );
});
const SmiliesResource = observer(() => {
  const [smilies, setSmilies] = useState<
    { id: string; webformatURL: string; previewWidth: number; previewHeight: number }[]
  >([]);
  const [imageType, setImageType] = useState('vector');
  const store = useStores().editorStore;
  useEffect(() => {
    const fetchSmilies = async () => {
      try {
        const response = await fetch(
          `https://pixabay.com/api/?key=${API_KEY}&q=smilies&image_type=${imageType}`,
          {},
        );
        const data = await response.json();
        setSmilies(data.hits);
      } catch (error) {
        console.error('Error fetching smilies:', error);
      }
    };
    fetchSmilies();
  }, [imageType]);
  const handleClick = (url: string, isFrame: boolean) => {
    let id: string;
    if (isFrame) {
      id = getUid();
      store.frames.push({
        id,
        src: url,
      });
    } else id = '';
    store.addImage(store.elements.length, url, isFrame, id);
  };
  return (
    <div className="h-screen w-full space-y-2 p-4" draggable="false">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Search</span>
        <select
          value={imageType}
          onChange={(e) => setImageType(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="vector">Vector</option>
          <option value="photo">Photo</option>
          <option value="illustration">Illustration</option>
        </select>
      </div>
      <MagicContainer className={'flex w-full flex-wrap gap-2 '}>
        {smilies.map((smiley, index) => (
          <MagicCard key={smiley.id} className="group relative h-auto w-full max-w-[130px] p-2">
            <div>
              {/* Hover action buttons - compact icon-only */}
              <div className="absolute inset-x-0 bottom-1 z-10 flex items-center justify-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <CustomTooltip content="Add as frame">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 w-7 rounded-full p-0 shadow-md"
                    onClick={() => handleClick(smiley.webformatURL, true)}
                  >
                    <Layers className="h-3.5 w-3.5" />
                  </Button>
                </CustomTooltip>
                <CustomTooltip content="Add as object">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 w-7 rounded-full p-0 shadow-md"
                    onClick={() => handleClick(smiley.webformatURL, false)}
                  >
                    <MousePointerClick className="h-3.5 w-3.5" />
                  </Button>
                </CustomTooltip>
              </div>
              <DraggableImage key={smiley.id} image={smiley} index={index} />
              <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
            </div>
          </MagicCard>
        ))}
      </MagicContainer>
    </div>
  );
});
export default SmiliesResource;
