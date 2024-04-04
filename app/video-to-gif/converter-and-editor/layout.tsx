import { Metadata } from "next"
export const metaData: Metadata = {
  title: "Video to GIF Converter and Editor",
  description: "Convert video to GIF, edit GIF, and create GIF from images.",
  keywords: ["video", "gif", "converter", "editor", "tools", "free"],
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
