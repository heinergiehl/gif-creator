import { computed, makeAutoObservable } from 'mobx';
import { fabric } from 'fabric';
import GIF from '@/dist/gif.js';
import { RootStore } from '.';
import { EditorElement } from '@/types';
import { FabricObjectFactory } from '@/utils/fabric-utils';
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
      frames: computed,
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
  get frames() {
    return this.editorStore?.elements
      .filter((el) => el.isFrame === true)
      .sort((a, b) => a.timeFrame.start - b.timeFrame.start)
      .sort((a, b) => a.index - b.index);
  }
  async createGifFromEditorElements(): Promise<string> {
    const gif = new GIF({
      workers: 6,
      quality: this.gifQuality,
      workerScript: '/gif.worker.js',
    });
    const frames = this.frames;
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
      console.log('CANVAS', canvas);
      if (!canvas) return Promise.reject('Canvas not found');
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.getWidth();
      tempCanvas.height = canvas.getHeight();
      const tempCanvasContext = tempCanvas.getContext('2d');
      if (tempCanvasContext) {
        tempCanvasContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        if (this.editorStore?.backgroundColor) {
          tempCanvasContext.fillStyle = this.editorStore?.backgroundColor;
          tempCanvasContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        }
        try {
          const fabricFrameObject = await FabricObjectFactory.manageFabricObject(currentFrame);
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
            const fabricObject = await FabricObjectFactory.manageFabricObject(editorElement);
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
  async createGifPreview(): Promise<string> {
    const gif = new GIF({
      workers: 2,
      quality: 30, // Lower quality for quick preview
      workerScript: '/gif.worker.js',
    });
    const frames = this.frames;
    const objectsInFrame = this.editorStore?.elements.filter((el) => el.isFrame === false);
    if (!frames || !objectsInFrame) {
      console.error('%cFrames or ObjectsInFrame not found', 'color: red');
      return '';
    }
    const frameInterval = Math.max(1, Math.floor(frames.length / 10)); // Reduce number of frames for preview
    for (let i = 0; i < frames.length; i += frameInterval) {
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
        if (this.rootStore?.canvasOptionsStore?.backgroundColor) {
          tempCanvasContext.fillStyle = this.rootStore?.canvasOptionsStore.backgroundColor;
          tempCanvasContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        }
        try {
          const fabricFrameObject = await FabricObjectFactory.manageFabricObject(currentFrame);
          if (fabricFrameObject) {
            fabricFrameObject.drawSelectionBackground = function (ctx: CanvasRenderingContext2D) {
              return this;
            };
            // fabricFrameObject.scaleToWidth(tempCanvas.width);
            // fabricFrameObject.scaleToHeight(tempCanvas.height);
            fabricFrameObject.setCoords();
            fabricFrameObject.render(tempCanvasContext);
          }
          for (let j = 0; j < objectsInCurrentFrame.length; j++) {
            const editorElement = objectsInCurrentFrame[j];
            const fabricObject = await FabricObjectFactory.manageFabricObject(editorElement);
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
        console.log('GIF preview progress', progress);
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
