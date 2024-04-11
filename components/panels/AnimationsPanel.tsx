"use client"
import React from "react"
import { StoreContext } from "@/store"
import { observer } from "mobx-react"
import { AnimationResource } from "../entity/AnimationResource"
import { getUid } from "@/utils"
export const AnimationsPanel = observer(() => {
  const store = React.useContext(StoreContext).store
  const selectedElement = store._selectedElement
  const selectedElementAnimations = store.animations.filter((animation) => {
    return animation.targetId === selectedElement?.id
  })
  const hasFadeInAnimation = selectedElementAnimations.some((animation) => {
    return animation.type === "fadeIn"
  })
  const hasFadeOutAnimation = selectedElementAnimations.some((animation) => {
    return animation.type === "fadeOut"
  })
  const hasSlideInAnimation = selectedElementAnimations.some((animation) => {
    return animation.type === "slideIn"
  })
  const hasSlideOutAnimation = selectedElementAnimations.some((animation) => {
    return animation.type === "slideOut"
  })
  const hasConsantAnimation = selectedElementAnimations.some((animation) => {
    return animation.type === "breathe"
  })
  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Animations
      </div>
      {selectedElement && !hasFadeInAnimation ? (
        <div
          className="text-sm px-[16px] py-[8px] font-semibold hover:bg-slate-700 hover:text-white cursor-pointer"
          onClick={() => {
            store.addAnimation({
              type: "fadeIn",
              duration: 1000,
              targetId: selectedElement.id,
              id: getUid(),
              properties: {},
            })
          }}
        >
          Add Fade In
        </div>
      ) : null}
      {selectedElement && !hasFadeOutAnimation ? (
        <div
          className="text-sm px-[16px] py-[8px] font-semibold hover:bg-slate-700 hover:text-white cursor-pointer"
          onClick={() => {
            store.addAnimation({
              type: "fadeOut",
              duration: 1000,
              targetId: selectedElement.id,
              id: getUid(),
              properties: {},
            })
          }}
        >
          Add Fade Out
        </div>
      ) : null}
      {selectedElement && !hasSlideInAnimation ? (
        <div
          className="text-sm px-[16px] py-[8px] font-semibold hover:bg-slate-700 hover:text-white cursor-pointer"
          onClick={() => {
            store.addAnimation({
              type: "slideIn",
              duration: 1000,
              targetId: selectedElement.id,
              id: getUid(),
              properties: {
                direction: "left",
                useClipPath: false,
                textType: "none",
              },
            })
          }}
        >
          Add Slide In
        </div>
      ) : null}
      {selectedElement && !hasSlideOutAnimation ? (
        <div
          className="text-sm px-[16px] py-[8px] font-semibold hover:bg-slate-700 hover:text-white cursor-pointer"
          onClick={() => {
            store.addAnimation({
              type: "slideOut",
              duration: 1000,
              targetId: selectedElement.id,
              id: getUid(),
              properties: {
                direction: "left",
                useClipPath: false,
                textType: "none",
              },
            })
          }}
        >
          Add Slide Out
        </div>
      ) : null}
      {selectedElement && !hasConsantAnimation ? (
        <div
          className="text-sm px-[16px] py-[8px] font-semibold hover:bg-slate-700 hover:text-white cursor-pointer"
          onClick={() => {
            store.addAnimation({
              type: "breathe",
              duration: 1000,
              targetId: selectedElement.id,
              id: getUid(),
              properties: {
                breathType: "constant",
                breathSize: 1,
              },
            })
          }}
        >
          Add Breathing
        </div>
      ) : null}
      {selectedElementAnimations.map((animation) => {
        return <AnimationResource key={animation.id} animation={animation} />
      })}
    </>
  )
})
