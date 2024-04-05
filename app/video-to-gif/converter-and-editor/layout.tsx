import RootNavigation from "@/app/RootNavigation"
import { Metadata } from "next"
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <RootNavigation />
      {children}
    </div>
  )
}
