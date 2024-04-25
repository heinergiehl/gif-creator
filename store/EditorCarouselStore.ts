import { makeAutoObservable } from 'mobx';
import { TimelineStore } from './TimelineStore';
import { EditorStore } from './EditorStore';
export class EditorCarouselStore {
  timelineStore?: TimelineStore;
  private editorStore?: EditorStore;
  cardItemWidth: number = 0;
  cardItemHeight: number = 0;
  isCreatingGifs: boolean = false;
  constructor() {
    makeAutoObservable(this);
  }
  initialize(editorStore: EditorStore, timelineStore: TimelineStore) {
    this.editorStore = editorStore;
    this.timelineStore = timelineStore;
  }
}
