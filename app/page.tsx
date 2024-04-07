import { Metadata } from "next"
import Head from "next/head"
import Link from "next/link"
import { FaRegCopyright } from "react-icons/fa6"
import { Footer } from "./components/ui/Footer"
import Image from "next/image"
export const metadata: Metadata = {
  title: "Free GIF Maker: Create GIFs from Videos or Images with GifMagic.app",
  description:
    "GifMagic.app is a free online GIF maker that lets you create GIFs from videos or images. Convert videos to GIFs, edit GIFs, and share them with ease!",
  keywords: "gif maker, video, converter, editor, free gif maker, gif creator",
  openGraph: {
    title:
      "Free GIF Maker: Create GIFs from Videos or Images with GifMagic.app",
    description:
      "GifMagic.app is a free online GIF maker that lets you create GIFs from videos or images. Convert videos to GIFs, edit GIFs, and share them with ease!",
    images: [
      {
        url: "https://gifmagic.app/root.png",
        width: 800,
        height: 600,
        alt: "GifMagic.app",
      },
    ],
    siteName: "GifMagic.app",
  },
}
export default function Home() {
  const faqData = [
    {
      question: "How do I convert a video to a GIF?",
      answer:
        "Simply upload your video file to GifMagic.app, and our tool will instantly convert it into a high-quality GIF. You can then customize the GIF's frame rate, add text, or edit it further according to your needs.",
    },
    {
      question: "What video formats are supported?",
      answer:
        "GifMagic.app supports a wide range of video formats, including MP4, AVI, WEBM, and more. This ensures you can easily convert most video files into GIFs without worrying about compatibility issues.",
    },
    {
      question: "Can I edit a GIF after converting it?",
      answer:
        "Yes, after converting your video to a GIF, our platform offers various editing tools. You can add text, adjust sizes, rotate, and scale images within your GIF, making it perfectly suited to your needs.",
    },
    {
      question: "Can I add text or captions to my GIFs?",
      answer:
        "Yes, GifMagic.app allows you to add text or captions to your GIFs. You can choose the font, size, color, and position of the text to suit your needs.",
    },
    {
      question: "What is the maximum file size for uploading a video?",
      answer:
        "The maximum file size for uploading a video to GifMagic.app is 100MB. This ensures quick processing and conversion times while still allowing for high-quality GIFs.",
    },
    {
      question: "Is there a limit to how many GIFs I can create?",
      answer:
        "At GifMagic.app, we offer unlimited video to GIF conversions. Our service is completely free, allowing you to create as many GIFs as you like without any restrictions.",
    },
    {
      question: "Can I use the GIFs I create commercially?",
      answer:
        "Yes, you are free to use the GIFs you create with GifMagic.app for both personal and commercial purposes. However, please ensure that you have the necessary rights to any content you upload.",
    },
    {
      question: "How do I download a GIF from GifMagic.app?",
      answer:
        "After creating or editing your GIF on GifMagic.app, click the 'Download' button. This will save the GIF to your device's default download location. You can then view the GIF using any software that supports the GIF format.",
    },
  ]
  return (
    <div className="flex flex-col ">
      <section className="hero bg-base-200 mt-[62px] ">
        <div className="hero-content text-center">
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold">Free Online GIF Maker</h1>
            <p className="py-6">
              Convert videos to GIFs, edit GIFs, and share them with ease using
              GifMagic.app. No sign-up required!
            </p>
            <Link href="/video-to-gif" className="btn btn-primary">
              Convert to GIF Now
            </Link>
          </div>
        </div>
      </section>
      <section className="py-16 w-full">
        <div className="container mx-auto px-4 w-full flex flex-col">
          <h2 className="text-3xl font-bold text-center mb-8">
            Why Choose GifMagic.app?
          </h2>
          <SmartPhone />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ">
            <div className="card card-bordered min-w-[300px]">
              <div className="card-body">
                <h3 className="card-title">
                  Easy to use high quality Online GIF maker
                </h3>
                <p>
                  Create high-quality GIFs from videos or images with just a few
                  clicks. No sign-up required!
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
                  GIFMagic.app offers a wide range of editing tools to help you.
                  It allows you to perform video-to-gif, image-to-gif, and
                  gif-to-video conversions. You can also add text To GIFs,
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
                  allows you to record your screen and convert it into a video.
                  You can choose to record a window, a tab, or the entire
                  screen. Also, you can edit the resolution of the video, and
                  crop it to your liking.
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
          <div className="space-y-2 join join-vertical">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="collapse collapse-arrow join-item border border-base-300  rounded-box"
              >
                <input
                  type="radio"
                  name="faq-accordion"
                  className="peer"
                  defaultChecked={index === 0}
                />
                <div className="collapse-title text-xl font-medium peer-checked:bg-primary peer-checked:text-primary-content">
                  {faq.question}
                </div>
                <div className="collapse-content bg-primary text-primary-content">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
const SmartPhone = () => {
  return (
    <div className="mockup-phone mb-8">
      <div className="camera"></div>
      <div className="display w-[200px] h-[400px] flex justify-center items-center">
        <div className="artboard artboard-demo phone-1">
          <Image
            src="/example.gif"
            alt="A GIF with a Text overlay. Create GIFs from Videos or Images with GifMagic.app"
            width={320}
            height={700}
            className="object-fit  mx-auto "
          />
        </div>
      </div>
    </div>
  )
}
