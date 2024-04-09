"use client"
import { fabric } from "fabric"
import React, { use, useEffect, useRef, useState } from "react"
import { RootStore, StoreContext } from "@/store"
import { observer } from "mobx-react"
import { Store } from "@/store/Store"
import "@/utils/fabric-utils"
import { Carousel } from "./Carousel"
import Link from "next/link"
import { Resources } from "./Resources"
import { Sidebar } from "./Sidebar"
import Navigation from "../nav/Navigation"
import ElementsHistoryPanel from "../panels/ElementsHistoryPanel"
import { FaPlayCircle, FaStopCircle } from "react-icons/fa"
import { usePathname } from "next/navigation"
import RootNavigation from "@/app/RootNavigation"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
} from "@dnd-kit/core"
import { set } from "animejs"
const EditorWithStore = () => {
  const [store] = useState(new RootStore())
  return (
    <StoreContext.Provider value={store}>
      <Editor></Editor>
    </StoreContext.Provider>
  )
}
export default EditorWithStore
const Editor = observer(() => {
  const rootStore = React.useContext(StoreContext)
  const store = rootStore.store
  const resizeCanvas = () => {
    const canvasContainer = document.getElementById("grid-canvas-container")
    if (!canvasContainer || !store.canvas) return
    const ratio = store.canvas.getWidth() / store.canvas.getHeight()
    const containerWidth = window.innerWidth / 3
    const containerHeight = containerWidth / ratio
    const scale = containerWidth / store.canvas.getWidth()
    store.canvas.setWidth(containerWidth)
    store.canvas.setHeight(containerHeight)
    // make sure to keep the position of the objects when resizing
    const objects = store.canvas.getObjects()
    objects.forEach((object) => {
      if (object.scaleX) {
        object.scaleX *= scale
      }
      if (object.scaleY) {
        object.scaleY *= scale
      }
      if (object.left) {
        object.left *= scale
      }
      if (object.top) {
        object.top *= scale
      }
      object.setCoords()
    })
  }
  useEffect(() => {
    window.addEventListener("resize", resizeCanvas)
    resizeCanvas() // Call it to ensure it sizes correctly initially
    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, []) // Depend on the store.canvas to ensure it exists
  const pathName = usePathname()
  useEffect(() => {
    // check if the canvas is already initialized
    if (store._canvas) {
      return
    }
    const canvas = new fabric.Canvas("canvas", {
      backgroundColor: "grey",
      hoverCursor: "pointer",
      allowTouchScrolling: true,
      perPixelTargetFind: true,
      selection: true,
      selectionBorderColor: "blue",
      width: 400,
      height: 300,
      preserveObjectStacking: true,
    })
    canvas.on("object:modified", (e) => {
      console.log("object modified")
      store.onObjectModified(e)
    })
    canvas.on("object:added", (e) => {
      //workaround - selecting all objects to enable object controls
      console.log("object added69!")
      console.log(e.target)
    })
    canvas.on("object:resizing", function (e) {})
    fabric.Object.prototype.transparentCorners = false
    fabric.Object.prototype.cornerColor = "blue"
    fabric.Object.prototype.cornerStyle = "circle"
    store._canvas = canvas
    fabric.util.requestAnimFrame(function render() {
      canvas?.requestRenderAll()
      fabric.util.requestAnimFrame(render)
    })
    store.setPlaying(false)
    if (store.playInterval) clearInterval(store.playInterval)
  }, [])
  useEffect(() => {
    if (
      (!store.creatingGifFrames &&
        store.cardItemHeight &&
        store.cardItemWidth &&
        pathName.includes("video-to-gif")) ||
      (!store.creatingGifFrames &&
        store.cardItemHeight &&
        store.cardItemWidth &&
        pathName.includes("edit-gifs"))
    ) {
      store.addImages()
      store.addCurrentGifFrameToCanvas()
    }
  }, [store.creatingGifFrames, store.cardItemHeight, store.cardItemWidth])
  const ControlsSkeleton = () => {
    return (
      <div className="flex flex-col gap-4">
        {/* Mimic the label and select dropdown */}
        <div className="flex flex-col">
          <div className="skeleton h-4 w-28 mb-2"></div> {/* Mimic the label */}
          <div className="skeleton h-8 w-full"></div>{" "}
          {/* Mimic the select dropdown */}
        </div>
        {/* Mimic the play/stop button */}
        <div className="skeleton h-14 w-14 mt-8 mx-auto rounded-full"></div>
      </div>
    )
  }
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    //extract index from the id
    console.log(active, over)
    const index = parseInt(String(active.id).split("-")[1])
    if (store.imageType === "Frame" && String(over?.id).includes("carousel")) {
      // get the src from the image html element
      const src = document
        .getElementById(String(active.id))
        ?.getAttribute("src")
      if (!src) return
      store.frames.push({ src, nestedObjects: [] })
      store.addImage(index, true)
      store.currentKeyFrame = store.frames.length - 1
    } else {
      store.addImage(index, true)
    }
  }
  const handleDragStart = (event: DragStartEvent) => {
    console.log("drag start")
  }
  const handleDragOver = (event: DragOverEvent) => {
    //check if over id is canvas-grid-container, if so set store.imageType to ObjectInFrame
    if (event.over?.id === "grid-canvas-container") {
      store.imageType = "ObjectInFrame"
    } else {
      store.imageType = "Frame"
    }
  }
  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
    >
      <main
        className="overflow-hidden  grid pt-[64px] lg:grid-rows-[1fr_auto] lg:grid-cols-[75px_300px_1fr_150px] 
         grid-rows-[1fr_0px_0px]  grid-cols-[72px_150px_1fr_auto] 
      "
      >
        <RootNavigation />
        <div className="tile row-span-2 flex flex-col ">
          <Sidebar />
        </div>
        <div className="tile  flex flex-col ">
          <Resources />
        </div>
        <div className=" bg-slate-100 flex justify-center items-center  flex-col ">
          <div className="flex w-full justify-center items-center space-x-8">
            {store.creatingGifFrames && <ControlsSkeleton />}
            {store.frames.length !== 0 &&
              store._editorElements.length !== 0 && (
                <div className="flex flex-col">
                  <label
                    htmlFor="speed"
                    className="flex flex-col font-semibold  "
                  >
                    <span className="text-sm text-gray-600">
                      Playback Speed
                    </span>
                    <select
                      id="speed"
                      onChange={(e) =>
                        store.setSpeedFactor(parseFloat(e.target.value))
                      }
                      defaultValue="1"
                    >
                      <option value="0.25">0.25x</option>
                      <option value="0.5">0.5x</option>
                      <option value="1">1x (Normal)</option>
                      <option value="1.5">1.5x</option>
                      <option value="2">2x</option>
                    </select>
                  </label>
                  <button
                    onClick={() => store.playSequence()}
                    className="play-button mt-8"
                  >
                    {store.playing ? (
                      <FaStopCircle size={54} className="" />
                    ) : (
                      <FaPlayCircle size={54} />
                    )}
                  </button>{" "}
                </div>
              )}
            <Canvas />
          </div>
          <Carousel />
        </div>
        <ElementsHistoryPanel />
      </main>
    </DndContext>
  )
})
const Canvas = () => {
  const { isOver, setNodeRef } = useDroppable({
    id: "grid-canvas-container",
  })
  return (
    <div
      id="grid-canvas-container"
      ref={setNodeRef}
      className="   border-2 border-gray-300 drop-shadow-lg"
    >
      <canvas id="canvas" className="  " />
    </div>
  )
}
