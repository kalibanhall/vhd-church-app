/**
 * =============================================================================
 * SERVICE NOTIFICATIONS PUSH ET PWA - MyChurchApp
 * =============================================================================
 * 
 * Fonctionnalités:
 * - Notifications push Web Push API
 * - Gestion des abonnements
 * - Templates de notifications
 * - Mode hors ligne amélioré
 * - Synchronisation en arrière-plan
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 * @version 2.0.0
 * =============================================================================
 */

// Types
export interface PushSubscription {
  id: string;
  memberId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  device: {
    userAgent: string;
    platform: string;
    deviceName?: string;
  };
  preferences: NotificationPreferences;
  active: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
}

export interface NotificationPreferences {
  // Types de notifications
  announcements: boolean;
  events: boolean;
  prayers: boolean;
  messages: boolean;
  birthdays: boolean;
  donations: boolean;
  reminders: boolean;
  
  // Préférences horaires
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:MM
  quietHoursEnd: string;
  
  // Fréquence
  dailyDigest: boolean;
  immediateUrgent: boolean;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: {
    type: NotificationType;
    entityId?: string;
    url?: string;
    actions?: NotificationAction[];
  };
  timestamp: Date;
  ttl?: number; // Time to live en secondes
  urgency?: 'very-low' | 'low' | 'normal' | 'high';
  topic?: string;
}

export type NotificationType = 
  | 'announcement'
  | 'event_reminder'
  | 'event_update'
  | 'prayer_request'
  | 'prayer_answered'
  | 'message'
  | 'birthday'
  | 'donation_received'
  | 'donation_reminder'
  | 'sermon_new'
  | 'general';

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationLog {
  id: string;
  notificationId: string;
  subscriptionId: string;
  memberId: string;
  status: 'sent' | 'delivered' | 'clicked' | 'dismissed' | 'failed';
  error?: string;
  sentAt: Date;
  deliveredAt?: Date;
  clickedAt?: Date;
}

export interface OfflineData {
  id: string;
  memberId: string;
  type: 'attendance' | 'prayer' | 'testimony' | 'donation';
  data: Record<string, unknown>;
  createdOfflineAt: Date;
  syncedAt?: Date;
  syncStatus: 'pending' | 'synced' | 'failed';
  retryCount: number;
}

// ============================================================================
// SERVICE PUSH NOTIFICATIONS
// ============================================================================

export class PushNotificationService {
  
  /**
   * Templates de notifications
   */
  static getNotificationTemplates(): Record<NotificationType, { title: string; body: string; icon: string }> {
    return {
      announcement: {
        title: '📢 Nouvelle annonce',
        body: '{churchName}: {title}',
        icon: '/icons/announcement.png'
      },
      event_reminder: {
        title: '📅 Rappel d\'événement',
        body: '{eventName} commence dans {timeUntil}',
        icon: '/icons/event.png'
      },
      event_update: {
        title: '🔄 Événement modifié',
        body: '{eventName} a été mis à jour',
        icon: '/icons/event.png'
      },
      prayer_request: {
        title: '🙏 Nouvelle demande de prière',
        body: '{memberName} a besoin de vos prières',
        icon: '/icons/prayer.png'
      },
      prayer_answered: {
        title: '✨ Prière exaucée !',
        body: '{memberName} partage une bonne nouvelle',
        icon: '/icons/prayer.png'
      },
      message: {
        title: '💬 Nouveau message',
        body: '{senderName}: {preview}',
        icon: '/icons/message.png'
      },
      birthday: {
        title: '🎂 Anniversaire aujourd\'hui',
        body: 'C\'est l\'anniversaire de {memberName} !',
        icon: '/icons/birthday.png'
      },
      donation_received: {
        title: '💝 Don reçu',
        body: 'Merci pour votre don de {amount}',
        icon: '/icons/donation.png'
      },
      donation_reminder: {
        title: '💰 Rappel de don',
        body: 'Votre don récurrent est prévu pour demain',
        icon: '/icons/donation.png'
      },
      sermon_new: {
        title: '🎬 Nouvelle prédication',
        body: '"{title}" par {preacher} est disponible',
        icon: '/icons/sermon.png'
      },
      general: {
        title: '{title}',
        body: '{body}',
        icon: '/icons/app.png'
      }
    };
  }

