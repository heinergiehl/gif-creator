'use client';
import * as React from 'react';
import { useTheme } from 'next-themes';
import { Toggle } from '@/components/ui/toggle';
import { FaCloudMoon, FaCloudSun } from 'react-icons/fa6';
export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Toggle
      aria-label="Toggle Dark Mode"
      onClick={() => setTheme(() => (theme === 'dark' ? 'white' : 'dark'))}
    >
      {theme === 'dark' ? <FaCloudSun size={24} /> : <FaCloudMoon size={24} />}
    </Toggle>
  );
}
