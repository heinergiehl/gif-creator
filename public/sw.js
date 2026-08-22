'use strict';

const CACHE_PREFIX = 'gif-creator-shell-';
const CACHE_VERSION = 'v1';
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;

const APP_SHELL_URLS = ['/', '/favicon.ico', '/logo.png', '/manifest.webmanifest'];
const STATIC_PATHS = new Set(['/favicon.ico', '/logo.png', '/manifest.webmanifest']);
const SENSITIVE_PATH_PREFIXES = [
  '/api',
  '/auth',
  '/account',
  '/login',
  '/project',
  '/projects',
  '/share',
  '/embed',
  '/remix',
  '/media',
  '/uploads',
  '/storage',
];
const SENSITIVE_QUERY_KEYS = new Set([
  'code',
  'file',
  'media',
  'project',
  'projectId',
  'remix',
  'share',
  'source',
  'sourceUrl',
  'token',
]);

function isSensitivePath(pathname) {
  return SENSITIVE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function hasSensitiveQuery(url) {
  for (const key of SENSITIVE_QUERY_KEYS) {
    if (url.searchParams.has(key)) return true;
  }

  return false;
}

function isSafeRequest(request, url) {
  return (
    request.method === 'GET' &&
    (url.protocol === 'https:' || url.protocol === 'http:') &&
    url.origin === self.location.origin &&
    !isSensitivePath(url.pathname) &&
    !hasSensitiveQuery(url) &&
    !request.headers.has('authorization') &&
    !request.headers.has('range')
  );
}

function isSafeCacheResponse(response) {
  const cacheControl = response.headers.get('cache-control') || '';

  return (
    response.ok && response.type === 'basic' && !/\b(?:no-store|private)\b/i.test(cacheControl)
  );
}

function isStaticShellRequest(url) {
  if (url.search) return false;

  return STATIC_PATHS.has(url.pathname) || url.pathname.startsWith('/_next/static/');
}

async function cacheAnonymousShell() {
  const cache = await caches.open(CACHE_NAME);

  await Promise.allSettled(
    APP_SHELL_URLS.map(async (pathname) => {
      const request = new Request(pathname, {
        cache: 'reload',
        credentials: 'omit',
      });
      const response = await fetch(request);

      if (isSafeCacheResponse(response)) {
        await cache.put(pathname, response);
      }
    }),
  );
}

async function cacheFirstStatic(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) return cached;

  const response = await fetch(request);
  if (isSafeCacheResponse(response)) {
    await cache.put(request, response.clone());
  }

  return response;
}

function offlineResponse() {
  return new Response(
    '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GIF-Creator is offline</title><style>body{font:16px system-ui;margin:0;min-height:100vh;display:grid;place-items:center;background:#020617;color:#f8fafc}main{max-width:32rem;padding:2rem}a{color:#7dd3fc}</style><main><h1>You are offline</h1><p>Reconnect to open GIF-Creator. Projects and source media are never stored in the offline cache.</p><a href="/">Try again</a></main>',
    {
      status: 503,
      statusText: 'Offline',
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    },
  );
}

async function networkFirstNavigation(request) {
  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(CACHE_NAME);
    return (await cache.match('/')) || offlineResponse();
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheAnonymousShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (!isSafeRequest(request, url)) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isStaticShellRequest(url)) {
    event.respondWith(cacheFirstStatic(request));
  }
});
