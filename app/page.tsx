import { Metadata } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FaRegCopyright } from 'react-icons/fa6';
import { Footer } from './components/ui/Footer';
import Image from 'next/image';
import CustomCard from './components/ui/CustomCard';
import { Button } from '@/components/ui/button';
import { CustomAccordion } from './components/ui/CustomAccordion';
import CustomH1 from './components/ui/CustomH1';
export const metadata: Metadata = {
  title: 'Free GIF Maker: Create GIFs from Videos or Images with GifMagic.app',
  description:
    'GifMagic.app is a free online GIF maker that lets you create GIFs from videos or images. Convert videos to GIFs, edit GIFs, and share them with ease!',
  keywords: 'gif maker, video, converter, editor, free gif maker, gif creator',
  openGraph: {
    title: 'Free GIF Maker: Create GIFs from Videos or Images with GifMagic.app',
    description:
      'GifMagic.app is a free online GIF maker that lets you create GIFs from videos or images. Convert videos to GIFs, edit GIFs, and share them with ease!',
    images: [
      {
        url: 'https://gifmagic.app/root.png',
        width: 800,
        height: 600,
        alt: 'GifMagic.app',
      },
    ],
    siteName: 'GifMagic.app',
  },
};
export default function Home() {
  const faqData = [
    {
      question: 'How do I convert a video to a GIF?',
      answer:
        "Simply upload your video file to GifMagic.app, and our tool will instantly convert it into a high-quality GIF. You can then customize the GIF's frame rate, add text, or edit it further according to your needs.",
    },
    {
      question: 'What video formats are supported?',
      answer:
        'GifMagic.app supports a wide range of video formats, including MP4, AVI, WEBM, and more. This ensures you can easily convert most video files into GIFs without worrying about compatibility issues.',
    },
    {
      question: 'Can I edit a GIF after converting it?',
      answer:
        'Yes, after converting your video to a GIF, our platform offers various editing tools. You can add text, adjust sizes, rotate, and scale images within your GIF, making it perfectly suited to your needs.',
    },
    {
      question: 'Can I add text or captions to my GIFs?',
      answer:
        'Yes, GifMagic.app allows you to add text or captions to your GIFs. You can choose the font, size, color, and position of the text to suit your needs.',
    },
    {
      question: 'What is the maximum file size for uploading a video?',
      answer:
        'The maximum file size for uploading a video to GifMagic.app is 100MB. This ensures quick processing and conversion times while still allowing for high-quality GIFs.',
    },
    {
      question: 'Is there a limit to how many GIFs I can create?',
      answer:
        'At GifMagic.app, we offer unlimited video to GIF conversions. Our service is completely free, allowing you to create as many GIFs as you like without any restrictions.',
    },
    {
      question: 'Can I use the GIFs I create commercially?',
      answer:
        'Yes, you are free to use the GIFs you create with GifMagic.app for both personal and commercial purposes. However, please ensure that you have the necessary rights to any content you upload.',
    },
    {
      question: 'How do I download a GIF from GifMagic.app?',
      answer:
        "After creating or editing your GIF on GifMagic.app, click the 'Download' button. This will save the GIF to your device's default download location. You can then view the GIF using any software that supports the GIF format.",
    },
  ];
  const featuresData = [
    {
      title: 'Easy to Use High-Quality Online GIF Maker',
      description:
        'Create high-quality GIFs from videos or images with just a few clicks. No sign-up required!',
    },
    {
      title: 'Fast and Easy',
      description:
        "Most services like ezgif, imgflip, and giphy don't offer the same level of quality and ease of use as GifMagic.app.",
    },
    {
      title: 'Completely Free',
      description:
        'Enjoy unlimited conversions and edits without any fees. Quality comes at no cost.',
    },
    {
      title: 'Extensive Editing Tooling',
      description:
        'GIFMagic.app offers a wide range of editing tools to help you. It allows you to perform video-to-gif, image-to-gif, and gif-to-video conversions. You can also add text to GIFs, adjust frame rates, and customize your GIFs to your liking.',
    },
    {
      title: 'A Unique Feature: Screen-to-Video',
      description:
        'GifMagic.app offers a unique screen-to-video feature that allows you to record your screen and convert it into a video. You can choose to record a window, a tab, or the entire screen. Also, you can edit the resolution of the video, and crop it to your liking.',
    },
  ];
  return (
    <div className="relative z-40 h-full w-full text-black dark:text-white ">
      <div
        className="absolute inset-0 z-[10] h-full w-full items-center px-5 py-24 opacity-100 
       [background:radial-gradient(125%_125%_at_50%_50%,#fdfdfd_30%,#63e_100%)]
   dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]
      "
      ></div>
      <div
        className="absolute bottom-0 left-0 right-0 top-0  z-[20] h-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] 
        bg-[size:24px_24px] opacity-30
        dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)]
        dark:bg-[size:24px_24px] dark:opacity-100
      "
      ></div>
      <div className="relative z-40 flex flex-col opacity-100">
        <section className="  mt-[100px] ">
          <div className="flex w-full justify-center">
            <div className="max-w-xl ">
              <CustomH1 text={'Free Online GIF Maker'}></CustomH1>
              <p className="py-6">
                Convert videos to GIFs, edit GIFs, and share them with ease using GifMagic.app. No
                sign-up required!
              </p>
              <Button variant={'link'}>
                <Link href="/video-to-gif">Convert to GIF Now</Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="w-full py-16">
          <div className="container mx-auto flex w-full flex-col px-4">
            <h2 className="mb-8 text-center text-3xl font-bold">Why Choose GifMagic.app?</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {featuresData.map((feature, index) => (
                <CustomCard key={index} title={feature.title} description={feature.description} />
              ))}
            </div>
          </div>
        </section>
        <section className="py-16 ">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-3xl font-bold">Frequently Asked Questions</h2>
            <div className="join join-vertical space-y-2">
              {faqData.map((faq, index) => (
                <CustomAccordion key={index} trigger={faq.question} content={faq.answer} />
              ))}
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
}
