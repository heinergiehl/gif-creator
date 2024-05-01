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
import CustomNavigation from './components/ui/CustomNavigation';
import { usePathname } from 'next/navigation';
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
export default function RootNavigation() {
  return usePathname().includes('/converter-and-editor') ? null : (
    <CustomNavigation sections={sections} />
  );
}
