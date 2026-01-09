/**
 * NotificationContext - Gestion centralisée des notifications
 * Push notifications, in-app notifications, et badges
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authenticatedFetch } from '@/lib/auth-fetch';

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement' | 'event' | 'prayer' | 'message';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  createdAt: string;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  isPushSupported: boolean;
  isPushEnabled: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  requestPushPermission: () => Promise<boolean>;
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Vérifier le support des push notifications
  useEffect(() => {
    const checkPushSupport = async () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsPushSupported(supported);

      if (supported) {
        const permission = Notification.permission;
        setIsPushEnabled(permission === 'granted');
      }
    };

    checkPushSupport();
  }, []);

  // Récupérer les notifications
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch('/api/notifications-proxy');
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (id: string) => {
    try {
      await authenticatedFetch(`/api/notifications-proxy`, {
        method: 'PUT',
        body: JSON.stringify({ id, action: 'read' }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  }, []);

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      await authenticatedFetch(`/api/notifications-proxy`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'read-all' }),
      });

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
    }
  }, []);

  // Supprimer une notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await authenticatedFetch(`/api/notifications-proxy?id=${id}`, {
        method: 'DELETE',
      });

      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
    }
  }, []);

  // Effacer toutes les notifications
  const clearAll = useCallback(async () => {
    try {
      await authenticatedFetch(`/api/notifications-proxy`, {
        method: 'DELETE',
        body: JSON.stringify({ action: 'clear-all' }),
      });

      setNotifications([]);
    } catch (error) {
      console.error('Erreur lors de la suppression des notifications:', error);
    }
  }, []);

  // Demander la permission push
  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setIsPushEnabled(granted);
      return granted;
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      return false;
    }
  }, [isPushSupported]);

  // S'abonner aux push notifications
  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Récupérer la clé publique VAPID du serveur
      const vapidResponse = await fetch('/api/notifications/push/vapid-key');
      const { publicKey } = await vapidResponse.json();

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      });

      // Envoyer l'abonnement au serveur
      await authenticatedFetch('/api/notifications/push', {
        method: 'POST',
        body: JSON.stringify({
          action: 'subscribe',
          subscription: subscription.toJSON(),
        }),
      });

      setIsPushEnabled(true);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'abonnement push:', error);
      return false;
    }
  }, [isPushSupported]);

  // Se désabonner
  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        await authenticatedFetch('/api/notifications/push', {
          method: 'POST',
          body: JSON.stringify({
            action: 'unsubscribe',
            endpoint: subscription.endpoint,
          }),
        });
      }

      setIsPushEnabled(false);
      return true;
    } catch (error) {
      console.error('Erreur lors du désabonnement:', error);
      return false;
    }
  }, [isPushSupported]);

  // Charger les notifications au montage
  useEffect(() => {
    fetchNotifications();

    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        isPushSupported,
        isPushEnabled,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        requestPushPermission,
        subscribeToPush,
        unsubscribeFromPush,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext doit être utilisé dans un NotificationProvider');
  }
  return context;
}

export default NotificationContext;
