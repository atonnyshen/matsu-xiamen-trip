/* 馬祖・廈門人文之旅 — Service Worker（離線優先）v10 */
const CACHE = 'matsu2026-v17';
const ASSETS = [
  './',
  './index.html',
  './checklist.html',
  './manifest.json',
  './img/qinbi.jpg',
  './img/beihai.jpg',
  './img/fuzheng.jpg',
  './img/fuzhou.jpg',
  './img/lighthouse.jpg',
  './img/keelung.jpg',
  './img/kulangsu.jpg',
  './img/xiamen.jpg',
  './img/xiamen2.jpg',
  './img/botanic.jpg',
  './img/xmu.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // 離線時：navigation 請求回退到首頁（index 快取）
          if (event.request.mode === 'navigate') return caches.match('./');
          return cached;
        });
    })
  );
});
