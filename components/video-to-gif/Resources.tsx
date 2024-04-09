"use client"
import React, { useEffect } from "react"
import { StoreContext } from "@/store"
import { observer } from "mobx-react"
import { TextResourcesPanel } from "@/components/panels/TextResourcesPanel"
import VideoResource from "../entity/VideoResource"
import ImageResource from "../entity/ImageResource"
import SmiliesResource from "../entity/SmiliesResource"
import GifResource from "../entity/GifResource"
import ExportPanel from "../panels/ExportPanel"
import interact from "interactjs"
export const Resources = observer(() => {
  const rootStore = React.useContext(StoreContext)
  const store = rootStore.store
  const selectedMenuOption = store.selectedMenuOption
  const sidebarRef = React.useRef<HTMLDivElement>(null)
  return (
    <aside className="bg-slate-200  h-screen" ref={sidebarRef}>
      {selectedMenuOption === "Text" ? <TextResourcesPanel /> : null}
      {selectedMenuOption === "Video" ? <VideoResource /> : null}
      {selectedMenuOption === "Image" ? <ImageResource /> : null}
      {selectedMenuOption === "Export" ? <ExportPanel /> : null}
      {selectedMenuOption === "Smilies" ? <SmiliesResource /> : null}
      {selectedMenuOption === "Gif" ? <GifResource /> : null}
    </aside>
  )
})
