'use client';
import * as React from 'react';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { ModeToggle } from './components/ui/DarkToggle';
const sections = [
  {
    section: 'Convert',
    links: [
      {
        title: 'Video to GIF',
        href: '/video-to-gif',
        description: 'Convert your videos into GIF format effortlessly.',
      },
      {
        title: 'Image to GIF',
        href: '/image-to-gif',
        description: 'Turn your images into GIFs quickly and easily.',
      },
      {
        title: 'Screen to Video',
        href: '/screen-to-video',
        description: 'Record your screen and save as video.',
      },
    ],
  },
  {
    section: 'Tools',
    links: [
      {
        title: 'Video to GIF Editor',
        href: '/video-to-gif/converter-and-editor',
        description: 'Edit your GIFs created from videos.',
      },
      {
        title: 'Image to GIF Editor',
        href: '/image-to-gif/converter-and-editor',
        description: 'Edit and enhance your image-based GIFs.',
      },
      {
        title: 'Screen Recording',
        href: '/screen-to-video/record-screen',
        description: 'Record your screen with advanced options.',
      },
    ],
  },
  {
    section: 'Documentation',
    href: '/docs',
    description: 'Access detailed documentation and developer guides.',
  },
];
export default function NavigationMenuDemo() {
  return (
    <div
      className=" fixed inset-0
                    z-[999] flex    h-[70px]  items-center 
                      justify-center  bg-white p-4 text-lg text-black backdrop-blur lg:grid-cols-2 dark:bg-gray-800 dark:text-white"
    >
      <NavigationMenu className="">
        <NavigationMenuList>
          {sections.map((section) => (
            <NavigationMenuItem key={section.section}>
              <NavigationMenuTrigger className="text-lg ">{section.section}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <>
                  <ul
                    className="grid  w-[400px] gap-3  bg-white md:w-[500px] lg:w-[800px]  dark:bg-gray-800  
                     "
                  >
                    {section.links ? (
                      section.links.map((link) => (
                        <ListItem key={link.title} href={link.href} title={link.title}>
                          {link.description}
                        </ListItem>
                      ))
                    ) : (
                      <ListItem href={section.href} title={section.section}>
                        {section.description}
                      </ListItem>
                    )}
                  </ul>
                </>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <ModeToggle />
    </div>
  );
}
const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  { href: string; title: string; children?: React.ReactNode }
>(({ href, title, children, ...props }, ref) => {
  return (
    <Link href={href} legacyBehavior passHref>
      <NavigationMenuLink
        className={cn([navigationMenuTriggerStyle(), ' my-4 rounded-md text-lg'])}
      >
        <span
          ref={ref}
          className="cursor-pointer rounded-md p-4 transition-colors duration-200 ease-in-out hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          {...props}
        >
          <div className="font-medium leading-none ">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">{children}</p>
        </span>
      </NavigationMenuLink>
    </Link>
  );
});
ListItem.displayName = 'ListItem';
