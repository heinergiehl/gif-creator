"use client"
import Image from "next/image"
import Link from "next/link"
import React from "react"
function Navigation() {
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
      </div>
    </nav>
  )
}
export default Navigation
