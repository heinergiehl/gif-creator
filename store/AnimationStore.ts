import { makeAutoObservable } from 'mobx';
import {
  Animation,
  EditorElement,
  FadeInAnimation,
  FadeOutAnimation,
  SlideDirection,
  SlideInAnimation,
  SlideOutAnimation,
} from '@/types';
import { EditorStore } from './EditorStore';
import { HistoryStore } from './HistoryStore';
import { RootStore } from '.';
import { fabric } from 'fabric';
export class AnimationStore {
  rootStore?: RootStore;
  animations: Animation[] = [];
  fps = 4;
  speedFactor = 1;
  currentTimeInMs = 0;
  isPaused = false;
  timePerFrameInMs: number = 1000 / this.fps;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
  get editorStore(): EditorStore | undefined {
    return this.rootStore?.editorStore;
  }
  get historyStore(): HistoryStore | undefined {
    return this.rootStore?.historyStore;
  }
  addAnimation(animation: Animation) {
    if (this.historyStore?.history.length === 0) {
      this.historyStore?.addState(this.editorStore?.elements || [], this.animations);
    }
    this.animations = [...this.animations, animation];
    if (this.historyStore?.history && this.historyStore?.history.length > 0)
      this.historyStore?.addState(this.editorStore?.elements || [], this.animations);
  }
  applyAnimation(animation: Animation, canvas: fabric.Canvas) {
    switch (animation.type) {
      case 'slideIn':
        this.animateSlideIn(animation as SlideInAnimation, canvas);
        break;
      case 'slideOut':
        this.animateSlideOut(animation as SlideOutAnimation, canvas);
        break;
      case 'fadeIn':
        this.animateFadeIn(animation as FadeInAnimation, canvas);
        break;
      case 'fadeOut':
        this.animateFadeOut(animation as FadeOutAnimation, canvas);
        break;
      case 'breathe':
        this.animateBreathe(animation, canvas);
        break;
    }
  }
  private animateFadeIn(
    animation: FadeInAnimation,
    canvas: fabric.Canvas,
    { duration = 1000 } = {},
  ) {
    const targetElement = this.getTargetElement(animation);
    if (!targetElement) return;
    targetElement.opacity = 0;
    const elementsToAnimate = this.getElementsToAnimate(animation, targetElement, duration);
    elementsToAnimate.forEach((element) => {
      const progress = this.calculateAnimationProgress(
        elementsToAnimate,
        element,
        this.timePerFrameInMs,
        duration,
      );
      element.opacity = progress;
    });
    canvas.renderAll();
  }
  private animateBreathe(animation: Animation, canvas: fabric.Canvas, { duration = 1000 } = {}) {
    const targetElement = this.getTargetElement(animation);
    if (!targetElement) return;
    const elementsToAnimate = this.getElementsToAnimate(animation, targetElement, duration);
    elementsToAnimate.forEach((element) => {
      const progress = this.calculateAnimationProgress(
        elementsToAnimate,
        element,
        this.timePerFrameInMs,
        duration,
      );
      const scale = 1 + 0.1 * Math.sin(progress * Math.PI); // Breathe effect using sine wave
      element.placement.scaleX = scale;
      element.placement.scaleY = scale;
    });
    canvas.renderAll();
  }
  private animateFadeOut(
    animation: FadeOutAnimation,
    canvas: fabric.Canvas,
    { duration = 1000 } = {},
  ) {
    const targetElement = this.getTargetElement(animation);
    if (!targetElement) return;
    targetElement.opacity = 1;
    const elementsToAnimate = this.getElementsToAnimate(animation, targetElement, duration);
    elementsToAnimate.forEach((element) => {
      const progress = this.calculateAnimationProgress(
        elementsToAnimate,
        element,
        this.timePerFrameInMs,
        duration,
      );
      element.opacity = 1 - progress;
    });
  }
  private animateSlideIn(
    animation: SlideInAnimation,
    canvas: fabric.Canvas,
    { duration = 1000 } = {},
  ) {
    const targetElement = this.getTargetElement(animation);
    if (!targetElement) return;
    const { direction } = animation.properties;
    const startPosition = this.getSlideStartPosition(direction, targetElement, canvas);
    targetElement.placement.x = startPosition.left || 0;
    targetElement.placement.y = startPosition.top || 0;
    console.log(
      'startPosition:',
      startPosition,
      'targetPosition:',
      targetElement.placement,
      canvas.width,
      canvas.height,
    );
    const elementsToAnimate = this.getElementsToAnimate(animation, targetElement, duration);
    elementsToAnimate.forEach((element) => {
      const progress = this.calculateAnimationProgress(
        elementsToAnimate,
        element,
        this.timePerFrameInMs,
        duration,
      );
      element.placement.x =
        startPosition.left + (targetElement.placement.x - startPosition.left) * progress;
      element.placement.y =
        startPosition.top + (targetElement.placement.y - startPosition.top) * progress;
      console.log('element.placement:', element.placement, 'progress:', progress);
      this.editorStore?.updateElement(element.id, { placement: element.placement });
    });
  }
  private animateSlideOut(
    animation: SlideOutAnimation,
    canvas: fabric.Canvas,
    { duration = 1000 } = {},
  ) {
    const targetElement = this.getTargetElement(animation);
    if (!targetElement) return;
    const { direction } = animation.properties;
    const endPosition = this.getSlideEndPosition(direction, targetElement, canvas);
    const elementsToAnimate = this.getElementsToAnimate(animation, targetElement, duration);
    elementsToAnimate.forEach((element) => {
      const progress = this.calculateAnimationProgress(
        elementsToAnimate,
        element,
        this.timePerFrameInMs,
        duration,
      );
      element.placement.x =
        targetElement.placement.x + (endPosition.left - targetElement.placement.x) * progress;
      element.placement.y =
        targetElement.placement.y + (endPosition.top - targetElement.placement.y) * progress;
      this.editorStore?.updateElement(element.id, { placement: element.placement });
    });
  }
  private getTargetElement(animation: Animation): EditorElement | undefined {
    return this.editorStore?.elements.find((element) => element.id === animation.targetId);
  }
  private getElementsToAnimate(
    animation: Animation,
    targetElement: EditorElement,
    durationInMs: number,
  ): EditorElement[] {
    return (
      this.editorStore?.elements.filter(
        (ele) =>
          ele.id !== animation.targetId &&
          ele.timeFrame.start >= targetElement.timeFrame.start &&
          ele.timeFrame.end <= targetElement.timeFrame.end + durationInMs,
      ) || []
    );
  }
  private getSlideStartPosition(
    direction: SlideDirection,
    targetElement: EditorElement,
    canvas: fabric.Canvas,
  ) {
    const canvasWidth = canvas.width || 0;
    const canvasHeight = canvas.height || 0;
    const targetPosition = {
      left: targetElement.placement.x || 0,
      top: targetElement.placement.y || 0,
    };
    return {
      left:
        direction === 'left'
          ? -targetElement.placement.width
          : direction === 'right'
            ? canvasWidth
            : targetPosition.left,
      top:
        direction === 'top'
          ? -targetElement.placement.height
          : direction === 'bottom'
            ? canvasHeight
            : targetPosition.top,
    };
  }
  private getSlideEndPosition(
    direction: SlideDirection,
    targetElement: EditorElement,
    canvas: fabric.Canvas,
  ) {
    const canvasWidth = canvas.width || 0;
    const canvasHeight = canvas.height || 0;
    return {
      left:
        direction === 'left'
          ? -targetElement.placement.width
          : direction === 'right'
            ? canvasWidth
            : targetElement.placement.x,
      top:
        direction === 'top'
          ? -targetElement.placement.height
          : direction === 'bottom'
            ? canvasHeight
            : targetElement.placement.y,
    };
  }
  private calculateAnimationProgress(
    elementsToAnimate: EditorElement[],
    element: EditorElement,
    timePerFrameInMs: number,
    duration: number,
  ): number {
    const index = elementsToAnimate.indexOf(element);
    return ((index + 1) * timePerFrameInMs) / duration;
  }
  saveCurrentState() {
    const affectedElements = this.editorStore?.elements;
    if (!affectedElements) return;
    this.historyStore?.addState(affectedElements, this.animations);
  }
  refreshAnimations(canvas: fabric.Canvas): void {
    this.animations.forEach((animation) => {
      this.applyAnimation(animation, canvas);
    });
  }
  removeAnimation(id: string): void {
    this.animations = this.animations.filter((animation) => animation.id !== id);
    const historyState = this.historyStore?.deleteAndGetStateBeforeAnimation(id);
    if (historyState && this.editorStore) {
      this.editorStore.elements = [...historyState.elements];
      this.editorStore.frames = historyState.elements.map((el) => ({
        src: el.src,
        id: el.id,
      }));
      if (this.rootStore?.canvasRef.current)
        this.refreshAnimations(this.rootStore?.canvasRef.current);
    }
  }
  updateAnimation(id: string, updatedAnimation: Animation): void {
    const index = this.animations.findIndex((animation) => animation.id === id);
    if (index !== -1) {
      this.animations[index] = updatedAnimation;
      this.historyStore?.addState(this.editorStore?.elements || [], this.animations);
    }
  }
  undo() {
    this.historyStore?.undo();
  }
  redo() {
    this.historyStore?.redo();
  }
}
