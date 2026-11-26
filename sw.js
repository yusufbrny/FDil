const CACHE_NAME = 'fdil-v9';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './css/variables.css',
  './css/animations.css',
  './css/layout.css',
  './css/modes.css',
  './css/modals-stats.css',
  './css/responsive.css',
  './css/coach-profile-leaderboard.css',
  './js/data/units.js',
  './js/data/meta.js',
  './js/data/phrasal-verbs.js',
  './js/data/reading-passages.js',
  './js/core/icons.js',
  './js/core/storage.js',
  './js/core/utils.js',
  './js/modules/gamification.js',
  './js/modules/spaced-repetition.js',
  './js/modules/flashcard.js',
  './js/modules/quizzes.js',
  './js/modules/learn-modal.js',
  './js/modules/my-words.js',
  './js/modules/phrasal-verbs.js',
  './js/modules/search-dict.js',
  './js/modules/reading.js',
  './js/modules/stats-settings.js',
  './js/modules/mascot.js',
  './js/modules/exam-coach.js',
  './js/modules/auth-profile-leaderboard.js',
  './js/app.js'
];

const DEV_MODE = true;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  if (DEV_MODE) {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('Offline', { status: 503 });
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }

        if (response.type === 'basic' || response.type === 'cors') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Bildirim içeriği',
    icon: data.icon || './icon-192.png',
    badge: './icon-192.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || [],
    tag: data.tag || 'fdil-notification',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'FDil', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || './';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      return self.clients.openWindow(urlToOpen);
    })
  );
});
