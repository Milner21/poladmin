const CACHE_NAME = 'poladmin-v1';

// Archivos que siempre estarán disponibles offline
const urlsToCache = [
  '/',                   
  '/rm',                 
  '/tr',               
  '/manifest.json',       
  '/login'
];

// Instalar el Service Worker y cachear archivos
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalándose...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cacheando archivos importantes');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activar el Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activado');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Limpiar cachés antiguos
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si está en caché, devolverlo
        if (response) {
          return response;
        }
        
        // Si no, ir a la red
        return fetch(event.request);
      })
  );
});