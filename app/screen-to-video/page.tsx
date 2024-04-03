import Head from "next/head"
import Link from "next/link"
import { FaRegCopyright } from "react-icons/fa6"
import { Footer } from "@/app/components/ui/Footer"
export default function ScreenToVideo() {
  return (
    <div>
      <Head>
        <title>Screen to Video Converter</title>
        <meta
          name="description"
          content="Convert screen recordings to videos"
        />
        <meta
          name="keywords"
          content="screen, video, converter, editor, free"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="font-sans">
        <section className="hero bg-base-200">
          <div className="hero-content text-center">
            <div className="max-w-lg">
              <h1 className="text-5xl font-bold">
                Convert Screen Recordings into Videos with Ease
              </h1>
              <p className="py-6">
                Discover the simplest way to convert your screen recordings into
                high-quality videos. With GifMagic.app, you have the tools to
                customize your videos to perfection. Start converting and
                editing today for free!
              </p>
              <Link
                href="/screen-to-video/record-screen"
                className="btn btn-primary"
              >
                Start Recording Screen Now
              </Link>
            </div>
          </div>
        </section>
        <section className="py-16 w-full">
          <div className="container mx-auto px-4 w-full">
            <h2 className="text-3xl font-bold text-center mb-8">
              Why Choose GifMagic.app?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
              <div className="card card-bordered min-w-[200px]">
                <div className="card-body">
                  <h3 className="card-title">High-Quality Conversion</h3>
                  <p>
                    Utilizes advanced algorithms for crisp, clear GIFs that
                    capture every moment beautifully.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[200px]">
                <div className="card-body">
                  <h3 className="card-title">Fast and Easy</h3>
                  <p>
                    Just a few clicks to transform your video into a GIF. No
                    complicated processes.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[200px]">
                <div className="card-body">
                  <h3 className="card-title">Completely Free</h3>
                  <p>
                    GifMagic.app is completely free to use. No hidden costs or
                    subscriptions required.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[200px]">
                <div className="card-body">
                  <h3 className="card-title">
                    Extensive Conversion Functionality
                  </h3>
                  <p>
                    Supports a wide range of video formats for hassle-free
                    conversions. Convert what you see on your screen into a
                    video and share it with the world.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[200px]">
                <div className="card-body">
                  <h3 className="card-title">Unlimited Conversions</h3>
                  <p>
                    Enjoy unlimited video to GIF conversions with GifMagic.app.
                    Record as many videos as you like without any restrictions.
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
                  How do I record my screen and convert it into a video?
                </h3>
                <p>
                  GifMagic.app offers a simple screen recording tool that allows
                  you to capture your screen and convert it into a video. Start
                  recording your screen today and create high-quality videos
                  with ease.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  Can I edit a video after converting it?
                </h3>
                <p>
                  Yes, after converting your screen recording to a video, you
                  can use our editing tools to customize it further. Add text,
                  adjust sizes, and apply filters to make your videos stand out.
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
      </main>
      <Footer />
    </div>
  )
}
