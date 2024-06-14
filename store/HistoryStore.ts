import { makeAutoObservable } from 'mobx';
import { EditorElement, Animation } from '@/types';
import { RootStore } from '.';
interface HistoryState {
  elements: EditorElement[];
  animations: Animation[];
}
export class HistoryStore {
  rootStore: RootStore;
  history: HistoryState[] = [];
  currentIndex = -1;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
  addState(elements: EditorElement[], animations: Animation[]) {
    // Remove future states if we are not at the end of the history
    // set inital state if currentIndex is -1
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    // Add new state
    this.history.push({
      elements: JSON.parse(JSON.stringify(elements)), // Deep copy to avoid reference issues
      animations: JSON.parse(JSON.stringify(animations)),
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
          };
        else if (state.animations.map((an) => an.id).includes(animationId)) return undefined;
      })
      .filter((state) => state !== undefined) as HistoryState[];
    console.log('newHistory:', [...newHistory]);
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
      this.rootStore.animationStore.animations = JSON.parse(JSON.stringify(state.animations));
    }
  }
}
