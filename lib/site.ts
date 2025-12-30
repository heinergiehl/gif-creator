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

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, SITE_URL).toString();
}
