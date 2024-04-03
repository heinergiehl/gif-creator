import { Metadata } from "next"
import React from "react"
import { FaRegCopyright } from "react-icons/fa"
export const metadata: Metadata = {
  title: "Video to Gif Converter and Editor",
  description: "Convert and edit videos to gifs",
  keywords: "video, gif, converter, editor, free",
}
function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
export default Layout
