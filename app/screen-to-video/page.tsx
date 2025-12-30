import Link from 'next/link';
import { Footer } from '@/app/components/ui/Footer';
import { SITE_BRAND } from '@/lib/site';
export default function ScreenToVideo() {
  return (
    <div>
      <main className="mt-[62px] font-sans">
        <section className="hero bg-base-200">
          <div className="hero-content text-center">
            <div className="max-w-lg">
              <h1 className="text-5xl font-bold">Free Online Screen Recorder</h1>
              <p className="py-6">
                Record your screen in the browser and download the result as a video. Pick a
                resolution, crop to the area you want, then turn the clip into a GIF or keep it as
                MP4 for sharing.
              </p>
              <Link href="/screen-to-video/record-screen" className="btn btn-primary">
                Start recording
              </Link>
            </div>
          </div>
        </section>
        <section className="w-full py-16">
          <div className="container mx-auto w-full px-4">
            <h2 className="mb-8 text-center text-3xl font-bold">
              Why use {SITE_BRAND} for screen recording?
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">High-Quality Conversion</h3>
                  <p>
                    Create sharp recordings with a simple workflow — no sign-up required.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">Fast and Easy</h3>
                  <p>
                    Record, crop, download — and convert to a GIF when you’re ready. No complicated
                    setup.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">Completely Free</h3>
                  <p>
                    {SITE_BRAND} is completely free to use. No hidden costs or subscriptions
                    required.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">Extensive Conversion Functionality</h3>
                  <p>
                    Record your whole screen, a browser tab, or a single application window and
                    download a shareable video in minutes.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">Unlimited Conversions</h3>
                  <p>
                    Record as often as you like. When you need a GIF, convert your clip with our
                    tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-gray-100 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-3xl font-bold">Frequently Asked Questions</h2>
            <div className="space-y-8 text-left">
              <div>
                <h3 className="text-xl font-semibold">
                  How do I record my screen and convert it into a video?
                </h3>
                <p>
                  Click “Start recording”, choose what you want to capture (screen, tab, or window),
                  then download the result as a video when you’re done.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Can I edit a video after converting it?</h3>
                <p>
                  Yes, after converting your screen recording to a video, you can use our editing
                  tools to customize it further. Add text, adjust sizes, and apply filters to make
                  your videos stand out.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Can I edit a GIF after converting it?</h3>
                <p>
                  Yes, after converting your video to a GIF, our platform offers various editing
                  tools. You can add text, adjust sizes, rotate, and scale images within your GIF,
                  making it perfectly suited to your needs.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  Is there a limit to how many GIFs I can create?
                </h3>
                <p>
                  At {SITE_BRAND}, we offer unlimited video to GIF conversions. Our service is
                  completely free, allowing you to create as many GIFs as you like without any
                  restrictions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
