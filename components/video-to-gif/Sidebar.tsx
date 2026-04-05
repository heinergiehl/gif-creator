'use client';
import React from 'react';
import { RootStore, useStores } from '@/store';
import { observer } from 'mobx-react';
import {
  MdDownload,
  MdVideoLibrary,
  MdImage,
  MdTransform,
  MdTitle,
  MdBrush,
  MdCategory,
} from 'react-icons/md';
import { UIStore } from '@/store/UIStore';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/* ── Group definitions ─────────────────────────────────────── */
type SidebarGroup = {
  label: string;
  items: SidebarItem[];
};

type SidebarItem = {
  name: string;
  icon: React.ComponentType<{ size?: string | number }>;
  tooltip: string;
  action: (store: UIStore) => void;
};

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    label: 'Import',
    items: [
      {
        name: 'Video',
        icon: MdVideoLibrary,
        tooltip: 'Import video',
        action: (store) => store.setSelectedMenuOption('Video'),
      },
      {
        name: 'Image',
        icon: MdImage,
        tooltip: 'Add images',
        action: (store) => store.setSelectedMenuOption('Image'),
      },
      {
        name: 'Gif',
        icon: MdTransform,
        tooltip: 'Import GIF',
        action: (store) => store.setSelectedMenuOption('Gif'),
      },
    ],
  },
  {
    label: 'Create',
    items: [
      {
        name: 'Text',
        icon: MdTitle,
        tooltip: 'Add text',
        action: (store) => store.setSelectedMenuOption('Text'),
      },
      {
        name: 'Draw',
        icon: MdBrush,
        tooltip: 'Freehand draw',
        action: (store) => store.setSelectedMenuOption('Draw'),
      },
      {
        name: 'Shapes',
        icon: MdCategory,
        tooltip: 'Add shapes',
        action: (store) => store.setSelectedMenuOption('Shapes'),
      },
    ],
  },
  {
    label: 'Output',
    items: [
      {
        name: 'Export',
        icon: MdDownload,
        tooltip: 'Export GIF',
        action: (store) => store.setSelectedMenuOption('Export'),
      },
    ],
  },
];

/* ── Sidebar button ──────────────────────────────────────── */
const SidebarButton = observer(
  ({ item, isSelected, store, rootStore }: { item: SidebarItem; isSelected: boolean; store: UIStore; rootStore: RootStore }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => {
            // Auto-disable drawing mode when switching away from Draw tab
            if (item.name !== 'Draw') {
              const canvas = rootStore.canvasRef.current;
              if (canvas?.isDrawingMode) {
                canvas.isDrawingMode = false;
                canvas.discardActiveObject();
                canvas.renderAll();
              }
            }
            item.action(store);
          }}
          className={cn(
            'flex h-[52px] w-[52px] flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-200',
            isSelected
              ? 'scale-[1.04] bg-blue-500 text-white shadow-lg shadow-blue-500/35 ring-2 ring-blue-400/50 hover:bg-blue-600 active:scale-100 dark:bg-blue-500 dark:ring-blue-300/25 dark:shadow-blue-500/25'
              : 'text-slate-400 hover:scale-[1.06] hover:bg-blue-50 hover:text-blue-600 active:scale-95 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-blue-400',
          )}
        >
          <item.icon size="18" />
          <span className="text-[9px] font-medium leading-none">{item.name}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="px-2.5 py-1.5">
        <p className="text-xs font-medium">{item.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  ),
);

/* ── Main sidebar ────────────────────────────────────────── */
export const Sidebar = observer(() => {
  const rootStore = useStores();
  const store = rootStore.uiStore;
  return (
    <TooltipProvider delayDuration={300}>
      {/* ── Desktop sidebar ── */}
      <div
        id="sidebar"
        className="absolute bottom-0 left-0 hidden w-[76px] flex-col items-center bg-slate-50 pt-3 dark:bg-gray-900 md:top-0 md:flex md:h-screen"
      >
        {SIDEBAR_GROUPS.map((group, gi) => (
          <React.Fragment key={group.label}>
            {/* Group items */}
            <div className="flex flex-col items-center gap-0.5 py-1">
              {group.items.map((item) => (
                <SidebarButton
                  key={item.name}
                  item={item}
                  isSelected={store.selectedMenuOption === item.name}
                  store={store}
                  rootStore={rootStore}
                />
              ))}
            </div>

            {/* Separator between groups */}
            {gi < SIDEBAR_GROUPS.length - 1 && (
              <div className="mx-auto h-px w-8 bg-slate-200/80 dark:bg-slate-700/40" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── Mobile bottom bar — flat row, no group labels ── */}
      <div
        id="sidebar-mobile"
        className="flex w-screen items-center justify-around bg-slate-50 py-1 dark:bg-gray-900 md:hidden"
      >
        {SIDEBAR_GROUPS.flatMap((g) => g.items).map((item) => (
          <SidebarButton
            key={item.name}
            item={item}
            isSelected={store.selectedMenuOption === item.name}
            store={store}
            rootStore={rootStore}
          />
        ))}
      </div>
    </TooltipProvider>
  );
});
