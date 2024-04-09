"use client"
import React from "react"
import dynamic from "next/dynamic"
const DynmaicEditor = dynamic(
  () => import("@/components/video-to-gif/Editor"),
  {
    ssr: false,
  }
)
function page() {
  return (
    <>
      <DynmaicEditor />
    </>
  )
}
export default page
