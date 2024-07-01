import { makeAutoObservable } from 'mobx';
import { MenuOption } from '@/types';
export class UIStore {
  selectedMenuOption: MenuOption = 'Video';
  constructor() {
    makeAutoObservable(this);
  }
  setSelectedMenuOption(option: MenuOption) {
    this.selectedMenuOption = option;
  }
}
