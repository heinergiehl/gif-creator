const DEFAULT_SITE_URL = 'https://gif-creator.heinerdevelops.tech';

function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return DEFAULT_SITE_URL;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
}

export function getSiteUrl(): URL {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL;

  try {
    return new URL(normalizeUrl(envUrl));
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export const SITE_URL = getSiteUrl();
export const SITE_NAME = 'GIF-Creator';
export const SITE_BRAND = 'GIF-Creator';
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@gif-creator.app';
export const SITE_DESCRIPTION =
  'Create and edit animated GIFs online. Convert video to GIF, make GIFs from images, crop, resize, add text, adjust speed, and optimize file size — free, fast, and without watermarks.';
export const SITE_KEYWORDS = [
  'GIF maker', 'GIF editor', 'video to GIF', 'image to GIF',
  'animated GIF editor', 'MP4 to GIF', 'resize GIF', 'crop GIF',
  'add text to GIF', 'compress GIF', 'optimize GIF', 'screen to GIF',
  'record screen to GIF', 'online GIF maker', 'free GIF editor',
  'animated image editor', 'GIF for docs', 'GIF for social media',
  'convert MP4 to GIF online free', 'how to make a GIF from a video',
  'reduce GIF file size', 'GIF speed changer', 'browser-based GIF editor',
  'private GIF maker no upload', 'GIF loop editor', 'MOV to GIF converter',
  'AVI to GIF', 'WebM to GIF', 'best free online GIF tool',
  'create animated GIF without watermark', 'GIF frame timing editor',
  'video clip to GIF converter', 'optimize GIF for web',
  'animated sticker maker', 'GIF maker for Slack', 'GIF maker for Discord',
  'no watermark GIF creator', 'WebP to GIF', 'APNG maker',
  'split GIF into frames', 'GIF transparency editor',
];

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, SITE_URL).toString();
}
