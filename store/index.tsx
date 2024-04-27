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
import { HistoryStore } from './HistoryStore';
configure({
  enforceActions: 'never',
});
class RootStore {
  screenToVideoStore = new ScreenToVideoStore();
  editorStore = new EditorStore();
  historyStore = new HistoryStore();
  animationStore = new AnimationStore();
  timelineStore = new TimelineStore();
  editorCarouselStore = new EditorCarouselStore();
  fileStore = new FileStore();
  uiStore = new UIStore();
  constructor() {
    this.setupDependencies();
  }
  // Method to configure all dependencies after instantiation
  setupDependencies() {
    this.historyStore.initialize(this.editorStore, this.animationStore);
    this.animationStore.initialize(this.editorStore, this.historyStore);
    this.timelineStore.initialize(this.animationStore, this.editorStore);
    this.editorCarouselStore.initialize(this.editorStore, this.timelineStore);
    this.editorStore.initialize(this.animationStore);
  }
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