  /**
   * Créer une notification depuis un template
   */
  static createFromTemplate(
    type: NotificationType,
    variables: Record<string, string>,
    customData?: Partial<PushNotification>
  ): Omit<PushNotification, 'id' | 'timestamp'> {
    const template = this.getNotificationTemplates()[type];
    
    // Remplacer les variables
    let title = template.title;
    let body = template.body;
    
    Object.entries(variables).forEach(([key, value]) => {
      title = title.replace(`{${key}}`, value);
      body = body.replace(`{${key}}`, value);
    });

    return {
      title,
      body,
      icon: template.icon,
      data: {
        type,
        ...customData?.data
      },
      urgency: customData?.urgency || 'normal',
      ...customData
    };
  }

  /**
   * Vérifier si on peut envoyer une notification (heures calmes)
   */
  static canSendNotification(
    preferences: NotificationPreferences,
    urgency: PushNotification['urgency'] = 'normal'
  ): boolean {
    // Les notifications urgentes passent toujours
    if (urgency === 'high' && preferences.immediateUrgent) {
      return true;
    }

    if (!preferences.quietHoursEnabled) {
      return true;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const start = preferences.quietHoursStart;
    const end = preferences.quietHoursEnd;

    // Gestion du cas où les heures calmes traversent minuit
    if (start <= end) {
      return currentTime < start || currentTime > end;
    } else {
      return currentTime < start && currentTime > end;
    }
  }

  /**
   * Préférences par défaut
   */
  static getDefaultPreferences(): NotificationPreferences {
    return {
      announcements: true,
      events: true,
      prayers: true,
      messages: true,
      birthdays: true,
      donations: true,
      reminders: true,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      dailyDigest: false,
      immediateUrgent: true
    };
  }

  /**
   * Construire le payload Web Push
   */
  static buildWebPushPayload(notification: PushNotification): object {
    return {
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/icons/icon-192x192.png',
      badge: notification.badge || '/icons/badge-96x96.png',
      image: notification.image,
      tag: notification.tag || notification.id,
      data: notification.data,
      timestamp: notification.timestamp.getTime(),
      actions: notification.data?.actions?.map(a => ({
        action: a.action,
        title: a.title,
        icon: a.icon
      })) || []
    };
  }

  /**
   * Actions prédéfinies par type
   */
  static getActionsForType(type: NotificationType): NotificationAction[] {
    const actionsMap: Record<NotificationType, NotificationAction[]> = {
      announcement: [
        { action: 'view', title: 'Voir' },
        { action: 'dismiss', title: 'Ignorer' }
      ],
      event_reminder: [
        { action: 'view', title: 'Détails' },
        { action: 'snooze', title: 'Rappeler plus tard' }
      ],
      event_update: [
        { action: 'view', title: 'Voir les modifications' }
      ],
      prayer_request: [
        { action: 'pray', title: '🙏 Je prie' },
        { action: 'view', title: 'Détails' }
      ],
      prayer_answered: [
        { action: 'celebrate', title: '🎉 Amen !' },
        { action: 'view', title: 'Lire' }
      ],
      message: [
        { action: 'reply', title: 'Répondre' },
        { action: 'view', title: 'Ouvrir' }
      ],
      birthday: [
        { action: 'wish', title: '🎂 Souhaiter' }
      ],
      donation_received: [
        { action: 'view', title: 'Voir le reçu' }
      ],
      donation_reminder: [
        { action: 'give', title: 'Donner maintenant' },
        { action: 'snooze', title: 'Plus tard' }
      ],
      sermon_new: [
        { action: 'watch', title: '▶️ Regarder' },
        { action: 'save', title: '💾 Sauvegarder' }
      ],
      general: [
        { action: 'view', title: 'Voir' }
      ]
    };

    return actionsMap[type] || [];
  }
}

// ============================================================================
// SERVICE MODE HORS LIGNE
// ============================================================================

export class OfflineService {
  
