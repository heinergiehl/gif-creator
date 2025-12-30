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
    section: 'Tools',
    links: [
      {
        title: 'Video to GIF',
        href: '/video-to-gif',
        description: 'Convert MP4, MOV, and AVI to GIF — trim, crop, resize, and optimize.',
      },
      {
        title: 'Image to GIF',
        href: '/image-to-gif',
        description: 'Turn photos into animated GIFs with frame timing and captions.',
      },
      {
        title: 'Edit GIFs',
        href: '/edit-gifs',
        description: 'Resize, crop, add text, and optimize existing animated GIFs.',
      },
      {
        title: 'Screen Recorder',
        href: '/screen-to-video',
        description: 'Record your screen to video, then convert the clip to a GIF.',
      },
    ],
  },
];
export default function RootNavigation() {
  const pathname = usePathname();
  const hideNavigation =
    pathname.includes('/converter-and-editor/editor') || pathname.includes('/record-screen');

  return hideNavigation ? null : <CustomNavigation sections={sections} />;
}
