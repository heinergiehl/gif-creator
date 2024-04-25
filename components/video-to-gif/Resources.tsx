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
    <aside className="h-screen   bg-slate-200" ref={sidebarRef}>
      {selectedMenuOption === 'Text' ? <TextResourcesPanel /> : null}
      {selectedMenuOption === 'Video' ? <VideoResource /> : null}
      {selectedMenuOption === 'Image' ? <ImageResource /> : null}
      {selectedMenuOption === 'Export' ? <ExportPanel /> : null}
      {selectedMenuOption === 'Smilies' ? <SmiliesResource /> : null}
      {selectedMenuOption === 'Gif' ? <GifResource /> : null}
      {selectedMenuOption === 'Animation' ? <AnimationsPanel /> : null}
    </aside>
  );
});
