"use client"
import React, { useEffect } from "react"
import { StoreContext } from "@/store"
import { observer } from "mobx-react"
import { TextResourcesPanel } from "@/components/panels/TextResourcesPanel"
import VideoResource from "../entity/VideoResource"
import ImageResource from "../entity/ImageResource"
import SmiliesResource from "../entity/SmiliesResource"
import ExportPanel from "../panels/ExportPanel"
import interact from "interactjs"
export const Resources = observer(() => {
  const store = React.useContext(StoreContext)
  const selectedMenuOption = store.selectedMenuOption
  const sidebarRef = React.useRef<HTMLDivElement>(null)
  const [sidebarWidth, setSidebarWidth] = React.useState(300)
  // useEffect(() => {
  //   if (sidebarRef.current) {
  //     interact(sidebarRef.current)
  //       .resizable({
  //         edges: { left: true, right: true, bottom: false, top: false },
  //         modifiers: [
  //           interact.modifiers.restrictSize({
  //             min: { width: 10, height: 0 },
  //             max: { width: 500, height: 2000 },
  //           }),
  //         ],
  //       })
  //       .on("resizemove", (event) => {
  //         store.sidebarWidth = event.rect.width
  //         event.target.style.width = event.rect.width + "px"
  //       })
  //   }
  // }, [])
  return (
    <aside className="bg-slate-200  h-screen" ref={sidebarRef}>
      {selectedMenuOption === "Text" ? <TextResourcesPanel /> : null}
      {selectedMenuOption === "Video" ? <VideoResource /> : null}
      {selectedMenuOption === "Image" ? <ImageResource /> : null}
      {selectedMenuOption === "Export" ? <ExportPanel /> : null}
      {selectedMenuOption === "Smilies" ? <SmiliesResource /> : null}
    </aside>
  )
})
