import { makeAutoObservable } from 'mobx';
import { Animation, EditorElement } from '@/types';
import { EditorStore } from './EditorStore';
import { fabric } from 'fabric';
import { AnimationStore } from './AnimationStore';
interface HistoryState {
  animations: Animation[];
  affectedElements: EditorElement[];
}
export class HistoryStore {
  private editorStore?: EditorStore;
  private animationStore?: AnimationStore;
  private history: HistoryState[] = [];
  private redoStack: HistoryState[] = [];
  constructor() {
    makeAutoObservable(this);
  }
  initialize(editorStore: EditorStore, animationStore: AnimationStore) {
    this.editorStore = editorStore;
    this.animationStore = animationStore;
  }
  addState(affectedElements: EditorElement[], animations: Animation[]) {
    // Clone affected elements with their current state
    const clonedElements = affectedElements.map((element) => ({
      ...element,
      fabricObject: element.fabricObject
        ? fabric.util.object.clone(element.fabricObject)
        : undefined,
    }));
    this.history.push({
      animations: JSON.parse(JSON.stringify(animations)),
      affectedElements: clonedElements,
    });
    this.redoStack = []; // Clear the redo stack whenever a new state is added
  }
  undo() {
    if (this.history.length < 2) return;
    const currentState = this.history.pop(); // Remove the latest state
    // when undoing an animation, we dont want to put on the redo stack
    if (currentState?.animations.length) {
      this.redoStack = [];
    } else {
      this.redoStack.push(currentState!);
    }
    this.restoreState(this.history[this.history.length - 1]); // Restore the previous state
  }
  redo() {
    const stateToRestore = this.redoStack.pop();
    if (!stateToRestore) return;
    this.history.push(stateToRestore);
    this.restoreState(stateToRestore);
  }
  private restoreState(state: HistoryState) {
    // Restore the editor elements to their previous state
    if (this.editorStore) {
      this.editorStore.elements = this.editorStore.elements.map((editorElement) => {
        const savedElement = state.affectedElements.find((e) => e.id === editorElement.id);
        return savedElement || editorElement;
      });
      // Update the canvas with restored elements
      if (this.editorStore.canvas) {
        this.editorStore.canvas.clear();
        this.editorStore.elements.forEach((element) => {
          if (element.fabricObject) {
            this.editorStore?.canvas!.add(element.fabricObject);
          }
        });
        this.editorStore.canvas.requestRenderAll();
      }
    }
    // Restore animations
    if (this.animationStore) {
      this.animationStore.animations = state.animations;
    }
  }
}
