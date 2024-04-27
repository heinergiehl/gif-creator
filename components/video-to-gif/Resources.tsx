'use client';
import React, { useEffect } from 'react';
import { useStores } from '@/store';
import { observer } from 'mobx-react';
import { TextResourcesPanel } from '@/components/panels/TextResourcesPanel';
import VideoResource from '../entity/VideoResource';
import ImageResource from '../entity/ImageResource';
import SmiliesResource from '../entity/SmiliesResource';
import GifResource from '../entity/GifResource';
import ExportPanel from '../panels/ExportPanel';
import { AnimationsPanel } from '../panels/AnimationsPanel';
const ANIMATION_TYPE_TO_LABEL: Record<string, string> = {
  fadeIn: 'Fade In',
  fadeOut: 'Fade Out',
  slideIn: 'Slide In',
  slideOut: 'Slide Out',
  breath: 'Breath',
};
export type AnimationResourceProps = {
  animation: Animation;
};
export const Resources = observer(() => {
  const store = useStores().uiStore;
  const selectedMenuOption = store.selectedMenuOption;
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  return (
    <aside
      className="relative w-full h-full transition-all duration-300 ease-in-out opacity-100 text-foreground dark:bg-slate-900 "
      ref={sidebarRef}
    >
      <div className="relative w-full h-full ">
        <div className="absolute -inset-0.5 h-full rounded-md bg-pink-600 bg-gradient-to-r from-pink-500 to-purple-600 opacity-60 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-500"></div>
        <div className="relative h-full w-full pt-[80px] dark:bg-slate-900">
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
