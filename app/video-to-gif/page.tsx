import Head from "next/head"
import Link from "next/link"
import { FaRegCopyright } from "react-icons/fa6"
import { Footer } from "@/app/components/ui/Footer"
import { Metadata } from "next"
export const metadata: Metadata = {
  title: "Free MP4 Video to GIF Online conversion tool | GifMagic.app",
  description:
    "Easily convert your videos to high-quality GIFs with GifMagic.app. Extract precise images, add text, elements, and more. Customize your GIFs effortlessly with our intuitive editor. Ready in seconds, no sign-up required.",
  keywords:
    "video to GIF converter, convert video, GIF maker, online GIF editor, customize GIF, add text to GIF, free GIF converter, GifMagic.app",
  alternates: { canonical: "https://www.gifmagic.app/video-to-gif" },
}
export default function VideoToGif() {
  return (
    <div>
      <main className="font-sans mt-[62px]">
        <section className="hero bg-base-200">
          <div className="hero-content text-center">
            <div className="max-w-lg">
              <h1 className="text-5xl font-bold">
                Free MP4 Video to GIF Online conversion tool
              </h1>
              <p className="py-6">
                Transform videos into high-quality, customized GIFs in just a
                few clicks with GifMagic.app, our awesome gifmaker. Our
                intuitive editor allows you to extract the precise images you
                want, add text in various fonts and sizes, and embellish your
                GIF with unique elements and images. Experience the magic of
                creating beautiful, customized GIFs effortlessly and quickly,
                ready to download and share.
              </p>
              <Link
                href="/video-to-gif/converter-and-editor"
                className="btn btn-primary"
              >
                Convert Video to GIF Now
              </Link>
            </div>
          </div>
        </section>
        <section className="py-16 w-full">
          <div className="container mx-auto px-4 w-full">
            <h2 className="text-3xl font-bold text-center mb-8">
              Why GifMagic.app is Your Go-To GIF Creation Tool
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">Extract with Precision</h3>
                  <p>
                    Use our editor to easily select and extract images from your
                    videos for the perfect GIF. No detail is too small.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">Customize Freely</h3>
                  <p>
                    Add text, choose from various fonts and sizes, and insert
                    elements and images to perfectly frame your GIF.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">Fast and Simple</h3>
                  <p>
                    Our process is streamlined for ease and speed, ensuring your
                    customized GIF is ready in just seconds.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">High-Quality Outputs</h3>
                  <p>
                    Expect nothing less than beautiful, high-quality GIFs that
                    bring your visions to life, ready for any platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              Get Started with GifMagic.app Today
            </h2>
            <div className="text-left space-y-8">
              <div>
                <h3 className="text-xl font-semibold">
                  How does the video-to-GIF conversion work?
                </h3>
                <p>
                  GifMagic.app simplifies the conversion process. Just upload
                  your video, use our editor to customize it, and download your
                  high-quality, personalized GIF in seconds.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  What customization options are available?
                </h3>
                <p>
                  Beyond text and images, GifMagic.app allows you to add unique
                  elements, adjust sizes, and much more, giving you total
                  creative freedom over your GIFs.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  Is GifMagic.app free to use?
                </h3>
                <p>
                  Absolutely! GifMagic.app is your free resource for creating
                  unlimited, high-quality, customized GIFs without any hidden
                  costs.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
