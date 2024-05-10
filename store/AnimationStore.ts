import { makeAutoObservable } from 'mobx';
import {
  Animation,
  EditorElement,
  FadeInAnimation,
  FadeOutAnimation,
  SlideInAnimation,
  SlideOutAnimation,
} from '@/types';
import { EditorStore } from './EditorStore';
import { HistoryStore } from './HistoryStore';
export class AnimationStore {
  editorStore?: EditorStore;
  private historyStore?: HistoryStore;
  animations: Animation[] = [];
  fps = 4;
  speedFactor = 1;
  currentTimeInMs = 0;
  isPaused = false;
  timePerFrameInMs: number = 1000 / this.fps;
  constructor() {
    makeAutoObservable(this);
  }
  initialize(editorStore: EditorStore, historyStore: HistoryStore): void {
    this.editorStore = editorStore;
    this.historyStore = historyStore;
  }
  addAnimation(animation: Animation) {
    this.animations = [...this.animations, animation];
    this.saveCurrentState();
    if (this.editorStore?.canvas) {
      {
        const editorElement = this.editorStore.elements.find(
          (element) => element.id === animation.targetId,
        );
        if (!editorElement) return;
      }
      const animationType = animation.type;
      const options = {
        duration: animation.duration,
      };
      // if targetElement is a frame, then make sure to update the placement of it so it has the correct dimensions, not just height and width of 100
      //but 100% of the canvas
      const targetElement = this.editorStore.elements.find(
        (element) => element.id === animation.targetId,
      );
      // update also subsequent elements that are within the the duration of the animation
      if (!targetElement) return;
      const elementsWithinCurrentTimeFrame = this.editorStore.elements.filter(
        (element) => targetElement?.timeFrame.end + animation.duration >= element.timeFrame.start,
      );
      if (!this.historyStore) return;
      this.historyStore.addState(this.editorStore.elements, this.animations);
      if (
        targetElement &&
        targetElement.isFrame &&
        targetElement.fabricObject &&
        targetElement.fabricObject.width &&
        targetElement.fabricObject.height &&
        targetElement.fabricObject.scaleX &&
        targetElement.fabricObject.scaleY
      ) {
        targetElement.placement.width =
          targetElement.fabricObject?.width * targetElement.fabricObject.scaleX ?? 0;
        targetElement.placement.height =
          targetElement.fabricObject?.height * targetElement.fabricObject.scaleY ?? 0;
      }
      if (!elementsWithinCurrentTimeFrame) return;
      elementsWithinCurrentTimeFrame.forEach((element) => {
        if (element.id === animation.targetId) return;
        if (
          element.fabricObject &&
          element.fabricObject.width &&
          element.fabricObject.height &&
          element.fabricObject.scaleX &&
          element.fabricObject.scaleY
        ) {
          element.placement.width = element.fabricObject?.width * element.fabricObject.scaleX;
          element.placement.height = element.fabricObject?.height * element.fabricObject.scaleY;
        }
      });
      // update the elements that are affected by the animation
      this.editorStore.elements = this.editorStore.elements.map((element) => {
        if (targetElement.id === animation.targetId) return element;
        if (
          !element.fabricObject?.width ||
          !element.fabricObject?.height ||
          !element.fabricObject?.scaleX ||
          !element.fabricObject?.scaleY
        )
          return element;
        return {
          ...element,
          placement: {
            ...element.placement,
            width: element.fabricObject?.width * element.fabricObject.scaleX ?? 0,
            height: element.fabricObject?.height * element.fabricObject.scaleY ?? 0,
          },
        };
      });
      switch (animationType) {
        case 'slideIn':
          this.animateSlideIn(animation as SlideInAnimation, options);
          break;
        case 'slideOut':
          this.animateSlideOut(animation);
          break;
        case 'fadeOut':
          this.animateFadeOut(animation as FadeOutAnimation, options);
          break;
        case 'fadeIn':
          this.animateFadeIn(animation);
          break;
        case 'breathe':
          this.animateBreathe(animation);
          break;
      }
      this.addCurrentGifFrameToCanvas();
    }
    console.log('animations', this.animations);
  }
  private animateFadeIn(animation: FadeInAnimation, { duration = 1000 } = {}) {
    if (!this.editorStore?.canvas) return;
    const targetElement = this.getTargetElement(animation);
    if (!targetElement) return;
    // now get all the elements that come after the target element and are within the duration of the animation
    targetElement.fabricObject?.set({ opacity: 0 });
    const elementsToAnimate = this.getElementsToAnimate(animation, targetElement, duration);
    elementsToAnimate.forEach((element) => {
      if (
        this.editorStore === null ||
        !this.editorStore?.selectedElement ||
        !this.isValidFabricObject(this.editorStore.selectedElement)
      )
        return;
      if (this.editorStore?.selectedElement.id !== element.id) return;
      const progress = this.calculateAnimationProgress(
        elementsToAnimate,
        this.editorStore.selectedElement,
        this.timePerFrameInMs,
        duration,
      );
      const opacity = progress;
      this.editorStore.selectedElement.fabricObject?.set({ opacity });
    });
  }
  private animateBreathe(animation: Animation, { duration = 1000 } = {}) {
    if (!this.editorStore?.canvas) return;
    const targetElement = this.getTargetElement(animation);
    // let it grow and shrink
    if (!targetElement) return;
    const elementsToAnimate = this.getElementsToAnimate(animation, targetElement, duration);
    elementsToAnimate.forEach((element, index) => {
      if (this.editorStore === null || !this.isValidFabricObject(element)) return;
      const progress = this.calculateAnimationProgress(
        elementsToAnimate,
        element,
        this.timePerFrameInMs,
        duration,
      );
      const scale = 1 + progress;
      this.editorStore?.elements[index].fabricObject?.set({ scaleX: scale, scaleY: scale });
    });
  }
  private animateFadeOut(animation: Animation, { duration = 1000 } = {}) {
    if (!this.editorStore?.canvas) return;
    const targetElement = this.getTargetElement(animation);
    if (!targetElement) return;
    targetElement.fabricObject?.set({ opacity: 1 });
    const elementsToAnimate = this.getElementsToAnimate(animation, targetElement, duration);
    elementsToAnimate.forEach((element) => {
      if (
        this.editorStore === null ||
        this.editorStore?.selectedElement === undefined ||
        !this.isValidFabricObject(this.editorStore?.selectedElement)
      )
        return;
      if (this.editorStore?.selectedElement.id !== element.id) return;
      const progress = this.calculateAnimationProgress(
        elementsToAnimate,
        this.editorStore.selectedElement,
        this.timePerFrameInMs,
        duration,
      );
      const opacity = 1 - progress;
      this.editorStore.selectedElement.fabricObject?.set({ opacity });
    });
  }
  /**
   * This method retrieves the target element of a given animation from the editor store.
   *
   * @param animation - The animation object containing the targetId.
   * @returns The target element if found, otherwise undefined.
   *
   * The target element is an EditorElement which contains the fabric object that is the target of the animation.
   * Based on this target element, subsequent elements that are within the duration of the animation are updated.
   */
  private getTargetElement(animation: Animation): EditorElement | undefined {
    return this.editorStore?.elements.find((element) => element.id === animation.targetId);
  }
  animateSlideIn(animation: SlideInAnimation, { duration = 1000 } = {}) {
    if (!this.editorStore?.canvas) return;
    const targetElement = this.getTargetElement(animation);
    if (!targetElement) return;
    if (!targetElement || !targetElement.placement) return;
    const canvasWidth = this.editorStore.canvas.width ?? 0;
    const canvasHeight = this.editorStore.canvas.height ?? 0;
    const direction = animation.properties.direction;
    const targetPosition = {
      left: targetElement.placement.x,
      top: targetElement.placement.y,
    };
    const startPosition = {
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
    if (!targetPosition) return;
    if (!targetElement) return;
    if (!this.editorStore.canvas.width) return;
    if (!this.editorStore.canvas.height) return;
    targetElement.fabricObject?.set({
      left: startPosition.left,
      top: startPosition.top,
    });
    const elementsToAnimate = this.getElementsToAnimate(animation, targetElement, duration);
    elementsToAnimate.forEach((element) => {
      if (
        this.editorStore === null ||
        this.editorStore?.selectedElement === undefined ||
        !this.isValidFabricObject(this.editorStore?.selectedElement)
      )
        return;
      if (this.editorStore.selectedElement.id !== element.id) return;
      const progress = this.calculateAnimationProgress(
        elementsToAnimate,
        this.editorStore.selectedElement,
        this.timePerFrameInMs,
        duration,
      );
      const left = startPosition.left + (targetPosition.left - startPosition.left) * progress;
      const top = startPosition.top + (targetPosition.top - startPosition.top) * progress;
      if (!this.editorStore.selectedElement.fabricObject) return;
      this.editorStore.selectedElement.fabricObject.set({ left, top });
    });
  }
  /**
   * This function calculates the animation progress based on the current element's index, time per frame, and total duration.
   *
   * @param elementsToAnimate - The array of elements to animate.
   * @param selectedElement - The currently selected element.
   * @param timePerFrameInMs - The time per frame in milliseconds.
   * @param duration - The total duration of the animation in milliseconds.
   * @returns The calculated animation progress.
   */
  private calculateAnimationProgress(
    elementsToAnimate: EditorElement[],
    selectedElement: EditorElement,
    timePerFrameInMs: number,
    duration: number,
  ): number {
    const index = elementsToAnimate.indexOf(selectedElement);
    console.log('index', index, 'timePerFrameInMs', timePerFrameInMs, 'duration', duration);
    return ((index + 1) * timePerFrameInMs) / duration;
  }
  private isValidFabricObject(element: EditorElement | null): element is EditorElement {
    return element !== null && element.fabricObject !== undefined;
  }
  private getElementsToAnimate(
    animation: Animation,
    targetElement: EditorElement,
    durationInMs: number,
  ): EditorElement[] {
    if (this.editorStore === undefined) {
      console.warn('Editor store is undefined');
      return [];
    }
    return this.editorStore.elements.filter(
      (ele) =>
        ele.id !== animation.targetId &&
        ele.timeFrame.start >= targetElement.timeFrame.start &&
        ele.timeFrame.end <= targetElement.timeFrame.end + durationInMs,
    );
  }
  private animateSlideOut(animation: SlideOutAnimation, { duration = 1000 } = {}) {
    if (!this.editorStore?.canvas) return;
    const targetElement = this.getTargetElement(animation);
    if (!targetElement || !targetElement.placement) {
      console.warn('No target element found for slide out animation');
      return;
    }
    const canvasWidth = this.editorStore.canvas.width ?? 0;
    const canvasHeight = this.editorStore.canvas.height ?? 0;
    const direction = animation.properties.direction;
    const targetPosition = {
      left: targetElement.placement.x,
      top: targetElement.placement.y,
    };
    const endPosition = {
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
    if (!targetPosition) {
      console.warn('No target position found for slide out animation');
      return;
    }
    if (!this.editorStore.canvas) {
    }
    targetElement.fabricObject?.set({
      left: targetPosition.left,
      top: targetPosition.top,
    });
    const elementsToAnimate = this.getElementsToAnimate(animation, targetElement, duration);
    if (elementsToAnimate.length === 0) {
      console.warn('No elements to animate found for slide out animation');
      return;
    }
    if (this.editorStore?.selectedElement === null) {
      console.warn('No selected element found for slide out animation');
      return;
    }
    const progress = this.calculateAnimationProgress(
      elementsToAnimate,
      this.editorStore.selectedElement,
      this.timePerFrameInMs,
      duration,
    );
    const left = targetPosition.left + (endPosition.left - targetPosition.left) * progress;
    const top = targetPosition.top + (endPosition.top - targetPosition.top) * progress;
    if (!this.editorStore.selectedElement.fabricObject) {
      console.warn('No fabric object found for selected element');
      return;
    }
    console.log('left', left, 'top', top, 'progress', progress);
    this.editorStore.selectedElement.fabricObject.set({ left, top });
  }
  addCurrentGifFrameToCanvas() {
    const elements = this.editorStore?.elements;
    if (!elements || !this.editorStore?.canvas) return;
    if (elements.length === 0) {
      return;
    }
    const els: EditorElement[] = elements.filter((element) => element !== undefined);
    console.log('elements', els, this.editorStore.currentKeyFrame);
    this.editorStore.selectedElement = els[this.editorStore.currentKeyFrame];
    if (!this.editorStore.selectedElement) {
      console.warn('No selected element found for current keyframe');
      return;
    }
    if (elements[this.editorStore.currentKeyFrame] == undefined) {
      console.warn('No element found for current keyframe');
      return;
    }
    const fabObject = els[this.editorStore.currentKeyFrame].fabricObject;
    if (!fabObject) {
      console.warn(
        'No fabric object found for current keyframe:',
        this.editorStore.currentKeyFrame,
      );
      return;
    }
    this.editorStore.canvas?.clear();
    if (fabObject !== undefined) {
      if (this.animations.length > 0) {
        this.animations.forEach((animation) => {
          this.applyAnimation(animation, animation.type);
          this.editorStore?.canvas?.add(fabObject);
          console.log('ANIMAtions APPLIED');
        });
      } else {
        if (fabObject) {
          // fabObject.set({
          //   top: placementBeforeAnimation.top,
          //   left: placementBeforeAnimation.left,
          //   width: placementBeforeAnimation.getScaledWidth(),
          //   height: placementBeforeAnimation.getScaledHeight(),
          //   scaleX: placementBeforeAnimation.scaleX,
          //   scaleY: placementBeforeAnimation.scaleY,
          // });
          // fabObject.setCoords();
          this.editorStore.canvas?.add(fabObject);
          // apply filters
        }
      }
      // update the frames array. currently it contains the inital images of each frame of a video.
      // this is used to generate the gif
      // but when using fabricjs to add text or edit this image on the canvas, we need to update the frames array, meaning getting a new dataURL of the canvas and use it as frame
    }
    const timeFrameOfCurrentKeyFrame = elements[this.editorStore.currentKeyFrame].timeFrame;
    const otherEditorElements = elements.filter((element) => element.isFrame === false);
    const editorElementsWithinCurrentTimeFrame = otherEditorElements.filter((element) => {
      return (
        element.timeFrame.start <= timeFrameOfCurrentKeyFrame.start &&
        element.timeFrame.end >= timeFrameOfCurrentKeyFrame.end
      );
    });
    editorElementsWithinCurrentTimeFrame.forEach((element) => {
      if (element.fabricObject) {
        this.editorStore?.canvas?.add(element.fabricObject);
      }
    });
    this.editorStore.canvas?.renderAll();
  }
  removeAnimation(id: string): void {
    this.historyStore?.undo();
    this.animations = this.animations.filter((animation) => animation.id !== id);
    this.addCurrentGifFrameToCanvas();
  }
  removeAnimationsByTargetId(targetId: string): void {
    this.historyStore?.undo();
    this.animations = this.animations.filter((animation) => animation.targetId !== targetId);
    this.addCurrentGifFrameToCanvas();
  }
  updateAnimation(id: string, updatedAnimation: Animation): void {
    const index = this.animations.findIndex((animation) => animation.id === id);
    if (index !== -1) {
      this.animations[index] = updatedAnimation;
    }
  }
  saveCurrentState() {
    // Assuming we want to save the state of all elements for broader undo functionality
    const affectedElements = this.editorStore?.elements; // Capture state of all elements
    if (!affectedElements) return;
    this.historyStore?.addState(affectedElements, this.animations);
  }
  public refreshAnimations(): void {
    // anime.remove(this.animationTimeLine)
    // this.animationTimeLine = anime.timeline()
    const elements = this.editorStore?.elements;
    this.animations.forEach((animation) => {
      const targetElement = elements?.find((element) => element.id === animation.targetId);
      if (!targetElement) return;
      const startTime = targetElement.timeFrame.start;
      const duration = animation.duration;
      // Find all elements that are affected by this animation
      const affectedObjectsInFrame = elements?.filter(
        (element) => element.timeFrame.start >= startTime && element.isFrame === false,
      );
      const totalElements = [targetElement, ...(affectedObjectsInFrame || [])];
      if (this.editorStore?.canvas)
        this.historyStore?.addState(this.editorStore.elements, this.animations);
      this.applyAnimation(animation, animation.type);
      if (this.editorStore?.canvas)
        this.historyStore?.addState(this.editorStore.elements, this.animations);
    });
  }
  private applyAnimation(animation: Animation, type: string): void {
    const canvas = this.editorStore?.canvas;
    if (!canvas) return;
    switch (type) {
      case 'slideIn':
        this.animateSlideIn(animation as SlideInAnimation);
        break;
      case 'slideOut':
        this.animateSlideOut(animation as SlideOutAnimation);
        break;
      case 'fadeOut':
        this.animateFadeOut(animation);
        break;
      case 'fadeIn':
        this.animateFadeIn(animation as FadeInAnimation);
        break;
      case 'breathe':
        this.animateBreathe(animation);
        break;
    }
    canvas.requestRenderAll();
  }
  undo() {
    if (this.editorStore?.canvas) this.historyStore?.undo();
  }
  redo() {
    if (this.editorStore?.canvas) this.historyStore?.redo();
  }
}
