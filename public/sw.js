// DejoiY Pay Service Worker v1.0.0
// Strict financial caching rules: Never cache financial mutation APIs or payment endpoints.

const CACHE_NAME = 'dejoiypay-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
  '/sdk/dejoiypay.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // CRITICAL FINANCIAL SECURITY:
  // Never intercept or cache API requests, POST/PUT/DELETE mutations, or webhook calls
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('/checkout/') ||
    url.pathname.includes('/pay')
  ) {
    return; // Pass through to network directly
  }

  // Static assets & navigational pages: Network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache good GET responses for static assets
        if (response.status === 200 && (url.pathname.match(/\.(js|css|png|svg|ico|woff2)$/) || STATIC_ASSETS.includes(url.pathname))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        // If offline and requesting an HTML page, serve the cached root
        if (request.headers.get('accept')?.includes('text/html')) {
          const root = await caches.match('/');
          if (root) return root;
        }
        return new Response('Network unavailable. DejoiY Pay is offline.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      })
  );
});
