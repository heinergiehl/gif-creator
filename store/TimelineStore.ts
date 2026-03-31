import { computed, makeAutoObservable } from 'mobx';
import { AnimationStore } from './AnimationStore';
import { EditorElement, TimeFrame } from '@/types';
import { RootStore } from '.';
export class TimelineStore {
  private rootStore?: RootStore;
  private playbackTimeout: ReturnType<typeof setTimeout> | null = null;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
  get editorStore() {
    return this.rootStore?.editorStore;
  }
  get animationStore() {
    return this.rootStore?.animationStore;
  }
  updateEditorElementTimeFrame(editorElement: EditorElement, timeFrame: Partial<TimeFrame>) {
    const maxTime = this.editorStore?.maxTime || Infinity;
    if (timeFrame.start != undefined && timeFrame.start < 0) {
      timeFrame.start = 0;
    }
    if (timeFrame.end != undefined && timeFrame.end > maxTime) {
      timeFrame.end = maxTime;
    }
    const updatedElement = {
      ...editorElement,
      timeFrame: { ...editorElement.timeFrame, ...timeFrame },
    };
    this.editorStore?.updateElement(updatedElement.id, updatedElement);
    // this.animationStore?.refreshAnimations();
  }
  formatCurrentTime(): string {
    if (!this.editorStore || !this.animationStore) return this.formatTime(0);
    const frameTimeInSeconds = this.editorStore.currentFrameTimeInMs / 1000;
    const totalTimeInSeconds = this.editorStore.maxTime / 1000;
    return `${this.formatTime(frameTimeInSeconds)} / ${this.formatTime(totalTimeInSeconds)}`;
  }
  private formatTime(timeInSeconds: number): string {
    const seconds = Math.floor(timeInSeconds % 60);
    const ms = Math.floor((timeInSeconds * 1000) % 1000);
    const formattedSeconds = seconds.toString().padStart(2, '0');
    const formattedMs = ms.toString().padStart(3, '0');
    return `${formattedSeconds}s:${formattedMs}ms`;
  }
  playSequence() {
    const isPlaying = this.editorStore?.isPlaying;
    if (isPlaying) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
  }
  private updateFrame(frame: number) {
    if (frame >= this.editorStore!.frames.length) {
      this.stopPlayback();
      return;
    }
    this.editorStore!.setCurrentKeyFrame(frame);
    // this.animationStore!.addCurrentGifFrameToCanvas();
  }
  private startPlayback() {
    if (!this.editorStore || !this.animationStore || this.editorStore.frames.length === 0) {
      return;
    }
    this.editorStore!.isPlaying = true;
    let currentFrame =
      this.editorStore.currentKeyFrame >= this.editorStore.frames.length - 1
        ? 0
        : this.editorStore.currentKeyFrame;
    this.updateFrame(currentFrame);
    const tick = () => {
      if (!this.editorStore?.isPlaying || !this.animationStore) {
        return;
      }
      currentFrame += 1;
      if (currentFrame >= this.editorStore.frames.length) {
        this.stopPlayback();
        return;
      }
      this.updateFrame(currentFrame);
      this.playbackTimeout = setTimeout(
        tick,
        this.animationStore.timePerFrameInMs / this.animationStore.speedFactor,
      );
    };
    this.playbackTimeout = setTimeout(
      tick,
      this.animationStore.timePerFrameInMs / this.animationStore.speedFactor,
    );
  }
  private stopPlayback() {
    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout);
      this.playbackTimeout = null;
    }
    if (this.editorStore!.playInterval) {
      clearInterval(this.editorStore!.playInterval);
      this.editorStore!.playInterval = null;
    }
    this.editorStore!.isPlaying = false;
  }
}
