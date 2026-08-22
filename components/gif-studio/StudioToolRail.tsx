'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Captions,
  Crop,
  Focus,
  Gauge,
  MousePointer2,
  ScanEye,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { StudioTool } from '@/components/gif-studio/types';

interface ToolDefinition {
  id: StudioTool;
  label: string;
  Icon: LucideIcon;
  shortcut?: string;
}

export const STUDIO_TOOLS: ToolDefinition[] = [
  { id: 'select', label: 'Select', Icon: MousePointer2, shortcut: 'V' },
  { id: 'transform', label: 'Transform', Icon: Crop, shortcut: 'C' },
  { id: 'text', label: 'Text', Icon: Captions, shortcut: 'T' },
  { id: 'redact', label: 'Redact', Icon: ScanEye, shortcut: 'R' },
  { id: 'annotate', label: 'Annotate', Icon: Focus, shortcut: 'A' },
  { id: 'effects', label: 'Effects', Icon: SlidersHorizontal, shortcut: 'F' },
  { id: 'timing', label: 'Timing', Icon: Gauge, shortcut: 'G' },
  { id: 'demo', label: 'Demo', Icon: Sparkles, shortcut: 'D' },
];

export function StudioToolRail({
  activeTool,
  onToolChange,
  className,
}: {
  activeTool: StudioTool;
  onToolChange: (tool: StudioTool) => void;
  className?: string;
}) {
  return (
    <TooltipProvider delayDuration={350}>
      <nav
        aria-label="Editing tools"
        className={cn(
          'flex shrink-0 items-center gap-1 border-slate-800 bg-slate-950 p-2 lg:w-[76px] lg:flex-col lg:border-r lg:py-3',
          className,
        )}
      >
        {STUDIO_TOOLS.map(({ id, label, Icon, shortcut }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={label}
                aria-pressed={activeTool === id}
                onClick={() => onToolChange(id)}
                className={cn(
                  'group flex h-14 w-12 flex-none flex-col items-center justify-center gap-1 rounded-md px-1 py-1.5 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 lg:h-[58px] lg:w-[58px]',
                  activeTool === id
                    ? 'bg-sky-400/12 text-sky-300'
                    : 'text-slate-500 hover:bg-white/[0.05] hover:text-slate-200',
                )}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                <span>{label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="hidden lg:block">
              <span>{label}</span>
              {shortcut ? <kbd className="ml-3 text-[10px] text-slate-400">{shortcut}</kbd> : null}
            </TooltipContent>
          </Tooltip>
        ))}
      </nav>
    </TooltipProvider>
  );
}
