/**
 * API Routes - Offline Sync
 * 
 * GET  /api/offline/sync - Récupérer les données en attente
 * POST /api/offline/sync - Envoyer les données hors ligne à synchroniser
 */

import { NextRequest, NextResponse } from 'next/server';
import { OfflineService, BackgroundSyncService, OfflineData } from '@/lib/services/pwa-service';

// Stockage temporaire
let offlineQueue: OfflineData[] = [];
let dataIdCounter = 1;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const action = searchParams.get('action');

    // Ressources à mettre en cache
    if (action === 'cacheResources') {
      return NextResponse.json({
        success: true,
        data: OfflineService.getCacheableResources()
      });
    }

    // Priorité de synchronisation
    if (action === 'syncPriority') {
      return NextResponse.json({
        success: true,
        data: OfflineService.getSyncPriority()
      });
    }

    // Tags de sync disponibles
    if (action === 'syncTags') {
      return NextResponse.json({
        success: true,
        data: BackgroundSyncService.SYNC_TAGS
      });
    }

    // Statistiques du cache
    if (action === 'cacheStats') {
      const pendingCount = offlineQueue.filter(d => d.syncStatus === 'pending').length;
      
      return NextResponse.json({
        success: true,
        data: {
          pendingItems: pendingCount,
          estimatedSize: OfflineService.estimateCacheSize(pendingCount),
          lastSync: offlineQueue
            .filter(d => d.syncedAt)
            .sort((a, b) => new Date(b.syncedAt!).getTime() - new Date(a.syncedAt!).getTime())[0]?.syncedAt
        }
      });
    }

    // Données en attente pour un membre
    if (memberId) {
      const pending = offlineQueue
        .filter(d => d.memberId === memberId && d.syncStatus === 'pending')
        .sort((a, b) => new Date(a.createdOfflineAt).getTime() - new Date(b.createdOfflineAt).getTime());

      return NextResponse.json({
        success: true,
        data: pending,
        total: pending.length
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalPending: offlineQueue.filter(d => d.syncStatus === 'pending').length,
        totalSynced: offlineQueue.filter(d => d.syncStatus === 'synced').length,
        totalFailed: offlineQueue.filter(d => d.syncStatus === 'failed').length
      }
    });
  } catch (error) {
    console.error('[Offline Sync GET] Error:', error);
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

    // Ajouter des données à synchroniser
    if (action === 'queue') {
      const { memberId, type, data, createdOfflineAt } = body;

      if (!memberId || !type || !data) {
        return NextResponse.json(
          { success: false, error: 'memberId, type et data sont requis' },
          { status: 400 }
        );
      }

      const offlineData: OfflineData = {
        id: `offline_${dataIdCounter++}`,
        memberId,
        type,
        data,
        createdOfflineAt: createdOfflineAt ? new Date(createdOfflineAt) : new Date(),
        syncStatus: 'pending',
        retryCount: 0
      };

      // Valider les données
      const validation = OfflineService.validateOfflineData(offlineData);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, errors: validation.errors },
          { status: 400 }
        );
      }

      offlineQueue.push(offlineData);

      return NextResponse.json({
        success: true,
        message: 'Données ajoutées à la file de synchronisation',
        data: { offlineId: offlineData.id }
      });
    }

    // Synchroniser les données en attente
    if (action === 'sync') {
      const { memberId, offlineIds } = body;

      let toSync = offlineQueue.filter(d => d.syncStatus === 'pending');
      
      if (memberId) {
        toSync = toSync.filter(d => d.memberId === memberId);
      }
      
      if (offlineIds && offlineIds.length > 0) {
        toSync = toSync.filter(d => offlineIds.includes(d.id));
      }

      const results: { id: string; success: boolean; error?: string }[] = [];

      for (const data of toSync) {
        // Simuler la synchronisation avec le backend
        // Dans un vrai scénario, on enverrait les données aux API correspondantes
        const success = Math.random() > 0.1; // 90% de succès

        if (success) {
          data.syncStatus = 'synced';
          data.syncedAt = new Date();
          results.push({ id: data.id, success: true });
        } else {
          data.retryCount++;
          if (data.retryCount >= 3) {
            data.syncStatus = 'failed';
          }
          results.push({ id: data.id, success: false, error: 'Erreur de synchronisation simulée' });
        }
      }

      const successCount = results.filter(r => r.success).length;

      return NextResponse.json({
        success: true,
        message: `${successCount}/${toSync.length} éléments synchronisés`,
        data: {
          synced: successCount,
          failed: toSync.length - successCount,
          results
        }
      });
    }

    // Synchroniser un type spécifique
    if (action === 'syncType') {
      const { memberId, type } = body;

      if (!type) {
        return NextResponse.json(
          { success: false, error: 'type est requis' },
          { status: 400 }
        );
      }

      let toSync = offlineQueue.filter(d => d.syncStatus === 'pending' && d.type === type);
      
      if (memberId) {
        toSync = toSync.filter(d => d.memberId === memberId);
      }

      // Simuler la synchronisation
      toSync.forEach(data => {
        data.syncStatus = 'synced';
        data.syncedAt = new Date();
      });

      return NextResponse.json({
        success: true,
        message: `${toSync.length} ${type}(s) synchronisé(s)`,
        data: { synced: toSync.length }
      });
    }

    // Réessayer les échecs
    if (action === 'retry') {
      const { memberId } = body;

      let failed = offlineQueue.filter(d => d.syncStatus === 'failed');
      
      if (memberId) {
        failed = failed.filter(d => d.memberId === memberId);
      }

      // Remettre en file d'attente
      failed.forEach(data => {
        data.syncStatus = 'pending';
        data.retryCount = 0;
      });

      return NextResponse.json({
        success: true,
        message: `${failed.length} élément(s) remis en file d'attente`,
        data: { requeued: failed.length }
      });
    }

    // Nettoyer les données synchronisées
    if (action === 'cleanup') {
      const { olderThanDays = 7 } = body;
      const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

      const before = offlineQueue.length;
      offlineQueue = offlineQueue.filter(d => 
        d.syncStatus !== 'synced' || 
        (d.syncedAt && new Date(d.syncedAt) > cutoff)
      );
      const removed = before - offlineQueue.length;

      return NextResponse.json({
        success: true,
        message: `${removed} entrée(s) nettoyée(s)`,
        data: { removed }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Offline Sync POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la synchronisation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offlineId = searchParams.get('offlineId');
    const memberId = searchParams.get('memberId');
    const clearAll = searchParams.get('clearAll') === 'true';

    // Supprimer un élément spécifique
    if (offlineId) {
      const index = offlineQueue.findIndex(d => d.id === offlineId);
      if (index === -1) {
        return NextResponse.json(
          { success: false, error: 'Élément non trouvé' },
          { status: 404 }
        );
      }

      offlineQueue.splice(index, 1);

      return NextResponse.json({
        success: true,
        message: 'Élément supprimé'
      });
    }

    // Vider la file d'un membre
    if (memberId) {
      const before = offlineQueue.length;
      
      if (clearAll) {
        offlineQueue = offlineQueue.filter(d => d.memberId !== memberId);
      } else {
        // Ne supprimer que les éléments en échec
        offlineQueue = offlineQueue.filter(d => 
          d.memberId !== memberId || d.syncStatus !== 'failed'
        );
      }

      return NextResponse.json({
        success: true,
        message: `${before - offlineQueue.length} élément(s) supprimé(s)`
      });
    }

    return NextResponse.json(
      { success: false, error: 'offlineId ou memberId requis' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Offline Sync DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
