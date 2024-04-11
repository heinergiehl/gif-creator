import { makeAutoObservable, observable } from "mobx"
import { fabric } from "fabric"
import {
  getUid,
  isHtmlAudioElement,
  isHtmlImageElement,
  isHtmlVideoElement,
} from "@/utils"
import anime from "animejs"
import {
  MenuOption,
  EditorElement,
  Animation,
  TextEditorElement,
  ImageEditorElement,
  VideoEditorElement,
  AudioEditorElement,
} from "@/types"
import GIF from "@/dist/gif.js"
import { Object } from "fabric/fabric-impl"
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
  frames: VideoFrame[]
  _imageObject: fabric.Image | null
  editorElements: EditorElement[]
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
  creatingGifFrames: boolean
  textColor: string
  textFont: string
  imageResources: string[]
  gifQuality: number = 10
  sidebarWidth: number
  cardItemWidth: number
  cardItemHeight: number
  imageType: "Frame" | "ObjectInFrame"
  constructor() {
    this._canvas = null
    this.cardItemWidth = 0
    this.cardItemHeight = 0
    this.textColor = "black"
    this.textFont = "Comic Sans MS"
    this.selectedMenuOption = "Text"
    this.creatingGifFrames = false
    this.speedFactor = 1
    this.playInterval = null
    this.videos = []
    this.images = []
    this.frames = []
    this.animations = []
    this.audios = []
    this._imageObject = null
    this.editorElements = []
    this.backgroundColor = "lightgrey"
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
    this.sidebarWidth = 300
    this.imageType = "Frame"
    makeAutoObservable(this)
  }
  set canvas(canvas: fabric.Canvas | null) {
    this._canvas = canvas
    if (this._canvas) {
      this._canvas.backgroundColor = this.backgroundColor
    }
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
  addAnimation(animation: Animation) {
    this.animations = [...this.animations, animation]
    const editorElement = this._selectedElement
    if (!editorElement || !editorElement.fabricObject) return
    console.log("ANIMATION69", editorElement.fabricObject)
    const animationType = animation.type
    const options = {
      duration: animation.duration,
    }
    switch (animationType) {
      case "fadeIn":
        this.animateFadeIn(editorElement.fabricObject, options)
        break
      case "fadeOut":
        this.animateFadeOut(editorElement.fabricObject, options)
        break
      case "slideIn":
        this.animateSlideIn(editorElement.fabricObject, options)
        break
      case "slideOut":
        this.animateSlideOut(editorElement.fabricObject, options)
        break
    }
  }
  animateSlideIn(fabricObject: Object, { duration = 1000 } = {}) {
    if (!this._canvas) return
    const left = fabricObject.left
    if (this._canvas.width === undefined) return
    if (left === undefined) return
    fabricObject.set("left", -this._canvas.width)
    fabricObject.animate("left", left, {
      duration,
      onChange: this._canvas.renderAll.bind(this._canvas),
    })
  }
  animateSlideOut(fabricObject: Object, { duration = 1000 } = {}) {
    if (this._canvas === null) return
    const left = fabricObject.left
    if (this._canvas.width === undefined) return
    if (left === undefined) return
    fabricObject.animate("left", left, {
      duration,
      onChange: this._canvas.renderAll.bind(this._canvas),
    })
  }
  animateFadeIn(fabricObject: Object, { duration = 1000 } = {}) {
    if (!this._canvas) return
    fabricObject.set("opacity", 0)
    fabricObject.animate("opacity", 1, {
      duration,
      onChange: this._canvas.renderAll.bind(this._canvas),
    })
  }
  animateFadeOut(fabricObject: Object, { duration = 1000 } = {}) {
    if (!this._canvas) return
    fabricObject.animate("opacity", 0, {
      duration,
      onChange: this._canvas.renderAll.bind(this._canvas),
    })
  }
  setCurrentKeyFrame(frame: number) {
    this.currentKeyFrame = frame
    this._selectedElement = this.editorElements[frame]
  }
  addEditorElement(element: EditorElement, isResource = false) {
    this.editorElements = [...this.editorElements, element]
    // this._selectedElement = this.editorElements[0]
    if (
      ((isResource && element.type === "image") ||
        (isResource && element.type === "smilies")) &&
      this.imageType === "ObjectInFrame"
    ) {
      console.log("YOYOY67")
      let fabricImage: fabric.Image | undefined
      if (this.frames.length > 0 && this.frames[this.currentKeyFrame]) {
        const currentVideoFrame = this.frames[this.currentKeyFrame]
        currentVideoFrame.nestedObjects.push({ id: element.id })
        fabricImage = this.createFabricImage(
          document.getElementById(
            element.properties.elementId
          ) as HTMLImageElement
        )
        element.fabricObject = fabricImage
        this.editorElements[this.editorElements.length - 1] = element
      } else {
        console.log("YOYOY68")
        fabricImage = this.createFabricImage(
          document.getElementById(
            element.properties.elementId
          ) as HTMLImageElement
        )
        element.fabricObject = fabricImage
        this.editorElements[this.editorElements.length - 1] = element
        if (fabricImage === undefined) return
        if (!element.properties.elementId) return
        if (!document.getElementById(element.properties.elementId)) return
        const imageElement = document.getElementById(
          element.properties.elementId
        ) as HTMLImageElement
        this.frames.push({
          src: imageElement.src,
          nestedObjects: [],
        })
        this.selectedElement = this.editorElements[
          this.editorElements.length - 1
        ] = element
        this.currentKeyFrame = this.frames.length - 1
      }
      // this.selectedElement = this.editorElements[0] = element
      // this.currentKeyFrame = this.frames.length - 1
      if (fabricImage) this.canvas?.add(fabricImage)
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
      this.editorElements[this.editorElements.length - 1] = element
      this.canvas?.add(text)
    } else if (
      element.type === "image" ||
      element.type === "smilies" ||
      element.type === "gif"
    ) {
      const imgElement = document.getElementById(
        element.properties.elementId
      ) as HTMLImageElement
      console.log("YOYOY69", imgElement)
      const fabricImage = this.createFabricImage(imgElement)
      element.fabricObject = fabricImage
      this.editorElements[this.editorElements.length - 1] = element
      this._selectedElement = this.editorElements[0]
      if (fabricImage) this._canvas?.add(fabricImage)
    }
  }
  clearEditorElements() {
    this.editorElements = []
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
    return this.editorElements[index]
  }
  updateSelectedElement() {
    this._selectedElement =
      this.editorElements.find(
        (element) => element.id === this._selectedElement?.id
      ) ?? null
  }
  addImage(index: number, isResource: boolean = false) {
    let imageElement: HTMLElement | null = null
    if (isResource) {
      imageElement = document.getElementById(`imageResource-${index}`)
      console.log("6970!", imageElement)
    } else {
      imageElement = document.getElementById(`image-${index}`)
    }
    console.log("imageElement", imageElement)
    if (!isHtmlImageElement(imageElement)) {
      return
    }
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
  addImages() {
    this.frames.forEach((_, index) => {
      this.addImage(index, false)
    })
  }
  // set editorElements(editorElements: EditorElement[]) {
  //   console.log("editorElements", editorElements)
  //   this.editorElements = editorElements
  //   this.updateSelectedElement()
  //   // this.refreshAnimations();
  // }
  getEditorElements() {
    return this.editorElements
  }
  updateEditorElement(editorElement: EditorElement) {
    this.editorElements = this.editorElements.map((element) => {
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
    console.log(this.editorElements, index)
    return this.editorElements[index]
  }
  clearCanvas(clearEditorElements = true) {
    // Clears all objects from the canvas
    this.canvas?.clear()
    // Optionally clear the editor elements if needed
    if (clearEditorElements) {
      this.editorElements = []
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
      console.log(
        "SIZE69",
        orignalWidth,
        orignalHeight,
        canvasWidth,
        canvasHeight
      )
      const aspectRatio = orignalWidth / orignalHeight
      const scaleX = canvasWidth / orignalWidth
      const scaleY = canvasHeight / orignalHeight
      const imageObject = new fabric.Image(image, {})
      imageObject.set({
        width: orignalWidth,
        height: orignalHeight,
        scaleX,
        scaleY,
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
    const currentGifFrame = this.editorElements[this.currentKeyFrame]
    const nestedObjectIds = currentVideoFrame.nestedObjects
    const nestedObjects = this.editorElements.filter((element) =>
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
    const frameToDelete = this.frames[index]
    this.frames = this.frames.filter((frame, i) => i !== index)
    this.editorElements = this.editorElements.filter(
      (element) =>
        !frameToDelete.nestedObjects.some(
          (nestedObject) => nestedObject.id === element.id
        )
    )
    this.editorElements = this.editorElements.filter(
      (element, i) => i !== index
    )
    this.frames = this.frames
  }
  deleteNestedObjectOfCurrentFrame(index: number) {
    const currentVideoFrame = this.frames[this.currentKeyFrame]
    const nestedObjectIds = currentVideoFrame.nestedObjects
    const nestedObjects = this.editorElements.filter((element) =>
      nestedObjectIds.some((nestedObject) => nestedObject.id === element.id)
    )
    const nestedObject = nestedObjects[index]
    if (nestedObject) {
      this.frames[this.currentKeyFrame].nestedObjects = nestedObjectIds.filter(
        (id) => id.id !== nestedObject.id
      )
      this.editorElements = this.editorElements.filter(
        (element) => element.id !== nestedObject.id
      )
    }
    // make sure to refresh the canvas
    this.addCurrentGifFrameToCanvas()
  }
  addCurrentGifFrameToCanvas() {
    // Add the current frame to the canvas. check whether we have the editor elements already in the store
    if (this.editorElements.length === 0) {
      return
    }
    this._canvas?.clear()
    // Get the current frame
    const gifFrame = this.editorElements[this.currentKeyFrame]
    // get all the nested objects for the current frame
    const currentVideoFrame = this.frames[this.currentKeyFrame]
    if (!currentVideoFrame) return
    const nestedObjectIds = currentVideoFrame.nestedObjects
    const nestedObjects = this.editorElements.filter((element) =>
      nestedObjectIds.some((nestedObject) => nestedObject.id === element.id)
    )
    // Create a temporary canvas to draw the image
    if (!gifFrame.fabricObject) return
    console.log("NESTEDOBJECTS69!", gifFrame.fabricObject)
    this._canvas?.add(gifFrame.fabricObject)
    console.log("NESTEDOBJECTS80!", nestedObjects)
    nestedObjects.forEach((nestedObject) => {
      console.log("NESTEDOBJECTS90!", nestedObject)
      if (nestedObject.fabricObject) {
        console.log("NESTEDOBJECTS90!", nestedObjects)
        this.canvas?.add(nestedObject.fabricObject)
      }
    })
    this._canvas?.requestRenderAll()
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
          this.setCurrentKeyFrame(currentFrame)
          this.addCurrentGifFrameToCanvas()
          currentFrame++
        } else {
          if (this.playInterval !== null) clearInterval(this.playInterval)
          this.setPlaying(false)
          this.setCurrentKeyFrame(0) // Optionally reset to start or keep the last frame
          this.addCurrentGifFrameToCanvas()
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
    for (let i = 0; i < this.editorElements.length; i++) {
      const editorElement = this.editorElements[i]
      const currentVideoFrame = this.frames[i]
      const nestedObjectIds = currentVideoFrame?.nestedObjects
      let nestedObjects: EditorElement[] = []
      if (nestedObjectIds)
        nestedObjects = this.editorElements.filter((element) =>
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
  addText(options: {
    text: string
    fontSize: number
    fontWeight: number
    addTextToAllFrames: boolean
  }) {
    const id = getUid()
    const index = this.editorElements.length
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
        id,
      },
    } as EditorElement
    if (options.addTextToAllFrames) {
      this.frames.forEach((frame) => {
        frame.nestedObjects.push({ id })
        this.addEditorElement({ ...text })
      })
    } else {
      this.frames[this.currentKeyFrame].nestedObjects.push({ id })
      this.addEditorElement({ ...text })
    }
  }
  removeAnimation(id: string) {
    this.animations = this.animations.filter((animation) => animation.id !== id)
  }
  updateAnimation(id: string, animation: Animation) {
    const index = this.animations.findIndex((a) => a.id === id)
    this.animations[index] = animation
  }
}
export function isEditorAudioElement(
  element: EditorElement
): element is AudioEditorElement {
  return element.type === "audio"
}
export function isEditorVideoElement(
  element: EditorElement
): element is VideoEditorElement {
  return element.type === "video"
}
export function isEditorImageElement(
  element: EditorElement
): element is ImageEditorElement {
  return element.type === "image"
}
function getTextObjectsPartitionedByCharacters(
  textObject: fabric.Text,
  element: TextEditorElement
): fabric.Text[] {
  let copyCharsObjects: fabric.Text[] = []
  // replace all line endings with blank
  const characters = (textObject.text ?? "").split("").filter((m) => m !== "\n")
  const charObjects = textObject.__charBounds
  if (!charObjects) return []
  const charObjectFixed = charObjects
    .map((m, index) => m.slice(0, m.length - 1).map((m) => ({ m, index })))
    .flat()
  const lineHeight = textObject.getHeightOfLine(0)
  for (let i = 0; i < characters.length; i++) {
    if (!charObjectFixed[i]) continue
    const { m: charObject, index: lineIndex } = charObjectFixed[i]
    const char = characters[i]
    const scaleX = textObject.scaleX ?? 1
    const scaleY = textObject.scaleY ?? 1
    const charTextObject = new fabric.Text(char, {
      left: charObject.left * scaleX + element.placement.x,
      scaleX: scaleX,
      scaleY: scaleY,
      top: lineIndex * lineHeight * scaleY + element.placement.y,
      fontSize: textObject.fontSize,
      fontWeight: textObject.fontWeight,
      fill: "#fff",
    })
    copyCharsObjects.push(charTextObject)
  }
  return copyCharsObjects
}
