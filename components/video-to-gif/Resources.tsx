'use client';
import React, { useCallback, useEffect } from 'react';
import { useStores } from '@/store';
import { observer } from 'mobx-react';
import { TextResourcesPanel } from '@/components/panels/TextResourcesPanel';
import VideoResource from '../entity/videoResource/VideoResource';
import ImageResource from '../entity/imageResource/ImageResource';
import SmiliesResource from '../entity/SmiliesResource';
import GifResource from '../entity/GifResource';
import ExportPanel from '../panels/ExportPanel';
import { AnimationsPanel } from '../panels/AnimationsPanel';
import { EditOptionsPanel } from '../panels/EditOptionsPanel';
import { MenuOption } from '@/types';
import { useCanvas } from '@/app/components/canvas/canvasContext';
import ShadowOptionsPanel from '../panels/ShadowOptionsPanel';
import TextStyleOptions from '../panels/TextStyleOptions';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { ScrollArea } from '../ui/scroll-area';
export type AnimationResourceProps = {
  animation: Animation;
};
export const Resources = observer(() => {
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const store = useStores().uiStore;
  const editorStore = useStores().editorStore;
  const selectedMenuOption = store.selectedMenuOption;
  useEffect(() => {
    editorStore.setAllOptionsToFalse();
  }, [selectedMenuOption, editorStore.toggleOptions]);
  return (
    <div className="w-full bg-slate-300">
      <RenderResource />
    </div>
  );
});
const RenderResource = observer(({}: {}) => {
  const store = useStores().uiStore;
  const selectedMenuOption = store.selectedMenuOption;
  const editorStore = useStores().editorStore;
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  if (editorStore.toggleOptions.get('shadowOptions')) {
    return <ShadowOptionsPanel />;
  }
  if (editorStore.toggleOptions.get('editOptions')) {
    return <EditOptionsPanel />;
  }
  if (editorStore.toggleOptions.get('textStyleOptions')) {
    return <TextStyleOptions />;
  }
  switch (selectedMenuOption) {
    case 'Text':
      return <TextResourcesPanel />;
    case 'Video':
      return <VideoResource />;
    case 'Image':
      return <ImageResource />;
    case 'Export':
      return <ExportPanel />;
    case 'Smilies':
      return <SmiliesResource />;
    case 'Gif':
      return <GifResource />;
    case 'Animation':
      return <AnimationsPanel />;
    default:
      return null;
  }
});
