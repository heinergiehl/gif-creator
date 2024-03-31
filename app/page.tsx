import Head from "next/head"
import Link from "next/link"
export default function Home() {
  return (
    <div>
      <Head>
        <title>Your App Name - Convert Videos to GIFs Easily</title>
        <meta
          name="description"
          content="Our App Name is the fastest way to convert videos to GIFs. Upload your video and get a high-quality GIF in seconds. Try it now for free!"
        />
        <meta
          name="keywords"
          content="video to GIF, GIF converter, video converter, online GIF maker, create GIFs"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="font-sans">
        <section className="hero bg-base-200">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold">
                Convert Your Videos to GIFs Instantly
              </h1>
              <p className="py-6">
                Experience the fastest way to convert your favorite videos into
                high-quality GIFs. Get started below!
              </p>
              <Link href={"/video-to-gif"} className="btn btn-primary">
                Create GIFs For Free
              </Link>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="card card-bordered">
                <div className="card-body">
                  <h2 className="card-title">High-Quality GIFs</h2>
                  <p>
                    Create stunning GIFs that maintain the quality of your
                    original video.
                  </p>
                </div>
              </div>
              <div className="card card-bordered">
                <div className="card-body">
                  <h2 className="card-title">Fast and Easy</h2>
                  <p>
                    Upload your video and let our tool do the rest. Fast
                    conversions, no hassle.
                  </p>
                </div>
              </div>
              <div className="card card-bordered">
                <div className="card-body">
                  <h2 className="card-title">Totally Free</h2>
                  <p>
                    Enjoy unlimited video to GIF conversions without any cost.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <footer className="fixed bottom-0 footer footer-center p-4 bg-base-300 text-base-content">
          <div>
            <p>Your App Name &copy; 2024. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
