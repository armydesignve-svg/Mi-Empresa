self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.use('mi-empresa').then((cache) => {
      return cache.addAll(['./', './index.html', './manifest.webmanifest']);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
