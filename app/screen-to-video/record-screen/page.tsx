import { useContext, useEffect, useRef, useState } from "react"
import { useReactMediaRecorder } from "react-media-recorder"
import { fabric } from "fabric"
import { cn } from "@/utils/cn"
import { StoreContext } from "@/store"
import { observer } from "mobx-react"
import dynamic from "next/dynamic"
const RecordComponent = dynamic(
  () => import("@/app/components/recorder/RecordComponent"),
  { ssr: false }
)
console.log("RecordPage", RecordComponent)
const RecordPage = () => {
  return <RecordComponent />
}
export default RecordPage
