import { makeAutoObservable } from 'mobx';
import { AnimationStore } from './AnimationStore';
import { EditorElement, TimeFrame } from '@/types';
import { EditorStore } from './EditorStore';
export class TimelineStore {
  private animationStore?: AnimationStore;
  private editorStore?: EditorStore;
  constructor() {
    makeAutoObservable(this);
  }
  initialize(animationStore: AnimationStore, editorStore: EditorStore) {
    this.animationStore = animationStore;
    this.editorStore = editorStore;
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
    this.animationStore?.addCurrentGifFrameToCanvas();
    this.animationStore?.refreshAnimations();
  }
  formatCurrentTime(): string {
    if (!this.editorStore || !this.animationStore) return this.formatTime(0);
    const frameTimeInSeconds = this.editorStore?.currentKeyFrame / this.animationStore?.fps || 0;
    const totalTimeInSeconds = this.editorStore?.frames.length / this.animationStore?.fps || 0;
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
    this.editorStore!.currentKeyFrame = frame;
    this.animationStore!.addCurrentGifFrameToCanvas();
  }
  private startPlayback() {
    this.editorStore!.isPlaying = true;
    let currentFrame = this.editorStore!.currentKeyFrame;
    this.editorStore!.playInterval = setInterval(
      () => {
        this.updateFrame(currentFrame);
        currentFrame++;
      },
      1000 / (this.animationStore!.fps * this.animationStore!.speedFactor),
    );
  }
  private stopPlayback() {
    if (this.editorStore!.playInterval) {
      clearInterval(this.editorStore!.playInterval);
      this.editorStore!.playInterval = null;
      this.editorStore!.isPlaying = false;
    }
  }
}
