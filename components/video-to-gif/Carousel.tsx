"use client"
import { use, useCallback, useContext, useState } from "react"
import Image from "next/image"
import { cn } from "@/utils/cn"
import { Store } from "@/store/Store"
import { useRef } from "react"
import { observer } from "mobx-react-lite"
import { createContext } from "react"
import { StoreContext } from "@/store"
import { EditorElement } from "@/types"
import { useEffect } from "react"
import { gsap } from "gsap"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import React from "react"
import { useDroppable } from "@dnd-kit/core"
export const Carousel = observer(() => {
  const { isOver, setNodeRef } = useDroppable({
    id: "carousel",
  })
  const rootStore = React.useContext(StoreContext)
  const store = rootStore.store
  const [currentlySelectedFrame, setCurrentlySelectedFrame] = useState(
    store.currentKeyFrame
  )
  const carouselRef = useRef<HTMLDivElement>(null)
  gsap.registerPlugin(ScrollToPlugin)
  const [cardWidth, setCardWidth] = useState(120) // State to store dynamic card width
  const cardRef = useRef<HTMLDivElement>(null)
  // ... (rest of the useEffects)
  const handleSelectFrame = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    // Implement frame selection logic based on the event
    const newFrameIndex: number = 0 // Calculate the new frame index based on the event
    setCurrentlySelectedFrame(newFrameIndex)
    store.setCurrentKeyFrame(newFrameIndex)
    // Additional logic as necessary
  }
  const creatingGifFrames = store.creatingGifFrames
  // calculate how many cards fit in the carousel based on the width of the carousel and the width of the card. this is needed for skeleton placeholders
  const skeletonCarouselRef = useRef<HTMLDivElement>(null)
  const [cardsFitInCarousel, setCardsFitInCarousel] = useState(0)
  useEffect(() => {
    if (skeletonCarouselRef.current) {
      const carouselWidth = skeletonCarouselRef.current.offsetWidth
      const cardsFitInCarousel = Math.floor(carouselWidth / cardWidth)
      setCardsFitInCarousel(cardsFitInCarousel)
    }
  }, [store.frames, cardWidth])
  const [carouselWidth, setCarouselWidth] = useState(0)
  useEffect(() => {
    if (carouselRef.current) {
      setCarouselWidth(carouselRef.current.offsetWidth)
    }
  }, [store.frames, store.editorElements])
  useEffect(() => {
    const updateCardWidth = () => {
      const card = carouselRef.current?.querySelector(
        ".carousel-item"
      ) as HTMLDivElement | null
      if (card) {
        setCardWidth(card.getBoundingClientRect().width)
      }
    }
    updateCardWidth()
    const observer = new MutationObserver(updateCardWidth)
    if (carouselRef.current) {
      observer.observe(carouselRef.current, { childList: true })
    }
    return () => observer.disconnect()
  }, [store.frames, store.editorElements])
  useEffect(() => {
    const scrollPosition = cardWidth * currentlySelectedFrame
    if (carouselRef.current) {
      gsap.to(carouselRef.current, {
        scrollTo: { x: scrollPosition },
        duration: 0.1,
        ease: "sine.inOut",
      })
    }
  }, [currentlySelectedFrame, cardWidth])
  useEffect(() => {
    if (store.currentKeyFrame !== currentlySelectedFrame)
      setCurrentlySelectedFrame(store.currentKeyFrame)
  }, [store.currentKeyFrame])
  const handleDeleteFrame = (index: number): void => {
    store.deleteFrame(index) // Assuming this method exists on the store
    if (index === currentlySelectedFrame || index === store.frames.length - 1) {
      const newSelectedIndex =
        (index === 0 ? 0 : index - 1) % store.frames.length
      setCurrentlySelectedFrame(newSelectedIndex)
      store.setCurrentKeyFrame(newSelectedIndex) // Assuming this method exists on the store
    }
  }
  return (
    <div className="max-w-[850px] p-4 space-y-4" ref={setNodeRef}>
      {!creatingGifFrames && (
        <div
          className="max-w-[750px]  space-y-4"
          style={{
            width: carouselWidth,
            margin: "0 auto",
          }}
        >
          <Timeline
            currentFrame={currentlySelectedFrame}
            onSelectFrame={handleSelectFrame}
            totalFrames={store.frames.length}
          />
        </div>
      )}
      <div className="  space-x-4  ">
        <div className="  space-y-4">
          <div className="flex justify-center items-center space-x-4">
            {creatingGifFrames && <ButtonSkeleton />}
            {!creatingGifFrames && store.frames.length > 0 && (
              <button
                onClick={() => {
                  if (carouselRef.current) {
                    gsap.to(carouselRef.current, {
                      scrollTo: { x: "-=" + cardWidth },
                      duration: 1,
                      ease: "sine.inOut",
                    })
                    if (currentlySelectedFrame > 0) {
                      setCurrentlySelectedFrame(
                        (currentlySelectedFrame - 1 + store.frames.length) %
                          store.frames.length
                      )
                      store.setCurrentKeyFrame(currentlySelectedFrame - 1)
                      store.addCurrentGifFrameToCanvas()
                    }
                  }
                }}
                className="btn btn-outline"
              >
                Prev
              </button>
            )}
            <>
              {creatingGifFrames && (
                <div
                  ref={skeletonCarouselRef}
                  className="min-w-[300px] xl:min-w-[850px]   carousel carousel-center p-4  bg-neutral rounded-box w-full space-x-4 "
                >
                  {Array.from({ length: cardsFitInCarousel }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className={cn([
                          "relative carousel-item   transition-colors duration-200 ease-in-out cursor-pointer ",
                        ])}
                      >
                        <CardSkeleton />
                      </div>
                    )
                  )}
                </div>
              )}
              {!creatingGifFrames && (
                <div
                  id="carousel"
                  ref={carouselRef}
                  className="min-w-[300px] xl:min-w-[650px] min-h-[120px]   carousel carousel-center   bg-neutral rounded-box   flex items-center"
                >
                  {
                    // display the frames
                    store.frames.map((videoFrame, index) => (
                      // make sure the currently selected frame  has border around it
                      <div
                        onClick={() => {
                          setCurrentlySelectedFrame(index)
                          store.setCurrentKeyFrame(index)
                          store.addCurrentGifFrameToCanvas()
                        }}
                        className={cn([
                          "relative carousel-item    transition-colors duration-200 ease-in-out cursor-pointer ",
                        ])}
                        key={index}
                      >
                        {index === currentlySelectedFrame && (
                          <div className="absolute inset-0 bg-primary opacity-50   transition-all duration-300"></div>
                        )}
                        <Image
                          onLoad={(e) => {
                            store.cardItemHeight = e.currentTarget.naturalHeight
                            store.cardItemWidth = e.currentTarget.naturalWidth
                          }}
                          id={"image-" + index}
                          width={120}
                          height={70}
                          src={videoFrame.src}
                          alt={`Frame ${index + 1}`}
                          className="max-h-[70px] max-w-[120px] rounded-lg object-cover"
                        />
                        {/* display the current frame number */}
                        <div className="absolute top-2 left-[50%] translate-x-[-50%] bg-primary text-white p-1 rounded-full">
                          {index + 1}
                        </div>
                        {/* delete frame */}
                        <button
                          onClick={() => {
                            handleDeleteFrame(index)
                          }}
                          className="absolute top-2 right-2 text-white z-20"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))
                  }
                </div>
              )}
              {creatingGifFrames && <ButtonSkeleton />}
              {!creatingGifFrames && store.frames.length > 0 && (
                <button
                  onClick={() => {
                    if (carouselRef.current) {
                      gsap.to(carouselRef.current, {
                        scrollTo: { x: "+=" + cardWidth },
                        duration: 0.5,
                        ease: "sine.inOut",
                      })
                      if (currentlySelectedFrame < store.frames.length) {
                        setCurrentlySelectedFrame(
                          (currentlySelectedFrame + 1) % store.frames.length
                        )
                        store.setCurrentKeyFrame(currentlySelectedFrame + 1)
                        store.addCurrentGifFrameToCanvas()
                      }
                    }
                  }}
                  className="btn btn-outline"
                >
                  Next
                </button>
              )}
            </>
          </div>
        </div>
      </div>
    </div>
  )
})
const ButtonSkeleton = () => (
  <div className="inline-block px-6 py-2 rounded-md skeleton h-10 w-20"></div>
)
// when the
const CardSkeleton = () => {
  return <div className="skeleton w-[120px] h-[70px]"></div>
}
interface Frame {
  id: number
  url: string
}
interface TimelineProps {
  currentFrame: number
  onSelectFrame: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  totalFrames: number
}
const Timeline: React.FC<TimelineProps> = observer(
  ({ currentFrame, onSelectFrame, totalFrames }) => {
    const store = useContext(StoreContext).store
    const markerWidthPercent = 100 / totalFrames
    const [tooltipContent, setTooltipContent] = useState("")
    const timelineRef = useRef<HTMLDivElement>(null)
    const [frameNumber, setFrameNumber] = useState(0)
    // mouse position on the timeline
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const handleMouseMove = (
      event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
      if (timelineRef.current) {
        const { left, width } = timelineRef.current.getBoundingClientRect()
        setMousePosition({
          x: event.clientX - left,
          y: event.clientY,
        })
        const mouseXRelativeToTimeline = event.clientX - left // Mouse X position relative to the timeline start
        const frameNumber = Math.ceil(
          (mouseXRelativeToTimeline / width) * totalFrames
        )
        setTooltipContent(`Frame: ${frameNumber}`)
        setFrameNumber(frameNumber)
      }
    }
    let currentPositionPercent = 0
    if (store.frames.length > 0) {
      currentPositionPercent = markerWidthPercent * currentFrame
    } else {
      currentPositionPercent = 0
    }
    const tooltip = useRef<HTMLDivElement>(null)
    return (
      <div
        onMouseMove={handleMouseMove}
        className="flex  flex-col items-end 6969 relative "
        onClick={() => {
          store.currentKeyFrame = frameNumber - 1
          store.addCurrentGifFrameToCanvas()
        }}
      >
        {/* display of current frame / total frames */}
        <div className="text-sm font-semibold text-gray-500">
          {store.frames.length ? store.currentKeyFrame + 1 : 0} / {totalFrames}
        </div>
        <div
          ref={tooltip}
          data-tip={tooltipContent}
          // make sure the tooltips is being displayed, where the mouse is on the x-axis
          style={{ left: `${mousePosition.x}px` }}
          className="tooltip w-20 h-20 absolute z-[100]"
        />
        <div
          ref={timelineRef}
          className="z-10 relative w-full h-4 bg-gray-200 items-center justify-center flex rounded-lg "
          onClick={onSelectFrame}
        >
          <div
            className="z-10 absolute  left-0 h-2 bg-blue-500 rounded-lg"
            style={{ width: `${currentPositionPercent}%` }}
          ></div>
          <div
            className="z-[30] absolute w-2 h-2 bg-red-500 rounded-full"
            style={{ left: `calc(${currentPositionPercent}% - 5px)` }}
          ></div>
        </div>
      </div>
    )
  }
)
