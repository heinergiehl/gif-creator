import { StoreContext } from "@/store"
import { VideoFrame } from "@/store/Store"
import React from "react"
import { observer } from "mobx-react"
export const VideoResource = observer(() => {
  const store = React.useContext(StoreContext)
  const [frameRate, setFrameRate] = React.useState(1)
  const [resolution, setResolution] = React.useState(1)
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    store.creatingGifFrames = true
    const file = event.target.files?.[0]
    if (!file) return
    store.frames = []
    const extractedFrames = await extractFramesFromFile(
      file,
      frameRate,
      resolution
    )
    // render first frame
    store.setVideoFrames(extractedFrames)
    store.creatingGifFrames = false
  }
  async function extractFramesFromFile(
    file: File,
    frameRate: number,
    resolutionScale: number
  ): Promise<VideoFrame[]> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const video = document.createElement("video")
      video.src = url
      video.addEventListener("loadedmetadata", () => {
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth * resolutionScale
        canvas.height = video.videoHeight * resolutionScale
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }
        const frames: VideoFrame[] = []
        video.addEventListener("seeked", async () => {
          if (video.currentTime >= video.duration || video.ended) {
            URL.revokeObjectURL(url) // Cleanup
            resolve(frames)
            return
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          frames.push({ src: canvas.toDataURL(), nestedObjects: [] })
          video.currentTime = Math.min(
            video.duration,
            video.currentTime + 1 / frameRate
          )
        })
        video.currentTime = 0
      })
    })
  }
  return (
    <div className="p-4 h-screen">
      {/* if store._editorelements, make sure to provide option for deleting all  frames and resetting the editor */}
      {store.frames.length > 0 && store._editorElements.length > 0 && (
        <div className="flex flex-col  w-full mb-4">
          <button
            onClick={() => {
              store.frames = []
              store._editorElements = []
              store._canvas?.clear()
            }}
            className="btn btn-primary"
          >
            Delete all Frames and Reset Editor
          </button>
        </div>
      )}
      {store.frames.length === 0 && (
        <>
          <span className="text-xs font-semibold text-gray-700">
            Upload a video to extract frames
          </span>
          <div className="flex text-gray-700 text-xs  flex-col items-center justify-center w-full mb-4">
            <input
              type="file"
              accept="video/*"
              className=" w-full max-w-xs mb-4"
              onChange={handleFileChange}
            />
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className=" ">
                  Frame extraction rate (frames per second):
                </span>
              </div>
              <span className="text-xs font-semibold">{frameRate} fps</span>
              <input
                type="range"
                step="1"
                min="1"
                max="24"
                value={frameRate}
                onChange={(e) => setFrameRate(parseFloat(e.target.value))}
                className=""
              />
            </label>
            <label className="form-control w-full max-w-xs">
              <div className="label flex flex-col items-start">
                <span className="">
                  {" "}
                  Resolution scale (1 for full, 0.5 for half, etc.):
                </span>
                <span className="font-semibold  ">{resolution}</span>
              </div>
              <input
                type="range"
                step="0.1"
                max={1}
                min={0.1}
                value={resolution}
                onChange={(e) => setResolution(parseFloat(e.target.value))}
                className=""
              />
            </label>
          </div>
        </>
      )}
    </div>
  )
})
export default VideoResource
