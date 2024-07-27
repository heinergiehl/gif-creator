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
  MdMovieFilter,
  MdAnimation,
} from 'react-icons/md';
import { usePathname } from 'next/navigation';
import { FaRegSmile } from 'react-icons/fa';
import { UIStore } from '@/store/UIStore';
import { cn } from '@/lib/utils';
export const Sidebar = observer(() => {
  const pathName = usePathname();
  const store = useStores().uiStore;
  const editorStore = useStores().editorStore;
  const progress = editorStore.progress;
  return (
    <div className="absolute bottom-0 left-0 flex w-screen items-center justify-center dark:bg-gray-800 md:top-0  md:h-screen   md:w-[90px] md:flex-col">
      {MENU_OPTIONS.map((option) => {
        const isSelected = store.selectedMenuOption === option.name;
        return (
          <li
            key={option.name}
            className={`
              relative
               m-1
               flex
              h-[72px]
              w-[72px]
              flex-col
              items-center
              justify-center rounded-lg  `}
          >
            <button
              onClick={() => {
                option.action(store);
              }}
              className={cn([
                'flex h-full w-full flex-col items-center justify-center rounded-lg',
                isSelected
                  ? 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600'
                  : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200',
              ])}
            >
              <option.icon size="20" />
              <div className={`text-[0.6rem]`}>{option.name}</div>
            </button>
          </li>
        );
      })}
    </div>
  );
});
const MENU_OPTIONS = [
  {
    name: 'Video',
    icon: MdVideoLibrary,
    action: (store: UIStore) => {
      store.setSelectedMenuOption('Video');
    },
  },
  {
    name: 'Image',
    icon: MdImage,
    action: (store: UIStore) => {
      store.setSelectedMenuOption('Image');
    },
  },
  {
    name: 'Gif',
    icon: MdTransform,
    action: (store: UIStore) => {
      store.setSelectedMenuOption('Gif');
    },
  },
  {
    name: 'Text',
    icon: MdTitle,
    action: (store: UIStore) => {
      store.setSelectedMenuOption('Text');
    },
  },
  {
    name: 'Export',
    icon: MdDownload,
    action: (store: UIStore) => {
      store.setSelectedMenuOption('Export');
    },
  },
];
