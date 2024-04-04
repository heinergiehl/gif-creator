import { Metadata } from "next"
import Head from "next/head"
import Link from "next/link"
import { FaRegCopyright } from "react-icons/fa6"
import { Footer } from "./components/ui/Footer"
export const metadata: Metadata = {
  title: "Free GIF Maker: Create GIFs from Videos or Images with GifMagic.app",
  description:
    "GifMagic.app is a free online GIF maker that lets you create GIFs from videos or images. Convert videos to GIFs, edit GIFs, and share them with ease!",
  keywords: "gif maker, video, converter, editor, free gif maker, gif creator",
}
export default function Home() {
  return (
    <div>
      <main className="font-sans">
        <section className="hero bg-base-200 mt-[62px] ">
          <div className="hero-content text-center">
            <div className="max-w-lg">
              <h1 className="text-5xl font-bold">Free Online GIF Maker</h1>
              <p className="py-6">
                Convert videos to GIFs, edit GIFs, and share them with ease
                using GifMagic.app. No sign-up required!
              </p>
              <Link href="/video-to-gif" className="btn btn-primary">
                Convert to GIF Now
              </Link>
            </div>
          </div>
        </section>
        <section className="py-16 w-full">
          <div className="container mx-auto px-4 w-full">
            <h2 className="text-3xl font-bold text-center mb-8">
              Why Choose GifMagic.app?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ">
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">
                    Easy to use high quality Online GIF maker
                  </h3>
                  <p>
                    Create high-quality GIFs from videos or images with just a
                    few clicks. No sign-up required!
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">Fast and Easy</h3>
                  <p>
                    Most services like ezgif, imgflip, and giphy don't offer the
                    same level of quality and ease of use as GifMagic.app.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">Completely Free</h3>
                  <p>
                    Enjoy unlimited conversions and edits without any fees.
                    Quality comes at no cost.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">Extensive Editing Tooling</h3>
                  <p>
                    GIFMagic.app offers a wide range of editing tools to help
                    you. It allows you to perform video-to-gif, image-to-gif,
                    and gif-to-video conversions. You can also add text To GIFs,
                    adjust frame rates, and customize your GIFs to your liking.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">
                    A Unique Feature: screen-to-video
                  </h3>
                  <p>
                    GifMagic.app offers a unique screen-to-video feature that
                    allows you to record your screen and convert it into a
                    video. You can choose to record a window, a tab, or the
                    entire screen. Also, you can edit the resolution of the
                    video, and crop it to your liking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="text-left space-y-8">
              <div>
                <h3 className="text-xl font-semibold">
                  How do I convert a video to a GIF?
                </h3>
                <p>
                  Simply upload your video file to GifMagic.app, and our tool
                  will instantly convert it into a high-quality GIF. You can
                  then customize the GIFs frame rate, add text, or edit it
                  further according to your needs.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  What video formats are supported?
                </h3>
                <p>
                  GifMagic.app supports a wide range of video formats, including
                  MP4, AVI, WEBM, and more. This ensures you can easily convert
                  most video files into GIFs without worrying about
                  compatibility issues.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  Can I edit a GIF after converting it?
                </h3>
                <p>
                  Yes, after converting your video to a GIF, our platform offers
                  various editing tools. You can add text, adjust sizes, rotate,
                  and scale images within your GIF, making it perfectly suited
                  to your needs.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  Is there a limit to how many GIFs I can create?
                </h3>
                <p>
                  At GifMagic.app, we offer unlimited video to GIF conversions.
                  Our service is completely free, allowing you to create as many
                  GIFs as you like without any restrictions.
                </p>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </div>
  )
}
