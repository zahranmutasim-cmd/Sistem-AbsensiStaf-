const CACHE_NAME = 'zran-absensi-v2';
const ASSETS_TO_CACHE = [
  './',
  './staf-absensi.html',
  './JS/staf-absensi.js',
  './JS/firebase-config.js'
];

// Install Service Worker & Pre-cache
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(err => {
        console.warn('SW: Cache addAll gagal (mungkin offline), lanjut saja', err);
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
            console.log('SW: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Network-first strategy (selalu coba ambil dari internet dulu, 
// baru fallback ke cache kalau offline)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Simpan copy response ke cache untuk offline fallback
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Kalau offline, ambil dari cache
        return caches.match(event.request);
      })
  );
});
