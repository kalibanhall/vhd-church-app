/**
 * API Routes - Webhooks Management
 * 
 * GET    /api/integrations/webhooks - Liste des webhooks
 * POST   /api/integrations/webhooks - Créer un webhook
 * PATCH  /api/integrations/webhooks - Mettre à jour un webhook
 * DELETE /api/integrations/webhooks - Supprimer un webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { WebhookService, Webhook, WebhookEvent } from '@/lib/services/integration-service';

// Stockage temporaire
let webhooks: Webhook[] = [];
let webhookIdCounter = 1;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const webhookId = searchParams.get('id');

    // Obtenir les événements disponibles
    if (action === 'events') {
      return NextResponse.json({
        success: true,
        data: WebhookService.getAvailableEvents()
      });
    }

    // Obtenir un webhook spécifique
    if (webhookId) {
      const webhook = webhooks.find(w => w.id === webhookId);
      if (!webhook) {
        return NextResponse.json(
          { success: false, error: 'Webhook non trouvé' },
          { status: 404 }
        );
      }
      // Ne pas exposer le secret complet
      return NextResponse.json({
        success: true,
        data: {
          ...webhook,
          secret: webhook.secret.substring(0, 12) + '...'
        }
      });
    }

    // Liste tous les webhooks
    const safeWebhooks = webhooks.map(w => ({
      ...w,
      secret: w.secret.substring(0, 12) + '...'
    }));

    return NextResponse.json({
      success: true,
      data: safeWebhooks,
      total: webhooks.length,
      stats: {
        active: webhooks.filter(w => w.active).length,
        inactive: webhooks.filter(w => !w.active).length,
        totalDeliveries: webhooks.reduce((acc, w) => acc + w.successCount + w.failureCount, 0)
      }
    });
  } catch (error) {
    console.error('[Webhooks GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des webhooks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Tester un webhook
    if (action === 'test') {
      const { webhookId } = body;
      const webhook = webhooks.find(w => w.id === webhookId);
      
      if (!webhook) {
        return NextResponse.json(
          { success: false, error: 'Webhook non trouvé' },
          { status: 404 }
        );
      }

      const result = await WebhookService.testWebhook(webhook.url, webhook.secret);
      
      return NextResponse.json({
        success: result.success,
        testResult: result
      });
    }

    // Créer un nouveau webhook
    const { name, url, events, headers, retryPolicy } = body;

    if (!name || !url || !events || events.length === 0) {
      return NextResponse.json(
        { success: false, error: 'name, url et events sont requis' },
        { status: 400 }
      );
    }

    // Valider l'URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, error: 'URL invalide' },
        { status: 400 }
      );
    }

    // Valider les événements
    const availableEvents = WebhookService.getAvailableEvents().map(e => e.event);
    const invalidEvents = events.filter((e: string) => !availableEvents.includes(e as WebhookEvent));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { success: false, error: `Événements invalides: ${invalidEvents.join(', ')}` },
        { status: 400 }
      );
    }

    const secret = WebhookService.generateSecret();
    const newWebhook: Webhook = {
      id: `whk_${webhookIdCounter++}`,
      name,
      url,
      events,
      secret,
      active: true,
      headers: headers || {},
      retryPolicy: retryPolicy || { maxRetries: 3, retryDelay: 60 },
      successCount: 0,
      failureCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    webhooks.push(newWebhook);

    return NextResponse.json({
      success: true,
      message: 'Webhook créé avec succès',
      data: {
        ...newWebhook,
        // Exposer le secret complet uniquement à la création
        secretOnce: secret
      }
    }, { status: 201 });
  } catch (error) {
    console.error('[Webhooks POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du webhook' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { webhookId, name, url, events, headers, retryPolicy, active, regenerateSecret } = body;

    if (!webhookId) {
      return NextResponse.json(
        { success: false, error: 'webhookId est requis' },
        { status: 400 }
      );
    }

    const index = webhooks.findIndex(w => w.id === webhookId);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Webhook non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour les champs
    if (name !== undefined) webhooks[index].name = name;
    if (url !== undefined) {
      try {
        new URL(url);
        webhooks[index].url = url;
      } catch {
        return NextResponse.json(
          { success: false, error: 'URL invalide' },
          { status: 400 }
        );
      }
    }
    if (events !== undefined) webhooks[index].events = events;
    if (headers !== undefined) webhooks[index].headers = headers;
    if (retryPolicy !== undefined) webhooks[index].retryPolicy = retryPolicy;
    if (active !== undefined) webhooks[index].active = active;

    let newSecret: string | undefined;
    if (regenerateSecret) {
      newSecret = WebhookService.generateSecret();
      webhooks[index].secret = newSecret;
    }

    webhooks[index].updatedAt = new Date();

    const response: Record<string, unknown> = {
      success: true,
      message: 'Webhook mis à jour',
      data: {
        ...webhooks[index],
        secret: webhooks[index].secret.substring(0, 12) + '...'
      }
    };

    if (newSecret) {
      response.newSecret = newSecret;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Webhooks PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du webhook' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const webhookId = searchParams.get('id');

    if (!webhookId) {
      return NextResponse.json(
        { success: false, error: 'id est requis' },
        { status: 400 }
      );
    }

    const index = webhooks.findIndex(w => w.id === webhookId);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Webhook non trouvé' },
        { status: 404 }
      );
    }

    const deleted = webhooks.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      message: 'Webhook supprimé',
      data: { id: deleted.id, name: deleted.name }
    });
  } catch (error) {
    console.error('[Webhooks DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
