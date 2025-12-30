'use client';
import * as React from 'react';
import { useTheme } from 'next-themes';
import { Toggle } from '@/components/ui/toggle';
import { FaCloudMoon, FaCloudSun } from 'react-icons/fa6';
export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';
  return (
    <Toggle
      aria-label="Toggle color theme"
      disabled={!mounted}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {!mounted ? <FaCloudMoon size={24} /> : isDark ? <FaCloudSun size={24} /> : <FaCloudMoon size={24} />}
    </Toggle>
  );
}
