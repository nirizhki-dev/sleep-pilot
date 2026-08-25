// Service Worker — מסע ההרגלים: מעטפת אפליקציה במטמון, עבודה אופליין
const CACHE = 'habits-v1';
const SHELL = ['./', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // הקהילה (cross-origin) עוברת ישירות לרשת
  // רשת-קודם עם נפילה למטמון: תמיד טרי כשיש אינטרנט, תמיד עובד כשאין
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() =>
      caches.match(e.request).then(hit => hit || (e.request.mode === 'navigate' ? caches.match('./') : undefined))
    )
  );
});
