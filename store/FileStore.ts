import { makeAutoObservable } from 'mobx';
import { EditorStore } from './EditorStore';
import GIF from '@/dist/gif.js';
import { AnimationStore } from './AnimationStore';
export class FileStore {
  private editorStore?: EditorStore;
  private animationStore?: AnimationStore;
  gifQuality = 10;
  constructor() {
    makeAutoObservable(this);
  }
  initialize(editorStore: EditorStore, animationStore: AnimationStore) {
    this.editorStore = editorStore;
    this.animationStore = animationStore;
  }
  async createGifFromEditorElements(): Promise<string> {
    const gif = new GIF({
      workers: 6,
      quality: this.gifQuality,
      workerScript: '/gif.worker.js',
    });
    const frames = this.editorStore?.elements.filter((el) => el.isFrame === true);
    const ObjectsInFrame = this.editorStore?.elements.filter((el) => el.isFrame === false);
    // only draw the objects in the frame that are in the timeframe of the frame
    if (!frames || !ObjectsInFrame) return '';
    for (let i = 0; i < frames.length; i++) {
      const currentFrame = frames[i];
      // get all object within the timeframe of the frame
      const objectsInFrame = ObjectsInFrame.filter(
        (obj) =>
          obj.timeFrame.start <= currentFrame.timeFrame.start &&
          obj.timeFrame.end >= currentFrame.timeFrame.end,
      );
      const tempCanvas = document.createElement('canvas');
      const canvas = this.editorStore?.canvas;
      tempCanvas.width = canvas?.getWidth() || 800;
      tempCanvas.height = canvas?.getHeight() || 500;
      const tempCanvasContext = tempCanvas.getContext('2d');
      if (tempCanvasContext) {
        // Clear the canvas
        tempCanvasContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        // Draw the background color
        if (this.editorStore?.backgroundColor)
          tempCanvasContext.fillStyle = this.editorStore?.backgroundColor;
        tempCanvasContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        // Draw the image, meaning draw the frame and the objects in the frame
        if (currentFrame.fabricObject) {
          currentFrame.fabricObject.setCoords();
          currentFrame.fabricObject.render(tempCanvasContext);
        }
        // Draw the objects in the frame
        objectsInFrame.forEach((obj) => {
          if (obj.fabricObject) {
            obj.fabricObject.setCoords();
            obj.fabricObject.render(tempCanvasContext);
          }
        });
        // Add the canvas frame to the GIF
        if (this.animationStore?.fps)
          gif.addFrame(tempCanvas, { delay: 1000 / this.animationStore?.fps });
      }
    }
    // for (let i = 0; i < this.editorStore.elements.length; i++) {
    //   const editorElement = this.editorStore.elements[i];
    //   const currentVideoFrame = this.editorStore.frames[i];
    //   const tempCanvas = document.createElement('canvas');
    //   const canvas = this.editorStore.canvas;
    //   tempCanvas.width = canvas?.getWidth() || 800;
    //   tempCanvas.height = canvas?.getHeight() || 500;
    //   console.log('CANVAS', tempCanvas.width, tempCanvas.height);
    //   const tempCanvasContext = tempCanvas.getContext('2d');
    //   if (tempCanvasContext) {
    //     // Clear the canvas
    //     tempCanvasContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    //     // Draw the background color
    //     tempCanvasContext.fillStyle = this.editorStore.backgroundColor;
    //     tempCanvasContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    //     // Draw the image
    //     if (editorElement.fabricObject) {
    //       editorElement.fabricObject.setCoords();
    //       editorElement.fabricObject.render(tempCanvasContext);
    //     }
    //     // Add the canvas frame to the GIF
    //     gif.addFrame(tempCanvas, { delay: 1000 / this.animationStore.fps });
    //   }
    // }
    return new Promise((resolve, reject) => {
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
      // Do something with the gifUrl, such as downloading it or displaying it
      return gifUrl;
    } catch (error) {
      console.error('Error creating GIF', error);
      return '';
    }
  };
}
