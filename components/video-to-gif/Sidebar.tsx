'use client';
import React from 'react';
import { useStores } from '@/store';
import { observer } from 'mobx-react';
import {
  MdDownload,
  MdVideoLibrary,
  MdImage,
  MdTransform,
  MdTitle,
} from 'react-icons/md';
import { usePathname } from 'next/navigation';
import { UIStore } from '@/store/UIStore';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const Sidebar = observer(() => {
  const store = useStores().uiStore;
  return (
    <TooltipProvider delayDuration={300}>
      <div
        id="sidebar"
        className="absolute bottom-0 left-0 flex w-screen items-center justify-between bg-slate-200 dark:bg-gray-800 md:top-0 md:h-screen md:w-[90px] md:flex-col md:justify-start md:pt-[50px]"
      >
        {MENU_OPTIONS.map((option) => {
          const isSelected = store.selectedMenuOption === option.name;
          return (
            <Tooltip key={option.name}>
              <TooltipTrigger asChild>
                <li
                  className="relative m-1 flex h-[72px] w-[72px] flex-col items-center justify-center rounded-lg"
                >
                  <button
                    onClick={() => option.action(store)}
                    className={cn([
                      'flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-lg transition-colors',
                      isSelected
                        ? 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600'
                        : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200',
                    ])}
                  >
                    <option.icon size="20" />
                    <div className="text-[0.6rem] font-medium leading-tight">{option.name}</div>
                  </button>
                </li>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[180px]">
                <p className="text-xs font-semibold">{option.name}</p>
                <p className="text-[10px] text-muted-foreground">{option.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
});

const MENU_OPTIONS = [
  {
    name: 'Video',
    icon: MdVideoLibrary,
    tooltip: 'Import a video clip and extract frames for your GIF',
    action: (store: UIStore) => {
      store.setSelectedMenuOption('Video');
    },
  },
  {
    name: 'Image',
    icon: MdImage,
    tooltip: 'Upload images or search Pixabay for drag-and-drop assets',
    action: (store: UIStore) => {
      store.setSelectedMenuOption('Image');
    },
  },
  {
    name: 'Gif',
    icon: MdTransform,
    tooltip: 'Upload an existing GIF to edit, optimize, or restyle',
    action: (store: UIStore) => {
      store.setSelectedMenuOption('Gif');
    },
  },
  {
    name: 'Text',
    icon: MdTitle,
    tooltip: 'Add text overlays, captions, and titles to your frames',
    action: (store: UIStore) => {
      store.setSelectedMenuOption('Text');
    },
  },
  {
    name: 'Export',
    icon: MdDownload,
    tooltip: 'Configure export settings and download your final GIF',
    action: (store: UIStore) => {
      store.setSelectedMenuOption('Export');
    },
  },
];
