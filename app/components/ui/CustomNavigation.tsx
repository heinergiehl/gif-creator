'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileToggleRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setOpenSection(null);
    setMobileOpen(false);
  }, [pathname]);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMobileOpen(false);
      setOpenSection(null);
      mobileToggleRef.current?.focus();
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [mobileOpen]);

  const featuredLinks = useMemo(
    () => [
      { title: 'All GIF Tools', href: '/gif-tools' },
      { title: 'Compress GIF', href: '/compress-gif' },
      { title: 'Change Speed', href: '/change-gif-speed' },
      { title: 'Video to GIF', href: '/video-to-gif' },
    ],
    [],
  );

  return (
    <div
      className={cn([
        'fixed inset-x-0 top-0 z-[800] border-b border-slate-200/80 bg-white/95 backdrop-blur transition-colors duration-300 dark:border-slate-800/80 dark:bg-slate-950/80',
        isScrolled ? 'shadow-lg shadow-slate-900/5 dark:shadow-black/20' : '',
      ])}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:h-[72px] lg:px-8">
        {/* ---- Logo ---- */}
        <Link href="/" className="flex shrink-0 items-center space-x-1">
          <span className="text-xl font-bold text-blue-600 sm:text-2xl">GIF</span>
          <span className="text-xl font-bold text-purple-600 sm:text-2xl">Creator</span>
        </Link>

        {/* ---- Desktop nav ---- */}
        <nav className="hidden items-center gap-1 lg:flex">
          {featuredLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white',
                pathname === link.href &&
                  'bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-white',
              )}
            >
              {link.title}
            </Link>
          ))}

          {sections.map((section) => (
            <div
              key={section.section}
              className="relative"
              onMouseEnter={() => setOpenSection(section.section)}
              onMouseLeave={() =>
                setOpenSection((current) => (current === section.section ? null : current))
              }
            >
              <button
                type="button"
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white',
                  openSection === section.section &&
                    'bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-white',
                )}
                onClick={() =>
                  setOpenSection((current) =>
                    current === section.section ? null : section.section,
                  )
                }
                aria-expanded={openSection === section.section}
                aria-haspopup="true"
              >
                {section.section}
                <ChevronDown className="h-4 w-4" />
              </button>

              {openSection === section.section ? (
                <div className="absolute left-0 top-full w-[420px] pt-2">
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30">
                    <div className="grid gap-2">
                      {section.links?.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="rounded-2xl px-4 py-3 transition hover:bg-slate-100 dark:hover:bg-slate-900"
                        >
                          <div className="text-base font-semibold text-slate-950 dark:text-white">
                            {link.title}
                          </div>
                          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                            {link.description}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        {/* ---- Right side actions ---- */}
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          <button
            ref={mobileToggleRef}
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900 lg:hidden"
            onClick={() => setMobileOpen((current) => !current)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ---- Mobile menu ---- */}
      {mobileOpen ? (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-slate-200 bg-white px-4 pb-8 pt-4 dark:border-slate-800 dark:bg-slate-950 lg:hidden"
        >
          <div className="grid gap-1">
            {featuredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-2xl px-4 py-3.5 text-base font-medium text-slate-700 transition active:bg-slate-200 dark:text-slate-300 dark:active:bg-slate-800',
                  pathname === link.href
                    ? 'bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-white'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-900/60',
                )}
              >
                {link.title}
              </Link>
            ))}
          </div>

          <div className="mt-4 grid gap-3">
            {sections.map((section) => (
              <div
                key={section.section}
                className="rounded-2xl border border-slate-200 dark:border-slate-800"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                  onClick={() =>
                    setOpenSection((current) =>
                      current === section.section ? null : section.section,
                    )
                  }
                  aria-expanded={openSection === section.section}
                >
                  <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    {section.section}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-slate-400 transition-transform duration-200',
                      openSection === section.section && 'rotate-180',
                    )}
                  />
                </button>
                {openSection === section.section ? (
                  <div className="grid gap-1 px-2 pb-3">
                    {section.links?.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="rounded-2xl px-3 py-3 transition hover:bg-slate-50 active:bg-slate-200 dark:hover:bg-slate-900/60 dark:active:bg-slate-800"
                      >
                        <div className="text-sm font-semibold text-slate-950 dark:text-white">
                          {link.title}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {link.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="mt-6">
            <Link
              href="/gif-tools"
              className="flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Browse all GIF tools
            </Link>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
