'use client';
import CustomNavigation from './components/ui/CustomNavigation';
import { usePathname } from 'next/navigation';
const sections = [
  {
    section: 'Tools',
    links: [
      {
        title: 'Video to GIF',
        href: '/video-to-gif',
        description: 'Convert MP4, MOV, and AVI to GIF — trim, crop, resize, and optimize.',
      },
      {
        title: 'Image to GIF',
        href: '/image-to-gif',
        description: 'Turn photos into animated GIFs with frame timing and captions.',
      },
      {
        title: 'Edit GIFs',
        href: '/edit-gifs',
        description: 'Resize, crop, add text, and optimize existing animated GIFs.',
      },
      {
        title: 'Screen Recorder',
        href: '/screen-to-video',
        description: 'Record your screen to video, then convert the clip to a GIF.',
      },
    ],
  },
  {
    section: 'Learn',
    links: [
      {
        title: 'GIF Blog',
        href: '/blog',
        description: 'Read practical guides for making, editing, optimizing, and converting GIFs.',
      },
      {
        title: 'Make a GIF from video',
        href: '/blog/how-to-make-a-gif-from-a-video',
        description: 'Trim, crop, and convert MP4, MOV, and WebM clips into clean looping GIFs.',
      },
      {
        title: 'Edit a GIF without quality loss',
        href: '/blog/how-to-edit-a-gif-without-losing-quality',
        description: 'Learn how to resize, crop, add text, and tune timing without hurting readability.',
      },
      {
        title: 'Reduce GIF file size',
        href: '/blog/optimize-gif-size-without-losing-quality',
        description: 'Compress and optimize GIFs with practical file-size reduction techniques.',
      },
    ],
  },
];
export default function RootNavigation() {
  const pathname = usePathname();
  const hideNavigation =
    pathname.includes('/converter-and-editor/editor') || pathname.includes('/record-screen');

  return hideNavigation ? null : <CustomNavigation sections={sections} />;
}
