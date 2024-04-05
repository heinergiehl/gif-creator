import { Metadata } from "next"
import React from "react"
import RootNavigation from "../RootNavigation"
export const metadata: Metadata = {
  title: "Free Video to GIF Converter and Editor",
  description:
    "Convert videos to GIFs, and edit them. This means you can add other elemens to the GIF, like text, images, and more.",
  keywords: "video, gif, converter, editor, free",
}
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <RootNavigation />
      {children}
    </div>
  )
}
export default Layout
