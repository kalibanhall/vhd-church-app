/**
 * API Routes - Push Notifications
 * 
 * GET    /api/notifications/push - Abonnements et préférences
 * POST   /api/notifications/push - S'abonner / envoyer notification
 * PATCH  /api/notifications/push - Mettre à jour préférences
 * DELETE /api/notifications/push - Se désabonner
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  PushNotificationService, 
  PushSubscription, 
  PushNotification,
  NotificationLog,
  NotificationType 
} from '@/lib/services/pwa-service';

// Stockage temporaire
let subscriptions: PushSubscription[] = [];
let notifications: PushNotification[] = [];
let logs: NotificationLog[] = [];
let subIdCounter = 1;
let notifIdCounter = 1;
let logIdCounter = 1;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const action = searchParams.get('action');

    // Templates de notifications
    if (action === 'templates') {
      return NextResponse.json({
        success: true,
        data: PushNotificationService.getNotificationTemplates()
      });
    }

    // Préférences par défaut
    if (action === 'defaultPreferences') {
      return NextResponse.json({
        success: true,
        data: PushNotificationService.getDefaultPreferences()
      });
    }

    // Historique des notifications d'un membre
    if (action === 'history' && memberId) {
      const memberLogs = logs
        .filter(l => l.memberId === memberId)
        .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
        .slice(0, 50);

      // Enrichir avec les détails des notifications
      const enrichedLogs = memberLogs.map(log => {
        const notif = notifications.find(n => n.id === log.notificationId);
        return {
          ...log,
          notification: notif ? {
            title: notif.title,
            body: notif.body,
            type: notif.data?.type
          } : null
        };
      });

      return NextResponse.json({
        success: true,
        data: enrichedLogs
      });
    }

    // Statistiques
    if (action === 'stats') {
      const totalSent = logs.length;
      const delivered = logs.filter(l => l.status === 'delivered').length;
      const clicked = logs.filter(l => l.status === 'clicked').length;
      const failed = logs.filter(l => l.status === 'failed').length;

      return NextResponse.json({
        success: true,
        data: {
          totalSent,
          delivered,
          clicked,
          failed,
          deliveryRate: totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 0,
          clickRate: delivered > 0 ? Math.round((clicked / delivered) * 100) : 0,
          activeSubscriptions: subscriptions.filter(s => s.active).length
        }
      });
    }

    // Abonnements d'un membre
    if (memberId) {
      const memberSubs = subscriptions.filter(s => s.memberId === memberId && s.active);
      
      return NextResponse.json({
        success: true,
        data: memberSubs.map(s => ({
          id: s.id,
          device: s.device,
          preferences: s.preferences,
          createdAt: s.createdAt,
          lastUsedAt: s.lastUsedAt
        })),
        total: memberSubs.length
      });
    }

    return NextResponse.json(
      { success: false, error: 'memberId requis' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Push GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // S'abonner aux notifications push
    if (action === 'subscribe') {
      const { memberId, subscription, device } = body;

      if (!memberId || !subscription || !subscription.endpoint) {
        return NextResponse.json(
          { success: false, error: 'memberId et subscription sont requis' },
          { status: 400 }
        );
      }

      // Vérifier si déjà abonné avec le même endpoint
      const existing = subscriptions.find(s => 
        s.memberId === memberId && s.endpoint === subscription.endpoint
      );

      if (existing) {
        // Réactiver si désactivé
        existing.active = true;
        existing.lastUsedAt = new Date();
        
        return NextResponse.json({
          success: true,
          message: 'Abonnement réactivé',
          data: { subscriptionId: existing.id }
        });
      }

      const newSub: PushSubscription = {
        id: `sub_${subIdCounter++}`,
        memberId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        device: device || {
          userAgent: 'Unknown',
          platform: 'Unknown'
        },
        preferences: PushNotificationService.getDefaultPreferences(),
        active: true,
        createdAt: new Date()
      };

      subscriptions.push(newSub);

      return NextResponse.json({
        success: true,
        message: 'Abonnement créé',
        data: { subscriptionId: newSub.id }
      }, { status: 201 });
    }

    // Envoyer une notification
    if (action === 'send') {
      const { type, variables, targetMemberIds, customData, urgency } = body;

      if (!type) {
        return NextResponse.json(
          { success: false, error: 'type est requis' },
          { status: 400 }
        );
      }

      // Créer la notification
      const notifData = PushNotificationService.createFromTemplate(
        type as NotificationType,
        variables || {},
        { urgency, ...customData }
      );

      const notification: PushNotification = {
        id: `notif_${notifIdCounter++}`,
        ...notifData,
        timestamp: new Date(),
        data: {
          type: type as NotificationType,
          ...notifData.data,
          actions: PushNotificationService.getActionsForType(type as NotificationType)
        }
      };

      notifications.push(notification);

      // Trouver les abonnés cibles
      let targetSubs = subscriptions.filter(s => s.active);
      
      if (targetMemberIds && targetMemberIds.length > 0) {
        targetSubs = targetSubs.filter(s => targetMemberIds.includes(s.memberId));
      }

      // Filtrer par préférences et heures calmes
      const typePreferenceMap: Record<string, keyof PushSubscription['preferences']> = {
        announcement: 'announcements',
        event_reminder: 'events',
        event_update: 'events',
        prayer_request: 'prayers',
        prayer_answered: 'prayers',
        message: 'messages',
        birthday: 'birthdays',
        donation_received: 'donations',
        donation_reminder: 'donations',
        sermon_new: 'announcements'
      };

      const prefKey = typePreferenceMap[type] || 'announcements';
      
      targetSubs = targetSubs.filter(s => {
        // Vérifier préférence de type
        if (!s.preferences[prefKey]) return false;
        // Vérifier heures calmes
        return PushNotificationService.canSendNotification(s.preferences, urgency);
      });

      // Simuler l'envoi et logger
      const sendResults: { subscriptionId: string; success: boolean; error?: string }[] = [];

      for (const sub of targetSubs) {
        // Dans un vrai scénario, on utiliserait web-push ici
        const success = Math.random() > 0.1; // 90% de succès simulé
        
        const log: NotificationLog = {
          id: `log_${logIdCounter++}`,
          notificationId: notification.id,
          subscriptionId: sub.id,
          memberId: sub.memberId,
          status: success ? 'sent' : 'failed',
          error: success ? undefined : 'Simulated failure',
          sentAt: new Date()
        };

        logs.push(log);
        sendResults.push({
          subscriptionId: sub.id,
          success,
          error: log.error
        });

        // Mettre à jour lastUsedAt
        sub.lastUsedAt = new Date();
      }

      const successCount = sendResults.filter(r => r.success).length;

      return NextResponse.json({
        success: true,
        message: `Notification envoyée à ${successCount}/${targetSubs.length} abonnés`,
        data: {
          notificationId: notification.id,
          targetCount: targetSubs.length,
          successCount,
          failureCount: targetSubs.length - successCount
        }
      });
    }

    // Enregistrer une action utilisateur (click, dismiss)
    if (action === 'logAction') {
      const { logId, userAction } = body;

      const logEntry = logs.find(l => l.id === logId);
      if (!logEntry) {
        return NextResponse.json(
          { success: false, error: 'Log non trouvé' },
          { status: 404 }
        );
      }

      if (userAction === 'click') {
        logEntry.status = 'clicked';
        logEntry.clickedAt = new Date();
      } else if (userAction === 'delivered') {
        logEntry.status = 'delivered';
        logEntry.deliveredAt = new Date();
      } else if (userAction === 'dismiss') {
        logEntry.status = 'dismissed';
      }

      return NextResponse.json({
        success: true,
        message: 'Action enregistrée'
      });
    }

    // Test d'envoi
    if (action === 'test') {
      const { subscriptionId } = body;
      
      const sub = subscriptions.find(s => s.id === subscriptionId);
      if (!sub) {
        return NextResponse.json(
          { success: false, error: 'Abonnement non trouvé' },
          { status: 404 }
        );
      }

      const testNotif = PushNotificationService.createFromTemplate('general', {
        title: 'Test de notification',
        body: 'Si vous voyez ceci, les notifications fonctionnent ! 🎉'
      });

      return NextResponse.json({
        success: true,
        message: 'Notification de test envoyée',
        data: {
          payload: PushNotificationService.buildWebPushPayload({
            id: 'test',
            ...testNotif,
            timestamp: new Date()
          })
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Push POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'opération' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, memberId, preferences } = body;

    // Mettre à jour les préférences d'un abonnement spécifique
    if (subscriptionId) {
      const sub = subscriptions.find(s => s.id === subscriptionId);
      if (!sub) {
        return NextResponse.json(
          { success: false, error: 'Abonnement non trouvé' },
          { status: 404 }
        );
      }

      sub.preferences = { ...sub.preferences, ...preferences };

      return NextResponse.json({
        success: true,
        message: 'Préférences mises à jour',
        data: sub.preferences
      });
    }

    // Mettre à jour les préférences de tous les abonnements d'un membre
    if (memberId && preferences) {
      const memberSubs = subscriptions.filter(s => s.memberId === memberId);
      
      memberSubs.forEach(sub => {
        sub.preferences = { ...sub.preferences, ...preferences };
      });

      return NextResponse.json({
        success: true,
        message: `Préférences mises à jour pour ${memberSubs.length} appareil(s)`,
        data: preferences
      });
    }

    return NextResponse.json(
      { success: false, error: 'subscriptionId ou memberId requis' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Push PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');
    const memberId = searchParams.get('memberId');
    const allDevices = searchParams.get('allDevices') === 'true';

    // Désabonner un appareil spécifique
    if (subscriptionId) {
      const sub = subscriptions.find(s => s.id === subscriptionId);
      if (!sub) {
        return NextResponse.json(
          { success: false, error: 'Abonnement non trouvé' },
          { status: 404 }
        );
      }

      sub.active = false;

      return NextResponse.json({
        success: true,
        message: 'Désabonné avec succès'
      });
    }

    // Désabonner tous les appareils d'un membre
    if (memberId && allDevices) {
      const memberSubs = subscriptions.filter(s => s.memberId === memberId && s.active);
      
      memberSubs.forEach(sub => {
        sub.active = false;
      });

      return NextResponse.json({
        success: true,
        message: `${memberSubs.length} appareil(s) désabonné(s)`
      });
    }

    return NextResponse.json(
      { success: false, error: 'subscriptionId ou (memberId + allDevices) requis' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Push DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du désabonnement' },
      { status: 500 }
    );
  }
}
