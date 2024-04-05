"use client"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"
function RootNavigation() {
  const pathName = usePathname()
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
          {Links.map((link) => (
            <Link key={link.name} href={link.path}>
              <span
                className={`text-white font-semibold text-lg ${
                  pathName.includes(link.path) ? "underline" : ""
                }`}
              >
                {link.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
const Links: { name: string; path: string }[] = [
  { name: "Video-To-GIF", path: "/video-to-gif" },
  { name: "Image-To-GIF", path: "/image-to-gif" },
  { name: "Screen-To-Video", path: "/screen-to-video" },
]
export default RootNavigation
