import Link from 'next/link';
import { Footer } from '@/app/components/ui/Footer';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Free Screen Recorder',
  description:
    "Record your screen, and save it as a video. You can choose different resolutions, and crop the video to the size you want. It's free and super simple.Then, you can download the video, and turn it into a GIF, or edit it further.",
  keywords: 'screen, recorder, free',
  alternates: { canonical: 'https://www.gifmagic.app/screen-to-video' },
};
export default function ScreenToVideo() {
  return (
    <div>
      <main className="mt-[62px] font-sans">
        <section className="hero bg-base-200">
          <div className="hero-content text-center">
            <div className="max-w-lg">
              <h1 className="text-5xl font-bold">Screen To GIF Converter</h1>
              <p className="py-6">
                Record your screen and save it as a video. Choose different resolutions and crop the
                video to the size you want. It's free and super simple. Then, you can download the
                video and turn it into a GIF or edit it further.
              </p>
              <Link href="/screen-to-video/record-screen" className="btn btn-primary">
                Start Recording Screen Now
              </Link>
            </div>
          </div>
        </section>
        <section className="w-full py-16">
          <div className="container mx-auto w-full px-4">
            <h2 className="mb-8 text-center text-3xl font-bold">
              Why Choose GifMagic.app for screen-to-video or screen-to-gif ?
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">High-Quality Conversion</h3>
                  <p>
                    Create high-quality videos from your screen recordings with just a few clicks.
                    No sign-up required!
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">Fast and Easy</h3>
                  <p>
                    Just with a few clicks, you can transform your screen recording into a video.
                    And then, you can convert it into a GIF. No complicated processes.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">Completely Free</h3>
                  <p>
                    GifMagic.app is completely free to use. No hidden costs or subscriptions
                    required.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">Extensive Conversion Functionality</h3>
                  <p>
                    Supports a wide range of video formats for hassle-free conversions. Convert what
                    you see on your screen into a video and share it with the world. You can record
                    your whole screen, a browser tab, or just an application window.
                  </p>
                </div>
              </div>
              <div className="card card-bordered min-w-[300px]">
                <div className="card-body">
                  <h3 className="card-title">Unlimited Conversions</h3>
                  <p>
                    Enjoy unlimited video to GIF conversions with GifMagic.app. Record as many
                    videos as you like without any restrictions.
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
                  GifMagic.app offers a simple screen recording tool that allows you to capture your
                  screen and convert it into a video. Start recording your screen today and create
                  high-quality videos with ease.
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
                  At GifMagic.app, we offer unlimited video to GIF conversions. Our service is
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
