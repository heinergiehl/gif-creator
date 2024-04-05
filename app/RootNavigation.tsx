"use client"
import Image from "next/image"
import Link from "next/link"
import React from "react"
function RootNavigation() {
  return (
    <nav className="fixed z-[100]  h-16 inset-0 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="relative w-full h-full">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="logo"
            width={140}
            height={140}
            className="absolute top-[50%] translate-y-[-50%] left-4"
          />
        </Link>
        {/* video to gif */}
        <div className="w-full flex ml-[200px] justify-start items-center h-full space-x-8">
          <Link href="/video-to-gif">
            <div className="text-white">Video-To-GIF</div>
          </Link>
          <Link href="/image-to-gif">
            <div className="text-white">Image-To-GIF</div>
          </Link>
          <Link href="/screen-to-video">
            <div className="text-white">Screen-To-Video</div>
          </Link>
        </div>
      </div>
    </nav>
  )
}
export default RootNavigation
