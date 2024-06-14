import {
  Bell,
  CalendarIcon,
  EditIcon,
  FileText,
  Globe,
  LucideIcon,
  ShareIcon,
  VideoIcon,
} from 'lucide-react';
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card';
import { Footer } from './components/ui/Footer';
import { CustomAccordion } from './components/ui/CustomAccordion';
import { InputIcon } from '@radix-ui/react-icons';
import { CTA } from '@/components/pages/CTA';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import Marquee from '@/components/magicui/marquee';
import { FileTextIcon } from '@radix-ui/react-icons';
import { Share2Icon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { AnimatedBeamDemo } from '@/components/pages/animated-beam-multiple-outputs';
import { BorderBeam } from '@/components/magicui/border-beam';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { BentoGrid } from '@/components/magicui/bento-grid';
import { ForwardRefExoticComponent, ReactNode, RefAttributes } from 'react';
import { IconProps } from '@radix-ui/react-icons/dist/types';
const FadeInUpWrapper = dynamic(
  () => import('@/components/ui/FadeInWrapper').then((mod) => mod.FadeInUpWrapper),
  { ssr: false },
);
const files = [
  {
    name: 'bitcoin.pdf',
    body: 'Bitcoin is a cryptocurrency invented in 2008 by an unknown person or group of people using the name Satoshi Nakamoto.',
  },
  {
    name: 'finances.xlsx',
    body: 'A spreadsheet or worksheet is a file made of rows and columns that help sort data, arrange data easily, and calculate numerical data.',
  },
  {
    name: 'logo.svg',
    body: 'Scalable Vector Graphics is an Extensible Markup Language-based vector image format for two-dimensional graphics with support for interactivity and animation.',
  },
  {
    name: 'keys.gpg',
    body: 'GPG keys are used to encrypt and decrypt email, files, directories, and whole disk partitions and to authenticate messages.',
  },
  {
    name: 'seed.txt',
    body: 'A seed phrase, seed recovery phrase or backup seed phrase is a list of words which store all the information needed to recover Bitcoin funds on-chain.',
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
  Icon:
    | ReactNode
    | ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>
    | LucideIcon;
  name: string;
  description: string;
  href: string;
  cta: string;
  className: string;
  background: ReactNode | ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
};
const Notification = ({ name, description, icon, color, time }: Item) => {
  return (
    <FadeInUpWrapper>
      <figure
        className={cn(
          'relative mx-auto min-h-fit w-full max-w-[400px] transform cursor-pointer overflow-hidden rounded-2xl p-4',
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
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
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
              <span className="text-xs text-gray-500">{time}</span>
            </figcaption>
            <p className="text-sm font-normal dark:text-white/60">{description}</p>
          </div>
        </div>
      </figure>
    </FadeInUpWrapper>
  );
};
const features = [
  {
    Icon: FileTextIcon,
    name: 'Save your files',
    description: 'We automatically save your files as you type.',
    href: '/',
    cta: 'Learn more',
    className: 'col-span-3 lg:col-span-1',
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] "
      >
        {files.map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              'relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4',
              'border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]',
              'dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]',
              'transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none',
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-sm font-medium dark:text-white ">{f.name}</figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-xs">{f.body}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: InputIcon,
    name: 'Full text search',
    description: 'Search through all your files in one place.',
    href: '/',
    cta: 'Learn more',
    className: 'col-span-3 lg:col-span-2',
    background: (
      <Command className="absolute right-10 top-10 w-[70%] origin-top translate-x-0 border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:-translate-x-10">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>screenshot.png</CommandItem>
            <CommandItem>bitcoin.pdf</CommandItem>
            <CommandItem>finances.xlsx</CommandItem>
            <CommandItem>logo.svg</CommandItem>
            <CommandItem>keys.gpg</CommandItem>
            <CommandItem>seed.txt</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    ),
  },
  {
    Icon: Share2Icon,
    name: 'Integrations',
    description: 'Supports 100+ integrations and counting.',
    href: '/',
    cta: 'Learn more',
    className: 'col-span-3 lg:col-span-2',
    background: (
      <AnimatedBeamDemo className="absolute right-2 top-4 h-[300px] w-[600px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
    ),
  },
  {
    Icon: CalendarIcon,
    name: 'Calendar',
    description: 'Use the calendar to filter your files by date.',
    className: 'col-span-3 lg:col-span-1',
    href: '/',
    cta: 'Learn more',
    background: (
      <Calendar
        mode="single"
        selected={new Date(2022, 4, 11, 0, 0, 0)}
        className="absolute right-0 top-10 origin-top rounded-md border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-105"
      />
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
    <div className=" relative   z-40 h-full w-full text-black dark:text-white">
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
      <div className="relative z-40  flex  flex-col opacity-100 ">
        <section className=" mt-[100px] h-screen ">
          <div className="flex items-stretch justify-center">
            <div className="flex h-screen min-h-screen max-w-6xl flex-col items-center justify-center">
              <FadeInUpWrapper>
                <NeonGradientCard className="max-w-2xl items-center justify-center ">
                  <span className="pointer-events-none z-10  text-pretty bg-gradient-to-br from-[#ff2975] from-35% to-[#00FFF1] bg-clip-text text-7xl font-bold leading-none tracking-tighter text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                    Feature Rich Free To Use GIF Maker
                  </span>
                </NeonGradientCard>
              </FadeInUpWrapper>
              <FadeInUpWrapper>
                <p className="text-pretty py-6 text-center">
                  Convert videos to GIFs, edit GIFs, and share them with ease using GifMagic.app. No
                  sign-up required!
                </p>
              </FadeInUpWrapper>
              <div className="flex flex-col items-center justify-center space-x-4 space-y-8">
                <FadeInUpWrapper>
                  <CTA />
                </FadeInUpWrapper>
                <FadeInUpWrapper>
                  <div className="relative rounded-xl">
                    <Image
                      src="/hero-dark.png"
                      alt="Hero Image"
                      width={1200}
                      height={500}
                      className="hidden w-[1200px] rounded-[inherit] border object-contain shadow-lg dark:block"
                    />
                    <Image
                      width={1200}
                      height={500}
                      src="/dashboard-light.png"
                      alt="Hero Image"
                      className="block w-[1200px] rounded-[inherit] border object-contain shadow-lg dark:hidden"
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
              <h2 className="mb-8 text-center text-3xl font-bold">Why Choose GifMagic.app?</h2>
            </FadeInUpWrapper>
            <FadeInUpWrapper>
              <BentoGrid features={features} />
            </FadeInUpWrapper>
          </div>
        </section>
        <section className=" py-16">
          <FadeInUpWrapper>
            <div className="container mx-auto px-4">
              <h2 className="mb-8 text-center text-3xl font-bold">Frequently Asked Questions</h2>
              <div className="join join-vertical space-y-2">
                {faqData.map((faq, index) => (
                  <CustomAccordion trigger={faq.question} content={faq.answer} key={index} />
                ))}
              </div>
            </div>
          </FadeInUpWrapper>
        </section>
        <Footer />
      </div>
    </div>
  );
}
