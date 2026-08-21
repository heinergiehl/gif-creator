export type GifToolCategory = 'create' | 'edit' | 'motion' | 'optimize' | 'convert' | 'extract';

export interface GifToolDefinition {
  path: string;
  name: string;
  shortName: string;
  description: string;
  category: GifToolCategory;
  related: string[];
  featured?: boolean;
  updatedAt?: string;
}

export const gifToolCategories: Array<{
  id: GifToolCategory;
  label: string;
  description: string;
}> = [
  {
    id: 'create',
    label: 'Create',
    description: 'Start with a video, image sequence, screen recording, or existing animation.',
  },
  {
    id: 'edit',
    label: 'Edit',
    description: 'Change the canvas, orientation, or message without flattening the animation.',
  },
  {
    id: 'motion',
    label: 'Motion',
    description: 'Control timing, direction, and the exact section that should loop.',
  },
  {
    id: 'optimize',
    label: 'Optimize',
    description: 'Reduce dimensions or file weight while keeping the result useful.',
  },
  {
    id: 'convert',
    label: 'Convert',
    description: 'Move animated media between practical web and video formats.',
  },
  {
    id: 'extract',
    label: 'Extract',
    description: 'Turn an animation into reusable, correctly rendered individual frames.',
  },
];

export const gifTools: GifToolDefinition[] = [
  {
    path: '/video-to-gif',
    name: 'Video to GIF',
    shortName: 'Video to GIF',
    description: 'Turn an MP4, MOV, AVI, or WebM clip into an animated GIF.',
    category: 'create',
    related: ['/trim-gif', '/compress-gif', '/gif-to-mp4'],
    featured: true,
  },
  {
    path: '/image-to-gif',
    name: 'Images to GIF',
    shortName: 'Images to GIF',
    description: 'Build an animated GIF from still images and control frame timing.',
    category: 'create',
    related: ['/split-gif-into-frames', '/resize-gif', '/compress-gif'],
  },
  {
    path: '/edit-gifs',
    name: 'Full GIF Editor',
    shortName: 'GIF Editor',
    description: 'Use the complete editor for layered and frame-level changes.',
    category: 'create',
    related: ['/add-text-to-gif', '/crop-gif', '/resize-gif'],
  },
  {
    path: '/screen-to-video',
    name: 'Screen Recorder',
    shortName: 'Screen Recorder',
    description: 'Record a short screen demo before turning it into a GIF.',
    category: 'create',
    related: ['/video-to-gif', '/trim-gif', '/compress-gif'],
  },
  {
    path: '/resize-gif',
    name: 'Resize GIF',
    shortName: 'Resize',
    description: 'Set exact animated GIF dimensions with an optional locked aspect ratio.',
    category: 'edit',
    related: ['/crop-gif', '/compress-gif', '/gif-to-webp'],
    featured: true,
    updatedAt: '2026-08-21',
  },
  {
    path: '/crop-gif',
    name: 'Crop GIF',
    shortName: 'Crop',
    description: 'Remove unused edges and keep the important action in frame.',
    category: 'edit',
    related: ['/resize-gif', '/compress-gif', '/trim-gif'],
    updatedAt: '2026-08-21',
  },
  {
    path: '/rotate-gif',
    name: 'Rotate or Flip GIF',
    shortName: 'Rotate',
    description: 'Correct orientation or mirror every frame of an animated GIF.',
    category: 'edit',
    related: ['/crop-gif', '/resize-gif', '/compress-gif'],
    updatedAt: '2026-08-21',
  },
  {
    path: '/add-text-to-gif',
    name: 'Add Text to GIF',
    shortName: 'Add Text',
    description: 'Add a caption, callout, or label to an existing animated GIF.',
    category: 'edit',
    related: ['/edit-gifs', '/resize-gif', '/compress-gif'],
  },
  {
    path: '/change-gif-speed',
    name: 'Change GIF Speed',
    shortName: 'Change Speed',
    description: 'Speed up or slow down a GIF by multiplier or exact duration.',
    category: 'motion',
    related: ['/trim-gif', '/reverse-gif', '/compress-gif'],
    featured: true,
    updatedAt: '2026-08-21',
  },
  {
    path: '/trim-gif',
    name: 'Trim GIF',
    shortName: 'Trim',
    description: 'Keep the exact time range you need and remove the rest of the loop.',
    category: 'motion',
    related: ['/change-gif-speed', '/reverse-gif', '/compress-gif'],
    updatedAt: '2026-08-21',
  },
  {
    path: '/reverse-gif',
    name: 'Reverse GIF',
    shortName: 'Reverse',
    description: 'Play a GIF backward or create a smooth ping-pong loop.',
    category: 'motion',
    related: ['/change-gif-speed', '/trim-gif', '/compress-gif'],
    updatedAt: '2026-08-21',
  },
  {
    path: '/compress-gif',
    name: 'Compress GIF',
    shortName: 'Compress',
    description: 'Find the clearest real encode below an exact KB or MB target.',
    category: 'optimize',
    related: ['/resize-gif', '/gif-to-webp', '/gif-to-mp4'],
    featured: true,
    updatedAt: '2026-08-21',
  },
  {
    path: '/gif-to-mp4',
    name: 'GIF to MP4',
    shortName: 'GIF to MP4',
    description: 'Convert an animated GIF into a broadly shareable MP4 video.',
    category: 'convert',
    related: ['/gif-to-webp', '/compress-gif', '/video-to-gif'],
    featured: true,
    updatedAt: '2026-08-21',
  },
  {
    path: '/gif-to-webp',
    name: 'GIF to WebP',
    shortName: 'GIF to WebP',
    description: 'Convert a GIF into an animated WebP for modern web delivery.',
    category: 'convert',
    related: ['/webp-to-gif', '/compress-gif', '/gif-to-mp4'],
    updatedAt: '2026-08-21',
  },
  {
    path: '/webp-to-gif',
    name: 'WebP to GIF',
    shortName: 'WebP to GIF',
    description: 'Turn a still or animated WebP into a widely compatible GIF.',
    category: 'convert',
    related: ['/gif-to-webp', '/compress-gif', '/resize-gif'],
    updatedAt: '2026-08-21',
  },
  {
    path: '/split-gif-into-frames',
    name: 'Split GIF into Frames',
    shortName: 'Extract Frames',
    description: 'Extract correctly rendered PNG frames from an animated GIF.',
    category: 'extract',
    related: ['/image-to-gif', '/gif-to-webp', '/trim-gif'],
    featured: true,
    updatedAt: '2026-08-21',
  },
];

export function getGifTool(path: string): GifToolDefinition | undefined {
  return gifTools.find((tool) => tool.path === path);
}

export function getRelatedGifTools(path: string, limit = 3): GifToolDefinition[] {
  const tool = getGifTool(path);
  if (!tool) return [];

  return tool.related
    .map((relatedPath) => getGifTool(relatedPath))
    .filter((related): related is GifToolDefinition => Boolean(related))
    .slice(0, limit);
}

export const canonicalStaticPages: Array<{ path: string; updatedAt?: string }> = [
  { path: '/', updatedAt: '2026-08-21' },
  { path: '/gif-tools', updatedAt: '2026-08-21' },
  ...gifTools.map(({ path, updatedAt }) => ({ path, updatedAt })),
  { path: '/blog' },
  { path: '/contact' },
  { path: '/privacy-policy' },
  { path: '/terms-of-service' },
  { path: '/info/cookies' },
];
