'use client';
import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toggle } from '@/components/ui/toggle';
export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Toggle
      aria-label="Toggle Dark Mode"
      onClick={() => setTheme(() => (theme === 'dark' ? 'white' : 'dark'))}
    >
      {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
    </Toggle>
  );
}
