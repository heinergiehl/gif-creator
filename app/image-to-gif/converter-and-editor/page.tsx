"use client"
import React from "react"
import { EditorWithStore } from "@/components/video-to-gif/Editor"
import dynamic from "next/dynamic"
const DynmaicEditor = dynamic(
  () =>
    import("@/components/video-to-gif/Editor").then(
      (mod) => mod.EditorWithStore
    ),
  {
    ssr: false,
  }
)
export default function ConverterAndEditor() {
  return <DynmaicEditor />
}
