// FilterStore.ts
import { computed, makeAutoObservable } from 'mobx';
import { EditorStore, FilterType } from './EditorStore';
import { fabric } from 'fabric';
import { IBaseFilter } from '@/components/panels/EffectsPanel';
import { EditorElement } from '@/types';
interface FiltersOfSelectedElement {
  selectedElementId: string;
  filters: FilterType[];
}
interface GrayscaleFilterOptions {}
interface InvertFilterOptions {}
interface RemoveColorFilterOptions {
  color: string;
  distance: number;
}
interface BrightnessFilterOptions {
  brightness: number;
}
// Extend Fabric.js filters with these options
class GrayscaleFilter extends fabric.Image.filters.Grayscale implements GrayscaleFilterOptions {}
class InvertFilter extends fabric.Image.filters.Invert implements InvertFilterOptions {}
class RemoveColorFilter
  extends fabric.Image.filters.BaseFilter
  implements RemoveColorFilterOptions
{
  color: string;
  distance: number;
  constructor(options: RemoveColorFilterOptions) {
    super();
    this.color = options.color;
    this.distance = options.distance;
  }
}
class BrightnessFilter extends fabric.Image.filters.BaseFilter implements BrightnessFilterOptions {
  brightness: number;
  constructor(options: BrightnessFilterOptions) {
    super();
    this.brightness = options.brightness;
  }
}
export interface FilterInputOptions {
  [key: string]: string | number | boolean;
}
export class FilterStore {
  editorStore: EditorStore | null = null;
  selectedFilter: IBaseFilter | null = null;
  filtersTypes: FilterType[] = [
    FilterType.Grayscale,
    FilterType.Invert,
    FilterType.RemoveColor,
    FilterType.Brightness,
    FilterType.Contrast,
    FilterType.Pixelate,
    FilterType.Blur,
    FilterType.Vibrance,
    FilterType.Noise,
    FilterType.Saturation,
  ];
  updateAll: boolean = false;
  shouldRemoveFilter: boolean = false;
  applyToAllFrames: boolean = false;
  fromFrame: number | undefined = undefined;
  toFrame: number | undefined = undefined;
  addingFilter: boolean = false;
  applyingFilter: boolean = false;
  constructor(editorStore: EditorStore) {
    this.editorStore = editorStore;
    makeAutoObservable(this);
  }
  // initialize(editorStore: EditorStore) {
  //   this.editorStore = editorStore;
  // }
  setSelectedFilter(filter: IBaseFilter) {
    this.selectedFilter = filter;
  }
  get selectedElementId() {
    return this.editorStore?.selectedElement?.id;
  }
  setToFrame(frame: number) {
    this.toFrame = frame;
  }
  setFromFrame(frame: number) {
    this.fromFrame = frame;
  }
  get selectedElement() {
    return this.editorStore?.elements.find((el) => el.id === this.selectedElementId);
  }
  getSelectedElement() {
    return this.editorStore?.elements.find((el) => el.id === this.selectedElementId);
  }
  get elements() {
    return this.editorStore?.elements;
  }
  get canvas() {
    return this.editorStore?.canvas;
  }
  filtersOfSelectedElement(): IBaseFilter[] | undefined {
    if (this.selectedElement?.type !== 'image') {
      // console log in red
      console.log('%cSelected element is not an image:', 'color: red; font-weight: bold');
      return;
    }
    return [...(this.asFabricImage(this.selectedElement)?.filters || [])];
  }
  removeFilter(filterType: FilterType) {
    if (this.selectedElement?.type !== 'image') {
      console.error('Selected element is not an image');
      return;
    }
    const fabricElement = this.selectedElement?.fabricObject as fabric.Image;
    if (!fabricElement) {
      console.error('No fabric object found');
      return;
    }
    console.log('Current Filters Before Removal:', fabricElement.filters);
    fabricElement.filters = fabricElement.filters?.filter(
      (f) => this.asBaseFilter(f).type !== filterType,
    );
    fabricElement.applyFilters();
    this.canvas?.renderAll();
    console.log('Current Filters After Removal:', fabricElement.filters);
  }
  applyFilter(filterType: FilterType, options?: FilterInputOptions) {
    console.log('Applying filter:', filterType, options);
    if (this.selectedElement?.type !== 'image') {
      console.error('Selected element is not an image');
      return;
    }
    const fabricElement = this.selectedElement?.fabricObject as fabric.Image;
    if (!fabricElement) {
      console.error('No fabric object found');
      return;
    }
    console.log('Current Filters Before Update:', fabricElement.filters);
    const filter = this.getExistingFilter(fabricElement, filterType);
    console.log('6969!', options);
    if (options?.removeFilter !== true) {
      console.log('Filter with options:', filterType, options);
      this.updateOrAddFilter(fabricElement, filterType, filter, options);
      this.asFabricImage(this.selectedElement).applyFilters();
    } else {
      console.log('Removing filter:', filterType);
      this.removeFilter(filterType);
    }
    this.editorStore?.canvas?.renderAll();
  }
  asFabricImage(element: EditorElement): fabric.Image {
    return element.fabricObject as fabric.Image;
  }
  asBaseFilter(filter: fabric.IBaseFilter): IBaseFilter {
    return filter as IBaseFilter;
  }
  createFilter(filterType: FilterType, options: FilterInputOptions) {
    switch (filterType) {
      case 'Grayscale':
        return new fabric.Image.filters.Grayscale(options as any);
      case 'Invert':
        return new fabric.Image.filters.Invert(options as any);
      case 'RemoveColor':
        const removeColor = new fabric.Image.filters.RemoveColor();
        return removeColor;
      case 'Brightness':
        return new fabric.Image.filters.Brightness(options as any);
      case 'Contrast':
        return new fabric.Image.filters.Contrast(options as any);
      case 'Pixelate':
        return new fabric.Image.filters.Pixelate(options as any);
      case 'Blur':
        return new fabric.Image.filters.Blur(options as any);
      case 'Vibrance':
        return new fabric.Image.filters.Vibrance(options as any);
      case 'Noise':
        return new fabric.Image.filters.Noise(options as any);
      case 'Saturation':
        return new fabric.Image.filters.Saturation(options as any);
      default:
        console.error('Filter type not supported:', filterType);
        return null;
    }
  }
  private getExistingFilter(fabricElement: fabric.Image, filterType: FilterType) {
    return fabricElement.filters?.find((f) => this.asBaseFilter(f).type === filterType);
  }
  // for the case filter was applied to a frame, but from and to frame are being provided as arguments as well, then we need to add the filter to all the frames
  createFilterForFromToFrames(
    fabricElement: fabric.Image,
    filterType: FilterType,
    options: FilterInputOptions,
  ) {
    // console console in orange
    console.log(
      '%cFilter applying to multiple frames in createFilterForFromToFrames :',
      'color: orange; font-weight: bold',
    );
    const fabricObjectOfSelectedElement = this.selectedElement?.fabricObject;
    if (!fabricObjectOfSelectedElement) {
      // console console in red
      console.log('%cNo fabric object found:', 'color: red; font-weight: bold');
      return;
    }
    // check if its fabric.image and not just faqbric.object type
    if (fabricObjectOfSelectedElement.type !== 'image') {
      // console console in red
      console.log('%cSelected element is not an image:', 'color: red; font-weight: bold');
      return;
    }
    const filter = this.getExistingFilter(
      fabricObjectOfSelectedElement as fabric.Image,
      filterType,
    );
    if (this.elements === undefined || this.fromFrame === undefined || this.toFrame === undefined) {
      // console console in red
      console.log(
        '%cElement not found in createFilterForFromToFrames:',
        'color: red; font-weight: bold',
      );
      return;
    }
    for (let i = this.fromFrame; i <= this.toFrame; i++) {
      const frame = this.elements?.find((f, index) => index === i);
      if (!frame) {
        // console console in red
        console.log('%cFrame not found:', 'color: red; font-weight: bold', i);
        return;
      }
      if (frame) {
        const frameElement = this.elements?.find((el) => el.id === frame.id);
        if (frameElement) {
          const fabricObject = frameElement.fabricObject as fabric.Image;
          if (fabricObject) {
            const doesCurrentElementHaveFilter = fabricObject.filters?.find(
              (f) => this.asBaseFilter(f).type === filter.type,
            );
            if (doesCurrentElementHaveFilter && options && filter) {
              // console console in orange
              console.log('%cFilter found:', 'color: orange; font-weight: bold', filter);
              Object.assign(filter, options);
            } else {
              const newFilter = this.createFilter(filterType, options);
              if (newFilter) {
                Object.assign(newFilter, options);
                // console console in orange
                console.log('%cNew filter created:', 'color: orange; font-weight: bold', newFilter);
                fabricObject.filters = [...(fabricObject?.filters || []), newFilter];
                if (this.elements === undefined || this.elements[i]?.fabricObject === undefined) {
                  // console console in red
                  console.log('%cElement not found:', 'color: red; font-weight: bold', i);
                  return;
                }
                this.elements[i].fabricObject = fabricObject;
                fabricObject.applyFilters();
                this.addingFilter = false;
              }
            }
          }
          fabricObject.applyFilters();
          // in green
          console.log('%cFilter applied to frame:', 'color: green; font-weight: bold', i);
        }
      }
    }
  }
  // function for checking if the selected element is within from and to frame, using just the index of the element or the current key frame
  checkIfElementIsWithinFromToFrame() {
    const index = this.elements?.findIndex((el, index) => {
      if (this.fromFrame !== undefined && this.toFrame !== undefined) {
        return index >= this.fromFrame && index <= this.toFrame;
      }
    });
    if (index !== undefined) {
      return index;
    }
    return -1;
  }
  private updateFilterOnAllFrames(
    fabricElement: fabric.Image,
    filterType: FilterType,
    options: FilterInputOptions,
    fromFrame: number,
    toFrame: number,
  ) {
    // console log in orange
    console.log('%cUpdate filter on all frames:', 'color: orange; font-weight: bold');
    const fabricObjectOfSelectedElement = this.selectedElement?.fabricObject;
    if (!fabricObjectOfSelectedElement) {
      // console log in red
      console.log('%cNo fabric object found:', 'color: red; font-weight: bold');
      return;
    }
    // check if its fabric.image and not just faqbric.object type
    if (fabricObjectOfSelectedElement.type !== 'image') {
      // console log in red
      console.log('%cSelected element is not an image:', 'color: red; font-weight: bold');
      return;
    }
    const filter = this.getExistingFilter(
      fabricObjectOfSelectedElement as fabric.Image,
      filterType,
    );
    for (let i = fromFrame; i <= toFrame; i++) {
      const frame = this.elements?.find((f, index) => index === i);
      if (!frame) {
        // console log in red
        console.log('%cFrame not found:', 'color: red; font-weight: bold', i);
        return;
      }
      if (frame) {
        const frameElement = this.elements?.find((el) => el.id === frame.id);
        if (frameElement) {
          const fabricObject = frameElement.fabricObject as fabric.Image;
          if (fabricObject) {
            const doesCurrentElementHaveFilter = fabricObject.filters?.find(
              (f) => (f as any).type === filterType,
            );
            if (doesCurrentElementHaveFilter && options && filter) {
              // console log in orange
              console.log('%cFilter found:', 'color: orange; font-weight: bold', filter);
              fabricElement.filters?.map((f) => {
                if ((f as any).type === filterType) {
                  return Object.assign(f, options);
                }
              });
              if (this.elements === undefined || this.elements[i]?.fabricObject === undefined) {
                // console log in red
                console.log('%cElement not found:', 'color: red; font-weight: bold', i);
                return;
              }
              (this.elements[i].fabricObject as fabric.Image).applyFilters();
            }
          }
          // in green
          console.log('%cFilter applied to frame:', 'color: green; font-weight: bold', i);
        }
      }
    }
  }
  private updateOrAddFilter(
    fabricElement: fabric.Image,
    filterType: FilterType,
    filter: IBaseFilter | undefined,
    options: FilterInputOptions,
  ) {
    if (this.updateAll && this.fromFrame !== undefined && this.toFrame !== undefined) {
      // console log in orange
      console.log('%cUpdate all:', 'color: orange; font-weight: bold');
      this.updateFilterOnAllFrames(
        fabricElement,
        filterType,
        options,
        this.fromFrame,
        this.toFrame,
      );
    }
    if (filter && this.fromFrame === undefined && this.toFrame === undefined) {
      // console log in orange
      console.log('%cFilter found, updating:', 'color: orange; font-weight: bold', filter);
      Object.assign(filter, options);
    } else if (
      this.fromFrame !== undefined &&
      this.toFrame !== undefined &&
      this.fromFrame !== this.toFrame &&
      filter
    ) {
      // console log in orange
      console.log('%cFilter applying to multiple frames:', 'color: orange; font-weight: bold');
      this.createFilterForFromToFrames(fabricElement, filterType, options);
    } else if (!filter) {
      const newFilter = this.createFilter(filterType, options);
      // console in green
      console.log('%cNew filter created:', 'color: green; font-weight: bold', newFilter);
      if (newFilter) {
        fabricElement.filters?.push(newFilter);
        if (this.selectedElement === null || this.selectedElement === undefined) {
          // console in red
          console.log('%cSelected element not found:', 'color: red; font-weight: bold');
          return;
        }
        this.selectedElement.fabricObject = fabricElement;
      }
    }
  }
  getElementById(elementId?: string) {
    return this.editorStore?.elements.find((el) => el.id === elementId);
  }
  // get updated filer of the selected element
  get selectedElementFilters() {
    return (this.selectedElement?.fabricObject as fabric.Image)?.filters;
  }
  get filterByTypeOfSelectedElement() {
    return (this.selectedElement?.fabricObject as fabric.Image)?.filters?.find(
      (f) => (f as IBaseFilter).type === this.selectedFilter?.type,
    );
  }
  isFilterActive(filterType: FilterType) {
    const element = this.selectedElement;
    if (!element || !(element.fabricObject instanceof fabric.Image)) {
      return false;
    }
    return (element.fabricObject as fabric.Image)?.filters?.some(
      (f) => (f as IBaseFilter).type === filterType,
    );
  }
}
export default FilterStore;
