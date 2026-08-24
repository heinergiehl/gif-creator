'use client';
import CustomNavigation from './components/ui/CustomNavigation';
import { usePathname } from 'next/navigation';
const sections = [
  {
    section: 'Edit & convert',
    links: [
      {
        title: 'Resize GIF',
        href: '/resize-gif',
        description: 'Set exact dimensions while keeping the animation intact.',
      },
      {
        title: 'Crop GIF',
        href: '/crop-gif',
        description: 'Remove unused edges with an animated crop preview.',
      },
      {
        title: 'Trim GIF',
        href: '/trim-gif',
        description: 'Keep an exact time range and rebuild the shorter loop.',
      },
      {
        title: 'GIF to PNG',
        href: '/gif-to-png',
        description: 'Convert a GIF into composited PNG frames and download them as a ZIP.',
      },
      {
        title: 'GIF to MP4',
        href: '/gif-to-mp4',
        description: 'Turn an animated GIF into a shareable MP4 video.',
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
        title: 'All GIF tools',
        href: '/gif-tools',
        description: 'Browse every creation, editing, motion, conversion, and extraction tool.',
      },
      {
        title: 'Make a GIF from video',
        href: '/blog/how-to-make-a-gif-from-a-video',
        description: 'Trim, crop, and convert MP4, MOV, and WebM clips into clean looping GIFs.',
      },
      {
        title: 'Edit a GIF without quality loss',
        href: '/blog/how-to-edit-a-gif-without-losing-quality',
        description:
          'Learn how to resize, crop, add text, and tune timing without hurting readability.',
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
