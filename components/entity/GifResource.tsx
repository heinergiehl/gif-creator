// Import React hooks and other necessary components
import React, {
  useContext,
  useState,
  ChangeEvent,
  useEffect,
  useLayoutEffect,
} from "react"
import { observer } from "mobx-react"
import { StoreContext } from "@/store"
import { fabric } from "fabric"
import { SuperGif } from "@wizpanda/super-gif"
// Define a type for storing information about each frame
interface Frame {
  src: string
  nestedObjects: any[] // Define more specific type based on your needs
}
// The GifResource component
const GifResource = observer(() => {
  const store = useContext(StoreContext).store
  const [loading, setLoading] = useState<boolean>(false)
  // Function to extract frames from the GIF stored in  html image element
  const extractFrames = async (file: File) => {
    store.creatingGifFrames = true
    const image = new Image()
    image.src = URL.createObjectURL(file)
    const superGif = new SuperGif(image, { auto_play: false })
    superGif.load(() => {
      const frames: Frame[] = []
      const nestedObjects: { id: string }[] = []
      for (let i = 0; i < superGif.getLength(); i++) {
        superGif.moveTo(i)
        const canvas = superGif.getCanvas()
        const src = canvas.toDataURL("image/png")
        // Add your logic to extract nested objects
        frames.push({ src, nestedObjects })
      }
      store.frames = frames
      store.creatingGifFrames = false
      console.log(frames)
    })
  }
  // Function to handle file change
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await extractFrames(file)
    }
  }
  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <input type="file" accept="image/gif" onChange={handleFileChange} />
          {/* Display extracted frames or any other UI elements here */}
        </>
      )}
    </div>
  )
})
export default GifResource
