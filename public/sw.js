// Service Worker pour les notifications push
self.addEventListener('install', (event) => {
  console.log('Service Worker installé')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activé')
  event.waitUntil(self.clients.claim())
})

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
      self.registration.showNotification(data.title || 'VHD Ministères', options)
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