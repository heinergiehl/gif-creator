'use client';

import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { FilmIcon, ImageIcon, SparklesIcon, TypeIcon, PaintbrushIcon, ShapesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuOption } from '@/types';
import { EditorModeConfig } from './editor-mode';

type EditorEmptyStateProps = {
  config: EditorModeConfig;
  selectedMenuOption: MenuOption;
  onSelectMenuOption: (option: MenuOption) => void;
  onCreateBlankFrame?: () => void;
};

const sourceOptions: Array<{
  option: MenuOption;
  title: string;
  description: string;
  icon: typeof FilmIcon;
  group: 'import' | 'create';
}> = [
  {
    option: 'Video',
    title: 'Video',
    description: 'Convert a clip into frames and edit the result.',
    icon: FilmIcon,
    group: 'import',
  },
  {
    option: 'Image',
    title: 'Images',
    description: 'Build a GIF from photos or illustrations.',
    icon: ImageIcon,
    group: 'import',
  },
  {
    option: 'Gif',
    title: 'GIF',
    description: 'Upload a GIF and optimize or restyle it.',
    icon: SparklesIcon,
    group: 'import',
  },
  {
    option: 'Text',
    title: 'Text',
    description: 'Start with a text frame and build from there.',
    icon: TypeIcon,
    group: 'create',
  },
  {
    option: 'Draw',
    title: 'Draw',
    description: 'Paint on a blank canvas to create frames.',
    icon: PaintbrushIcon,
    group: 'create',
  },
  {
    option: 'Shapes',
    title: 'Shapes',
    description: 'Build frames with shapes, icons, and patterns.',
    icon: ShapesIcon,
    group: 'create',
  },
];

export function EditorEmptyState({
  config,
  selectedMenuOption,
  onSelectMenuOption,
  onCreateBlankFrame,
}: EditorEmptyStateProps) {
  const importOptions = sourceOptions.filter((o) => o.group === 'import');
  const createOptions = sourceOptions.filter((o) => o.group === 'create');
  const [importNotice, setImportNotice] = useState<string | null>(null);

  const openImport = () => {
    // Mount the matching resource panel before opening its existing file picker.
    // Keep this synchronous so the browser retains the user's click activation.
    flushSync(() => onSelectMenuOption(config.menuOption));
    const input = Array.from(
      document.querySelectorAll<HTMLInputElement>(
        `input[data-editor-import="${config.routeMode}"]`,
      ),
    ).find((candidate) => candidate.parentElement?.getClientRects().length);

    if (input) {
      setImportNotice(null);
      input.click();
    } else {
      setImportNotice('The import controls are preparing. Please try again in a moment.');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-8">
      {/* ── Hero card ── */}
      <div className="rounded-3xl border border-white/20 bg-white/70 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
        <div className="mb-4 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
          Guided start
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {config.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {config.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {config.acceptedFormats.map((format) => (
                <span
                  key={format}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {format}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" onClick={openImport}>
                {config.primaryActionLabel}
              </Button>
              <Button variant="outline" size="lg" onClick={() => onSelectMenuOption('Export')}>
                Review export settings
              </Button>
            </div>
            {importNotice && (
              <p role="status" className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {importNotice}
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Quick steps</div>
            <ol className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {config.quickSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{config.helperText}</p>
          </div>
        </div>
      </div>

      {/* ── Import sources ── */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Import from file
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {importOptions.map(({ option, title, description, icon: Icon }) => {
            const isSelected = selectedMenuOption === option;
            const isRecommended = config.menuOption === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onSelectMenuOption(option)}
                className={cn(
                  'rounded-2xl border p-5 text-left transition-colors',
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm dark:border-blue-400 dark:bg-blue-950/40'
                    : 'border-slate-200 bg-white/80 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700',
                )}
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                  {isRecommended && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Best match
                    </span>
                  )}
                </div>
                <div className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{title}</div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Create from scratch ── */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Or start from scratch
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {createOptions.map(({ option, title, description, icon: Icon }) => {
            const isSelected = selectedMenuOption === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onSelectMenuOption(option);
                  if (onCreateBlankFrame) onCreateBlankFrame();
                }}
                className={cn(
                  'rounded-2xl border p-5 text-left transition-colors',
                  isSelected
                    ? 'border-violet-500 bg-violet-50 shadow-sm dark:border-violet-400 dark:bg-violet-950/40'
                    : 'border-slate-200 bg-white/80 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700',
                )}
              >
                <Icon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                <div className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{title}</div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
