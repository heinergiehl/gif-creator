import { computed, makeAutoObservable } from 'mobx';
import { EditorElement, ImageEditorElement, Placement, TextEditorElement } from '@/types';
import { fabric } from 'fabric';
import { getUid, isHtmlImageElement } from '@/utils';
import { AnimationStore } from './AnimationStore';
import { DragStartEvent } from '@dnd-kit/core';
import { IBaseFilter } from '@/components/panels/EffectsPanel';
export interface Frame {
  id: string;
  src: string;
}
// export enum FilterType {
//   grayscale = 'grayscale',
//   invert = 'invert',
//   removeColor = 'removeColor',
//   sepia = 'sepia',
//   brightness = 'brightness',
//   contrast = 'contrast',
//   pixelate = 'pixelate',
//   blur = 'blur',
//   vibrance = 'vibrance',
//   noise = 'noise',
//   saturation = 'saturation',
// }
// make uppercase
export enum FilterType {
  Grayscale = 'Grayscale',
  Invert = 'Invert',
  RemoveColor = 'RemoveColor',
  Sepia = 'Sepia',
  Brightness = 'Brightness',
  Contrast = 'Contrast',
  Pixelate = 'Pixelate',
  Blur = 'Blur',
  Vibrance = 'Vibrance',
  Noise = 'Noise',
  Saturation = 'Saturation',
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
export class EditorStore {
  private animationStore?: AnimationStore;
  elements: EditorElement[] = [];
  selectedElement: EditorElement | null = null;
  filtersOfSelectedElement: IBaseFilter[] = [];
  canvas: fabric.Canvas | null = null;
  backgroundColor = '#ffffff';
  fontColor = '#000000';
  fontSize = 16;
  fontWeight = 400;
  textBackground = '#ffffff';
  fontFamily = 'Arial';
  fontStyle = 'normal';
  currentKeyFrame = 0;
  frames: Frame[] = [];
  images: string[] = [];
  isPaused = false;
  isPlaying = false;
  playInterval: NodeJS.Timeout | null = null;
  currentTimeInMs = 0;
  maxTime = 0;
  textColor = '#000000';
  imageType: 'Frame' | 'ObjectInFrame' = 'Frame';
  isDragging = false;
  activeDraggable: DragStartEvent | null = null;
  progress = {
    conversion: 0,
    rendering: 0,
  };
  // use Filters to get all available
  filtersTypes: FilterType[] = [
    FilterType.Grayscale,
    FilterType.Invert,
    FilterType.RemoveColor,
    FilterType.Sepia,
    FilterType.Brightness,
    FilterType.Contrast,
    FilterType.Pixelate,
    FilterType.Blur,
    FilterType.Vibrance,
    FilterType.Noise,
    FilterType.Saturation,
  ];
  constructor() {
    makeAutoObservable(this);
  }
  initialize(animationStore: AnimationStore) {
    this.animationStore = animationStore;
  }
  addElement(element: EditorElement): void {
    this.elements.push(element);
  }
  updateElement(id: string, changes: Partial<EditorElement>): void {
    const index = this.elements.findIndex((el) => el.id === id);
    if (index !== -1) {
      this.elements[index] = {
        ...this.elements[index],
        ...changes,
      } as EditorElement;
    }
  }
  updateMaxTime() {
    this.maxTime = this.frames.length * this.animationStore!.timePerFrameInMs;
  }
  updateFramesOrder(oldIndex: number, newIndex: number) {
    const movedFrame = this.frames[oldIndex];
    const editorElementToMove = this.elements[oldIndex];
    if (!movedFrame) return;
    this.frames = this.frames.filter((frame, i) => i !== oldIndex);
    this.frames.splice(newIndex, 0, movedFrame);
    this.elements = this.elements.filter((element, i) => i !== oldIndex);
    this.elements.splice(newIndex, 0, editorElementToMove);
  }
  updateEditorElementsForFrames() {
    const frameDuration = this.maxTime / this.frames.length;
    // Update timeFrames based on the new order of frames
    this.elements = this.elements.map((element, index) => {
      if (element.isFrame) {
        element.timeFrame.start = index * frameDuration;
        element.timeFrame.end = (index + 1) * frameDuration;
      }
      return element;
    });
  }
  onObjectModified(e: fabric.IEvent) {
    const fabricObject = e.target;
    // if (this.selectedElement.type === 'text' && this.selectedElement.fabricObject !== undefined) {
    //   const textElement = this.selectedElement.placement;
    //   const fabricText = fabricObject as fabric.Textbox;
    //   this.selectedElement.properties.text = fabricText.text || '';
    //   // this.selectedElement.properties.fontSize = fabricText.fontSize || 0
    //   // this.selectedElement.properties.fontWeiht = fabricText.fontSize || 0
    //   // textElement.fontSize = fabricText.fontSize || 0;
    //   // textElement.fontWeight = fabricText.fontWeight || 0;
    //   // textElement.fill = fabricText.fill || '';
    //   // textElement.fontFamily = fabricText.fontFamily || '';
    //   // textElement.text = fabricText.text || '';
    //   // textElement.backgroundColor = fabricText.backgroundColor || '';
    //   // textElement.fontStyle = fabricText.fontStyle || '';
    //   textElement.scaleX = fabricText.scaleX || 1;
    //   textElement.scaleY = fabricText.scaleY || 1;
    //   textElement.width = fabricText.width || 0;
    //   textElement.height = fabricText.height || 0;
    //   textElement.x = fabricText.left || 0;
    //   textElement.y = fabricText.top || 0;
    //   textElement.rotation = fabricText.angle || 0;
    // }
  }
  updateTextProperties<K extends keyof fabric.ITextOptions>(
    property: K,
    value: fabric.ITextOptions[K],
  ): void {
    console.log('updateTextProperties', property, value);
    const fabricElement = this.selectedElement?.fabricObject;
    if (fabricElement && this.selectedElement?.type === 'text') {
      const textElement = fabricElement as fabric.Text;
      textElement.set({ [property]: value });
      this.elements = this.elements.map((element) => {
        if (element.id === this.selectedElement?.id) {
          element.properties = {
            ...element.properties,
            [property]: value,
          };
        }
        return element;
      });
      this.selectElement(this.selectedElement.id);
      // this.canvas?.fire('object:modified', { target: fabricElement });
    }
  }
  async addEditorElement(element: EditorElement) {
    let fabricObject;
    if (element.type === 'image' && element.isFrame) {
      fabricObject = await this.createFabricImageFromBlob(element.src);
      console.log('fabricObject', fabricObject);
      element.fabricObject = fabricObject;
      if (element.index) this.elements[element?.index] = element;
      else this.addElement(element);
    } else if (element.type === 'text') {
      fabricObject = new fabric.Textbox(element.properties.text, {
        left: element.placement.x,
        top: element.placement.y,
        fontSize: element.properties.fontSize,
        fontWeight: element.properties.fontWeight,
        fill: element.properties.fontColor,
        fontFamily: element.properties.fontFamily,
        width: element.placement.width,
        height: element.placement.height,
        editable: true,
        id: element.id,
      });
      element.fabricObject = fabricObject;
      if (element.index) this.elements[element?.index] = element;
      else this.addElement(element);
    }
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
    fabricElement.filters = fabricElement.filters?.filter((f) => f.type !== filterType);
    fabricElement.applyFilters();
    this.canvas?.renderAll();
    console.log('Current Filters After Removal:', fabricElement.filters);
  }
  applyFilter(
    filterType: FilterType,
    options?: FilterInputOptions,
    fromFrame?: number,
    toFrame?: number,
    applyToAllFrames: boolean = false,
  ) {
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
    console.log('6969!', options, filter);
    if (options?.removeFilter !== true) {
      console.log('Filter with options:', filterType, options);
      const updatedFabricElement = this.updateOrAddFilter(
        fabricElement,
        filterType,
        filter,
        options,
        fromFrame,
        toFrame,
        applyToAllFrames,
      );
      updatedFabricElement.applyFilters();
      this.selectedElement.fabricObject = updatedFabricElement;
    } else {
      console.log('Removing filter:', filterType);
      this.removeFilterFromElement(fabricElement, filterType);
    }
    this.canvas?.renderAll();
  }
  createFilter(filterType: FilterType, options: FilterInputOptions) {
    switch (filterType) {
      case 'grayscale':
        return new fabric.Image.filters.Grayscale(options as any);
      case 'invert':
        return new fabric.Image.filters.Invert(options as any);
      case 'removeColor':
        //console log with orange text
        if (options !== undefined) {
          const color = options['removeColor'] === undefined ? '' : options['removeColor']?.color;
          const distance = options[filterType] === undefined ? 0 : options[filterType]?.distance;
          console.log(
            '%cRemoveColor options:',
            'color: orange; font-weight: bold',
            color,
            distance,
          );
        } else {
          const color = '#ffffff';
          const distance = 0;
          console.log(
            '%cRemoveColor options:',
            'color: orange; font-weight: bold',
            color,
            distance,
          );
          const removeColor = new fabric.Image.filters.RemoveColor();
          removeColor.color = color;
          removeColor.distance = distance;
          return removeColor;
        }
      case 'sepia':
        return new fabric.Image.filters.Sepia(options);
      case 'brightness':
        return new fabric.Image.filters.Brightness(options);
      case 'contrast':
        return new fabric.Image.filters.Contrast(options);
      case 'pixelate':
        return new fabric.Image.filters.Pixelate(options);
      case 'blur':
        return new fabric.Image.filters.Blur(options);
      case 'invert':
        return new fabric.Image.filters.Invert(options);
      case 'vibrance':
        return new fabric.Image.filters.Vibrance(options);
      case 'noise':
        return new fabric.Image.filters.Noise(options);
      case 'saturation':
        return new fabric.Image.filters.Saturation(options);
      default:
        console.error('Filter type not supported:', filterType);
        return null;
    }
  }
  private getExistingFilter(fabricElement: fabric.Image, filterType: FilterType) {
    {
      return fabricElement.filters?.find((f) => {
        console.log(f.type, filterType);
        return f.type.toLowerCase() === filterType.toLowerCase();
      });
    }
  }
  // for the case filter was applied to a frame, but from and to frame are being provided as arguments as well, then we need to add the filter to all the frames
  createFilterForFromToFrames(
    fabricElement: fabric.Image,
    filterType: FilterType,
    options: FilterInputOptions,
    fromFrame: number,
    toFrame: number,
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
    for (let i = fromFrame; i <= toFrame; i++) {
      const frame = this.elements.find((f, index) => index === i);
      if (!frame) {
        // console console in red
        console.log('%cFrame not found:', 'color: red; font-weight: bold', i);
        return;
      }
      if (frame) {
        const frameElement = this.elements.find((el) => el.id === frame.id);
        if (frameElement) {
          const fabricObject = frameElement.fabricObject as fabric.Image;
          if (fabricObject) {
            const doesCurrentElementHaveFilter = fabricObject.filters?.find(
              (f) => f.type.toLowerCase() === filterType.toLowerCase(),
            );
            if (doesCurrentElementHaveFilter && options && filter) {
              // console console in orange
              console.log('%cFilter found:', 'color: orange; font-weight: bold', filter);
              Object.assign(filter, options);
            } else {
              const newFilter = this.createFilter(filterType, options);
              if (newFilter) {
                // console console in orange
                console.log('%cNew filter created:', 'color: orange; font-weight: bold', newFilter);
                fabricObject.filters?.push(newFilter);
                this.elements[i].fabricObject = fabricObject;
                this.selectedElement.fabricObject = fabricObject;
              }
            }
            fabricObject.applyFilters();
            // in green
            console.log('%cFilter applied to frame:', 'color: green; font-weight: bold', i);
          }
        }
      }
    }
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
      const frame = this.elements.find((f, index) => index === i);
      if (!frame) {
        // console log in red
        console.log('%cFrame not found:', 'color: red; font-weight: bold', i);
        return;
      }
      if (frame) {
        const frameElement = this.elements.find((el) => el.id === frame.id);
        if (frameElement) {
          const fabricObject = frameElement.fabricObject as fabric.Image;
          if (fabricObject) {
            const doesCurrentElementHaveFilter = fabricObject.filters?.find(
              (f) => f.type.toLowerCase() === filterType.toLowerCase(),
            );
            if (doesCurrentElementHaveFilter && options && filter) {
              // console log in orange
              console.log('%cFilter found:', 'color: orange; font-weight: bold', filter);
              fabricElement.filters?.map((f) => {
                if (f.type.toLowerCase() === filterType.toLowerCase()) {
                  return Object.assign(f, options);
                }
              });
              this.elements[i].fabricObject = fabricElement;
              this.elements[i].fabricObject?.applyFilters();
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
    fromFrame?: number,
    toFrame?: number,
    updateAll: boolean = false,
  ) {
    // in orange
    console.log(
      '%cUpdate or add filter:',
      'color: orange; font-weight: bold',
      filterType,
      options,
      fromFrame,
      toFrame,
      updateAll,
    );
    if (updateAll && fromFrame !== undefined && toFrame !== undefined) {
      // console log in orange
      console.log('%cUpdate all:', 'color: orange; font-weight: bold');
      this.updateFilterOnAllFrames(fabricElement, filterType, options, fromFrame, toFrame);
    }
    if (filter && fromFrame === undefined && toFrame === undefined) {
      Object.assign(filter, options);
      console.log('Filter updated:', filter, options);
    } else if (
      fromFrame !== undefined &&
      toFrame !== undefined &&
      fromFrame !== toFrame &&
      filter
    ) {
      // console log in orange
      console.log('%cFilter applying to multiple frames:', 'color: orange; font-weight: bold');
      this.createFilterForFromToFrames(fabricElement, filterType, options, fromFrame, toFrame);
    } else {
      const newFilter = this.createFilter(filterType, options);
      if (newFilter) {
        fabricElement.filters?.push(newFilter);
        this.selectedElement.fabricObject = fabricElement;
        console.log('selectedElementFilters', this.selectedElement?.fabricObject?.filters);
      }
    }
    return fabricElement;
  }
  private removeFilterFromElement(fabricElement: fabric.Image, filterType: FilterType) {
    fabricElement.filters = fabricElement.filters?.filter(
      (f) => f.type.toLowerCase() !== filterType.toLowerCase(),
    );
    fabricElement.applyFilters();
    console.log('Filters after removal:', fabricElement.filters);
  }
  createFabricImageFromBlob(src: string): Promise<fabric.Image | undefined> {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(
        src,
        (img) => {
          img.set({
            left: 0,
            top: 0,
            selectable: true,
            hoverCursor: 'pointer',
            transparentCorners: true,
            originX: 'left',
            originY: 'top',
            id: getUid(), // Ensure a unique ID is used for tracking
          });
          if (!this.canvas) {
            console.error('Canvas is not found');
            return;
          }
          const scaleX = this.canvas?.getWidth() / img.width!;
          const scaleY = this.canvas?.getHeight() / img.height!;
          img.scaleX = scaleX;
          img.scaleY = scaleY;
          img.setCoords();
          resolve(img);
        },
        { crossOrigin: 'anonymous' },
      );
    });
  }
  addImage(index: number, blobUrl: string, isFrame = false) {
    const id = getUid(); // Use getUid() to ensure each image has a unique identifier
    this.addEditorElement({
      index,
      id: id,
      type: 'image',
      isFrame: isFrame,
      src: blobUrl,
      placement: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
      properties: {
        elementId: id,
        src: blobUrl,
        effect: { type: 'none' },
      },
      timeFrame: {
        start: (index * this.maxTime) / this.frames.length,
        end: this.maxTime / this.frames.length,
      },
    });
  }
  addText(options: {
    text: string;
    fontSize: number;
    fontWeight: number;
    fontColor: string;
    fontFamily: string;
    fontStyle: string;
    textBackground: string;
    isFrame: boolean;
    id: string;
  }) {
    const id = options.id || getUid();
    const index = this.elements.length;
    const text = {
      id,
      isFrame: options.isFrame,
      name: `Text ${index + 1}`,
      type: 'text',
      placement: {
        x: this.canvas ? this.canvas.getWidth() / 2 : 0,
        y: this.canvas ? this.canvas.getHeight() / 2 : 0,
        width: 200,
        height: 200,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
      timeFrame: {
        start: 0,
        end: this.maxTime,
      },
      properties: {
        text: options.text,
        fontSize: options.fontSize,
        fontWeight: options.fontWeight,
        fontColor: options.fontColor,
        fontFamily: options.fontFamily,
        fontStyle: options.fontStyle,
        textBackground: options.textBackground,
        splittedTexts: [],
        id,
      },
    } as TextEditorElement;
    this.addEditorElement({ ...text });
  }
  addImages() {
    // if there are already, adjust the index
    const startIndex = this.elements.length > 0 ? this.elements.length : 0;
    console.log('startIndex', startIndex, this.frames);
    this.frames.forEach((fr, i) => {
      const id = fr.id;
      const src = fr.src;
      // check if the image is already added, if so skip
      if (this.elements.find((el) => el.id === id)) return;
      this.addImage(i + startIndex, src, true);
      console.log('added image', i + startIndex, id);
    });
    if (!this.elements.length) return;
    this.updateMaxTime();
    console.log('maxTime', this.maxTime);
  }
  private createFabricImage(image: HTMLImageElement | null): fabric.Image | undefined {
    if (this.canvas) {
      const canvasWidth = this.canvas.getWidth();
      const canvasHeight = this.canvas.getHeight();
      if (!image) {
        console.error('Image is not found');
        return;
      }
      const orignalHeight = image.naturalHeight;
      const orignalWidth = image.naturalWidth;
      const scaleX = canvasWidth / orignalWidth;
      const scaleY = canvasHeight / orignalHeight;
      const originalWidth = image.naturalWidth;
      const originalHeight = image.naturalHeight;
      if (originalWidth === 0 || originalHeight === 0)
        console.error('Image has no width or height');
      const aspect = originalWidth / originalHeight;
      const imageObject = new fabric.Image(image, {
        width: originalWidth,
        height: originalHeight,
        scaleX,
        scaleY,
        left: 0,
        top: 0,
        angle: 0,
        selectable: true,
        hoverCursor: 'pointer',
        transparentCorners: true,
        originX: 'left',
        originY: 'top',
        id: image.id,
        customProperty: {
          id: image.id,
          isFrame: true,
          name: image.id,
        },
        // clipPath: new fabric.Rect({
        //   width: originalWidth,
        //   height: originalHeight,
        //   fill: 'transparent',
        // }),
      });
      imageObject.setCoords();
      return imageObject;
    }
  }
  updateEditorElement(editorElement: EditorElement) {
    console.log('updateEditorElement', editorElement);
    this.elements = this.elements.map((element) => {
      return element.id === editorElement.id ? editorElement : element;
    });
  }
  selectElement(id: string): void {
    this.selectedElement = this.elements.find((el) => el.id === id) || null;
  }
  removeElement(id: string): void {
    if (this.selectedElement?.id === id) {
      this.selectedElement = null;
      this.elements = this.elements.filter((el) => el.id !== id);
    }
    this.elements = this.elements.filter((el) => el.id !== id);
    // animations that are related to this element should be removed
    this.animationStore?.removeAnimationsByTargetId(id);
  }
  deleteFrame(index: number) {
    this.frames = this.frames.filter((frame, i) => i !== index);
    this.elements = this.elements.filter((element, i) => i !== index);
    this.frames = this.frames;
  }
  updateFromCanvas(): void {
    if (!this.canvas) return;
    this.canvas.getObjects().map((obj) => {
      const scaleX = obj.scaleX || 1;
      const scaleY = obj.scaleY || 1;
      const width = (obj.width || 0) * scaleX;
      const height = (obj.height || 0) * scaleY;
      this.elements = this.elements.map((element) => {
        if (element.id === obj.id) {
          element.placement = {
            x: obj.left || 0,
            y: obj.top || 0,
            width,
            height,
            rotation: obj.angle || 0,
            scaleX,
            scaleY,
          };
        }
        return element;
      });
    });
  }
  // Additional methods...
}
