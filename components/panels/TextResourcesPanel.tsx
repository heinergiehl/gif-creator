"use client"
import React, { useEffect, useState } from "react"
import { observer } from "mobx-react"
import { TextResource } from "../entity/TextResource"
import { useStores } from "@/store"
import { useDraggable } from "@dnd-kit/core"
import { set } from "animejs"
const TEXT_RESOURCES = [
  {
    name: "Title",
    fontSize: 28,
    fontWeight: 600,
  },
]
type TextResourceProps = {
  fontSize: number
  fontWeight: number
  fontFamily: string
  fontColor: string
  fontStyle: string
  textBackground: string
  sampleText: string
  fill: string
}
const DraggableText = observer(
  ({
    fontSize,
    fontWeight,
    fontFamily,
    fontColor,
    fontStyle,
    textBackground,
    sampleText,
    fill,
    index,
  }: TextResourceProps & { index: number }) => {
    const { attributes, listeners, setNodeRef, isDragging, transform } =
      useDraggable({
        id: `textResource-${index}`,
      })
    const style = transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          zIndex: 999,
          cursor: "grab",
        }
      : { cursor: "grab" }
    const store = useStores().editorStore
    return (
      <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
        <div
          className="text-start "
          id={`textResource-${index}`}
          style={{
            fontSize: `${fontSize}px`,
            fontWeight: `${fontWeight}`,
            color: fontColor,
            fontFamily: fontFamily,
            fontStyle: fontStyle,
            backgroundColor: textBackground,
            fill,
          }}
        >
          {sampleText}
        </div>
      </div>
    )
  }
)
// FontPicker component for selecting fonts
const FontPicker = observer(() => {
  const store = useStores().editorStore
  const handleFontChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    store.fontFamily = event.target.value
  }
  return (
    <div className="flex flex-col items-center">
      <label htmlFor="fontPicker" className="mb-2">
        Choose a font:
      </label>
      <select
        id="fontPicker"
        value={store.fontFamily}
        onChange={handleFontChange}
        className="select rounded-md select-bordered min-h-[2rem] h-[2rem]"
      >
        {/* Font options */}
        <option value="Arial">Arial</option>
        <option value="Verdana">Verdana</option>
        <option value="Georgia">Georgia</option>
        <option value="Courier New">Courier New</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Comic Sans MS">Comic Sans MS</option>
        <option value="Impact">Impact</option>
      </select>
    </div>
  )
})
// TextResourcesPanel component
export const TextResourcesPanel = observer(() => {
  const store = useStores().editorStore
  const [fontSize, setFontSize] = useState(14)
  const [fontWeight, setFontWeight] = useState("400")
  const [fontColor, setFontColor] = useState("#000000")
  useEffect(() => {
    store.fontColor = fontColor
    store.fontSize = fontSize
  }, [fontColor, fontSize])
  return (
    <div className="bg-slate-200 h-full p-4 ">
      <div className="flex flex-col justify-between items-start space-y-4 w-full">
        <FontPicker />
        {/* Additional controls like color picker and font size range */}
        <input
          type="color"
          id="textColor"
          name="textColor"
          value={fontColor}
          onChange={(e) => setFontColor(e.target.value)}
        />
        <input
          type="range"
          min="10"
          max="100"
          value={fontSize}
          onChange={(e) => setFontSize(parseFloat(e.target.value))}
        />
      </div>
      <div className="flex flex-col space-y-4">
        {TEXT_RESOURCES.map((resource, index) => (
          <DraggableText
            key={resource.name}
            fontSize={fontSize}
            fontFamily={store.fontFamily}
            fontColor={store.fontColor}
            fontStyle="normal"
            textBackground=""
            fontWeight={resource.fontWeight}
            sampleText={resource.name}
            fill={store.textColor}
            index={store.frames.length - 1}
          />
        ))}
      </div>
    </div>
  )
})
