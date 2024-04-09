import React from "react"
import RootNavigation from "../RootNavigation"
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <RootNavigation />
      {children}
    </div>
  )
}
