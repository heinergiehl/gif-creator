import { makeAutoObservable } from "mobx"
// store for screen to video editor and converter
export class ScreenToVideoStore {
  currentStep: 1 | 2 | 3 | 4 = 1
  constructor() {
    makeAutoObservable(this)
  }
}
