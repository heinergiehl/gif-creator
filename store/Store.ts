import { makeAutoObservable, observable } from "mobx"
import { fabric } from "fabric"
import {
  getUid,
  isHtmlAudioElement,
  isHtmlImageElement,
  isHtmlVideoElement,
} from "@/utils"
import anime from "animejs"
import { MenuOption, EditorElement, Animation } from "@/types"
import { FabricUitls } from "@/utils/fabric-utils"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { toBlobURL } from "@ffmpeg/util"
import GIF from "@/dist/gif.js"
export type VideoFrame = {
  src: string
  nestedObjects: { id: string }[]
}
export class Store {
  _canvas: fabric.Canvas | null
  backgroundColor: string
  selectedMenuOption: MenuOption
  audios: string[]
  videos: string[]
  images: string[]
  videoFrames: VideoFrame[]
  _imageObject: fabric.Image | null
  _editorElements: EditorElement[]
  _selectedElement: EditorElement | null
  maxTime: number
  animations: Animation[]
  playing: boolean
  currentKeyFrame: number
  fps: number
  possibleVideoFormats: string[] = ["mp4", "webm"]
  selectedVideoFormat: "mp4" | "webm"
  playInterval: NodeJS.Timeout | null
  speedFactor: number
  _creatingGifFrames: boolean
  textColor: string
  textFont: string
  imageResources: string[]
  gifQuality: number = 10
  constructor() {
    this._canvas = null
    this.textColor = "black"
    this.textFont = "Comic Sans MS"
    this.selectedMenuOption = "Text"
    this._creatingGifFrames = false
    this.speedFactor = 1
    this.playInterval = null
    this.videos = []
    this.images = []
    this.videoFrames = []
    this.audios = []
    this._imageObject = null
    this._editorElements = []
    this.backgroundColor = "green"
    this.maxTime = 30 * 1000
    this.playing = false
    this.currentKeyFrame = 0
    this._selectedElement = null
    this.fps = 24
    this.animations = []
    // this.animationTimeLine = anime.timeline()
    this.selectedMenuOption = "Video"
    this.selectedVideoFormat = "mp4"
    this.imageResources = []
    makeAutoObservable(this)
  }
  set canvas(canvas: fabric.Canvas | null) {
    this._canvas = canvas
    if (this._canvas) {
      this._canvas.backgroundColor = this.backgroundColor
    }
  }
  set creatingGifFrames(isCreatingGifFrames: boolean) {
    this._creatingGifFrames = isCreatingGifFrames
  }
  get creatingGifFrames() {
    return this._creatingGifFrames
  }
  get canvas() {
    return this._canvas
  }
  setSelectedMenuOption(selectedMenuOption: MenuOption) {
    this.selectedMenuOption = selectedMenuOption
  }
  setPlaying(playing: boolean) {
    this.playing = playing
  }
  setCurrentKeyFrame(frame: number) {
    this.currentKeyFrame = frame
  }
  addEditorElement(element: EditorElement, isResource = false) {
    this._selectedElement =
      this._editorElements[this._editorElements.length - 1]
    this._editorElements = [...this._editorElements, element]
    if (isResource && element.type === "image") {
      const currentVideoFrame = this.frames[this.currentKeyFrame]
      currentVideoFrame.nestedObjects.push({ id: element.id })
      const fabricImage = this.createFabricImage(
        document.getElementById(
          element.properties.elementId
        ) as HTMLImageElement
      )
      element.fabricObject = fabricImage
      this._editorElements[this._editorElements.length - 1] = element
      if (fabricImage) this.canvas?.add(fabricImage)
      element.fabricObject = fabricImage
    }
    //text
    else if (element.type === "text") {
      const text = new fabric.IText(element.properties.text, {
        fontSize: element.properties.fontSize,
        fontWeight: element.properties.fontWeight,
        fill: this.textColor,
        fontFamily: this.textFont,
      })
      element.fabricObject = text
      this._editorElements[this._editorElements.length - 1] = element
      this.canvas?.add(text)
    } else {
      this.refreshElements()
    }
    this.canvas?.renderAll()
  }
  clearEditorElements() {
    this._editorElements = []
  }
  get selectedElement() {
    return this._selectedElement
  }
  set selectedElement(selectedElement: EditorElement | null) {
    this._selectedElement = selectedElement
    if (this._canvas) {
      if (selectedElement?.fabricObject) {
        this._canvas.setActiveObject(selectedElement.fabricObject)
      } else this._canvas.discardActiveObject()
    }
    console.log("selectedElement", this._selectedElement)
  }
  getSelectedElementByIndex(index: number) {
    return this._editorElements[index]
  }
  updateSelectedElement() {
    this._selectedElement =
      this._editorElements.find(
        (element) => element.id === this._selectedElement?.id
      ) ?? null
  }
  set frames(frames: VideoFrame[]) {
    this.videoFrames = frames
  }
  get frames() {
    return this.videoFrames
  }
  addImage(index: number, isResource: boolean = false) {
    let imageElement: HTMLElement | null = null
    if (isResource) {
      imageElement = document.getElementById(`imageResource-${index}`)
    } else {
      imageElement = document.getElementById(`image-${index}`)
    }
    console.log("imageElement", imageElement)
    if (!isHtmlImageElement(imageElement)) {
      return
    }
    const aspectRatio = imageElement.naturalWidth / imageElement.naturalHeight
    const canvasWidth = this._canvas?.width || 800 // Default to 800 if canvas is not initialized
    const canvasHeight = this._canvas?.height || 500 // Default to 500 if canvas is not initialized
    // Calculate the scale for the image to fit the canvas
    const scaleX = canvasWidth / imageElement.naturalWidth
    const scaleY = canvasHeight / imageElement.naturalHeight
    const scaleToFit = Math.min(scaleX, scaleY, 1) // Ensure scale is not more than 1 to avoid enlarging the image
    // Use the scale to calculate the actual dimensions to fit the canvas
    const imageWidth = imageElement.naturalWidth * scaleToFit
    const imageHeight = imageElement.naturalHeight * scaleToFit
    // Center the image on the canvas
    const left = canvasWidth / 2
    const top = canvasHeight / 2
    const id = getUid()
    this.addEditorElement(
      {
        id,
        name: `Media(image) ${index}`,
        type: "image",
        placement: {
          x: left,
          y: top,
          width: imageWidth,
          height: imageHeight,
          rotation: 0,
          scaleX: scaleToFit / 2,
          scaleY: scaleToFit / 2,
        },
        timeFrame: {
          start: 0,
          end: this.maxTime,
        },
        properties: {
          elementId: isResource ? `imageResource-${index}` : `image-${index}`,
          src: imageElement.src,
          effect: {
            type: "none",
          },
        },
      },
      isResource
    )
  }
  set editorElements(editorElements: EditorElement[]) {
    console.log("editorElements", editorElements)
    this._editorElements = editorElements
    this.updateSelectedElement()
    // this.refreshAnimations();
  }
  getEditorElements() {
    return this.editorElements
  }
  updateEditorElement(editorElement: EditorElement) {
    this._editorElements = this._editorElements.map((element) => {
      console.log(element.id === editorElement.id)
      return element.id === editorElement.id ? editorElement : element
    })
    this.canvas?.renderAll()
  }
  set imageObject(imageObject: fabric.Image) {
    if (!this._selectedElement) return
    this._imageObject = imageObject
  }
  getEditorElementByIndex(index: number) {
    console.log(this._editorElements, index)
    return this._editorElements[index]
  }
  refreshElements() {
    this._editorElements.forEach((editorElement) => {
      switch (editorElement.type) {
        case "image":
          if (!editorElement.fabricObject) {
            const imgElement = document.getElementById(
              editorElement.properties.elementId
            ) as HTMLImageElement
            if (imgElement) {
              // editorElement.fabricObject = this.createFabricImage(imgElement)
              const fabricObject = this.createFabricImage(imgElement)
              editorElement.fabricObject = fabricObject
              console.log("YOOOOOOOOO69")
              this.addFabricObjectToCanvas()
            }
            break
          } else {
            this.addFabricObjectToCanvas()
          }
      }
    })
    // const editorElement = this.getEditorElementByIndex(index)
    // if (!editorElement) {
    //   console.error("No editor element found at index: " + index)
    //   return
    // }
    // if (!editorElement.fabricObject) {
    //   // If the fabric object does not exist yet, create it
    //   const imgElement = document.getElementById(
    //     editorElement.properties.elementId
    //   ) as HTMLImageElement
    //   if (imgElement) {
    //     editorElement.fabricObject = this.createFabricImage(imgElement)
    //   }
    // } else {
    //   this.addFabricObjectToCanvas(editorElement.fabricObject)
    // }
    // this._selectedElement = editorElement
  }
  clearCanvas(clearEditorElements = true) {
    // Clears all objects from the canvas
    this.canvas?.clear()
    // Optionally clear the editor elements if needed
    if (clearEditorElements) {
      this._editorElements = []
    }
  }
  createFabricImage(image: HTMLImageElement): fabric.Image | undefined {
    // Create a new fabric.Image object using the editorElement properties
    if (this._canvas) {
      const canvasWidth = this._canvas.getWidth()
      const canvasHeight = this._canvas.getHeight()
      // make sure the image fits exactly the canvas
      const orignalHeight = image.naturalHeight
      const orignalWidth = image.naturalWidth
      const imageObject = new fabric.Image(image, {})
      imageObject.set({
        width: orignalWidth,
        height: orignalHeight,
        scaleX: canvasWidth / orignalWidth,
        scaleY: canvasHeight / orignalHeight,
        originX: "center",
        originY: "center",
        left: canvasWidth / 2,
        top: canvasHeight / 2,
      })
      imageObject.center()
      imageObject.setCoords()
      return imageObject
    }
  }
  addFabricObjectToCanvas() {
    const currentVideoFrame = this.frames[this.currentKeyFrame]
    const currentGifFrame = this._editorElements[this.currentKeyFrame]
    const nestedObjectIds = currentVideoFrame.nestedObjects
    const nestedObjects = this._editorElements.filter((element) =>
      nestedObjectIds.some((nestedObject) => nestedObject.id === element.id)
    )
    if (currentGifFrame.fabricObject)
      this.canvas?.add(currentGifFrame.fabricObject)
    for (const nestedObject of nestedObjects) {
      if (nestedObject.fabricObject) {
        this.canvas?.add(nestedObject.fabricObject)
        this.canvas?.requestRenderAll()
      }
    }
    this.canvas?.renderAll()
  }
  // This function is called when a change is made to an object on the canvas
  onObjectModified(e: fabric.IEvent) {
    const fabricObject = e.target
    if (fabricObject && this._selectedElement) {
      // Here, we directly update the properties of the selected element's placement
      // This ensures that the changes are kept even when the object is not on the canvas
      this._selectedElement.placement = {
        x: fabricObject.left || 0,
        y: fabricObject.top || 0,
        width: fabricObject.getScaledWidth(),
        height: fabricObject.getScaledHeight(),
        rotation: fabricObject.angle || 0,
        scaleX: fabricObject.scaleX || 1,
        scaleY: fabricObject.scaleY || 1,
      }
      console.log("selectedElement", this._selectedElement)
      this.updateEditorElement(this._selectedElement)
    }
  }
  setSpeedFactor(factor: number) {
    this.speedFactor = factor
  }
  deleteFrame(index: number) {
    this.frames.splice(index, 1)
    this._editorElements.splice(index, 1)
  }
  deleteNestedObjectOfCurrentFrame(index: number) {
    const currentVideoFrame = this.frames[this.currentKeyFrame]
    const nestedObjectIds = currentVideoFrame.nestedObjects
    const nestedObjects = this._editorElements.filter((element) =>
      nestedObjectIds.some((nestedObject) => nestedObject.id === element.id)
    )
    const nestedObject = nestedObjects[index]
    if (nestedObject) {
      this.frames[this.currentKeyFrame].nestedObjects = nestedObjectIds.filter(
        (id) => id.id !== nestedObject.id
      )
      this._editorElements = this._editorElements.filter(
        (element) => element.id !== nestedObject.id
      )
    }
    // make sure to refresh the canvas
    this.addCurrentGifFrameToCanvas()
  }
  addCurrentGifFrameToCanvas() {
    // Add the current frame to the canvas. check whether we have the editor elements already in the store
    if (this._editorElements.length === 0) {
      return
    }
    // Get the current frame
    const gifFrame = this._editorElements[this.currentKeyFrame]
    // get all the nested objects for the current frame
    const currentVideoFrame = this.frames[this.currentKeyFrame]
    const nestedObjectIds = currentVideoFrame.nestedObjects
    const nestedObjects = this._editorElements.filter((element) =>
      nestedObjectIds.some((nestedObject) => nestedObject.id === element.id)
    )
    this.canvas?.clear()
    // Create a temporary canvas to draw the image
    if (!gifFrame.fabricObject) return
    this.canvas?.add(gifFrame.fabricObject)
    console.log("NESTEDOBJECTS80!", nestedObjects)
    nestedObjects.forEach((nestedObject) => {
      console.log("NESTEDOBJECTS90!", nestedObject)
      if (nestedObject.fabricObject) {
        console.log("NESTEDOBJECTS90!", nestedObjects)
        this.canvas?.add(nestedObject.fabricObject)
      }
    })
    this.canvas?.requestRenderAll()
  }
  playSequence() {
    if (this.playing) {
      if (this.playInterval !== null) {
        clearInterval(this.playInterval)
      }
      this.setPlaying(false)
      this.playInterval = null
    } else {
      this.setPlaying(true)
      let currentFrame = this.currentKeyFrame
      this.playInterval = setInterval(() => {
        if (currentFrame < this.frames.length) {
          this.addCurrentGifFrameToCanvas()
          this.setCurrentKeyFrame(currentFrame)
          currentFrame++
        } else {
          if (this.playInterval !== null) clearInterval(this.playInterval)
          this.setPlaying(false)
          this.setCurrentKeyFrame(0) // Optionally reset to start or keep the last frame
        }
      }, 10000 / this.fps / this.speedFactor) // This aligns with the playback speed
    }
  }
  async createGifFromEditorElements(): Promise<string> {
    const gif = new GIF({
      workers: 2,
      quality: this.gifQuality,
      workerScript: "/gif.worker.js",
    })
    for (let i = 0; i < this._editorElements.length; i++) {
      const editorElement = this._editorElements[i]
      const currentVideoFrame = this.frames[i]
      const nestedObjectIds = currentVideoFrame?.nestedObjects
      let nestedObjects: EditorElement[] = []
      if (nestedObjectIds)
        nestedObjects = this._editorElements.filter((element) =>
          nestedObjectIds.some((nestedObject) => nestedObject.id === element.id)
        )
      const tempCanvas = document.createElement("canvas")
      tempCanvas.width = this.canvas?.getWidth() || 800
      tempCanvas.height = this.canvas?.getHeight() || 500
      const tempCanvasContext = tempCanvas.getContext("2d")
      if (tempCanvasContext) {
        // Clear the canvas
        tempCanvasContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
        // Draw the background color
        tempCanvasContext.fillStyle = this.backgroundColor
        tempCanvasContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
        // Draw the image
        if (editorElement.fabricObject) {
          editorElement.fabricObject.setCoords()
          editorElement.fabricObject.render(tempCanvasContext)
        }
        // Draw the nested objects
        for (const nestedObject of nestedObjects) {
          if (nestedObject.fabricObject) {
            nestedObject.fabricObject.setCoords()
            nestedObject.fabricObject.render(tempCanvasContext)
          }
        }
        // Add the canvas frame to the GIF
        gif.addFrame(tempCanvas, { delay: 1000 / this.fps })
      }
    }
    return new Promise((resolve, reject) => {
      gif.on("finished", (blob: Blob) => {
        resolve(URL.createObjectURL(blob))
      })
      gif.on("error", (error: Error) => {
        reject(error)
      })
      gif.render()
    })
  }
  handleSaveAsGif = async (): Promise<string> => {
    try {
      const gifUrl = await this.createGifFromEditorElements()
      // Do something with the gifUrl, such as downloading it or displaying it
      return gifUrl
    } catch (error) {
      console.error("Error creating GIF", error)
      return ""
    }
  }
  addText(options: { text: string; fontSize: number; fontWeight: number }) {
    const id = getUid()
    const index = this._editorElements.length
    this.frames[this.currentKeyFrame].nestedObjects.push({ id })
    const text = {
      id,
      name: `Text ${index + 1}`,
      type: "text",
      placement: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
      timeFrame: {
        start: 0,
        end: this.maxTime,
      },
      properties: {
        text: options.text,
        fontSize: options.fontSize,
        fontWeight: options.fontWeight,
        splittedTexts: [],
      },
    } as EditorElement
    this.addEditorElement({ ...text })
    // const currentVideoFrame = this.frames[this.currentKeyFrame]
    // const currentGifFrame = this._editorElements[this.currentKeyFrame]
    // const nestedObjectIds = currentVideoFrame.nestedObjects
    // const nestedObjects = this._editorElements.filter((element) =>
    //   nestedObjectIds.some((nestedObject) => nestedObject.id === element.id)
    // )
    // this.canvas?.clear()
    // if (currentGifFrame.fabricObject)
    //   this.canvas?.add(currentGifFrame.fabricObject)
    // for (const nestedObject of nestedObjects) {
    //   console.log(nestedObject)
    //   if (!nestedObject.fabricObject && nestedObject.type === "text") {
    //     const text = new fabric.IText(nestedObject.properties.text, {
    //       fontSize: nestedObject.properties.fontSize,
    //       fontWeight: nestedObject.properties.fontWeight,
    //       fill: this.textColor,
    //       fontFamily: this.textFont,
    //     })
    //     nestedObject.fabricObject = text
    //     this.canvas?.add(text)
    //     this.canvas?.renderAll()
    //   } else if (nestedObject.fabricObject) {
    //     this.canvas?.add(nestedObject.fabricObject)
    //     this.canvas?.renderAll()
    //   }
    // }
  }
}
