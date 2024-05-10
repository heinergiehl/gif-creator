import { makeAutoObservable } from 'mobx';
import { MenuOption } from '@/types';
export class UIStore {
  selectedMenuOption: MenuOption = 'Effect';
  constructor() {
    makeAutoObservable(this);
  }
  setSelectedMenuOption(option: MenuOption) {
    this.selectedMenuOption = option;
  }
}
