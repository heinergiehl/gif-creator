import { makeAutoObservable } from 'mobx';
import { RootStore } from '.';
export class CanvasOptionsStore {
  width: number = 640;
  height: number = 360;
  // white color by default
  backgroundColor: string = '#ffffff';
  backgroundGradient: string = '';
  showCanvasOptions: boolean = false;
  // other important fabric canvas options
  rootStore: RootStore;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
  toggleCanvasOptions() {
    this.showCanvasOptions = !this.showCanvasOptions;
  }
  setWidth(width: number) {
    this.width = width;
  }
  setHeight(height: number) {
    this.height = height;
  }
  setBackgroundColor(color: string) {
    this.backgroundColor = color;
  }
  setBackgroundGradient(gradient: string) {
    this.backgroundGradient = gradient;
  }
}
