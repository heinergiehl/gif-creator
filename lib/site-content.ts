import fs from 'node:fs';
import path from 'node:path';

const APP_DIRECTORY = path.join(process.cwd(), 'app');

const EXCLUDED_EXACT_ROUTES = new Set([
  '/account',
  '/auth/confirm',
  '/create-and-edit-gifs',
  '/create-and-edit-gifs/converter-and-editor',
  '/create-and-edit-gifs/converter-and-editor/editor',
  '/login',
  '/screen-to-video/record-screen',
]);

function walkDirectories(directoryPath: string): string[] {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      if (entry.name.startsWith('_')) {
        continue;
      }

      files.push(...walkDirectories(absolutePath));
      continue;
    }

    if (entry.name === 'page.tsx') {
      files.push(absolutePath);
    }
  }

  return files;
}

function normalizeRouteFromPagePath(pagePath: string): string {
  const relativePath = path.relative(APP_DIRECTORY, pagePath);
  const routePath = relativePath.replace(/\\/g, '/').replace(/\/page\.tsx$/, '');

  if (!routePath) {
    return '/';
  }

  return `/${routePath}`;
}

function isPublicRoute(route: string): boolean {
  if (EXCLUDED_EXACT_ROUTES.has(route)) {
    return false;
  }

  if (route.includes('/auth/') || route.includes('/editor')) {
    return false;
  }

  const segments = route.split('/').filter(Boolean);

  return segments.every(
    (segment) =>
      !segment.startsWith('(') &&
      !segment.endsWith(')') &&
      !segment.startsWith('[') &&
      !segment.endsWith(']'),
  );
}

export function getPublicAppRoutes(): string[] {
  const routes = walkDirectories(APP_DIRECTORY)
    .map(normalizeRouteFromPagePath)
    .filter(isPublicRoute);

  return [...new Set(routes)].sort((left, right) => left.localeCompare(right));
}

export function getRoutePriority(route: string): number {
  if (route === '/') {
    return 1;
  }

  if (route === '/blog') {
    return 0.85;
  }

  if (route === '/video-to-gif' || route === '/image-to-gif' || route === '/edit-gifs') {
    return 0.9;
  }

  if (route.endsWith('/converter-and-editor')) {
    return 0.7;
  }

  if (route.startsWith('/screen-to-video')) {
    return 0.6;
  }

  if (route.includes('privacy') || route.includes('terms') || route.includes('cookies')) {
    return 0.3;
  }

  if (route === '/contact') {
    return 0.4;
  }

  return 0.5;
}

export function getRouteChangeFrequency(route: string): 'weekly' | 'monthly' {
  if (
    route === '/' ||
    route === '/blog' ||
    route === '/video-to-gif' ||
    route === '/image-to-gif' ||
    route === '/edit-gifs'
  ) {
    return 'weekly';
  }

  return 'monthly';
}