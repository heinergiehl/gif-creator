import { makeAutoObservable } from "mobx"
import { TimelineStore } from "./TimelineStore"
import { EditorStore } from "./EditorStore"
export class EditorCarouselStore {
  timelineStore: TimelineStore
  editorStore: EditorStore
  cardItemWidth: number = 0
  cardItemHeight: number = 0
  isCreatingGifs: boolean = false
  constructor(timelineStore: TimelineStore) {
    this.timelineStore = timelineStore
    this.editorStore = timelineStore.animationStore.editorStore
    makeAutoObservable(this)
  }
}
