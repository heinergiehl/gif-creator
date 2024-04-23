'use client';
import React, { createContext, useContext } from 'react';
import { configure } from 'mobx';
import { ScreenToVideoStore } from './ScreenToVideoStore';
import { AnimationStore } from './AnimationStore';
import { EditorStore } from './EditorStore';
import { TimelineStore } from './TimelineStore';
import { UIStore } from './UIStore';
import { EditorCarouselStore } from './EditorCarouselStore';
import { FileStore } from './FileStore';
configure({
  enforceActions: 'never',
});
export class RootStore {
  screenToVideoStore = new ScreenToVideoStore();
  editorStore = new EditorStore();
  animationStore = new AnimationStore(this.editorStore);
  timelineStore = new TimelineStore(this.animationStore);
  editorCarouselStore = new EditorCarouselStore(this.timelineStore);
  fileStore = new FileStore(this.animationStore);
  uiStore = new UIStore();
  constructor() {}
}
const StoreContext = createContext<RootStore | undefined>(undefined);
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const rootStore = new RootStore();
  return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>;
};
export const useStores = (): RootStore => {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStores must be used within a StoreProvider');
  return store;
};
