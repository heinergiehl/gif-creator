import { makeAutoObservable } from 'mobx';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

class FFmpegStore {
  ffmpeg: FFmpeg | null = null;
  loading: boolean = true;
  error: string | null = null;
  private loadPromise: Promise<FFmpeg> | null = null;

  constructor() {
    makeAutoObservable<this, 'loadPromise'>(this, {
      loadPromise: false,
    });
    void this.ensureLoaded().catch(() => {
      // Consumers surface a contextual retry message.
    });
  }

  async ensureLoaded(): Promise<FFmpeg> {
    if (this.ffmpeg?.loaded) {
      return this.ffmpeg;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loading = true;
    this.error = null;
    this.loadPromise = (async () => {
      const ffmpeg = new FFmpeg();
      ffmpeg.on('log', () => {});

      try {
        await ffmpeg.load({
          coreURL: await toBlobURL(
            'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
            'text/javascript',
          ),
          wasmURL: await toBlobURL(
            'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
            'application/wasm',
          ),
        });
        this.ffmpeg = ffmpeg;
        return ffmpeg;
      } catch (error) {
        this.ffmpeg = null;
        this.error =
          error instanceof Error ? error.message : 'The browser engine could not be loaded.';
        throw error;
      } finally {
        this.loading = false;
        this.loadPromise = null;
      }
    })();

    return this.loadPromise;
  }

  async loadFFMPEG(): Promise<FFmpeg> {
    return this.ensureLoaded();
  }
}

export const ffmpegStore = new FFmpegStore();
