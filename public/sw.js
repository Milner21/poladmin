const SW_VERSION = '1.2.0';
const CACHE_NAME = `poladmin-cache-${SW_VERSION}`;

const urlsToCache = [
  '/',
  '/manifest.json',
];

// Instalar y cachear solo lo esencial
self.addEventListener('install', (event) => {
  console.log(`[SW] Instalando version ${SW_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  // Forzar activacion inmediata sin esperar tabs antiguos
  self.skipWaiting();
});

// Activar y limpiar caches viejos
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activando version ${SW_VERSION}`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[SW] Eliminando cache viejo: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tomar control de todos los tabs inmediatamente
      return self.clients.claim();
    })
  );
});

// Estrategia: Network First para HTML y API, Cache First para assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // No interceptar requests al backend ni a otros dominios
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // No interceptar llamadas a la API
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/padron')) {
    return;
  }

  // Para version.json: siempre ir a la red
  if (url.pathname.includes('version.json')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Para navegacion HTML: Network First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/') ?? fetch(event.request);
      })
    );
    return;
  }

  // Para assets estaticos (js, css, png, etc): Cache First
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

// Escuchar mensaje de forzar actualizacion desde el frontend
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});