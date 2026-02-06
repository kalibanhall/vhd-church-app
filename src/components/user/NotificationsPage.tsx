/**
 * NotificationsPage - Centre de notifications
 * Gère toutes les notifications de l'utilisateur
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  BellOff,
  Check, 
  CheckCheck,
  Trash2,
  Settings,
  Filter,
  Calendar,
  Heart,
  MessageCircle,
  DollarSign,
  Users,
  BookOpen,
  AlertTriangle,
  Info,
  Gift,
  Star,
  Clock,
  ChevronRight,
  X
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'event' | 'prayer' | 'message' | 'donation' | 'announcement' | 'reminder' | 'system' | 'alert';
  title: string;
  message: string;
  isRead: boolean;
  isImportant: boolean;
  actionUrl?: string;
  actionLabel?: string;
  sender?: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
  expiresAt?: string;
}

interface NotificationGroup {
  date: string;
  label: string;
  notifications: Notification[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    events: true,
    prayers: true,
    messages: true,
    donations: true,
    announcements: true,
    reminders: true,
  });

  const filters = [
    { id: 'all', label: 'Toutes', count: notifications.length },
    { id: 'unread', label: 'Non lues', count: notifications.filter(n => !n.isRead).length },
    { id: 'important', label: 'Importantes', count: notifications.filter(n => n.isImportant).length },
  ];

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        console.warn('[Notifications] Backend indisponible');
        setNotifications([]);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event': return Calendar;
      case 'prayer': return Heart;
      case 'message': return MessageCircle;
      case 'donation': return DollarSign;
      case 'announcement': return Info;
      case 'reminder': return Clock;
      case 'system': return Settings;
      case 'alert': return AlertTriangle;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'bg-[#fff3cc] text-[#cc9b00]';
      case 'prayer': return 'bg-[#fff3cc] text-[#cc9b00]';
      case 'message': return 'bg-green-100 text-green-600';
      case 'donation': return 'bg-yellow-100 text-yellow-600';
      case 'announcement': return 'bg-[#fff3cc] text-[#cc9b00]';
      case 'reminder': return 'bg-orange-100 text-orange-600';
      case 'system': return 'bg-gray-100 text-gray-600';
      case 'alert': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const clearAll = async () => {
    if (!confirm('Supprimer toutes les notifications ?')) return;
    setNotifications([]);
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/notifications/clear`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const groupNotifications = (): NotificationGroup[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups: NotificationGroup[] = [
      { date: 'today', label: 'Aujourd\'hui', notifications: [] },
      { date: 'yesterday', label: 'Hier', notifications: [] },
      { date: 'week', label: 'Cette semaine', notifications: [] },
      { date: 'older', label: 'Plus ancien', notifications: [] },
    ];

    filteredNotifications.forEach(notification => {
      const date = new Date(notification.createdAt);
      date.setHours(0, 0, 0, 0);

      if (date.getTime() === today.getTime()) {
        groups[0].notifications.push(notification);
      } else if (date.getTime() === yesterday.getTime()) {
        groups[1].notifications.push(notification);
      } else if (date.getTime() > lastWeek.getTime()) {
        groups[2].notifications.push(notification);
      } else {
        groups[3].notifications.push(notification);
      }
    });

    return groups.filter(g => g.notifications.length > 0);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'important') return n.isImportant;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ffc200] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-sm rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-600">Gérez vos notifications</p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <Settings className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f.id
                  ? 'bg-[#ffc200] text-[#0a0a0a] shadow-church'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-[#cc9b00] hover:text-[#e6af00]"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-6">
          {groupNotifications().map(group => (
            <div key={group.date}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {group.label}
              </h2>
              <div className="space-y-2">
                {group.notifications.map(notification => {
                  const TypeIcon = getTypeIcon(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${
                        notification.isRead 
                          ? 'border-gray-100' 
                          : 'border-[#ffc200] bg-[#fff3cc]/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className={`font-semibold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                                  {notification.title}
                                </h3>
                                {notification.isImportant && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                )}
                                {!notification.isRead && (
                                  <span className="w-2 h-2 bg-[#ffc200] rounded-full"></span>
                                )}
                              </div>
                              <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                                {notification.message}
                              </p>
                              {notification.sender && (
                                <p className="text-xs text-gray-500 mt-1">
                                  De : {notification.sender.name}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-gray-400">
                                  {formatDate(notification.createdAt)}
                                </span>
                                {notification.actionUrl && (
                                  <a
                                    href={notification.actionUrl}
                                    className="text-xs text-[#cc9b00] hover:text-[#e6af00] flex items-center gap-1"
                                  >
                                    {notification.actionLabel || 'Voir'}
                                    <ChevronRight className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1.5 hover:bg-gray-100 rounded-full"
                                  title="Marquer comme lu"
                                >
                                  <Check className="h-4 w-4 text-gray-400" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1.5 hover:bg-red-50 rounded-full"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BellOff className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-2">Aucune notification</p>
          <p className="text-gray-400 text-sm">
            Vous êtes à jour !
          </p>
        </div>
      )}

      {notifications.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={clearAll}
            className="text-sm text-red-500 hover:text-red-600"
          >
            Effacer toutes les notifications
          </button>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Paramètres de notifications</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">Notifications push</p>
                  <p className="text-sm text-gray-500">Recevoir les notifications en temps réel</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, pushEnabled: !settings.pushEnabled })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.pushEnabled ? 'bg-[#ffc200]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.pushEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">Notifications par email</p>
                  <p className="text-sm text-gray-500">Recevoir un résumé par email</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, emailEnabled: !settings.emailEnabled })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.emailEnabled ? 'bg-[#ffc200]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.emailEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <div className="border-t pt-4">
                <p className="font-medium mb-3">Types de notifications</p>
                {[
                  { key: 'events', label: 'Événements', icon: Calendar },
                  { key: 'prayers', label: 'Prières', icon: Heart },
                  { key: 'messages', label: 'Messages', icon: MessageCircle },
                  { key: 'donations', label: 'Dons', icon: DollarSign },
                  { key: 'announcements', label: 'Annonces', icon: Info },
                  { key: 'reminders', label: 'Rappels', icon: Clock },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.key} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-gray-400" />
                        <span>{item.label}</span>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key as keyof typeof settings] })}
                        className={`w-10 h-5 rounded-full transition-colors ${
                          settings[item.key as keyof typeof settings] ? 'bg-[#ffc200]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                            settings[item.key as keyof typeof settings] ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
