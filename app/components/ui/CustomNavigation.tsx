'use client';
import React, { useEffect } from 'react';
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
import { ModeToggle } from './DarkToggle';
import { cn } from '@/lib/utils';

interface CustomNavigationProps {
  sections: {
    section: string;
    links?: {
      title: string;
      href: string;
      description: string;
    }[];
    href?: string;
    description?: string;
  }[];
}
export default function CustomNavigation({ sections }: CustomNavigationProps) {
  const [isScrolled, setIsScrolled] = React.useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return (
    <div
      className={cn([
        `supports-backdrop-blur:bg-white/60 fixed inset-0    top-0   z-[800] flex
                      h-[70px]  w-full flex-none items-center justify-between bg-white/95  backdrop-blur transition-colors duration-500 dark:border-slate-50/[0.06] dark:bg-transparent lg:z-50 lg:grid-cols-2 lg:border-b lg:border-slate-900/10`,
        isScrolled ? ' shadow-lg dark:border-gray-700  dark:shadow-xl' : '',
      ])}
    >
      <div className="flex w-full items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center space-x-1">
          {/* display GIF-Creator as nice text */}
          <div className="text-2xl font-bold text-blue-600">GIF</div>
          <div className="text-2xl font-bold text-purple-600">Creator</div>
        
        </Link>
        <NavigationMenu className="sticky">
          <NavigationMenuList className="">
            {sections.map((section) => (
              <NavigationMenuItem key={section.section} className="">
                <NavigationMenuTrigger className="text-lg ">
                  {section.section}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="">
                  <ul
                    className="supports-backdrop-blur:bg-white/60 z-[200]      rounded-md border-b-2 
               bg-opacity-80 p-4   opacity-100    dark:backdrop-blur 
                  "
                  >
                    {section.links ? (
                      section.links.map((link) => (
                        <ListItem key={link.title} href={link.href} title={link.title}>
                          {link.description}
                        </ListItem>
                      ))
                    ) : (
                      <ListItem href={section.href ?? ''} title={section.section}>
                        {section.description}
                      </ListItem>
                    )}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <Link
          href="/edit-gifs/converter-and-editor"
          className="hidden items-center rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl sm:inline-flex"
        >
          Open GIF Editor
        </Link>
        <ModeToggle />
      </div>
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
        className={cn([navigationMenuTriggerStyle(), ' z-[300] my-4 rounded-md py-8 text-lg '])}
      >
        <span
          ref={ref}
          className="cursor-pointer rounded-md transition-colors duration-200 ease-in-out "
          {...props}
        >
          <div className="font-medium leading-none ">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </span>
      </NavigationMenuLink>
    </Link>
  );
});
ListItem.displayName = 'ListItem';
