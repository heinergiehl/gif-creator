// allows to add images to a specific gif frame (nested object)
// Compare this snippet from components/panels/TexResourcesPanel.tsx:
"use client"
import React, { use } from "react"
import { observer } from "mobx-react"
import { StoreContext } from "@/store"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { DndContext, DragOverlay, useDraggable } from "@dnd-kit/core"
const DraggableImage = observer(
  ({
    image,
    index,
    imageType,
  }: {
    image: string
    index: number
    imageType: ""
  }) => {
    const { attributes, listeners, setNodeRef, isDragging, transform } =
      useDraggable({
        id: `imageResource-${index}`,
      })
    const style = transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          zIndex: 999,
        }
      : undefined
    return (
      <div style={style} ref={setNodeRef} {...listeners} {...attributes}>
        <Image
          id={`imageResource-${index}`}
          src={image}
          width={100}
          height={100}
          alt={"Draggable image resource"}
          className="rounded-lg object-cover
            max-w-[100px] max-h-[100px] cursor-pointer
          "
          draggable={true}
        />
      </div>
    )
  }
)
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
        // store.frames.push({ src: reader.result as string, nestedObjects: [] })
        store.images.push(reader.result as string)
      } else {
        store.images.push(reader.result as string)
        // store.frames.push({ src: reader.result as string, nestedObjects: [] })
      }
    }
  }
  return (
    <>
      <div className="p-4 space-y-2 h-screen">
        <span className="text-xs font-semibold text-gray-700">
          Add Image(s)
        </span>
        <input
          type="file"
          multiple // Allow multiple files
          className="w-full max-w-xs mb-4"
          onChange={handleImageChange}
        />
        <div className="flex flex-col items-center justify-center w-full mb-4 space-y-4">
          {store.images.map((image, index) => (
            <DraggableImage key={index} image={image} index={index} />
          ))}
        </div>
      </div>
    </>
  )
})
export default ImageResource
