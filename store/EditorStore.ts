import { action, computed, makeAutoObservable, observable } from 'mobx';
import { EditorElement, ImageEditorElement, Placement, TextEditorElement } from '@/types';
import { fabric } from 'fabric';
import { getUid, isHtmlImageElement } from '@/utils';
import { AnimationStore } from './AnimationStore';
import { DragStartEvent } from '@dnd-kit/core';
import { RootStore } from '.';
export interface Video {
  id: string;
  user_id: string;
  video_url: string;
  uploaded_at: string;
  title?: string; // Additional metadata like title can be added
  thumbnail_url?: string;
  duration?: number;
  width?: number;
  height?: number;
}
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
interface Dependencies {
  rootStore: RootStore;
}
export class EditorStore {
  private rootStore: RootStore;
  elements: EditorElement[] = [];
  selectedElements: EditorElement[] = [];
  backgroundColor = '#ffffff';
  fill = '#000000';
  fontSize = 16;
  fontWeight = 400;
  textBackground = '#ffffff';
  fontFamily = 'Arial';
  fontStyle = 'normal';
  currentKeyFrame = 0;
  frames: Frame[] = [];
  images: string[] = [];
  videos: Video[] = [];
  isPaused = false;
  isPlaying = false;
  playInterval: NodeJS.Timeout | null = null;
  currentTimeInMs = 0;
  maxTime = 0;
  imageType: 'Frame' | 'None' | 'ObjectInFrame' = 'Frame';
  isDragging = false;
  activeDraggable: DragStartEvent | null = null;
  insertIndex = null;
  progress = {
    conversion: 0,
    rendering: 0,
  };
  conversion = 0;
  rendering = 0;
  fabricObjectUpdated: boolean = false;
  info = {
    header: '',
    content: '',
  };
  showAlertDialog: boolean = false;
  toggleOptions = new Map<string, boolean>([
    ['showShadowOptions', false],
    ['showEditOptions', false],
    ['textStyleOptions', false],
  ]);
  copiedElements: EditorElement[] = [];
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
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      elements: observable,
      elementsInCurrentFrame: computed,
      decreaseZIndexOfSelectedElements: action,
      increaseZIndexOfSelectedElements: action,
      bringToFrontSelectedElements: action,
      sendToBackSelectedElements: action,
      insertIndex: observable,
      setInsertIndex: action,
    });
  }
  setInsertIndex(index: number) {
    this.insertIndex = index;
  }
  setConversionProgress(progress: number) {
    this.conversion = progress;
  }
  setRenderingProgress(progress: number) {
    this.rendering = progress;
  }
  get animationStore(): AnimationStore | undefined {
    return this.rootStore.animationStore;
  }
  addElement(element: EditorElement): void {
    this.elements.push(element);
  }
  removeFrame(id: string) {
    this.frames = this.frames.filter((frame) => frame.id !== id);
  }
  setCopiedElements(elements: EditorElement[]) {
    this.copiedElements = elements;
  }
  setAllOptionsToFalse() {
    this.toggleOptions.forEach((value, key) => {
      this.toggleOptions.set(key, false);
    });
  }
  // Method to set videos
  setVideos(videos: Video[]) {
    this.videos = videos;
  }
  // Method to add a single video
  addVideo(video: Video) {
    this.videos.push(video);
  }
  // Method to remove a video
  removeVideo(videoId: string) {
    this.videos = this.videos.filter((video) => video.id !== videoId);
  }
  toggleOption(option: string): void {
    //make sure all other options are set to false
    this.toggleOptions.forEach((value, key) => {
      if (key !== option) {
        this.toggleOptions.set(key, false);
      }
    });
    this.toggleOptions.set(option, !this.toggleOptions.get(option)!);
  }
  setInfo(header: string, content: string) {
    this.info.header = header;
    this.info.content = content;
  }
  toggleAlertDialog() {
    this.showAlertDialog = !this.showAlertDialog;
  }
  updateElement(id: string, changes: Partial<EditorElement>): void {
    const index = this.elements.findIndex((el) => el.id === id);
    console.log(
      'ids in updateElement: ',
      id,
      this.elements.map((e) => e.id),
    );
    if (index === -1) {
      console.error('Element not found');
      return;
    }
    const oldShadowOptions = this.elements[index].shadow || {};
    // check if changes contains shadow options
    if (changes.shadow) {
      this.elements[index].shadow = {
        ...this.elements[index].shadow,
        ...changes.shadow,
      };
    }
    if (this.elements.length > 0) {
      this.elements[index] = {
        ...this.elements[index],
        dataUrl: changes.dataUrl,
        placement: {
          ...this.elements[index].placement,
          ...changes.placement,
        },
        properties: {
          ...(this.elements[index].properties as any),
          ...changes.properties,
        },
        timeFrame: {
          ...this.elements[index].timeFrame,
          ...changes.timeFrame,
        },
        copied: changes.copied ?? this.elements[index].copied,
      };
      console.log('Updated Element in EditorStore: ', this.elements[index]);
      this.selectedElements.map((el) => {
        //update all the selected elements, same as above
        if (el.id === id) {
          el.shadow = {
            ...el.shadow,
            ...changes.shadow,
          };
          el.placement = {
            ...el.placement,
            ...changes.placement,
          };
          el.properties = {
            ...el.properties,
            ...changes.properties,
          };
          el.timeFrame = {
            ...el.timeFrame,
            ...changes.timeFrame,
          };
        }
      });
    }
  }
  updateSelectedElementsShadow(
    property: keyof fabric.IShadowOptions,
    value: string | number | boolean,
  ): void {
    this.selectedElements.forEach((element) => {
      this.updateElement(element.id, {
        shadow: {
          ...element.shadow,
          [property]: value,
        },
      });
    });
  }
  // copies the selected elements and adds them to the elements array
  // important, the id of the copied elements is changed to a new id, and also the position slightly
  copySelectedElements(elements: EditorElement[]): void {
    const copiedElements = elements.map((element) => {
      const id = `element-${getUid()}`;
      return {
        ...element,
        id,
        placement: {
          ...element.placement,
          x: element.placement.x + 10,
          y: element.placement.y + 10,
        },
        timeFrame: {
          start: 0,
          end: this.maxTime,
        },
      };
    });
    this.elements = [...this.elements, ...copiedElements];
  }
  updateZIndex(objects: fabric.Object[], canvas: fabric.Canvas) {
    objects.forEach((object) => {
      console.log('Object in updateZIndex:', object);
      const element = this.elements.find((el) => el.id === object.id);
      if (element) {
        const frameElements = this.elements.filter(
          (el) => el.timeFrame.start === element.timeFrame.start,
        );
        const canvasObjects = canvas
          .getObjects()
          .filter((obj) => frameElements.some((el) => el.id === obj.id));
        const currentZIndex = canvasObjects.indexOf(object);
        // Update the Z-index for the element
        element.placement.zIndex = currentZIndex;
        // Update the Z-index for all elements in the same frame to ensure they are unique
        frameElements.forEach((el) => {
          if (el.id !== element.id) {
            const obj = canvasObjects.find((obj) => obj.id === el.id);
            if (obj) {
              el.placement.zIndex = canvasObjects.indexOf(obj);
            }
          }
        });
      }
    });
    this.elements = [...this.elements]; // Ensure the store is updated
    this.selectedElements = this.selectedElements.map((el) => {
      const updatedElement = this.elements.find((e) => e.id === el.id);
      return updatedElement ? updatedElement : el;
    });
    console.log(
      'Updated Z-index:',
      this.elements.map((e) => ({
        id: e.id,
        zIndex: e.placement.zIndex,
        type: e.type,
      })),
    );
  }
  // orderDisplayedElements(canvasObject: fabric.Canvas) {
  //   const selectedElementFrame = this.elements.find(
  //     (el) => el.id === this.selectedElement?.id && el.isFrame,
  //   );
  //   const elementsInCurrentFrame = this.elementsInCurrentFrame;
  //   // fabricObjects on Canvas
  //   const canvasObjects = canvasObject.getObjects();
  //   // now update the elements zIndex in the store based on the order of objects on canvas, also the zIndex of the selectedElement
  //   // if the selectedElement is a frame, then update the zIndex of the frame and all the objects in the frame
  //   // if the selectedElement is an object, then update the zIndex of the object
  //   if (selectedElementFrame) {
  //     const frameIndex = canvasObjects.findIndex((obj) => obj.id === selectedElementFrame.id);
  //     if (frameIndex > -1) {
  //       selectedElementFrame.placement.zIndex = frameIndex;
  //     }
  //     elementsInCurrentFrame.forEach((element) => {
  //       const index = canvasObjects.findIndex((obj) => obj.id === element.id);
  //       if (index > -1) {
  //         element.placement.zIndex = index;
  //       }
  //     });
  //   } else {
  //     const selectedElement = this.selectedElement;
  //     if (selectedElement) {
  //       const index = canvasObjects.findIndex((obj) => obj.id === selectedElement.id);
  //       if (index > -1) {
  //         selectedElement.placement.zIndex = index;
  //       }
  //     }
  //   }
  // }
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
  // get all the Objects in the frame; the problem tho, currentKeyFrame is not a time but just an index
  get elementsInCurrentFrame() {
    const objectsInCurrentFrame = this.elements.slice().filter((element) => {
      // if (element.isFrame) {
      //   console.log(
      //     'FrameStart',
      //     element.timeFrame.start,
      //     'FrameEnd',
      //     element.timeFrame.end,
      //     element.isFrame,
      //   );
      // } else {
      //   console.log(
      //     'ObjectStart',
      //     element.timeFrame.start,
      //     'ObjectEnd',
      //     element.timeFrame.end,
      //     element.isFrame,
      //   );
      // }
      return (
        !element.isFrame &&
        element.timeFrame.start <= this.currentKeyFrame * this.animationStore!.timePerFrameInMs &&
        element.timeFrame.end >= this.currentKeyFrame * this.animationStore!.timePerFrameInMs
      );
    });
    return objectsInCurrentFrame;
  }
  updateTextProperties<K extends keyof fabric.ITextOptions>(
    property: K,
    value: fabric.ITextOptions[K],
  ): void {
    console.log('updateTextProperties:', property, value, this.selectedElements);
    this.selectedElements.forEach((element) => {
      if (element.type === 'text') {
        const selectedElement = element as TextEditorElement;
        selectedElement.properties = {
          ...selectedElement.properties,
          [property]: value,
        };
        this.updateElement(selectedElement.id, {
          properties: {
            ...selectedElement.properties,
          },
        });
      }
    });
    this.fabricObjectUpdated = false;
  }
  increaseZIndexOfSelectedElements(canvas: fabric.Canvas) {
    this.selectedElements.forEach((element) => {
      const fabricObject = canvas.getObjects().find((obj) => obj.id === element.id);
      if (fabricObject) {
        fabricObject.bringForward(true);
      }
    });
    this.updateZIndex(
      this.selectedElements.map((el) => canvas.getObjects().find((obj) => obj.id === el.id)!),
      canvas,
    );
    this.fabricObjectUpdated = true;
  }
  decreaseZIndexOfSelectedElements(canvas: fabric.Canvas) {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.sendBackwards(true);
    }
    this.updateZIndex(
      this.selectedElements.map((el) => canvas.getActiveObjects().find((obj) => obj.id === el.id)!),
      canvas,
    );
    this.fabricObjectUpdated = true;
  }
  bringToFrontSelectedElements(canvas: fabric.Canvas) {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.bringToFront();
    }
    this.updateZIndex(
      this.selectedElements.map((el) => canvas.getActiveObjects().find((obj) => obj.id === el.id)!),
      canvas,
    );
    this.fabricObjectUpdated = true;
  }
  sendToBackSelectedElements(canvas: fabric.Canvas) {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.sendToBack();
    }
    this.updateZIndex(
      this.selectedElements.map((el) => canvas.getActiveObjects().find((obj) => obj.id === el.id)!),
      canvas,
    );
    this.fabricObjectUpdated = true;
  }
  alignSelectedElements(
    alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom',
    canvas: fabric.Canvas,
  ) {
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const activeObject = canvas.getActiveObject();
    console.log('activeOBject: ', activeObject?.type);
    if (!activeObject) return;
    if (activeObject.type === 'activeSelection') {
      const activeSelection = activeObject as fabric.ActiveSelection;
      this.alignSingleObject(activeSelection, alignment, canvasWidth, canvasHeight);
      activeSelection.setCoords();
    } else {
      this.alignSingleObject(activeObject, alignment, canvasWidth, canvasHeight);
    }
    canvas.requestRenderAll();
  }
  alignSingleObject(
    fabricObject: fabric.Object,
    alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom',
    canvasWidth: number,
    canvasHeight: number,
  ) {
    const objWidth = fabricObject.getScaledWidth();
    const objHeight = fabricObject.getScaledHeight();
    switch (alignment) {
      case 'left':
        fabricObject.set({ left: 0 });
        break;
      case 'center':
        fabricObject.set({ left: (canvasWidth - objWidth) / 2 });
        break;
      case 'right':
        fabricObject.set({ left: canvasWidth - objWidth });
        break;
      case 'top':
        fabricObject.set({ top: 0 });
        break;
      case 'middle':
        fabricObject.set({ top: (canvasHeight - objHeight) / 2 });
        break;
      case 'bottom':
        fabricObject.set({ top: canvasHeight - objHeight });
        break;
    }
    fabricObject.setCoords();
    this.updateElement(fabricObject.id as string, {
      placement: {
        x: fabricObject.left,
        y: fabricObject.top,
      },
    });
  }
  distributeElements(distribution: 'horizontal' | 'vertical', canvas: fabric.Canvas) {
    const selectedObjects = canvas.getActiveObject();
    if (!selectedObjects) return;
    if (selectedObjects.type === 'activeSelection') {
      const activeSelection = selectedObjects as fabric.ActiveSelection;
      console.log(
        'activeSelection:',
        activeSelection.getObjects().map((obj) => ({ left: obj.left, top: obj.top })),
        'canvas.getObjects():',
        canvas.getActiveObjects().map((obj) => ({
          left: obj.left,
          top: obj.top,
        })),
      );
      this.distributeMultipleObjects(canvas.getActiveObjects(), distribution, canvas);
    } else {
      this.alignSingleObject(selectedObjects, 'center', canvas.getWidth(), canvas.getHeight());
    }
  }
  distributeMultipleObjects(
    objects: fabric.Object[],
    distribution: 'horizontal' | 'vertical',
    canvas: fabric.Canvas,
  ) {
    canvas.discardActiveObject();
    const sortedObjects = objects.sort((a, b) => {
      if (!a || !b) return 0;
      if (
        a.left === undefined ||
        b.left === undefined ||
        a.top === undefined ||
        b.top === undefined
      )
        return 0;
      if (distribution === 'horizontal') {
        return b.left - a.left;
      } else {
        return a.top - b.top;
      }
    });
    const totalWidthOfAllObjects = sortedObjects.reduce((acc, obj) => {
      return acc + obj.getScaledWidth();
    }, 0);
    const totalHeightOfAllObjects = sortedObjects.reduce((acc, obj) => {
      return acc + obj.getScaledHeight();
    }, 0);
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    let currentX = 0;
    let currentY = 0;
    const freeSpaceHorizontal = canvasWidth - totalWidthOfAllObjects;
    const freeSpaceVertical = canvasHeight - totalHeightOfAllObjects;
    const spaceBetweenObjectsHorizontal = freeSpaceHorizontal / (sortedObjects.length - 1);
    const spaceBetweenObjectsVertical = freeSpaceVertical / (sortedObjects.length - 1);
    console.log(
      'totalWidthOfAllObjects',
      totalWidthOfAllObjects,
      'totalHeightOfAllObjects:',
      totalHeightOfAllObjects,
      'spaceBetweenObjectsHorizontal:',
      spaceBetweenObjectsHorizontal,
      'spaceBetweenObjectsVertical:',
      spaceBetweenObjectsVertical,
    );
    sortedObjects.forEach((obj, index) => {
      console.log(
        'sortedObjects:',
        obj.left,
        obj.top,
        obj.getScaledWidth(),
        obj.getScaledHeight(),
        'index:',
        index,
      );
      if (distribution === 'horizontal') {
        obj.set({
          left: currentX,
          top: sortedObjects[0].top,
        });
        currentX += obj.getScaledWidth() + spaceBetweenObjectsHorizontal;
      } else {
        obj.set({ top: currentY, left: sortedObjects[0].left });
        currentY += obj.getScaledHeight() + spaceBetweenObjectsVertical;
      }
      obj.setCoords();
      if (!obj?.left || !obj?.top) return;
      this.updateElement(obj.id as string, {
        placement: {
          x: obj.left,
          y: obj.top,
        },
      });
    });
    canvas.requestRenderAll();
  }
  isElementAligned(
    selectedElement: EditorElement,
    alignment: string,
    canvas: fabric.Canvas | undefined,
  ): boolean {
    if (!canvas || !selectedElement) return false;
    switch (alignment) {
      case 'left':
        return selectedElement.placement.x === 0;
      case 'right':
        return selectedElement.placement.x + selectedElement.placement.width === canvas.getWidth();
      case 'center':
        return (
          selectedElement.placement.x + selectedElement.placement.width / 2 ===
          canvas.getWidth() / 2
        );
      case 'top':
        return selectedElement.placement.y === 0;
      case 'middle':
        return (
          selectedElement.placement.y + selectedElement.placement.height / 2 ===
          canvas.getHeight() / 2
        );
      case 'bottom':
        return (
          selectedElement.placement.y + selectedElement.placement.height === canvas.getHeight()
        );
      default:
        return false;
    }
  }
  // typeguard function  for checking whether editorElement is either ImageEditorElement or TextEditorElement
  isImageEditorElement(editorElement: EditorElement): editorElement is ImageEditorElement {
    return editorElement.type === 'image';
  }
  setSelectedElements(ids: string[]): void {
    console.log(
      'Setting selected elements:',
      ids,
      'elements:',
      this.elements.map((e) => e.id),
    );
    if (ids.length === 0) {
      this.selectedElements = [];
      console.log('Selected elements:', this.selectedElements);
      return;
    }
    this.selectedElements = this.elements.filter((el) => ids.includes(el.id));
    console.log(
      'Selected elements in setSelectedElements:',
      this.selectedElements.map((e) => e.id),
    );
  }
  getSelectedElement() {
    return this.selectedElements;
  }
  getElement(id: string) {
    return this.elements.find((el) => el.id === id);
  }
  // applyFilter(
  //   filterType: FilterType,
  //   options?: FilterInputOptions,
  //   fromFrame?: number,
  //   toFrame?: number,
  //   applyToAllFrames: boolean = false,
  // ) {
  //   console.log('Applying filter:', filterType, options);
  //   if (this.selectedElement?.type !== 'image') {
  //     console.error('Selected element is not an image');
  //     return;
  //   }
  //   const fabricElement = this.selectedElement?.fabricObject as fabric.Image;
  //   if (!fabricElement) {
  //     console.error('No fabric object found');
  //     return;
  //   }
  //   const filter = this.getExistingFilter(fabricElement, filterType);
  //   if (options?.removeFilter !== true) {
  //     const updatedFabricElement = this.updateOrAddFilter(
  //       fabricElement,
  //       filterType,
  //       filter,
  //       options,
  //       fromFrame,
  //       toFrame,
  //       applyToAllFrames,
  //     );
  //     updatedFabricElement.applyFilters();
  //     this.selectedElement.fabricObject = updatedFabricElement;
  //   } else {
  //     console.log('Removing filter:', filterType);
  //     this.removeFilterFromElement(fabricElement, filterType);
  //   }
  //   this.canvas?.renderAll();
  // }
  // createFilter(filterType: FilterType, options: FilterInputOptions) {
  //   switch (filterType) {
  //     case 'grayscale':
  //       return new fabric.Image.filters.Grayscale(options as any);
  //     case 'invert':
  //       return new fabric.Image.filters.Invert(options as any);
  //     case 'removeColor':
  //       //console log with orange text
  //       if (options !== undefined) {
  //         const color = options['removeColor'] === undefined ? '' : options['removeColor']?.color;
  //         const distance = options[filterType] === undefined ? 0 : options[filterType]?.distance;
  //         console.log(
  //           '%cRemoveColor options:',
  //           'color: orange; font-weight: bold',
  //           color,
  //           distance,
  //         );
  //       } else {
  //         const color = '#ffffff';
  //         const distance = 0;
  //         console.log(
  //           '%cRemoveColor options:',
  //           'color: orange; font-weight: bold',
  //           color,
  //           distance,
  //         );
  //         const removeColor = new fabric.Image.filters.RemoveColor();
  //         removeColor.color = color;
  //         removeColor.distance = distance;
  //         return removeColor;
  //       }
  //     case 'sepia':
  //       return new fabric.Image.filters.Sepia(options);
  //     case 'brightness':
  //       return new fabric.Image.filters.Brightness(options);
  //     case 'contrast':
  //       return new fabric.Image.filters.Contrast(options);
  //     case 'pixelate':
  //       return new fabric.Image.filters.Pixelate(options);
  //     case 'blur':
  //       return new fabric.Image.filters.Blur(options);
  //     case 'invert':
  //       return new fabric.Image.filters.Invert(options);
  //     case 'vibrance':
  //       return new fabric.Image.filters.Vibrance(options);
  //     case 'noise':
  //       return new fabric.Image.filters.Noise(options);
  //     case 'saturation':
  //       return new fabric.Image.filters.Saturation(options);
  //     default:
  //       console.error('Filter type not supported:', filterType);
  //       return null;
  //   }
  // }
  // private getExistingFilter(fabricElement: fabric.Image, filterType: FilterType) {
  //   {
  //     return fabricElement.filters?.find((f) => {
  //       console.log(f.type, filterType);
  //       return f.type.toLowerCase() === filterType.toLowerCase();
  //     });
  //   }
  // }
  // // for the case filter was applied to a frame, but from and to frame are being provided as arguments as well, then we need to add the filter to all the frames
  // createFilterForFromToFrames(
  //   fabricElement: fabric.Image,
  //   filterType: FilterType,
  //   options: FilterInputOptions,
  //   fromFrame: number,
  //   toFrame: number,
  // ) {
  //   // console console in orange
  //   console.log(
  //     '%cFilter applying to multiple frames in createFilterForFromToFrames :',
  //     'color: orange; font-weight: bold',
  //   );
  //   const fabricObjectOfSelectedElement = this.selectedElement?.fabricObject;
  //   if (!fabricObjectOfSelectedElement) {
  //     // console console in red
  //     console.log('%cNo fabric object found:', 'color: red; font-weight: bold');
  //     return;
  //   }
  //   // check if its fabric.image and not just faqbric.object type
  //   if (fabricObjectOfSelectedElement.type !== 'image') {
  //     // console console in red
  //     console.log('%cSelected element is not an image:', 'color: red; font-weight: bold');
  //     return;
  //   }
  //   const filter = this.getExistingFilter(
  //     fabricObjectOfSelectedElement as fabric.Image,
  //     filterType,
  //   );
  //   for (let i = fromFrame; i <= toFrame; i++) {
  //     const frame = this.elements.find((f, index) => index === i);
  //     if (!frame) {
  //       // console console in red
  //       console.log('%cFrame not found:', 'color: red; font-weight: bold', i);
  //       return;
  //     }
  //     if (frame) {
  //       const frameElement = this.elements.find((el) => el.id === frame.id);
  //       if (frameElement) {
  //         const fabricObject = frameElement.fabricObject as fabric.Image;
  //         if (fabricObject) {
  //           const doesCurrentElementHaveFilter = fabricObject.filters?.find(
  //             (f) => f.type.toLowerCase() === filterType.toLowerCase(),
  //           );
  //           if (doesCurrentElementHaveFilter && options && filter) {
  //             // console console in orange
  //             console.log('%cFilter found:', 'color: orange; font-weight: bold', filter);
  //             Object.assign(filter, options);
  //           } else {
  //             const newFilter = this.createFilter(filterType, options);
  //             if (newFilter) {
  //               // console console in orange
  //               console.log('%cNew filter created:', 'color: orange; font-weight: bold', newFilter);
  //               fabricObject.filters?.push(newFilter);
  //               this.elements[i].fabricObject = fabricObject;
  //             }
  //           }
  //           fabricObject.applyFilters();
  //           // in green
  //           console.log('%cFilter applied to frame:', 'color: green; font-weight: bold', i);
  //         }
  //       }
  //     }
  //   }
  // }
  // private updateFilterOnAllFrames(
  //   fabricElement: fabric.Image,
  //   filterType: FilterType,
  //   options: FilterInputOptions,
  //   fromFrame: number,
  //   toFrame: number,
  // ) {
  //   // console log in orange
  //   console.log('%cUpdate filter on all frames:', 'color: orange; font-weight: bold');
  //   const fabricObjectOfSelectedElement = this.selectedElement?.fabricObject;
  //   if (!fabricObjectOfSelectedElement) {
  //     // console log in red
  //     console.log('%cNo fabric object found:', 'color: red; font-weight: bold');
  //     return;
  //   }
  //   // check if its fabric.image and not just faqbric.object type
  //   if (fabricObjectOfSelectedElement.type !== 'image') {
  //     // console log in red
  //     console.log('%cSelected element is not an image:', 'color: red; font-weight: bold');
  //     return;
  //   }
  //   const filter = this.getExistingFilter(
  //     fabricObjectOfSelectedElement as fabric.Image,
  //     filterType,
  //   );
  //   for (let i = fromFrame; i <= toFrame; i++) {
  //     const frame = this.elements.find((f, index) => index === i);
  //     if (!frame) {
  //       // console log in red
  //       console.log('%cFrame not found:', 'color: red; font-weight: bold', i);
  //       return;
  //     }
  //     if (frame) {
  //       const frameElement = this.elements.find((el) => el.id === frame.id);
  //       if (frameElement) {
  //         const fabricObject = frameElement.fabricObject as fabric.Image;
  //         if (fabricObject) {
  //           const doesCurrentElementHaveFilter = fabricObject.filters?.find(
  //             (f) => f.type.toLowerCase() === filterType.toLowerCase(),
  //           );
  //           if (doesCurrentElementHaveFilter && options && filter) {
  //             // console log in orange
  //             console.log('%cFilter found:', 'color: orange; font-weight: bold', filter);
  //             fabricElement.filters?.map((f) => {
  //               if (f.type.toLowerCase() === filterType.toLowerCase()) {
  //                 return Object.assign(f, options);
  //               }
  //             });
  //             this.elements[i].fabricObject = fabricElement;
  //             this.elements[i].fabricObject?.applyFilters();
  //           }
  //         }
  //         // in green
  //         console.log('%cFilter applied to frame:', 'color: green; font-weight: bold', i);
  //       }
  //     }
  //   }
  // }
  // private updateOrAddFilter(
  //   fabricElement: fabric.Image,
  //   filterType: FilterType,
  //   filter: IBaseFilter | undefined,
  //   options: FilterInputOptions,
  //   fromFrame?: number,
  //   toFrame?: number,
  //   updateAll: boolean = false,
  // ) {
  //   // in orange
  //   console.log(
  //     '%cUpdate or add filter:',
  //     'color: orange; font-weight: bold',
  //     filterType,
  //     options,
  //     fromFrame,
  //     toFrame,
  //     updateAll,
  //   );
  //   if (updateAll && fromFrame !== undefined && toFrame !== undefined) {
  //     // console log in orange
  //     console.log('%cUpdate all:', 'color: orange; font-weight: bold');
  //     this.updateFilterOnAllFrames(fabricElement, filterType, options, fromFrame, toFrame);
  //   }
  //   if (filter && fromFrame === undefined && toFrame === undefined) {
  //     Object.assign(filter, options);
  //     console.log('Filter updated:', filter, options);
  //   } else if (
  //     fromFrame !== undefined &&
  //     toFrame !== undefined &&
  //     fromFrame !== toFrame &&
  //     filter
  //   ) {
  //     // console log in orange
  //     console.log('%cFilter applying to multiple frames:', 'color: orange; font-weight: bold');
  //     this.createFilterForFromToFrames(fabricElement, filterType, options, fromFrame, toFrame);
  //   } else {
  //     const newFilter = this.createFilter(filterType, options);
  //     if (newFilter) {
  //       fabricElement.filters?.push(newFilter);
  //       this.selectedElement.fabricObject = fabricElement;
  //     }
  //   }
  //   return fabricElement;
  // }
  // createFabricImageFromBlob(src: string): Promise<fabric.Image | undefined> {
  //   return new Promise((resolve, reject) => {
  //     fabric.Image.fromURL(
  //       src,
  //       (img) => {
  //         img.set({
  //           left: 0,
  //           top: 0,
  //           selectable: true,
  //           hoverCursor: 'pointer',
  //           transparentCorners: true,
  //           originX: 'left',
  //           originY: 'top',
  //           id: getUid(), // Ensure a unique ID is used for tracking
  //         });
  //         if (!this.canvas) {
  //           console.error('Canvas is not found');
  //           return;
  //         }
  //         const scaleX = this.canvas?.getWidth() / img.width!;
  //         const scaleY = this.canvas?.getHeight() / img.height!;
  //         img.scaleX = scaleX;
  //         img.scaleY = scaleY;
  //         img.setCoords();
  //         resolve(img);
  //       },
  //       { crossOrigin: 'anonymous' },
  //     );
  //   });
  // }
  addImage(index: number, blobUrl: string, isFrame = false, frameId?: string) {
    const id = getUid(); // Use getUid() to ensure each image has a unique identifier
    this.addEditorElement({
      filters: [],
      index,
      dataUrl: blobUrl,
      copied: false,
      id: frameId ? frameId : id,
      type: 'image',
      isFrame: isFrame,
      src: blobUrl,
      order: index,
      opacity: 1,
      placement: {
        zIndex: isFrame ? 0 : 1,
        x: 0,
        y: 0,
      },
      shadow: {
        color: '',
        offsetX: 0,
        offsetY: 0,
        blur: 0,
      },
      properties: {
        elementId: frameId ? frameId : id,
        src: blobUrl,
        effect: { type: 'none' },
      },
      timeFrame: {
        start: 0,
        end: this.maxTime,
      },
    });
  }
  addText(options: {
    text: string;
    fontSize: number;
    fontWeight: number;
    fill: string;
    fontFamily: string;
    fontStyle: string;
    textBackground: string;
    isFrame: boolean;
    id: string;
    index: number;
  }) {
    const id = options.id || getUid();
    const index = this.elements.length;
    const text = {
      filters: [],
      copied: false,
      dataUrl: '',
      index,
      opacity: 1,
      id,
      order: index,
      isFrame: options.isFrame,
      name: `Text ${index + 1}`,
      type: 'text',
      shadow: {
        color: '',
        offsetX: 0,
        offsetY: 0,
        blur: 0,
      },
      placement: {
        x: 100,
        y: 200,
        width: 200,
        height: 200,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        zIndex: options.isFrame ? 0 : 1,
      },
      timeFrame: {
        start: 0,
        end: this.maxTime,
      },
      properties: {
        text: options.text,
        fontSize: options.fontSize,
        fontWeight: options.fontWeight,
        fill: options.fill,
        fontFamily: options.fontFamily,
        fontStyle: options.fontStyle,
        textBackground: options.textBackground,
        splittedTexts: [],
        textAlign: 'left',
        underline: false,
        linethrough: false,
        overline: false, // Add missing property
        id,
      },
    } as TextEditorElement;
    this.addEditorElement({ ...text });
  }
  addEditorElement(editorElement: EditorElement) {
    this.elements.push(editorElement);
  }
  addImages() {
    // if there are already, adjust the index
    const newFrames = this.frames.filter((fr) => {
      return !this.elements.some((el) => el.id === fr.id);
    });
    const startIndex = this.elements.length > 0 ? this.elements.length : 0;
    newFrames.forEach((frame, index) => {
      const indexWithOffset = startIndex + index;
      this.addImage(indexWithOffset, frame.src, true, frame.id);
    });
    if (!this.elements.length) return;
    this.updateMaxTime();
    console.log('maxTime', this.maxTime);
    this.setSelectedElements([this.elements[0].id]);
    if (!this.elements.length) return;
    this.updateMaxTime();
    console.log('maxTime', this.maxTime);
    // this.setSelectedElements([this.elements[0].id]);
  }
  updateEditorElement(editorElement: EditorElement) {
    this.elements = this.elements.map((element) => {
      return element.id === editorElement.id ? editorElement : element;
    });
  }
  removeElement(id: string): void {
    this.elements = this.elements.filter((el) => el.id !== id).slice();
    // animations that are related to this element should be removed
    // this.animationStore?.removeAnimationsByTargetId(id);
    this.selectedElements = this.selectedElements.filter((el) => el.id !== id);
  }
  deleteFrame(index: number) {
    this.frames = this.frames.filter((frame, i) => i !== index);
    this.elements = this.elements.filter((element, i) => i !== index);
    this.frames = this.frames;
  }
}
