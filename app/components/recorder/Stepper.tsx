"use client"
import { useStores } from "@/store"
import { observer } from "mobx-react"
import { useContext, useEffect, useState } from "react"
const Stepper = observer(() => {
  const [steps, setSteps] = useState([
    {
      text: "Start Recording: Choose from Tab, Window or Screen",
      isPrimary: true,
    },
    {
      text: "Stop Recording: Stop once you are done recording",
      isPrimary: false,
    },
    {
      text: "Choose Resolution: Choose a resolution you like to save the video in",
      isPrimary: false,
    },
    {
      text: "Crop Video: Crop the video, if you like to have a specific part of the video magnified.",
      isPrimary: false,
    },
  ])
  const root = useStores()
  const store = root.screenToVideoStore
  const currentStep = store.currentStep
  useEffect(() => {
    const newSteps = steps.map((step, index) => {
      if (index + 1 === currentStep) {
        return {
          ...step,
          isPrimary: true,
        }
      }
      return {
        ...step,
        isPrimary: false,
      }
    })
    setSteps(newSteps)
  }, [currentStep])
  return (
    <ul className="steps steps-vertical max-w-[400px] text-sm">
      {steps.map((step, index) => (
        <li
          key={index}
          className={`step ${
            step.isPrimary ? "step-primary font-bold" : "text-gray-400"
          }`}
        >
          {step.text}
        </li>
      ))}
    </ul>
  )
})
export default Stepper
