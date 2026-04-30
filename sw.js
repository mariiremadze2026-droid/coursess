// sw.js - Service Worker for Deep Space Academy PWA

const CACHE_NAME = 'deepspace-lms-v3'; // ვერსიის ნომერი (შეცვალეთ განახლებისას)

// ფაილები, რომლებიც უნდა შეინახოს კეშში
const urlsToCache = [
  './',
  'index.html',
  'auth.html',
  'dashboard.html',
  'books.html',
  'history.html',
  'css/style.css',
  'js/app.js',
  'manifest.json'
];


// ==================== INSTALL ====================
self.addEventListener('install', event => {
  console.log('🚀 Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cache opened, adding files...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ All files cached successfully');
        return self.skipWaiting(); // აქტიურად გადავიდეს ახალ ვერსიაზე
      })
  );
});


// ==================== FETCH ====================
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // თუ ფაილი კეშშია — დავაბრუნოთ
        if (response) {
          return response;
        }

        // თუ არ არის — წამოვიღოთ ინტერნეტიდან
        return fetch(event.request)
          .then(networkResponse => {
            // მნიშვნელოვანი ფაილები არ ვინახავთ კეშში (მაგ. API)
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // შევინახოთ კეშში ახალი პასუხი
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          });
      })
      .catch(() => {
        // offline რეჟიმში — თუ გვერდია, დავაბრუნოთ index.html
        if (event.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      })
  );
});


// ==================== ACTIVATE (ძველი კეშის გასუფთავება) ====================
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker: Activating...');

  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('🗑 Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});
