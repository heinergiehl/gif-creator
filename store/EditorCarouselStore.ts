import { makeAutoObservable } from 'mobx';
import { TimelineStore } from './TimelineStore';
import { RootStore } from '.';
export class EditorCarouselStore {
  rootStore?: RootStore;
  cardItemWidth: number = 0;
  cardItemHeight: number = 0;
  isCreatingGifs: boolean = false;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
}
