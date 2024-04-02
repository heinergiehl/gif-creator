import Head from "next/head"
import Link from "next/link"
export default function Home() {
  return (
    <div>
      <Head>
        <title>
          Convert Videos to GIFs | GifMagic - High-Quality, Fast, and Free
        </title>
        <meta
          name="description"
          content="GifMagic.app offers a powerful video to GIF converter that allows you to create high-quality GIFs. Customize frame rates, add text, and edit your GIFs with ease. Start creating for free today!"
        />
        <meta
          name="keywords"
          content="video to GIF, high-quality GIFs, GIF editing, free GIF converter, video converter, online GIF maker, edit GIFs, add text to GIF, GIF customization"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="font-sans">
        <section className="hero bg-base-200">
          <div className="hero-content text-center">
            <div className="max-w-lg">
              <h1 className="text-5xl font-bold">
                Transform Videos into GIFs with Ease
              </h1>
              <p className="py-6">
                Discover the simplest way to convert your videos into
                high-quality GIFs. With GifMagic.app, you have the tools to
                customize your GIFs to perfection. Start converting and editing
                today for free!
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
                    Enjoy unlimited conversions and edits without any fees.
                    Quality comes at no cost.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[200px]">
                <div className="card-body">
                  <h3 className="card-title">Extensive Editing Tools</h3>
                  <p>
                    Customize your GIFs with text, adjustments, and filters.
                    Make your GIFs stand out.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[200px]">
                <div className="card-body">
                  <h3 className="card-title">Support for Multiple Formats</h3>
                  <p>
                    Supports a wide range of video formats for hassle-free
                    conversions.
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
                  then customize the GIF's frame rate, add text, or edit it
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
        <footer className="footer footer-center p-4 bg-base-300 text-base-content">
          <p>GIFMagic.app &copy; 2024. All rights reserved.</p>
        </footer>
      </main>
    </div>
  )
}
