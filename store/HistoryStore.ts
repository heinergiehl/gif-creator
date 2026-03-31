import { makeAutoObservable } from 'mobx';
import { EditorElement, Animation, Frame } from '@/types';
import { RootStore } from '.';
interface HistoryState {
  elements: EditorElement[];
  animations: Animation[];
  frames: Frame[];
  currentKeyFrame: number;
  currentTimeInMs: number;
  selectedElementIds: string[];
}
export class HistoryStore {
  rootStore: RootStore;
  history: HistoryState[] = [];
  currentIndex = -1;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
  addState(
    elements: EditorElement[] = this.rootStore.editorStore.elements,
    animations: Animation[] = this.rootStore.animationStore.animations,
    frames: Frame[] = this.rootStore.editorStore.frames,
    currentKeyFrame: number = this.rootStore.editorStore.currentKeyFrame,
    currentTimeInMs: number = this.rootStore.editorStore.currentTimeInMs,
    selectedElementIds: string[] = this.rootStore.editorStore.selectedElements.map((el) => el.id),
  ) {
    // Remove future states if we are not at the end of the history
    // set inital state if currentIndex is -1
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    // Add new state
    this.history.push({
      elements: JSON.parse(JSON.stringify(elements)), // Deep copy to avoid reference issues
      animations: JSON.parse(JSON.stringify(animations)),
      frames: JSON.parse(JSON.stringify(frames)),
      currentKeyFrame,
      currentTimeInMs,
      selectedElementIds: JSON.parse(JSON.stringify(selectedElementIds)),
    });
    this.currentIndex++;
  }
  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.restoreState();
    }
  }
  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      this.restoreState();
    }
  }
  deleteAndGetStateBeforeAnimation(animationId: string) {
    const newHistory = this.history
      .map((state, i) => {
        if (i === 0) return state;
        if (state.animations.length > 1)
          return {
            elements: state.elements,
            animations: state.animations.filter((animation) => animation.id !== animationId),
            frames: state.frames,
            currentKeyFrame: state.currentKeyFrame,
            currentTimeInMs: state.currentTimeInMs,
            selectedElementIds: state.selectedElementIds,
          };
        else if (state.animations.map((an) => an.id).includes(animationId)) return undefined;
      })
      .filter((state) => state !== undefined) as HistoryState[];
    if (newHistory.length > 0) {
      this.history = newHistory;
      this.currentIndex = this.history.length - 1;
      return this.history[this.currentIndex];
    }
  }
  private restoreState() {
    const state = this.history[this.currentIndex];
    if (state) {
      this.rootStore.editorStore.elements = JSON.parse(JSON.stringify(state.elements));
      this.rootStore.editorStore.frames = JSON.parse(JSON.stringify(state.frames));
      this.rootStore.editorStore.syncFramesTimeline();
      this.rootStore.editorStore.setCurrentKeyFrame(state.currentKeyFrame);
      this.rootStore.editorStore.currentTimeInMs = state.currentTimeInMs;
      this.rootStore.editorStore.setSelectedElements(state.selectedElementIds);
      this.rootStore.animationStore.animations = JSON.parse(JSON.stringify(state.animations));
    }
  }
}
