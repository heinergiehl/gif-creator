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
    ],
  },
];
export default function RootNavigation() {
  return usePathname().includes('/converter-and-editor') ? null : (
    <CustomNavigation sections={sections} />
  );
}
