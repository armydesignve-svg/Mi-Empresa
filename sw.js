const CACHE_NAME = 'mi-empresa-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-96x96.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Se guarda cada archivo por separado: si uno falta, los demás igual se guardan
      Promise.all(ASSETS_TO_CACHE.map((url) => cache.add(url).catch(() => {})))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Solo archivos de tu propio sitio; Supabase, fuentes y /api van directo a internet
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  // La app (index.html): primero internet, así siempre ves la última versión; sin internet usa la copia guardada
  if (req.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put('/index.html', copia));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Íconos y demás archivos: primero la copia guardada
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(req, copia)); }
      return res;
    }))
  );
});
