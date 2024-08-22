import { makeAutoObservable } from 'mobx';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
class FFmpegStore {
  ffmpeg: FFmpeg | null = null;
  loading: boolean = true;
  constructor() {
    makeAutoObservable(this);
    this.loadFFMPEG();
  }
  async loadFFMPEG() {
    this.ffmpeg = new FFmpeg();
    this.ffmpeg.on('log', ({ message }) => console.log(message));
    await this.ffmpeg.load({
      coreURL: await toBlobURL(
        'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
        'text/javascript',
      ),
      wasmURL: await toBlobURL(
        'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
        'application/wasm',
      ),
    });
    this.loading = false;
  }
}
export const ffmpegStore = new FFmpegStore();
