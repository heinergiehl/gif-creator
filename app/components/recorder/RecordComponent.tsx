"use client"
import { useContext, useEffect, useRef, useState } from "react"
import { useReactMediaRecorder } from "react-media-recorder"
import { fabric } from "fabric"
import { cn } from "@/utils/cn"
import { observer } from "mobx-react"
import { StoreProvider, useStores } from "@/store"
import Stepper from "./Stepper"
const RecordComponent = observer(() => {
  const screenToVideoStore = useStores().screenToVideoStore
  console.log(screenToVideoStore)
  const { status, startRecording, stopRecording, mediaBlobUrl, previewStream } =
    useReactMediaRecorder({
      screen: true,
      audio: false,
    })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas>()
  const cropRectRef = useRef<fabric.Rect>()
  const [stoppedRecording, setStoppedRecording] = useState(false)
  const [startedRecording, setStartedRecording] = useState(false)
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        height: 1280,
        width: 720,
        backgroundColor: "grey",
        preserveObjectStacking: true,
        selectionBorderColor: "blue",
        selection: true,
      })
      const canvas = fabricCanvasRef.current
      // This should be set to false to avoid scaling issues
      fabric.Image.prototype.objectCaching = false
      if (!videoRef.current) return
      videoRef.current.addEventListener("loadeddata", () => {
        if (!fabricCanvasRef.current) return
        enableCropMode(fabricCanvasRef.current)
        canvas.on("object:modified", function (e) {
          //
        })
        if (!videoRef.current) return
        videoRef.current.width = videoRef.current.videoWidth
        videoRef.current.height = videoRef.current.videoHeight
        // Using 'loadeddata' event to ensure video dimensions are available
        const videoAspectRatio =
          videoRef.current.videoWidth / videoRef.current.videoHeight
        if (!canvas || !canvas.width || !canvas.height) return
        const canvasAspectRatio = canvas?.width / canvas?.height
        let scaleRatio: number
        // Decide whether to scale to width or height
        if (videoAspectRatio > canvasAspectRatio) {
          // Scale to width
          scaleRatio = canvas.width / videoRef.current.width
        } else {
          // Scale to height
          scaleRatio = canvas.height / videoRef.current.height
        }
        const videoElement = new fabric.Image(videoRef.current, {
          left: 0,
          top: 0,
          width: videoRef.current.width,
          height: videoRef.current.height,
          originX: "left",
          originY: "top",
          objectCaching: false,
          selectable: true,
          hasControls: true,
          hasBorders: true,
        })
        videoElement.setCoords()
        canvas.add(videoElement)
        canvas.requestRenderAll()
        function updateFrame() {
          if (
            !videoRef.current ||
            videoRef.current.paused ||
            videoRef.current.ended
          )
            return
          videoElement.setElement(videoRef.current)
          videoElement.set({
            scaleX: scaleRatio,
            scaleY: scaleRatio,
          })
          canvas.requestRenderAll()
          requestAnimationFrame(updateFrame)
          cropRectRef.current?.bringToFront()
        }
        updateFrame()
      })
      videoRef.current.addEventListener("play", () => {
        // We don't need to do anything here because the 'loadeddata' event will handle it
      })
    }
  }, [])
  const handleCrop = () => {
    if (!fabricCanvasRef.current || !cropRectRef.current) return
    // Calculate the new scale ratio for the cropped area to fit the canvas
    if (!fabricCanvasRef.current.width || !cropRectRef.current.width) return
    if (!cropRectRef.current.height || !fabricCanvasRef.current.height) return
    const scaleX = fabricCanvasRef.current.width / cropRectRef.current.width
    const scaleY = fabricCanvasRef.current.height / cropRectRef.current.height
    if (!cropRectRef.current.left || !cropRectRef.current.top) return
    const left = cropRectRef.current.left
    const top = cropRectRef.current.top
    // Calculate the top-left corner of the cropped area in relation to the canvas
    const croppedTopLeft = {
      x: -left * scaleX,
      y: -top * scaleY,
    }
    // Update the viewport transform to apply the new scale and position
    fabricCanvasRef.current.viewportTransform = [
      scaleX,
      0,
      0,
      scaleY,
      croppedTopLeft.x,
      croppedTopLeft.y,
    ]
    // Remove the crop rectangle from the canvas
    fabricCanvasRef.current.remove(cropRectRef.current)
    if (!cropRectRef.current) return
    cropRectRef.current = undefined // Reset the crop rectangle reference
    // Deselect any objects on the canvas
    fabricCanvasRef.current.discardActiveObject()
    // Apply the transformations and re-render the canvas
    fabricCanvasRef.current.requestRenderAll()
    setCropped(true)
  }
  const enableCropMode = (canvas: fabric.Canvas) => {
    if (cropRectRef.current) return
    cropRectRef.current = new fabric.Rect({
      fill: "rgba(0,0,0,0.3)",
      originX: "left",
      originY: "top",
      stroke: "#ccc",
      opacity: 1,
      width: 200,
      height: 200,
      borderColor: "red",
      cornerColor: "green",
      hasRotatingPoint: false,
      selectable: true,
      hasControls: true,
    })
    cropRectRef.current.bringToFront()
    cropRectRef.current.setCoords()
    canvas.add(cropRectRef.current)
    canvas.setActiveObject(cropRectRef.current)
  }
  const previewVideoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (!previewStream) return
    if (!previewVideoRef.current) return
    previewVideoRef.current.style.display = "block"
    previewVideoRef.current.srcObject = previewStream
    previewVideoRef.current.width = 1280
    previewVideoRef.current.height = 720
    if (screenToVideoStore.currentStep === 3) return
    screenToVideoStore.currentStep = 2
  }, [previewStream])
  // create function to create a video from the canvas stream, which will be the final edited video
  const createFinalVideo = () => {
    if (!canvasRef.current) return
    const stream = canvasRef.current.captureStream()
    const mediaRecorder = new MediaRecorder(stream)
    const chunks: BlobPart[] = ([] = [])
    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data)
    }
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "edited-video.webm"
      a.click()
      URL.revokeObjectURL(url)
    }
    mediaRecorder.start()
    setTimeout(() => {
      mediaRecorder.stop()
    }, 5000)
  }
  const [canvasSize, setCanvasSize] = useState({ width: 1280, height: 720 })
  const [newWidth, setNewWidth] = useState(1280)
  const [newHeight, setNewHeight] = useState(720)
  const [cropped, setCropped] = useState(false)
  const handleResizeCanvas = () => {
    const newDimensions = { width: newWidth, height: newHeight }
    if (fabricCanvasRef.current) {
      const objs = fabricCanvasRef.current.getObjects()
      objs.forEach((obj) => {
        obj.center()
        obj.setCoords()
      })
      fabricCanvasRef.current.setDimensions(newDimensions)
      fabricCanvasRef.current.renderAll()
    }
    // Update state to re-render component if necessary
    setCanvasSize(newDimensions)
    screenToVideoStore.currentStep = 4
  }
  useEffect(() => {
    // Reactively update canvas size
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setWidth(newWidth)
      fabricCanvasRef.current.setHeight(newHeight)
      fabricCanvasRef.current.setDimensions({
        width: newWidth,
        height: newHeight,
      })
      // keep the objects in the center of the canvas
      if (!fabricCanvasRef.current.item(0)) return
      fabricCanvasRef.current.renderAll() // Re-render the canvas to apply changes
    }
  }, [newWidth, newHeight])
  const handleStopRecording = () => {
    stopRecording()
    // get canvas size by using the video dimensions
    setStoppedRecording(true)
    screenToVideoStore.currentStep = 3
  }
  // when stopped recording, adjust canvas size to fit the video
  useEffect(() => {
    if (startedRecording) {
      if (previewVideoRef.current) {
        setNewWidth(previewVideoRef.current.videoWidth)
        setNewHeight(previewVideoRef.current.videoHeight)
      }
    }
  }, [startedRecording])
  return (
    <div className=" my-[80px] container  h-full  flex  ">
      <div className="flex flex-col mx-4">
        <Stepper />
        <div className="flex flex-col text-sm">
          <label className="label text-gray-700 ">
            Width:
            <input
              type="number"
              value={newWidth}
              onChange={(e) => setNewWidth(parseInt(e.target.value, 10))}
            />
          </label>
          <label className="label text-gray-700">
            Height:
            <input
              type="number"
              value={newHeight}
              onChange={(e) => setNewHeight(parseInt(e.target.value, 10))}
            />
          </label>
          <button
            className="btn  btn-xs  max-w-[150px] 
            "
            onClick={handleResizeCanvas}
          >
            Apply Canvas Size
          </button>
        </div>
      </div>
      <div className="flex flex-col justify-start ">
        {!startedRecording && (
          <button
            className="btn btn-primary m-2 max-w-[150px]"
            onClick={() => {
              setStartedRecording(true)
              startRecording()
            }}
          >
            Start Recording
          </button>
        )}
        {startedRecording && !stoppedRecording && (
          <button
            className="btn btn-secondary max-w-[150px]"
            onClick={handleStopRecording}
          >
            Stop Recording
          </button>
        )}
        <video
          ref={videoRef}
          src={mediaBlobUrl ?? ""}
          width={1280}
          height={720}
          controls
          autoPlay
          loop
          style={{ display: "none" }}
        />
        {previewStream && !mediaBlobUrl && (
          <video ref={previewVideoRef} controls autoPlay loop />
        )}
        {stoppedRecording && cropped && (
          <button className="btn btn-secondary m-2" onClick={handleCrop}>
            Crop
          </button>
        )}
        {stoppedRecording && (
          <button className="btn btn-secondary m-2" onClick={createFinalVideo}>
            Create Final Video
          </button>
        )}
        <div
          className={cn([
            "relative border border-gray-300 rounded-lg overflow-hidden ",
            !stoppedRecording && "hidden",
          ])}
        >
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
          />
        </div>
      </div>
    </div>
  )
})
const RecordComponentWithState = () => {
  return (
    <StoreProvider>
      <RecordComponent />
    </StoreProvider>
  )
}
export default RecordComponentWithState
