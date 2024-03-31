// allows to add images to a specific gif frame (nested object)
// Compare this snippet from components/panels/TexResourcesPanel.tsx:
"use client"
import React from "react"
import { observer } from "mobx-react"
import { StoreContext } from "@/store"
import Image from "next/image"
const ImageResource = observer(() => {
  const store = React.useContext(StoreContext)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onloadend = () => {
      store.imageResources.push(reader.result as string)
    }
    reader.readAsDataURL(file)
  }
  return (
    <div className="p-4 space-y-2">
      <span className="text-xs font-semibold text-gray-700">
        Add Image Resources
      </span>
      <input
        type="file"
        className=" w-full max-w-xs mb-4"
        onChange={handleImageChange}
      />
      {/* image preview; use tailwindcss or daisy ui to make it look good */}
      <div className="flex  flex-col items-center justify-center w-full mb-4 space-y-4">
        {store.imageResources.map((image, index) => (
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
              alt="image resource"
              className="rounded-lg w-40 h-40 object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
})
export default ImageResource
