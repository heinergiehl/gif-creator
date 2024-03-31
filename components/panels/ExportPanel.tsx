import { StoreContext } from "@/store"
import Link from "next/link"
import React, { useState } from "react"
import { observer } from "mobx-react"
const ExportPanel = observer(() => {
  const store = React.useContext(StoreContext)
  const [gifUrl, setGifUrl] = useState<string | null>(null)
  const handleCreateGif = async () => {
    const url = await store.handleSaveAsGif()
    setGifUrl(url) // Store the URL in state
  }
  return (
    <div className="p-4 flex flex-col space-y-2">
      <span className="text-xs font-semibold text-gray-700">
        Configure and Export Your GIFs
      </span>
      <>
        <input
          type="range"
          step={1}
          min="1"
          max="24"
          defaultValue={1}
          value={store.fps}
          onChange={(e) => (store.fps = parseFloat(e.target.value))}
        />
        <>
          <span className="text-xs text-gray-600 label flex flex-col items-start">
            <span className="font-bold"> {store.fps} fps</span> (Be careful with
            higher values. A GIF with 24 fps and 24 frames will only last 1
            second to go through all frames)
          </span>
        </>
      </>
      <>
        <span className="font-bold text-xs text-gray-600 label">
          {" "}
          {store.gifQuality} GIF quality
        </span>
        <input
          type="range"
          min="1"
          max="10"
          defaultValue={5}
          value={store.gifQuality}
          onChange={(e) => (store.gifQuality = parseFloat(e.target.value))}
        />
      </>
      {store._editorElements.some((el) => el.fabricObject) && !gifUrl && (
        <button onClick={handleCreateGif} className="btn btn-primary">
          Create Gif
        </button>
      )}
      {gifUrl && (
        <a href={gifUrl} download="animated.gif" className="btn btn-primary">
          Download Gif
        </a>
      )}
    </div>
  )
})
export default ExportPanel
