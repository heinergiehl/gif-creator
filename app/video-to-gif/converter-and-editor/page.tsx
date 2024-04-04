"use client"
import React from "react"
import dynamic from "next/dynamic"
import Head from "next/head"
const DynmaicEditor = dynamic(
  () =>
    import("@/components/video-to-gif/Editor").then(
      (mod) => mod.EditorWithStore
    ),
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
