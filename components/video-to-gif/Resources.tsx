"use client"
import React from "react"
import { StoreContext } from "@/store"
import { observer } from "mobx-react"
import { TextResourcesPanel } from "@/components/panels/TextResourcesPanel"
import VideoResource from "../entity/VideoResource"
import ImageResource from "../entity/ImageResource"
import ExportPanel from "../panels/ExportPanel"
export const Resources = observer(() => {
  const store = React.useContext(StoreContext)
  const selectedMenuOption = store.selectedMenuOption
  return (
    <div className="bg-slate-200 h-full">
      {selectedMenuOption === "Text" ? <TextResourcesPanel /> : null}
      {selectedMenuOption === "Video" ? <VideoResource /> : null}
      {selectedMenuOption === "Image" ? <ImageResource /> : null}
      {selectedMenuOption === "Export" ? <ExportPanel /> : null}
    </div>
  )
})
