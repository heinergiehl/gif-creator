import { makeAutoObservable } from "mobx"
import { AnimationStore } from "./AnimationStore"
import { EditorElement, TimeFrame } from "@/types"
export class TimelineStore {
  animationStore: AnimationStore
  constructor(animationStore: AnimationStore) {
    this.animationStore = animationStore
    makeAutoObservable(this)
  }
  updateEditorElementTimeFrame(
    editorElement: EditorElement,
    timeFrame: Partial<TimeFrame>
  ) {
    if (timeFrame.start != undefined && timeFrame.start < 0) {
      timeFrame.start = 0
    }
    if (
      timeFrame.end != undefined &&
      timeFrame.end > this.animationStore.editorStore.maxTime
    ) {
      timeFrame.end = this.animationStore.editorStore.maxTime
    }
    const newEditorElement = {
      ...editorElement,
      timeFrame: {
        ...editorElement.timeFrame,
        ...timeFrame,
      },
    }
    // this.updateVideoElements()
    this.animationStore.editorStore.updateEditorElement(newEditorElement)
    this.animationStore.addCurrentGifFrameToCanvas()
    this.animationStore.refreshAnimations()
  }
  formatCurrentTime() {
    const frameTimeInSeconds =
      this.animationStore.editorStore.currentKeyFrame / this.animationStore.fps
    const totalTimeInSeconds =
      this.animationStore.editorStore.frames.length / this.animationStore.fps
    // format in ss:ms, no decimal places after ms
    const seconds = Math.floor(frameTimeInSeconds % 60)
    const ms = Math.floor((frameTimeInSeconds * 1000) % 1000)
    this.animationStore.editorStore.currentTimeInMs = frameTimeInSeconds * 1000
    const totalSeconds = Math.floor(totalTimeInSeconds % 60)
    const totalMs = Math.floor((totalTimeInSeconds * 1000) % 1000)
    this.animationStore.editorStore.maxTime = totalTimeInSeconds * 1000
    // format to have 09 instead of 9
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`
    const formattedMs = ms < 10 ? `0${ms}` : `${ms}`
    const formattedTotalSeconds =
      totalSeconds < 10 ? `0${totalSeconds}` : `${totalSeconds}`
    const formattedTotalMs = totalMs < 10 ? `0${totalMs}` : `${totalMs}`
    return `${formattedSeconds}s:${formattedMs}ms / ${formattedTotalSeconds}s:${formattedTotalMs}ms`
  }
  playSequence() {
    const isPlaying = this.animationStore.editorStore.isPlaying
    if (isPlaying) {
      if (this.animationStore.editorStore.playInterval !== null) {
        clearInterval(this.animationStore.editorStore.playInterval)
        if (this.animationStore.editorStore.isPaused)
          this.animationStore.animationTimeLine.pause()
      }
      this.animationStore.editorStore.isPlaying = false
      this.animationStore.editorStore.playInterval = null
    } else {
      this.animationStore.editorStore.isPlaying = true
      let currentFrame = this.animationStore.editorStore.currentKeyFrame
      this.animationStore.editorStore.playInterval = setInterval(() => {
        if (currentFrame < this.animationStore.editorStore.frames.length) {
          this.animationStore.editorStore.currentKeyFrame = currentFrame
          this.animationStore.addCurrentGifFrameToCanvas()
          currentFrame++
        } else {
          if (this.animationStore.editorStore.playInterval !== null)
            clearInterval(this.animationStore.editorStore.playInterval)
          this.animationStore.editorStore.isPlaying = false
          this.animationStore.editorStore.currentKeyFrame = 0
          this.animationStore.animationTimeLine.pause()
          this.animationStore.addCurrentGifFrameToCanvas()
        }
      }, 1000 / this.animationStore.fps / this.animationStore.speedFactor) // This aligns with the playback speed
    }
  }
}
