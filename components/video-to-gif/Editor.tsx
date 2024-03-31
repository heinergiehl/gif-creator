"use client"
import { fabric } from "fabric"
import React, { useEffect, useRef, useState } from "react"
import { StoreContext } from "@/store"
import { observer } from "mobx-react"
import { Store } from "@/store/Store"
import "@/utils/fabric-utils"
import { Carousel } from "./Carousel"
import Link from "next/link"
import { Resources } from "./Resources"
import { Sidebar } from "./Sidebar"
import Navigation from "../nav/Navigation"
import ElementsHistoryPanel from "../panels/ElementsHistoryPanel"
export const EditorWithStore = () => {
  const [store] = useState(new Store())
  return (
    <StoreContext.Provider value={store}>
      <Editor></Editor>
    </StoreContext.Provider>
  )
}
export const Editor = observer(() => {
  const store = React.useContext(StoreContext)
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
  useEffect(() => {
    // check if the canvas is already initialized
    if (store.canvas) {
      return
    }
    const canvas = new fabric.Canvas("canvas", {
      backgroundColor: "grey",
      hoverCursor: "pointer",
      allowTouchScrolling: true,
      perPixelTargetFind: true,
      selection: true,
      selectionBorderColor: "blue",
      selectionColor: "rgba(0,255,0,0.3)",
      width: 400,
      height: 300,
      preserveObjectStacking: true,
    })
    canvas.on("object:modified", (e) => {
      console.log("object modified")
      store.onObjectModified(e)
    })
    canvas.on("object:added", () => {
      //workaround - selecting all objects to enable object controls
      console.log("object added")
      // let objects = canvas.getObjects()
      // // var selection = new fabric.ActiveSelection(objects, {
      // //   canvas: canvas,
      // // })
      // // canvas.setActiveObject(selection) //selecting all objects...
      // canvas.discardActiveObject() //...and deselecting them
      // canvas.requestRenderAll()
    })
    canvas.on("object:resizing", function (e) {})
    fabric.Object.prototype.transparentCorners = false
    fabric.Object.prototype.cornerColor = "blue"
    fabric.Object.prototype.cornerStyle = "circle"
    store.canvas = canvas
    fabric.util.requestAnimFrame(function render() {
      canvas?.requestRenderAll()
      fabric.util.requestAnimFrame(render)
    })
    store.setPlaying(false)
    clearInterval(store.playInterval)
  }, [])
  return (
    <>
      <Navigation />
      <main
        className="grid md:grid-rows-[700px_1fr_0px] md:grid-cols-[72px_300px_1fr_150px] 
         grid-cols-[1fr_3fr]  grid-rows-[1fr_2fr_3fr] 
      "
      >
        <div className="tile row-span-2 flex flex-col">
          <Sidebar />
        </div>
        <div className="tile row-span-2 flex flex-col">
          <Resources />
        </div>
        <div className=" bg-slate-100 flex justify-center items-center flex-col w-full h-full ">
          <div
            id="grid-canvas-container"
            className="flex justify-center items-center border-2 border-gray-300 drop-shadow-lg"
          >
            <canvas id="canvas" className="   " />
          </div>
          <div>
            <label htmlFor="speed">Playback Speed:</label>
            <select
              id="speed"
              onChange={(e) => store.setSpeedFactor(parseFloat(e.target.value))}
              defaultValue="1"
            >
              <option value="0.25">0.25x</option>
              <option value="0.5">0.5x</option>
              <option value="1">1x (Normal)</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          </div>
          <button onClick={() => store.playSequence()} className="play-button">
            {store.playing ? "Pause" : "Play"}
          </button>{" "}
          <Carousel />
        </div>
        <ElementsHistoryPanel />
      </main>
    </>
  )
})
