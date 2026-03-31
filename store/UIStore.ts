import { makeAutoObservable } from 'mobx';
import { MenuOption } from '@/types';
export class UIStore {
  selectedMenuOption: MenuOption;
  constructor(initialMenuOption: MenuOption = 'Video') {
    this.selectedMenuOption = initialMenuOption;
    makeAutoObservable(this);
  }
  setSelectedMenuOption(option: MenuOption) {
    this.selectedMenuOption = option;
  }
}
