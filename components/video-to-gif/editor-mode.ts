import { MenuOption } from '@/types';

export type EditorRouteMode = 'video' | 'image' | 'gif';

export type EditorModeConfig = {
  routeMode: EditorRouteMode;
  menuOption: MenuOption;
  title: string;
  description: string;
  primaryActionLabel: string;
  helperText: string;
  acceptedFormats: string[];
  quickSteps: string[];
};

const editorModeConfig: Record<EditorRouteMode, EditorModeConfig> = {
  video: {
    routeMode: 'video',
    menuOption: 'Video',
    title: 'Start with a video clip',
    description:
      'Upload MP4, MOV, AVI, or WebM, extract the best frames, then fine-tune timing, text, crop, and export.',
    primaryActionLabel: 'Upload video',
    helperText: 'Best for turning short clips into optimized GIFs.',
    acceptedFormats: ['MP4', 'MOV', 'AVI', 'WebM'],
    quickSteps: ['Upload a clip', 'Extract frames', 'Edit and export'],
  },
  image: {
    routeMode: 'image',
    menuOption: 'Image',
    title: 'Build a GIF from images',
    description:
      'Upload JPG, PNG, WebP, or HEIC images, arrange the sequence, adjust timing, and add overlays before export.',
    primaryActionLabel: 'Upload images',
    helperText: 'Best for slideshows, product demos, memes, and image sequences.',
    acceptedFormats: ['JPG', 'PNG', 'WebP', 'HEIC'],
    quickSteps: ['Upload images', 'Arrange the sequence', 'Add text and export'],
  },
  gif: {
    routeMode: 'gif',
    menuOption: 'Gif',
    title: 'Edit an existing GIF',
    description:
      'Upload a GIF, inspect the extracted frames, adjust timing, resize or crop, and export a cleaner optimized version.',
    primaryActionLabel: 'Upload GIF',
    helperText: 'Best for optimizing and polishing an existing animation.',
    acceptedFormats: ['GIF'],
    quickSteps: ['Upload a GIF', 'Adjust frames and styling', 'Export the final version'],
  },
};

export function getEditorRouteMode(pathname: string): EditorRouteMode {
  if (pathname.includes('/image-to-gif/')) {
    return 'image';
  }
  if (pathname.includes('/edit-gifs/')) {
    return 'gif';
  }
  return 'video';
}

export function getEditorModeConfig(routeMode: EditorRouteMode): EditorModeConfig {
  return editorModeConfig[routeMode];
}
