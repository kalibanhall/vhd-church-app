/**
 * =============================================================================
 * PANNEAU DE NOTIFICATIONS - SYSTÈME DE NOTIFICATIONS EN TEMPS RÉEL
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Système complet de notifications avec support des notifications
 * push, gestion des permissions navigateur, et redirections intelligentes selon
 * le rôle de l'utilisateur.
 * 
 * Fonctionnalités:
 * - Notifications en temps réel avec hooks personnalisés
 * - Support des notifications push du navigateur
 * - Redirections contextuelles selon le type de notification et le rôle
 * - Interface utilisateur moderne avec gestion d'état avancée
 * - Pagination et filtrage des notifications
 * 
 * =============================================================================
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { authenticatedFetch } from '@/lib/auth-fetch';
import { 
  Bell, 
  X, 
  Check, 
  Calendar, 
  Heart, 
  MessageCircle, 
  User, 
  FileText,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Interface pour les objets notification
 */
interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface NotificationsPanelProps {
  className?: string;
}

export default function NotificationsPanel({ className = '' }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();
  
  // Hook pour les notifications push
  const {
    permission,
    requestPermission,
    showNotification,
    simulatePushNotification
  } = useNotifications();

  // Fermer le panel si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Charger les notifications au montage et quand le panel s'ouvre
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    } else {
      fetchUnreadCount();
    }
  }, [isOpen]);

  // Charger le compteur de messages non lus
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const response = await authenticatedFetch('/api/chat-proxy?type=unread-count');
        if (response.ok) {
          const data = await response.json();
          setUnreadMessages(data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Erreur chargement messages non lus:', error);
      }
    };
    
    fetchUnreadMessages();
    // Polling toutes les 30 secondes
    const interval = setInterval(fetchUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async (loadAll = false) => {
    setLoading(true);
    try {
      const url = loadAll ? '/api/notifications-proxy?all=true' : '/api/notifications-proxy';
      const response = await authenticatedFetch(url);

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await authenticatedFetch('/api/notifications-proxy?unread=true');

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Erreur chargement compteur:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await authenticatedFetch('/api/notifications-proxy', {
        method: 'PUT',
        body: JSON.stringify({ notificationId })
      });

      if (response.ok) {
        // Mettre à jour localement
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await authenticatedFetch('/api/notifications-proxy', {
        method: 'PUT',
        body: JSON.stringify({ markAllAsRead: true })
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Marquer comme lue si pas encore lue
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Fermer le panel
    setIsOpen(false);

    // Redirection basée sur le type de notification et le rôle utilisateur
    switch (notification.type) {
      case 'APPOINTMENT':
        // Redirection selon le rôle de l'utilisateur
        if (user?.role === 'PASTOR' || user?.role === 'ADMIN') {
          router.push('/?tab=pastor-appointments');
        } else {
          // Pour les membres fidèles
          router.push('/?tab=appointments');
        }
        break;
      case 'EVENT':
      case 'EVENT_REMINDER':
        router.push('/?tab=events');
        break;
      case 'DONATION':
        router.push('/?tab=donations');
        break;
      case 'PRAYER':
        router.push('/?tab=prayers');
        break;
      case 'TESTIMONY':
        router.push('/?tab=testimonies');
        break;
      default:
        // Utiliser l'URL d'action si elle existe
        if (notification.actionUrl) {
          router.push(notification.actionUrl);
        }
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_reminder':
      case 'event_reminder':
        return <Calendar size={20} className="text-[#cc9b00]" />;
      case 'donation_receipt':
        return <Heart size={20} className="text-green-500" />;
      case 'prayer_request':
        return <span className="text-purple-500 text-lg">🙏</span>;
      case 'testimony_approved':
        return <MessageCircle size={20} className="text-yellow-500" />;
      case 'new_sermon':
        return <FileText size={20} className="text-indigo-500" />;
      case 'system_alert':
        return <AlertCircle size={20} className="text-red-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}j`;
    return date.toLocaleDateString('fr-FR');
  };

  // Total des notifications (notifications + messages non lus)
  const totalUnread = unreadCount + unreadMessages;

  return (
    <div className={`relative ${className}`} ref={panelRef}>
      {/* Bouton de notifications */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-[#cc9b00] transition-colors rounded-lg hover:bg-gray-100"
      >
        <Bell className="h-5 w-5 md:h-6 md:w-6" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center font-medium">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {/* Panel déroulant - Centré sur mobile, à droite sur desktop */}
      {isOpen && (
        <div className="fixed sm:absolute right-0 sm:right-0 top-14 md:top-16 sm:top-full left-0 sm:left-auto mt-0 sm:mt-2 w-full sm:w-80 md:w-96 bg-white rounded-none sm:rounded-lg shadow-xl border-t sm:border border-gray-200 z-50 max-h-[calc(100vh-4rem)] sm:max-h-80 md:max-h-96 flex flex-col">
          {/* Header du panel */}
          <div className="flex items-center justify-between p-2.5 sm:p-4 border-b border-gray-200">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900">
              Notifications
              {totalUnread > 0 && (
                <span className="ml-1.5 sm:ml-2 text-xs bg-red-100 text-red-600 px-1.5 sm:px-2 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {/* Lien vers messages */}
              {unreadMessages > 0 && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/?tab=chat');
                  }}
                  className="text-xs text-[#cc9b00] hover:text-[#5c4d00] flex items-center gap-1 bg-[#fff3cc] px-2 py-1 rounded-full"
                >
                  <MessageCircle size={12} />
                  <span>{unreadMessages} msg</span>
                </button>
              )}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[#cc9b00] hover:text-[#5c4d00] flex items-center gap-1"
                  title="Marquer tout comme lu"
                >
                  <CheckCircle2 size={14} />
                  <span className="hidden sm:inline">Tout lire</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Liste des notifications */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffc200]"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 transition-colors cursor-pointer hover:bg-gray-50 ${
                      !notification.isRead ? 'bg-[#fff3cc]' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icône */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2 ml-2">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-[#ffc200] rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        {notification.actionUrl && (
                          <div className="flex items-center space-x-1 mt-2 text-xs text-[#cc9b00]">
                            <ExternalLink size={12} />
                            <span>Cliquer pour voir</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer si nécessaire */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  setShowAllNotifications(!showAllNotifications);
                  fetchNotifications(!showAllNotifications);
                }}
                className="text-sm text-[#cc9b00] hover:text-[#5c4d00]"
              >
                {showAllNotifications ? 'Voir moins' : 'Voir toutes les notifications'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}