"use client"
import React, { useState } from "react"
import { observer } from "mobx-react"
import { TextResource } from "../entity/TextResource"
import { StoreContext } from "@/store"
const TEXT_RESOURCES = [
  {
    name: "Title",
    fontSize: 28,
    fontWeight: 600,
  },
  {
    name: "Subtitle",
    fontSize: 16,
    fontWeight: 600,
  },
  {
    name: "Body",
    fontSize: 14,
    fontWeight: 400,
  },
  {
    name: "Caption",
    fontSize: 12,
    fontWeight: 400,
  },
  {
    name: "Heading 1",
    fontSize: 24,
    fontWeight: 800,
  },
  {
    name: "Heading 2",
    fontSize: 20,
    fontWeight: 800,
  },
  {
    name: "Heading 3",
    fontSize: 18,
    fontWeight: 800,
  },
  {
    name: "Heading 4",
    fontSize: 16,
    fontWeight: 800,
  },
  {
    name: "Heading 5",
    fontSize: 14,
    fontWeight: 800,
  },
  {
    name: "Heading 6",
    fontSize: 12,
    fontWeight: 800,
  },
]
export const FontPicker = () => {
  const store = React.useContext(StoreContext)
  const [font, setFont] = useState("Arial")
  const handleFontChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    store.textFont = event.target.value
  }
  return (
    <div className="flex flex-col items-center">
      <label htmlFor="fontPicker" className="mb-2">
        Choose a font:
      </label>
      <select
        id="fontPicker"
        value={font}
        onChange={handleFontChange}
        className="select select-bordered w-max"
      >
        <option value="Arial">Arial</option>
        <option value="Verdana">Verdana</option>
        <option value="Georgia">Georgia</option>
        <option value="Courier New">Courier New</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Comic Sans MS">Comic Sans MS</option>
        <option value="Impact">Impact</option>
      </select>
      <p className="mt-4" style={{ fontFamily: font }}>
        The quick brown fox jumps over the lazy dog.
      </p>
    </div>
  )
}
export const TextResourcesPanel = observer(() => {
  const store = React.useContext(StoreContext)
  return (
    <div className="bg-slate-200 h-full">
      <div className="flex justify-between items-center space-y-4">
        <FontPicker />
        <div className=" text-sm px-[16px] pt-[16px] pb-[8px] font-semibold text-black">
          Text
        </div>
        <label className="text-xs text-gray-500 mr-4" htmlFor="textColor">
          Color
          <input
            className="h-[32px] rounded-full  w-[32px]  z-10  font-bold  flex items-center justify-center"
            type="color"
            id="textColor"
            name="textColor"
            value={store.textColor}
            onChange={(e) => {
              store.textColor = e.target.value
            }}
          ></input>
        </label>
      </div>
      <ul>
        {TEXT_RESOURCES.map((resource) => {
          return (
            <li key={resource.name}>
              <TextResource
                sampleText={resource.name}
                fontSize={resource.fontSize}
                fontWeight={resource.fontWeight}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
})
