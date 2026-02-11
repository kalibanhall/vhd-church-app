/**
 * Service Worker - MyChurchApp PWA
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 * @version 2.0.0 - Mise à jour reconnaissance faciale
 */

const CACHE_VERSION = '2.0.0';
const CACHE_NAME = `mychurchapp-v${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/auth',
  '/offline',
  '/profile',
  '/facial-profile',
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('✅ Service Worker installé');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache ouvert');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker v' + CACHE_VERSION + ' activé');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Supprimer TOUS les caches qui ne correspondent pas à la version actuelle
          if (cacheName !== CACHE_NAME && cacheName.startsWith('mychurchapp')) {
            console.log('🗑️ Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('🔄 Service Worker prend le contrôle');
      return self.clients.claim();
    })
  );
});

// Stratégie de cache : Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  // Ne pas mettre en cache les requêtes POST, PUT, DELETE, PATCH
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone la réponse car elle peut être utilisée une seule fois
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // Si le réseau échoue, chercher dans le cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // Si pas dans le cache, retourner une page offline
            return caches.match('/offline');
          });
      })
  );
});

// Écouter les notifications push
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body || 'Nouvelle notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: data.tag || 'notification',
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'Voir'
        },
        {
          action: 'dismiss',
          title: 'Ignorer'
        }
      ],
      requireInteraction: true,
      vibrate: [200, 100, 200]
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'MyChurchApp', options)
    )
  }
})

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'view') {
    // Ouvrir l'application ou rediriger vers la page appropriée
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        // Si l'application est déjà ouverte, la focus
        for (const client of clients) {
          if (client.url === self.location.origin && 'focus' in client) {
            return client.focus()
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (self.clients.openWindow) {
          return self.clients.openWindow('/')
        }
      })
    )
  }
})

// Gérer la fermeture des notifications
self.addEventListener('notificationclose', (event) => {
  console.log('Notification fermée:', event.notification.tag)
})