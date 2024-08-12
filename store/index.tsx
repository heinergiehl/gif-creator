'use client';
import React, { MutableRefObject, createContext, useContext } from 'react';
import { configure, makeAutoObservable } from 'mobx';
import { ScreenToVideoStore } from './ScreenToVideoStore';
import { AnimationStore } from './AnimationStore';
import { EditorStore } from './EditorStore';
import { TimelineStore } from './TimelineStore';
import { UIStore } from './UIStore';
import { EditorCarouselStore } from './EditorCarouselStore';
import { FileStore } from './FileStore';
import { HistoryStore } from './HistoryStore';
import { FilterStore } from './FilterStore';
import { injectStores } from '@mobx-devtools/tools';
import { CanvasOptionsStore } from './CanvasOptionsStore';
import { useCanvas } from '@/app/components/canvas/canvasContext';
import { observer } from 'mobx-react-lite';
import { Canvas } from 'fabric/fabric-impl';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
configure({
  enforceActions: 'never',
});
export class RootStore {
  canvasRef: MutableRefObject<Canvas | null>;
  supabase: SupabaseClient;
  touchActionEnabled = false;
  rerunUseManageFabricObjects = false;
  constructor(canvasRef: MutableRefObject<Canvas | null>) {
    this.canvasRef = canvasRef;
    this.supabase = createClient();
    makeAutoObservable(this);
  }
  setTouchActionEnabled = (value: boolean) => {
    this.touchActionEnabled = value;
  };
  setRerunUseManageFabricObjects = (value: boolean) => {
    this.rerunUseManageFabricObjects = value;
  };
  editorStore = new EditorStore(this);
  animationStore = new AnimationStore(this);
  timelineStore = new TimelineStore(this);
  editorCarouselStore = new EditorCarouselStore(this);
  historyStore = new HistoryStore(this);
  canvasOptionsStore = new CanvasOptionsStore(this);
  fileStore = new FileStore(this);
  screenToVideoStore = new ScreenToVideoStore(this);
  uiStore = new UIStore();
}
const StoreContext = createContext<RootStore | undefined>(undefined);
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const canvasRef = useCanvas().canvasRef;
  const rootStore = new RootStore(canvasRef);
  injectStores({
    rootStore: rootStore,
  });
  return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>;
};
export const useStores = (): RootStore => {
  const store: RootStore | undefined = useContext(StoreContext);
  if (!store) throw new Error('useStores must be used within a StoreProvider');
  return store;
};
