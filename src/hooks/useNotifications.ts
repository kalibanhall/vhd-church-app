/**
 * =============================================================================
 * MYCHURCHAPP
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * Version: 1.0.3
 * Date: Octobre 2025
 * 
 * =============================================================================
 */

'use client'
import { useState, useEffect, useCallback } from 'react'

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Initialiser le service worker et demander les permissions
  useEffect(() => {
    const initializeNotifications = async () => {
      // Vérifier le support des notifications
      if (!('Notification' in window)) {
        console.log('Ce navigateur ne supporte pas les notifications')
        return
      }

      // Vérifier le support des service workers
      if (!('serviceWorker' in navigator)) {
        console.log('Ce navigateur ne supporte pas les service workers')
        return
      }

      try {
        // Enregistrer le service worker
        const reg = await navigator.serviceWorker.register('/sw.js')
        setRegistration(reg)
        console.log('Service Worker enregistré:', reg)

        // Vérifier l'état des permissions
        setPermission(Notification.permission)
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du service worker:', error)
      }
    }

    initializeNotifications()
  }, [])

  // Demander la permission pour les notifications
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error)
      return false
    }
  }, [])

  // Charger les notifications depuis l'API
  const loadNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        credentials: 'include'
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error)
    }
  }, [])

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'mark-all-read' })
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Erreur lors du marquage global comme lu:', error)
    }
  }, [])

  // Supprimer une notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        const notif = notifications.find(n => n.id === notificationId)
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        
        if (notif && !notif.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }, [notifications])

  // Afficher une notification push locale
  const showNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') {
      console.log('Permission refusée pour les notifications')
      return
    }

    if (registration) {
      try {
        await registration.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          vibrate: [200, 100, 200],
          ...options
        })
      } catch (error) {
        console.error('Erreur lors de l\'affichage de la notification:', error)
      }
    }
  }, [permission, registration])

  // Simuler une notification push (pour les tests)
  const simulatePushNotification = useCallback(async () => {
    if (registration) {
      const payload = {
        title: 'Test de notification',
        body: 'Ceci est une notification de test',
        tag: 'test-notification',
        data: { url: '/' }
      }

      // Simuler un événement push
      if (registration.active) {
        registration.active.postMessage({
          type: 'SIMULATE_PUSH',
          payload
        })
      }
    }
  }, [registration])

  return {
    permission,
    notifications,
    unreadCount,
    loading,
    requestPermission,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    showNotification,
    simulatePushNotification
  }
}