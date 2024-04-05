import { Metadata } from "next"
import RootNavigation from "../RootNavigation"
export const metadata: Metadata = {
  title: "Free Image to GIF Converter and Editor",
  description:
    "Convert images to GIFs, and edit them. This means you can add other elemens to the GIF, like text, images, and more.",
  keywords: "image, gif, converter, editor, free",
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <RootNavigation />
      {children}
    </div>
  )
}