  /**
   * Ressources à mettre en cache pour le mode hors ligne
   */
  static getCacheableResources(): { url: string; strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate' }[] {
    return [
      // Pages statiques
      { url: '/', strategy: 'network-first' },
      { url: '/dashboard', strategy: 'network-first' },
      { url: '/members', strategy: 'network-first' },
      { url: '/events', strategy: 'network-first' },
      { url: '/prayers', strategy: 'network-first' },
      { url: '/sermons', strategy: 'stale-while-revalidate' },
      
      // Assets
      { url: '/manifest.json', strategy: 'cache-first' },
      { url: '/offline.html', strategy: 'cache-first' },
      
      // API (données essentielles)
      { url: '/api/members', strategy: 'network-first' },
      { url: '/api/events?upcoming=true', strategy: 'stale-while-revalidate' },
      { url: '/api/prayers?active=true', strategy: 'stale-while-revalidate' }
    ];
  }

  /**
   * Données à synchroniser en priorité quand la connexion revient
   */
  static getSyncPriority(): OfflineData['type'][] {
    return ['attendance', 'prayer', 'donation', 'testimony'];
  }

  /**
   * Valider des données hors ligne avant sync
   */
  static validateOfflineData(data: OfflineData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.memberId) {
      errors.push('memberId est requis');
    }

    if (!data.type) {
      errors.push('type est requis');
    }

    if (!data.data || Object.keys(data.data).length === 0) {
      errors.push('data ne peut pas être vide');
    }

    // Validations spécifiques par type
    switch (data.type) {
      case 'attendance':
        if (!data.data.eventId) errors.push('eventId requis pour attendance');
        break;
      case 'prayer':
        if (!data.data.content) errors.push('content requis pour prayer');
        break;
      case 'donation':
        if (!data.data.amount) errors.push('amount requis pour donation');
        break;
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Estimer la taille des données en cache
   */
  static estimateCacheSize(items: number, avgSizeKB: number = 5): string {
    const totalKB = items * avgSizeKB;
    if (totalKB < 1024) return `${totalKB} Ko`;
    return `${(totalKB / 1024).toFixed(1)} Mo`;
  }
}

// ============================================================================
// SERVICE BACKGROUND SYNC
// ============================================================================

export class BackgroundSyncService {
  
  /**
   * Tags de synchronisation
   */
  static SYNC_TAGS = {
    ATTENDANCE: 'sync-attendance',
    PRAYERS: 'sync-prayers',
    DONATIONS: 'sync-donations',
    TESTIMONIES: 'sync-testimonies',
    MESSAGES: 'sync-messages'
  };

  /**
   * Vérifier si Background Sync est supporté
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window;
  }

  /**
   * Enregistrer une synchronisation
   */
  static async registerSync(tag: string): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register(tag);
      return true;
    } catch (error) {
      console.error('Failed to register sync:', error);
      return false;
    }
  }

  /**
   * Obtenir les syncs en attente
   */
  static async getPendingSyncs(): Promise<string[]> {
    if (!this.isSupported()) return [];

    try {
      const registration = await navigator.serviceWorker.ready;
      const tags = await (registration as unknown as { sync: { getTags: () => Promise<string[]> } }).sync.getTags();
      return tags;
    } catch (error) {
      console.error('Failed to get pending syncs:', error);
      return [];
    }
  }
}

const pwaExports = {
  PushNotificationService,
  OfflineService,
  BackgroundSyncService
};

export default pwaExports;
