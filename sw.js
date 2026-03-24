const CACHE_NAME = 'zran-absensi-v1';
const ASSETS_TO_CACHE = [
  './halaman%20Login.html',
  './staf-absensi.html',
  './JS/staf-absensi.js',
  './JS/firebase-config.js',
  './LOGO%20saja%20.png'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Caching assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate & Cleanup Old Caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Assets from Cache App Shell
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Balikkan dari cache, atau fetch dari network jika belum di-cache
        return response || fetch(event.request);
      })
  );
});
