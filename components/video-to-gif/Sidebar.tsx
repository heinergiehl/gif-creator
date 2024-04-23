"use client"
import React, { useEffect } from "react"
import { useStores } from "@/store"
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
  MdAnimation,
} from "react-icons/md"
import { usePathname } from "next/navigation"
import { FaRegSmile } from "react-icons/fa"
import { UIStore } from "@/store/UIStore"
type ConversionType = "videoToGif" | "imageToGif" | "gifToGif"
export const Sidebar = observer(() => {
  const pathName = usePathname()
  const store = useStores().uiStore
  let conversionType: ConversionType = "videoToGif"
  switch (pathName) {
    case "/image-to-gif":
      conversionType = "imageToGif"
      break
    case "/video-to-gif":
      conversionType = "videoToGif"
      break
    case "/edit-gifs":
      conversionType = "gifToGif"
      break
    default:
      break
  }
  const [conversionTypeState, setConversionTypeState] =
    React.useState<ConversionType>(conversionType)
  // useEffect(() => {
  //   setConversionTypeState(conversionType)
  //   switch (conversionType) {
  //     case "videoToGif":
  //       store.setSelectedMenuOption("Video")
  //       break
  //     case "imageToGif":
  //       store.setSelectedMenuOption("Image")
  //       break
  //     case "gifToGif":
  //       store.setSelectedMenuOption("Gif")
  //       break
  //     default:
  //       break
  //   }
  // }, [pathName])
  return (
    <ul className="bg-white lg:h-screen  flex sm:flex-col lg:flex-col">
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
    action: (store: UIStore) => {
      store.setSelectedMenuOption("Video")
    },
  },
  {
    name: "Image",
    icon: MdImage,
    action: (store: UIStore) => {
      store.setSelectedMenuOption("Image")
    },
  },
  {
    name: "Gif",
    icon: MdTransform,
    action: (store: UIStore) => {
      store.setSelectedMenuOption("Gif")
    },
  },
  // smilies
  {
    name: "Smilies",
    icon: FaRegSmile,
    action: (store: UIStore) => {
      store.setSelectedMenuOption("Smilies")
    },
  },
  {
    name: "Text",
    icon: MdTitle,
    action: (store: UIStore) => {
      store.setSelectedMenuOption("Text")
    },
  },
  {
    name: "Animation",
    icon: MdAnimation,
    action: (store: UIStore) => {
      store.setSelectedMenuOption("Animation")
    },
  },
  {
    name: "Effect",
    icon: MdMovieFilter,
    action: (store: UIStore) => {
      store.setSelectedMenuOption("Effect")
    },
  },
  {
    name: "Export",
    icon: MdDownload,
    action: (store: UIStore) => {
      store.setSelectedMenuOption("Export")
    },
  },
]
