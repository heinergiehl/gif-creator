import { ffmpegStore } from '@/store/FFmpegStore';
import { FabricObjectFactory } from '@/utils/fabric-utils';
import { fetchFile } from '@ffmpeg/util';
import { RootStore } from '.';
import { computed, makeAutoObservable } from 'mobx';
export class FileStore {
  rootStore: RootStore;
  gifQuality = 10;
  paletteSize = 256; // New property for palette size
  ffmpeg = ffmpegStore.ffmpeg;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      canvas: computed,
      animationStore: computed,
      editorStore: computed,
      fabricObjects: computed,
      frames: computed,
      height: computed,
      width: computed,
    });
  }
  get editorStore() {
    return this.rootStore.editorStore;
  }
  get canvas() {
    return this.rootStore?.canvasRef?.current;
  }
  get height() {
    return this.rootStore.canvasOptionsStore.height;
  }
  get width() {
    return this.rootStore.canvasOptionsStore.width;
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
      .sort((a, b) => a?.index! - b?.index!);
  }
  async createGifFromEditorElements(isPreview: boolean): Promise<string> {
    const ffmpeg = this.ffmpeg;
    if (!ffmpeg?.loaded) return '';
    const frames = this.frames;
    const objectsInFrame = this.editorStore?.elements.filter((el) => el.isFrame === false);
    if (!frames || !objectsInFrame) {
      console.error('%cFrames or ObjectsInFrame not found', 'color: red');
      return '';
    }
    try {
      for (let i = 0; i < frames.length; i++) {
        const currentFrame = frames[i];
        const objectsInCurrentFrame = objectsInFrame.filter(
          (obj) =>
            obj.timeFrame.start <= currentFrame.timeFrame.start &&
            obj.timeFrame.end >= currentFrame.timeFrame.end,
        );
        const canvas = this.canvas;
        if (!canvas) throw new Error('Canvas not found');
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
          const fabricFrameObject = await FabricObjectFactory.manageFabricObject(currentFrame);
          if (fabricFrameObject) {
            fabricFrameObject.scaleToWidth(tempCanvas.width);
            fabricFrameObject.scaleToHeight(tempCanvas.height);
            fabricFrameObject.setCoords();
            fabricFrameObject.render(tempCanvasContext);
          }
          for (const editorElement of objectsInCurrentFrame) {
            const fabricObject = await FabricObjectFactory.manageFabricObject(editorElement);
            if (fabricObject) {
              fabricObject.render(tempCanvasContext);
            }
          }
          // Convert canvas to a PNG blob
          const blob = await new Promise<Blob | null>((resolve) =>
            tempCanvas.toBlob((blob) => resolve(blob), 'image/png'),
          );
          if (blob) {
            // Write PNG to FFmpeg FS
            await ffmpeg.writeFile(`frame_${i}.png`, await fetchFile(blob));
          }
        }
      }
      // Ensure frames were saved correctly
      const files = await ffmpeg.listDir('/');
      console.log('Files in FS:', files);
      // Create a video from the PNGs
      //if isPreview is true, create video in very low quality, meaning low resolution like 200x200
      const scaleFilter = isPreview ? 'scale=100:100' : `scale=${this.width}:${this.height}`;
      if (isPreview) {
        await ffmpeg.exec([
          '-r',
          String(this.animationStore?.fps || 10),
          '-f',
          'image2',
          '-y',
          '-i',
          'frame_%d.png',
          '-vcodec',
          'libx264',
          '-vf',
          scaleFilter,
          '-pix_fmt',
          'yuv420p',
          'output.mp4',
        ]);
      } else {
        await ffmpeg.exec([
          '-r',
          String(this.animationStore?.fps || 10),
          '-f',
          'image2',
          '-y',
          '-i',
          'frame_%d.png',
          '-vcodec',
          'libx264',
          '-pix_fmt',
          'yuv420p',
          'output.mp4',
        ]);
      }
      // Generate the palette
      await ffmpeg.exec([
        '-y',
        '-i',
        'output.mp4',
        '-vf',
        `scale=${this.width}:-1:flags=lanczos,palettegen=max_colors=${this.paletteSize}`,
        'palette.png',
      ]);
      // Convert the video to GIF using the palette
      await ffmpeg.exec([
        '-y',
        '-i',
        'output.mp4',
        '-i',
        'palette.png',
        '-filter_complex',
        'paletteuse',
        `output.gif`,
      ]);
      // Read the generated GIF
      const gifData = await ffmpeg.readFile('output.gif');
      return URL.createObjectURL(new Blob([gifData], { type: 'image/gif' }));
    } catch (error) {
      console.error('Error creating GIF:', error);
      return '';
    } finally {
      // // Clean up FFmpeg FS
      // await ffmpeg.deleteFile('output.mp4');
      // await ffmpeg.deleteFile('output.gif');
      // await ffmpeg.deleteFile('palette.png');
      // for (let i = 0; i < frames.length; i++) {
      //   await ffmpeg.deleteFile(`frame_${i}.png`);
      // }
    }
  }
  handleSaveAsGif = async (): Promise<string> => {
    try {
      const gifUrl = await this.createGifFromEditorElements(false);
      console.log('GIF URL', gifUrl);
      // Clean up FFmpeg FS
      const ffmpeg = this.ffmpeg;
      if (!ffmpeg) return '';
      await ffmpeg.deleteFile('output.mp4');
      await ffmpeg.deleteFile('output.gif');
      await ffmpeg.deleteFile('palette.png');
      for (let i = 0; i < frames.length; i++) {
        await ffmpeg.deleteFile(`frame_${i}.png`);
      }
      return gifUrl;
    } catch (error) {
      console.error('Error creating GIF', error);
      return '';
    }
  };
}
