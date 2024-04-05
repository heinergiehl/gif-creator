"use client"
import { useCallback, useContext, useState } from "react"
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
export const Carousel = observer(() => {
  const [currentlySelectedFrame, setCurrentlySelectedFrame] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const store = React.useContext(StoreContext)
  const timelineRef = useRef<HTMLDivElement>(null)
  const timelinePastRef = useRef<HTMLDivElement>(null)
  gsap.registerPlugin(ScrollToPlugin)
  const [cardWidth, setCardWidth] = useState(120) // State to store dynamic card width
  const cardRef = useRef<HTMLDivElement>(null)
  // ... (rest of the useEffects)
  const handleSelectFrame = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    // Implement frame selection logic based on the event
    const newFrameIndex: number = 0 // This should be dynamically calculated
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
  }, [store.frames, store._editorElements])
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
  }, [store.frames])
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
    if (store.currentKeyFrame !== currentlySelectedFrame) {
      setCurrentlySelectedFrame(store.currentKeyFrame)
    }
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
    <div className="w-full p-4 space-y-4">
      {!creatingGifFrames && store.frames.length > 0 && (
        <div
          className=""
          style={{
            width: carouselWidth,
            margin: "auto",
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
                    console.log(
                      "currentlySelectedFrame",
                      currentlySelectedFrame,
                      cardWidth
                    )
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
                          "relative carousel-item max-w-[60%]   transition-colors duration-200 ease-in-out cursor-pointer ",
                        ])}
                      >
                        <CardSkeleton />
                      </div>
                    )
                  )}
                </div>
              )}
              {!creatingGifFrames && store.frames.length > 0 && (
                <div
                  ref={carouselRef}
                  className="min-w-[300px] xl:min-w-[850px] max-w-[60%]   carousel carousel-center p-4  bg-neutral rounded-box w-full space-x-4 "
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
                          className=""
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
const Timeline: React.FC<TimelineProps> = ({
  currentFrame,
  onSelectFrame,
  totalFrames,
}) => {
  const markerWidthPercent = 100 / totalFrames
  // Calculate the current position of the marker in percentage.
  const currentPositionPercent = markerWidthPercent * (currentFrame + 1)
  return (
    <div className="flex  flex-col items-end 6969">
      {/* display of current frame / total frames */}
      <div className="text-sm font-semibold text-gray-500">
        {currentFrame + 1} / {totalFrames}
      </div>
      <div
        className="z-10 relative w-full h-2 bg-gray-200 items-center justify-center flex rounded-lg"
        onClick={onSelectFrame}
      >
        <div
          className="z-20 absolute top-0 left-0 h-2 bg-blue-500 rounded-lg"
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
