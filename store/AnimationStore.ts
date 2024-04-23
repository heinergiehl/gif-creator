import { makeAutoObservable } from 'mobx';
import { Animation, EditorElement, SlideInAnimation, SlideOutAnimation } from '@/types';
import anime from 'animejs';
import { FabricUitls } from '@/utils/fabric-utils';
import { Object } from 'fabric/fabric-impl';
import { fabric } from 'fabric';
import { EditorStore } from './EditorStore';
export class AnimationStore {
  editorStore: EditorStore;
  animations: Animation[] = [];
  fps = 30;
  speedFactor = 1;
  currentTimeInMs = 0;
  isPaused = false;
  timePerFrameInMs: number = 1000 / this.fps;
  animationTimeLine = anime.timeline();
  constructor(editorStore: EditorStore) {
    this.editorStore = editorStore;
    makeAutoObservable(this);
  }
  addAnimation(animation: Animation) {
    this.animations = [...this.animations, animation];
    const editorElement = this.editorStore.elements.find(
      (element) => element.id === animation.targetId,
    );
    if (!editorElement) return;
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
      case 'fadeIn':
        this.animateFadeIn(undefined, editorElement.fabricObject, options);
        break;
      case 'fadeOut':
        this.animateFadeOut(undefined, editorElement.fabricObject, options);
        break;
      case 'slideIn':
        this.animateSlideIn(animation);
        break;
      case 'slideOut':
        this.animateSlideOut(animation as SlideOutAnimation, undefined, editorElement, options);
        break;
    }
    this.addCurrentGifFrameToCanvas();
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
    return this.editorStore.elements.find((element) => element.id === animation.targetId);
  }
  animateSlideIn(animation: SlideInAnimation, { duration = 1000 } = {}) {
    if (!this.editorStore.canvas) return;
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
      if (this.editorStore === null || !this.isValidFabricObject(this.editorStore.selectedElement))
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
    return this.editorStore.elements.filter(
      (ele) =>
        ele.id !== animation.targetId &&
        ele.timeFrame.start >= targetElement.timeFrame.start &&
        ele.timeFrame.end <= targetElement.timeFrame.end + durationInMs,
    );
  }
  private animateSlideOut(
    animation: SlideOutAnimation,
    editorElements?: EditorElement[],
    editorElement?: EditorElement,
    { duration = 1000 } = {},
  ) {
    if (!this.editorStore.canvas) return;
    if (editorElements && editorElements.length > 0 && editorElements !== undefined) {
      const targetElement = editorElements.find((element) => element.id === animation.targetId);
      const targetPosition = {
        left: targetElement?.placement.x,
        top: targetElement?.placement.y,
      };
      const direction = animation.properties.direction;
      if (!targetPosition) return;
      if (!targetElement) return;
      if (!this.editorStore.canvas.width) return;
      if (!this.editorStore.canvas.height) return;
      const startPosition = {
        left:
          direction === 'left'
            ? -targetElement?.placement.width
            : direction === 'right'
              ? this.editorStore.canvas.width + targetElement?.placement.width
              : targetElement?.placement.x,
        top:
          direction === 'top'
            ? -targetElement?.placement.height
            : direction === 'bottom'
              ? this.editorStore.canvas.height + targetElement?.placement.height
              : targetElement?.placement.y,
      };
      this.animationTimeLine.add({
        targets: editorElements.map((element) => element.fabricObject),
        easing: 'easeOutExpo',
        duration: animation.duration,
        left: [targetPosition.left, startPosition.left],
        top: [targetPosition.top, startPosition.top],
        autoplay: false,
        update: (anim) => {
          const progress = (this.editorStore.currentKeyFrame + 1) / this.editorStore.frames.length;
          if (animation.properties.useClipPath) {
            const clipPath = FabricUitls.getClipMaskRect(
              editorElements[this.editorStore.currentKeyFrame],
              50 * progress,
            );
            editorElements[this.editorStore.currentKeyFrame].fabricObject?.set(
              'clipPath',
              clipPath,
            );
          }
          if (
            !startPosition.left ||
            !startPosition.top ||
            !targetPosition.left ||
            !targetPosition.top
          )
            return;
          const left = startPosition.left + (targetPosition.left - startPosition.left) * progress;
          const top = startPosition.top + (targetPosition.top - startPosition.top) * progress;
          if (editorElements.length < this.editorStore.currentKeyFrame + 1) return;
          editorElements[this.editorStore.currentKeyFrame].fabricObject?.set({
            left,
            top,
          });
          if (this.isPaused) anim.pause();
        },
        complete: () => {
          editorElements.forEach((element) => {
            element.fabricObject?.set({
              left: startPosition.left,
              top: startPosition.top,
            });
          });
          this.animationTimeLine.seek(this.currentTimeInMs);
        },
      });
    }
  }
  addCurrentGifFrameToCanvas() {
    const elements = this.editorStore.elements;
    if (elements.length === 0) {
      return;
    }
    const els: EditorElement[] = elements.filter((element) => element !== undefined);
    this.editorStore.selectedElement = els[this.editorStore.currentKeyFrame];
    const placementBeforeAnimation = els[this.editorStore.currentKeyFrame].fabricObject;
    const fabObject = els[this.editorStore.currentKeyFrame].fabricObject;
    this.editorStore.canvas?.clear();
    if (fabObject !== undefined) {
      if (this.animations.length > 0) {
        this.animations.forEach((animation) => {
          this.applyAnimation(animation, animation.type, animation.duration, 0);
          this.editorStore.canvas?.add(fabObject);
        });
      } else {
        if (fabObject) {
          fabObject.set({
            top: placementBeforeAnimation.top,
            left: placementBeforeAnimation.left,
            width: placementBeforeAnimation.getScaledWidth(),
            height: placementBeforeAnimation.getScaledHeight(),
            scaleX: placementBeforeAnimation.scaleX,
            scaleY: placementBeforeAnimation.scaleY,
          });
          fabObject.setCoords();
          this.editorStore.canvas?.add(fabObject);
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
        this.editorStore.canvas?.add(element.fabricObject);
      }
    });
    this.editorStore.canvas?.renderAll();
  }
  private animateFadeIn(
    fabricObjects?: Object[],
    fabricObject?: Object,
    { duration = 1000, startTime = 0 } = {},
  ) {
    if (!this.editorStore.canvas) return;
    if (fabricObjects && fabricObjects.length > 0 && fabricObject === undefined) {
      this.animationTimeLine.add(
        {
          targets: fabricObjects,
          opacity: [0, 1],
          duration: duration,
          easing: 'linear',
          autoplay: false,
          update: (anim) => {
            const currentProgress =
              (this.editorStore.currentKeyFrame + 1) / this.editorStore.frames.length;
            console.log('currentProgress70', anim.progress, currentProgress, anim);
            fabricObjects[this.editorStore.currentKeyFrame].set('opacity', currentProgress);
            if (this.isPaused) anim.pause();
          },
        },
        startTime,
      );
    }
    // for single object
    if (fabricObject && fabricObjects?.length === 0) {
      fabricObject.set('opacity', 0);
      fabricObject.animate('opacity', 1, {
        duration,
        onChange: this.editorStore.canvas.renderAll.bind(this.editorStore.canvas),
      });
    }
  }
  private animateFadeOut(
    fabricObjects?: Object[],
    fabricObject?: Object,
    { duration = 1000 } = {},
  ) {
    if (!this.editorStore.canvas) return;
    if (fabricObject && fabricObjects?.length === 0) {
      fabricObject.set('opacity', 1);
      fabricObject.animate('opacity', 0, {
        duration,
        onChange: this.editorStore.canvas.renderAll.bind(this.editorStore.canvas),
      });
    }
    // if  multiple objects are passed, then make sure to gradually fade out all of them
    if (fabricObjects && fabricObjects.length > 0 && fabricObject === undefined) {
      this.animationTimeLine.add({
        targets: fabricObjects,
        opacity: [1, 0],
        duration: duration,
        easing: 'linear',
        autoplay: false,
        update: (anim) => {
          const currentProgress = this.editorStore.currentKeyFrame / this.editorStore.frames.length;
          fabricObjects[this.editorStore.currentKeyFrame].set('opacity', currentProgress);
          if (this.isPaused) anim.pause();
        },
      });
    }
  }
  removeAnimation(id: string): void {
    this.animations = this.animations.filter((animation) => animation.id !== id);
    this.addCurrentGifFrameToCanvas();
  }
  updateAnimation(id: string, updatedAnimation: Animation): void {
    const index = this.animations.findIndex((animation) => animation.id === id);
    if (index !== -1) {
      this.animations[index] = updatedAnimation;
    }
  }
  public refreshAnimations(): void {
    // anime.remove(this.animationTimeLine)
    // this.animationTimeLine = anime.timeline()
    const elements = this.editorStore.elements;
    if (this.isPaused && this.editorStore.currentKeyFrame < this.editorStore.frames.length) {
      return this.animationTimeLine.seek(this.currentTimeInMs);
    }
    this.animations.forEach((animation) => {
      const targetElement = elements.find((element) => element.id === animation.targetId);
      if (!targetElement) return;
      const startTime = targetElement.timeFrame.start;
      const duration = animation.duration;
      // Find all elements that are affected by this animation
      const affectedObjectsInFrame = elements.filter(
        (element) => element.timeFrame.start >= startTime && element.isFrame === false,
      );
      this.applyAnimation(
        animation,
        animation.type,
        duration,
        startTime,
        undefined,
        affectedObjectsInFrame,
      );
    });
  }
  private applyAnimation(
    animation: Animation,
    type: string,
    duration: number,
    startTime: number,
    element?: EditorElement,
    elements?: EditorElement[],
  ): void {
    const canvas = this.editorStore.canvas;
    if (!canvas) return;
    const editorElements = this.editorStore.elements;
    switch (type) {
      case 'fadeIn':
        if (elements !== undefined && elements[0] !== undefined) {
          const fabriObjects = elements
            .filter((fabObj) => fabObj.fabricObject !== undefined)
            .map((element) => element.fabricObject!);
          this.animateFadeIn(fabriObjects, undefined, { duration, startTime });
        }
        break;
      case 'fadeOut':
        if (element !== undefined && element.fabricObject !== undefined) {
          this.animateFadeOut(undefined, element.fabricObject, { duration });
        }
        if (elements !== undefined && elements[0] !== undefined) {
          const fabriObjects = elements
            .filter((fabObj) => fabObj.fabricObject !== undefined)
            .map((element) => element.fabricObject!);
          this.animateFadeOut(fabriObjects, undefined, { duration });
        }
        break;
      case 'slideIn':
        this.animateSlideIn(animation as SlideInAnimation);
        break;
    }
    canvas.requestRenderAll();
  }
}
