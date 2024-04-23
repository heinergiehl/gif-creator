import { makeAutoObservable } from 'mobx';
import { EditorElement, Placement, TextEditorElement } from '@/types';
import { fabric } from 'fabric';
import { getUid, isHtmlImageElement } from '@/utils';
export interface Frame {
  id: string;
  src: string;
}
export class EditorStore {
  elements: EditorElement[] = [];
  selectedElement: EditorElement | null = null;
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
  maxTime = 10000;
  textColor = '#000000';
  imageType: 'Frame' | 'ObjectInFrame' = 'Frame';
  isDragging = false;
  constructor() {
    makeAutoObservable(this);
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
  updateFramesOrder(oldIndex: number, newIndex: number) {
    const movedFrame = this.frames[oldIndex];
    const editorElementToMove = this.elements[oldIndex];
    if (!movedFrame) return;
    this.frames = this.frames.filter((frame, i) => i !== oldIndex);
    this.frames.splice(newIndex, 0, movedFrame);
    this.elements = this.elements.filter((element, i) => i !== oldIndex);
    this.elements.splice(newIndex, 0, editorElementToMove);
  }
  private updateEditorElementsForFrames() {
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
      // this.canvas?.fire('object:modified', { target: fabricElement });
    }
  }
  addEditorElement(element: EditorElement) {
    this.elements.push(element);
    if ((element.type === 'image' || element.type === 'smilies') && element.isFrame) {
      const fabricImage = this.createFabricImage(
        document.getElementById(element.id) as HTMLImageElement,
      );
      if (!fabricImage) return;
      element.fabricObject = fabricImage;
      this.elements[this.elements.length - 1] = element;
      this.canvas?.add(fabricImage);
    } else if (element.type === 'text') {
      const textElement = element as TextEditorElement;
      const text = new fabric.Textbox(textElement.properties.text, {
        left: textElement.placement.x,
        top: textElement.placement.y,
        width: textElement.placement.width,
        height: textElement.placement.height,
        fontSize: textElement.properties.fontSize,
        fontWeight: textElement.properties.fontWeight,
        fill: textElement.properties.fontColor,
        fontFamily: textElement.properties.fontFamily,
        centeredRotation: true,
        centeredScaling: true,
        editable: true,
      });
      // text.on("modified", this.onObjectModified.bind(this))
      element.fabricObject = text;
      this.elements[this.elements.length - 1] = element;
      this.canvas?.add(element.fabricObject);
    }
  }
  addImage(index: number, imageId?: string, isFrame = false) {
    let imageElement: HTMLImageElement | null;
    if (imageId) imageElement = document.getElementById(imageId) as HTMLImageElement;
    else imageElement = document.getElementById(`image-${index}`) as HTMLImageElement;
    if (!isHtmlImageElement(imageElement)) {
      return;
    }
    const aspectRatio = imageElement.naturalWidth / imageElement.naturalHeight;
    const id = getUid();
    // make sure its perfectly centered
    const placement: Placement = {
      x: 0,
      y: 0,
      width: imageElement.naturalWidth,
      height: imageElement.naturalHeight,
      rotation: 0,
      scaleX: this.canvas ? this.canvas.getWidth() / imageElement.naturalWidth : 1,
      scaleY: this.canvas ? this.canvas.getHeight() / imageElement.naturalHeight : 1,
    };
    this.addEditorElement({
      isFrame,
      id: imageId?.toString() || 'image-' + index,
      name: `Media(image) ${index}`,
      type: 'image',
      placement,
      timeFrame: {
        start: 0,
        end: this.maxTime,
      },
      properties: {
        elementId: `image-${id}`,
        src: imageElement.src,
        effect: {
          type: 'none',
        },
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
  }) {
    const id = getUid();
    const index = this.elements.length;
    const text = {
      isFrame: options.isFrame,
      id,
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
    this.frames.forEach((fr, i) => {
      const id = fr.id;
      // check if the image is already added, if so skip
      if (this.elements.find((el) => el.id === id)) return;
      this.addImage(i + startIndex, id, true);
    });
    if (!this.elements.length) return;
    this.selectElement(this.elements[0].id);
  }
  private createFabricImage(image: HTMLImageElement | null): fabric.Image | undefined {
    if (this.canvas) {
      const canvasWidth = this.canvas.getWidth();
      const canvasHeight = this.canvas.getHeight();
      if (!image) return;
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
    this.elements = this.elements.filter((el) => el.id !== id);
  }
  deleteFrame(index: number) {
    this.frames = this.frames.filter((frame, i) => i !== index);
    this.elements = this.elements.filter((element, i) => i !== index);
    this.frames = this.frames;
  }
}
