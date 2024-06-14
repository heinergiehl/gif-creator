import { makeAutoObservable } from 'mobx';
import { RootStore } from '.';
// store for screen to video editor and converter
export class ScreenToVideoStore {
  currentStep: 1 | 2 | 3 | 4 = 1;
  constructor(
    // root store
    private rootStore: RootStore,
  ) {
    makeAutoObservable(this);
  }
}
