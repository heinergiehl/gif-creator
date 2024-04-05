"use client"
import React, { useEffect } from "react"
import { StoreContext } from "@/store"
import { observer } from "mobx-react"
import {
  MdDownload,
  MdVideoLibrary,
  MdImage,
  MdTransform,
  MdTitle,
  MdAudiotrack,
  MdOutlineFormatColorFill,
  MdMovieFilter,
} from "react-icons/md"
import { Store } from "@/store/Store"
import { usePathname } from "next/navigation"
type ConversionType = "videoToGif" | "imageToGif"
export const Sidebar = observer(() => {
  const pathName = usePathname()
  const conversionType: ConversionType = pathName.includes("video-to-gif")
    ? "videoToGif"
    : "imageToGif"
  console.log(conversionType)
  const [conversionTypeState, setConversionTypeState] =
    React.useState<ConversionType>(conversionType)
  useEffect(() => {
    setConversionTypeState(conversionType)
    store.setSelectedMenuOption(
      conversionTypeState === "videoToGif" ? "Video" : "Image"
    )
  }, [pathName])
  const store = React.useContext(StoreContext)
  return (
    <ul className="bg-white h-screen">
      {MENU_OPTIONS.map((option) => {
        const isSelected = store.selectedMenuOption === option.name
        return (
          <li
            key={option.name}
            className={`h-[72px] w-[72px] flex flex-col items-center justify-center rounded-lg ${
              isSelected ? "bg-slate-200" : ""
            }`}
          >
            <button
              disabled={
                option.name === "Video" &&
                store._editorElements.length === 0 &&
                conversionTypeState !== "videoToGif"
              }
              onClick={() => option.action(store)}
              className={`flex flex-col items-center`}
            >
              <option.icon size="20" color={isSelected ? "#000" : "#444"} />
              <div
                className={`text-[0.6rem]  hover:text-black ${
                  isSelected ? "text-black" : "text-slate-600"
                }`}
              >
                {option.name}
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
})
const MENU_OPTIONS = [
  {
    name: "Video",
    icon: MdVideoLibrary,
    action: (store: Store) => {
      store.setSelectedMenuOption("Video")
    },
  },
  {
    name: "Image",
    icon: MdImage,
    action: (store: Store) => {
      store.setSelectedMenuOption("Image")
    },
  },
  {
    name: "Text",
    icon: MdTitle,
    action: (store: Store) => {
      store.setSelectedMenuOption("Text")
    },
  },
  {
    name: "Effect",
    icon: MdMovieFilter,
    action: (store: Store) => {
      store.setSelectedMenuOption("Effect")
    },
  },
  {
    name: "Export",
    icon: MdDownload,
    action: (store: Store) => {
      store.setSelectedMenuOption("Export")
    },
  },
]
