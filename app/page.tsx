import {
  AppWindowIcon,
  Bell,
  CalendarIcon,
  EditIcon,
  FileText,
  Globe,
  LucideIcon,
  ShareIcon,
  SmileIcon,
  VideoIcon,
} from 'lucide-react';
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card';
import { Footer } from './components/ui/Footer';
import { CustomAccordion } from './components/ui/CustomAccordion';
import { InputIcon } from '@radix-ui/react-icons';
import { CTA } from '@/components/pages/CTA';
import { cn } from '@/lib/utils';
import Marquee from '@/components/magicui/marquee';
import { BorderBeam } from '@/components/magicui/border-beam';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { BentoGrid } from '@/components/magicui/bento-grid';
import { v2 as cloudinary } from 'cloudinary';
import { AnimatedList } from '@/components/magicui/animated-list';
const FadeInUpWrapper = dynamic(
  () => import('@/components/ui/FadeInWrapper').then((mod) => mod.FadeInUpWrapper),
  { ssr: false },
);
const files = [
  {
    name: '⚡ Blazingly Fast',
    body: 'GifMagic.app is designed to be fast and efficient, allowing you to convert videos to GIFs in seconds.',
  },
  {
    name: '💾No data will be stored',
    body: 'This application runs entirely in your browser, and no data is stored on our servers, as we do not have any.',
  },
  {
    name: '💻Feature Rich Editor',
    body: 'Edit your GIFs with ease using our feature-rich editor. Add text, stickers, and more to your GIFs.',
  },
];
interface Item {
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
}
let notifications = [
  {
    name: 'Payment received',
    description: 'Magic UI',
    time: '15m ago',
    icon: '💸',
    color: '#00C9A7',
  },
  {
    name: 'User signed up',
    description: 'Magic UI',
    time: '10m ago',
    icon: '👤',
    color: '#FFB800',
  },
  {
    name: 'New message',
    description: 'Magic UI',
    time: '5m ago',
    icon: '💬',
    color: '#FF3D71',
  },
  {
    name: 'New event',
    description: 'Magic UI',
    time: '2m ago',
    icon: '🗞️',
    color: '#1E86FF',
  },
];
notifications = Array.from({ length: 10 }, () => notifications).flat();
export type FeautureType = {
  Icon: any;
  name: string;
  description: string;
  href: string;
  cta: string;
  className: string;
  background: any;
};
const optimizeVideoUrl = cloudinary.url(
  'https://res.cloudinary.com/dwez4z3uv/video/upload/v1719792684/qp5i4nvqq8lhc6rwyvtg.mp4',
  {
    resource_type: 'video',
    quality: 'auto',
    fetch_format: 'auto',
    effect: 'vibrance:100',
    secure: true,
    sign_url: true,
  },
);
const features = [
  {
    Icon: SmileIcon,
    name: '🐙 Easy to use',
    description: 'Drag And Drop Gif Editor.',
    href: '/',
    cta: 'Learn more',
    className: 'col-span-3 lg:col-span-1 ',
    background: (
      <Marquee
        pauseOnHover
        className={cn([
          'absolute top-10 h-[300px] [--duration:20s] [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)] ',
          ' transition-all duration-500 ease-out [mask-image:none] hover:translate-y-[20%] md:hover:[mask-image:none] ',
        ])}
      >
        {files.map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              'relative   w-60 cursor-pointer overflow-hidden rounded-xl border p-2 md:w-40',
              'border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]',
              'dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]',
              'transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none',
              ' hover:scale-105',
            )}
          >
            <div className="flex flex-row items-center gap-2 ">
              <div className="flex flex-col">
                <figcaption className="text-xl  font-medium dark:text-white ">{f.name}</figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-xl md:text-sm">{f.body}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: AppWindowIcon,
    name: '💎 Beautiful UI',
    description: 'Turn videos, images, and text into GIFs with ease.',
    href: '/',
    cta: 'Learn more',
    className: 'col-span-3 lg:col-span-2 ',
    background: (
      <div className="rounded-[2.5rem]" style={{}}>
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            filter: 'brightness(1.2) contrast(1.0) saturate(1.2) ',
            clipPath: 'inset(35px 4px 20px 2px)',
          }}
          className="
        absolute
        top-10  w-[95%] origin-top translate-x-0 scale-110 border  transition-all duration-500 
        ease-out
        [mask-image:none] group-hover:-translate-x-10  md:right-10
        md:w-[70%]
        md:[mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]
        md:group-hover:scale-110
        md:group-hover:[mask-image:none]
        "
        >
          <source src={optimizeVideoUrl} type="video/mp4" />
        </video>
      </div>
    ),
  },
];
export default function Home() {
  const faqData = [
    {
      question: 'How do I convert a video to a GIF?',
      answer:
        "Simply upload your video file to GifMagic.app, and our tool will instantly convert it into a high-quality GIF. You can then customize the GIF's frame rate, add text, or edit it further according to your needs.",
    },
    //...other FAQ data
  ];
  return (
    <div className=" relative   z-40 h-full w-screen text-black dark:text-white md:w-full">
      <div
        className="absolute inset-0 z-[10] h-full w-full items-center px-5 py-24 opacity-100 
       [background:radial-gradient(125%_125%_at_50%_50%,#fdfdfd_30%,#63e_100%)]
       dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"
      ></div>
      <div
        className="absolute bottom-0 left-0 right-0 top-0  z-[20] h-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] 
        bg-[size:24px_24px] opacity-30 dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)]
        dark:bg-[size:24px_24px] dark:opacity-100"
      ></div>
      <div className="relative z-40 flex w-full  flex-col items-center  justify-center opacity-100 ">
        <section className=" mt-[100px] h-screen w-full">
          <div className=" flex items-center justify-center">
            <div className="flex h-screen min-h-screen max-w-6xl flex-col items-center justify-center gap-x-2">
              <FadeInUpWrapper>
                <NeonGradientCard className="mx-auto  flex max-w-2xl items-center justify-center">
                  <span className="pointer-events-none z-10  text-pretty bg-gradient-to-br from-[#ff2975] from-35% to-[#00FFF1] bg-clip-text text-7xl font-bold leading-none tracking-tighter text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                    Feature Rich Free To Use GIF Maker
                  </span>
                </NeonGradientCard>
              </FadeInUpWrapper>
              <FadeInUpWrapper>
                <p className="text-pretty px-4 py-6 text-center md:px-0">
                  Convert videos to GIFs, edit them by adding text, stickers, and more, and share
                  them with your friends. No Sign Up Required and 100% Free.
                </p>
              </FadeInUpWrapper>
              <div className="mx-auto flex flex-col items-center justify-center space-x-4 space-y-8">
                <FadeInUpWrapper>
                  <CTA />
                </FadeInUpWrapper>
                <FadeInUpWrapper>
                  <div className="relative m-auto flex w-full items-center justify-center rounded-xl">
                    <AnimatedListDemo className="absolute z-[999] hidden w-full max-w-[500px] opacity-0 transition-all duration-500 hover:translate-x-20 hover:opacity-100 md:block" />
                    <Image
                      src="/hero-dark.png"
                      alt="Hero Image"
                      width={1200}
                      height={500}
                      className=" hidden rounded-[inherit] border object-contain shadow-lg dark:block md:w-[1200px]"
                    />
                    <Image
                      width={1200}
                      height={500}
                      src="/dashboard-light.png"
                      alt="Hero Image"
                      className=" block rounded-[inherit] border object-contain shadow-lg dark:hidden md:w-[1200px]"
                    />
                    <BorderBeam size={250} duration={12} delay={9} />
                  </div>
                </FadeInUpWrapper>
              </div>
            </div>
          </div>
        </section>
        <section className=" py-16">
          <div className="container mx-auto flex h-full w-full flex-col px-4">
            <FadeInUpWrapper>
              <h2 className="pointer-events-none mb-8 whitespace-pre-wrap bg-gradient-to-b from-black to-gray-200/80 bg-clip-text text-center text-2xl  font-bold leading-none  text-transparent dark:from-white dark:to-slate-600/20 md:text-8xl">
                Why Choose GifMagic.app?
              </h2>
            </FadeInUpWrapper>
            <FadeInUpWrapper>
              <BentoGrid features={features} />
            </FadeInUpWrapper>
          </div>
        </section>
        {/* <section className=" py-16">
          <FadeInUpWrapper>
            <div className="container mx-auto px-4">
              <h2 className="d pointer-events-none mb-8 whitespace-pre-wrap bg-gradient-to-b from-black to-gray-200/90 bg-clip-text  text-center text-3xl  font-bold leading-none  text-transparent dark:from-white dark:to-slate-600/20 md:text-8xl">
                Frequently Asked Questions
              </h2>
              <div className="join join-vertical space-y-2">
                {faqData.map((faq, index) => (
                  <CustomAccordion trigger={faq.question} content={faq.answer} key={index} />
                ))}
              </div>
            </div>
          </FadeInUpWrapper>
        </section> */}
        <Footer />
      </div>
    </div>
  );
}
interface Item {
  name: string;
  icon: string;
  color: string;
}
let nots = [
  {
    name: 'No Signup Required',
    icon: '🌅',
    color: '#00C9A7',
  },
  {
    name: '100% Free',
    icon: '💰',
    color: '#ff9500',
  },
  {
    name: 'Easy to use Drag and Drop Editor',
    icon: '😺',
    color: '#FF3D71',
  },
  {
    name: 'Download GIFs in seconds',
    icon: '🛹',
    color: '#1E86FF',
  },
];
let notis = Array.from({ length: 10 }, () => nots).flat();
const Notification = ({ name, icon, color }: Item) => {
  return (
    <figure
      className={cn(
        'relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4',
        // animation styles
        'transition-all duration-200 ease-in-out hover:scale-[103%]',
        // light styles
        'bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]',
        // dark styles
        'transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]',
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white ">
            <span className="text-sm sm:text-lg">{name}</span>
            <span className="mx-1">·</span>
          </figcaption>
        </div>
      </div>
    </figure>
  );
};
export function AnimatedListDemo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex h-[500px] w-full flex-col overflow-hidden rounded-lg border bg-background p-6 md:shadow-xl',
        className,
      )}
    >
      <AnimatedList delay={2000}>
        {notis.map((item, idx) => (
          <Notification {...item} key={idx} />
        ))}
      </AnimatedList>
    </div>
  );
}
