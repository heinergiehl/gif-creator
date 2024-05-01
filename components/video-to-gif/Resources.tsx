'use client';
import React from 'react';
import { useStores } from '@/store';
import { observer } from 'mobx-react';
import { TextResourcesPanel } from '@/components/panels/TextResourcesPanel';
import VideoResource from '../entity/VideoResource';
import ImageResource from '../entity/ImageResource';
import SmiliesResource from '../entity/SmiliesResource';
import GifResource from '../entity/GifResource';
import ExportPanel from '../panels/ExportPanel';
import { AnimationsPanel } from '../panels/AnimationsPanel';
export type AnimationResourceProps = {
  animation: Animation;
};
export const Resources = observer(() => {
  const store = useStores().uiStore;
  const selectedMenuOption = store.selectedMenuOption;
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  return (
    <aside
      className="relative h-full w-full text-foreground opacity-100 transition-all duration-300 ease-in-out dark:bg-slate-900 "
      ref={sidebarRef}
    >
      <div className="relative h-full w-full ">
        <div className="absolute -inset-0.5 h-full rounded-md bg-pink-600 bg-gradient-to-r from-pink-500 to-purple-600 opacity-60 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-500"></div>
        <div className="relative h-full w-full  dark:bg-slate-900">
          {selectedMenuOption === 'Text' ? <TextResourcesPanel /> : null}
          {selectedMenuOption === 'Video' ? <VideoResource /> : null}
          {selectedMenuOption === 'Image' ? <ImageResource /> : null}
          {selectedMenuOption === 'Export' ? <ExportPanel /> : null}
          {selectedMenuOption === 'Smilies' ? <SmiliesResource /> : null}
          {selectedMenuOption === 'Gif' ? <GifResource /> : null}
          {selectedMenuOption === 'Animation' ? <AnimationsPanel /> : null}
        </div>
      </div>
    </aside>
  );
});
