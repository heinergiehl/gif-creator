import { computed, makeAutoObservable } from 'mobx';
import { fabric } from 'fabric';
import GIF from '@/dist/gif.js';
import { RootStore } from '.';
import { EditorElement } from '@/types';
export class FileStore {
  rootStore: RootStore;
  gifQuality = 10;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      canvas: computed,
      animationStore: computed,
      editorStore: computed,
      fabricObjects: computed,
    });
  }
  get editorStore() {
    return this.rootStore.editorStore;
  }
  get canvas() {
    return this.rootStore?.canvasRef?.current;
  }
  get fabricObjects() {
    return this.canvas?.getObjects();
  }
  get animationStore() {
    return this.rootStore.animationStore;
  }
  async loadFabricObject(element: EditorElement) {
    const { type, properties, placement } = element;
    switch (type) {
      case 'image':
      case 'smilies':
      case 'gif':
        return new Promise<fabric.Image>((resolve, reject) => {
          fabric.Image.fromURL(
            properties.src,
            (img) => {
              img.set({
                scaleX: placement?.scaleX || 1,
                scaleY: placement.scaleY || 1,
                left: placement.x || 0,
                top: placement.y || 0,
                angle: placement.rotation,
                originX: 'left',
                originY: 'top',
                selectable: false,
              });
              resolve(img);
            },
            { crossOrigin: 'anonymous' },
          );
        });
      case 'text':
        return new Promise<fabric.Text>((resolve) => {
          const {
            text,
            fontSize,
            fontWeight,
            fontFamily,
            fontColor,
            fontStyle,
            textAlign,
            underline,
            linethrough,
          } = properties;
          const fabricText = new fabric.Text(text, {
            left: placement.x,
            top: placement.y,
            scaleX: placement.scaleX || 1,
            scaleY: placement.scaleY || 1,
            fontSize,
            fontWeight,
            fontFamily,
            fill: fontColor,
            fontStyle,
            textAlign,
            underline,
            linethrough,
            angle: placement.rotation,
            originX: 'left',
            originY: 'top',
            selectable: false,
          });
          resolve(fabricText);
        });
      default:
        return Promise.reject(`Unsupported element type: ${type}`);
    }
  }
  async createGifFromEditorElements(): Promise<string> {
    const gif = new GIF({
      workers: 6,
      quality: this.gifQuality,
      workerScript: '/gif.worker.js',
    });
    const frames = this.editorStore?.elements.filter((el) => el.isFrame === true);
    const objectsInFrame = this.editorStore?.elements.filter((el) => el.isFrame === false);
    if (!frames || !objectsInFrame) {
      console.error('%cFrames or ObjectsInFrame not found', 'color: red');
      return '';
    }
    for (let i = 0; i < frames.length; i++) {
      const currentFrame = frames[i];
      const objectsInCurrentFrame = objectsInFrame.filter(
        (obj) =>
          obj.timeFrame.start <= currentFrame.timeFrame.start &&
          obj.timeFrame.end >= currentFrame.timeFrame.end,
      );
      const canvas = this.canvas;
      if (!canvas) return Promise.reject('Canvas not found');
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.getWidth() || 800;
      tempCanvas.height = canvas.getHeight() || 500;
      const tempCanvasContext = tempCanvas.getContext('2d');
      if (tempCanvasContext) {
        tempCanvasContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        if (this.editorStore?.backgroundColor) {
          tempCanvasContext.fillStyle = this.editorStore?.backgroundColor;
          tempCanvasContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        }
        try {
          const fabricFrameObject = await this.loadFabricObject(currentFrame);
          if (fabricFrameObject) {
            fabricFrameObject.drawSelectionBackground = function (ctx: CanvasRenderingContext2D) {
              return this;
            };
            fabricFrameObject.scaleToWidth(tempCanvas.width);
            fabricFrameObject.scaleToHeight(tempCanvas.height);
            fabricFrameObject.setCoords();
            fabricFrameObject.render(tempCanvasContext);
          }
          for (let j = 0; j < objectsInCurrentFrame.length; j++) {
            const editorElement = objectsInCurrentFrame[j];
            const fabricObject = await this.loadFabricObject(editorElement);
            if (fabricObject) {
              fabricObject.drawSelectionBackground = function (ctx: CanvasRenderingContext2D) {
                return this;
              };
              fabricObject.setCoords();
              fabricObject.render(tempCanvasContext);
            }
          }
          gif.addFrame(tempCanvas, {
            delay: 1000 / (this.animationStore?.fps || 10),
          });
        } catch (error) {
          console.error('Error rendering frame:', error);
        }
      }
    }
    return new Promise((resolve, reject) => {
      gif.on('progress', (progress: number) => {
        console.log('GIF progress', progress);
      });
      gif.on('finished', (blob: Blob) => {
        resolve(URL.createObjectURL(blob));
      });
      gif.on('error', (error: Error) => {
        reject(error);
      });
      gif.render();
    });
  }
  handleSaveAsGif = async (): Promise<string> => {
    try {
      const gifUrl = await this.createGifFromEditorElements();
      console.log('GIF URL', gifUrl);
      return gifUrl;
    } catch (error) {
      console.error('Error creating GIF', error);
      return '';
    }
  };
}
