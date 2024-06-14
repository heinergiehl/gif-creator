import { makeAutoObservable } from 'mobx';
import { EditorStore, FilterType } from './EditorStore';
interface FilterInputOptions {
  [key: string]: string | number | boolean;
}
export class FilterStore {
  editorStore: EditorStore;
  selectedFilter: FilterType | null = null;
  currentFilterOptions: FilterInputOptions = {};
  fromFrame: number = 0;
  toFrame: number = 0;
  constructor(editorStore: EditorStore) {
    this.editorStore = editorStore;
    makeAutoObservable(this, {}, { autoBind: true });
  }
  setSelectedFilter(filterType: FilterType) {
    this.selectedFilter = filterType;
  }
  setCurrentFilterOptions(options: FilterInputOptions) {
    this.currentFilterOptions = options;
  }
  setFromFrame(frame: number) {
    this.fromFrame = frame;
  }
  setToFrame(frame: number) {
    this.toFrame = frame;
  }
}
