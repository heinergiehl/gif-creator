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
type ConversionType = 'videoToGif' | 'imageToGif' | 'gifToGif';
export const Sidebar = observer(() => {
  const pathName = usePathname();
  const store = useStores().uiStore;
  let conversionType: ConversionType = 'videoToGif';
  switch (pathName) {
    case '/image-to-gif':
      conversionType = 'imageToGif';
      break;
    case '/video-to-gif':
      conversionType = 'videoToGif';
      break;
    case '/edit-gifs':
      conversionType = 'gifToGif';
      break;
    default:
      break;
  }
  // useEffect(() => {
  //   setConversionTypeState(conversionType)
  //   switch (conversionType) {
  //     case "videoToGif":
  //       store.setSelectedMenuOption("Video")
  //       break
  //     case "imageToGif":
  //       store.setSelectedMenuOption("Image")
  //       break
  //     case "gifToGif":
  //       store.setSelectedMenuOption("Gif")
  //       break
  //     default:
  //       break
  //   }
  // }, [pathName])
  return (
    <ul className="flex h-full w-[90px]   gap-y-4  border-4 pt-[80px] shadow-lg  shadow-secondary  dark:bg-gray-800 sm:flex-col lg:h-screen lg:flex-col">
      {MENU_OPTIONS.map((option) => {
        const isSelected = store.selectedMenuOption === option.name;
        return (
          <li
            key={option.name}
            className={`
              flex
              h-[72px]
              w-[72px]
              flex-col
              items-center
              justify-center rounded-lg  `}
          >
            <button
              onClick={() => option.action(store)}
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
    </ul>
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
  // smilies
  {
    name: 'Smilies',
    icon: FaRegSmile,
    action: (store: UIStore) => {
      store.setSelectedMenuOption('Smilies');
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
