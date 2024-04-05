// allows to add images to a specific gif frame (nested object)
// Compare this snippet from components/panels/TexResourcesPanel.tsx:
"use client"
import React, { use } from "react"
import { observer } from "mobx-react"
import { StoreContext } from "@/store"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { VideoFrame } from "@/store/Store"
const ImageResource = observer(() => {
  const pathName = usePathname()
  const isVideoToGif = pathName.includes("video-to-gif")
  const store = React.useContext(StoreContext)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const reader = new FileReader()
    reader.readAsDataURL(e.target.files[0])
    reader.onloadend = () => {
      if (isVideoToGif) {
        store.imageResources.push(reader.result as string)
      } else {
        store.images.push(reader.result as string)
        store.frames.push({ src: reader.result as string, nestedObjects: [] })
      }
    }
  }
  return (
    <div className="p-4 space-y-2 h-screen">
      <span className="text-xs font-semibold text-gray-700">
        Add Image Resources
      </span>
      <input
        type="file"
        multiple // Allow multiple files
        className=" w-full max-w-xs mb-4"
        onChange={handleImageChange}
      />
      <div className="flex  flex-col items-center justify-center w-full mb-4 space-y-4">
        {isVideoToGif &&
          store.imageResources.map((image, index) => (
            <div
              key={index}
              className="flex flex-col "
              onClick={() => store.addImage(index, true)}
            >
              <Image
                id={`imageResource-${index}`}
                src={image}
                width={100}
                height={100}
                alt={"imageResource"}
                className="rounded-lg w-40 h-40 object-cover"
              />
            </div>
          ))}
        {!isVideoToGif &&
          store.images.map((image, index) => (
            <div
              key={index}
              className="flex flex-col "
              onClick={() => {
                store.creatingGifFrames = true
                store.addImage(index, false)
                store.creatingGifFrames = false
              }}
            >
              <Image
                id={`image-${index}`}
                src={image}
                width={100}
                height={100}
                alt={"image"}
                className="rounded-lg w-40 h-40 object-cover"
              />
            </div>
          ))}
      </div>
    </div>
  )
})
export default ImageResource
