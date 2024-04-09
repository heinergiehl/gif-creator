import { Metadata } from "next"
export const metadata: Metadata = {
  title:
    "Screen to MP4 Video Recorder - Record your screen and save it as a video (Screen-To-Video)",
  description:
    "Record your screen, and save it as a video. You can choose different resolutions, and crop the video to the size you want. It's free and super simple.Then, you can download the video, and turn it into a GIF, or edit it further.",
  keywords: "screen, recorder, free",
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
