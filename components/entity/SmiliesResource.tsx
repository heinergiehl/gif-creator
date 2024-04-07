// SmiliesResource.jsx
"use client"
import React, { useEffect, useState, useContext } from "react"
import { observer } from "mobx-react"
import { StoreContext } from "@/store"
import { DndContext, useDraggable } from "@dnd-kit/core"
import Image from "next/image"
const API_KEY = "43266925-5f9d4a4a69a0b1f37c83e9c7a"
interface ImageProps {
  image: {
    id: string
    webformatURL: string
  }
  index: number
}
const DraggableImage = observer(({ image, index }: ImageProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `imageResource-${index}`,
  })
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
      }
    : undefined
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="p-2">
      <Image
        id={"imageResource-" + index}
        src={image.webformatURL}
        width={100}
        height={100}
        alt={"Smiley"}
        style={style}
        className="rounded-lg object-cover"
        draggable={false} // It's important to disable the native HTML drag and drop
      />
    </div>
  )
})
const SmiliesResource = observer(() => {
  const [smilies, setSmilies] = useState<
    { id: string; webformatURL: string }[]
  >([])
  const [imageType, setImageType] = useState("vector")
  const store = useContext(StoreContext)
  useEffect(() => {
    const fetchSmilies = async () => {
      try {
        const response = await fetch(
          `https://pixabay.com/api/?key=${API_KEY}&q=smilies&image_type=${imageType}`
        )
        const data = await response.json()
        setSmilies(data.hits)
      } catch (error) {
        console.error("Error fetching smilies:", error)
      }
    }
    fetchSmilies()
  }, [imageType])
  return (
    <div className="p-4 space-y-2 h-screen">
      <span className="text-xs font-semibold text-gray-700">Add Smilies</span>
      <select value={imageType} onChange={(e) => setImageType(e.target.value)}>
        <option value="vector">Vector</option>
        <option value="photo">Photo</option>
        <option value="illustration">Illustration</option>
      </select>
      <div className="flex flex-wrap items-center justify-center">
        {smilies.map((smiley, index) => (
          <DraggableImage key={smiley.id} image={smiley} index={index} />
        ))}
      </div>
    </div>
  )
})
export default SmiliesResource
