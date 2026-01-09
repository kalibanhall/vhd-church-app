/**
 * API Routes - Sermon Favorites & Watch History
 * 
 * GET    /api/sermons/favorites - Favoris et historique
 * POST   /api/sermons/favorites - Ajouter aux favoris / enregistrer progression
 * DELETE /api/sermons/favorites - Retirer des favoris
 */

import { NextRequest, NextResponse } from 'next/server';
import { SermonFavorite, WatchHistory, SeriesService, StreamingService } from '@/lib/services/sermons-service';

// Stockage temporaire
let favorites: SermonFavorite[] = [];
let watchHistory: WatchHistory[] = [];
let favoriteIdCounter = 1;
let historyIdCounter = 1;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const action = searchParams.get('action');
    const sermonId = searchParams.get('sermonId');

    if (!memberId && action !== 'streaming') {
      return NextResponse.json(
        { success: false, error: 'memberId est requis' },
        { status: 400 }
      );
    }

    // Informations de streaming
    if (action === 'streaming') {
      return NextResponse.json({
        success: true,
        data: {
          qualities: StreamingService.getAvailableQualities(),
          estimatedSize: sermonId ? {
            '360p': StreamingService.estimateDownloadSize(3000, '360p') + ' Mo',
            '720p': StreamingService.estimateDownloadSize(3000, '720p') + ' Mo',
            '1080p': StreamingService.estimateDownloadSize(3000, '1080p') + ' Mo'
          } : null
        }
      });
    }

    // Historique de visionnage
    if (action === 'history') {
      const memberHistory = watchHistory
        .filter(h => h.memberId === memberId)
        .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())
        .slice(0, 50); // 50 derniers

      return NextResponse.json({
        success: true,
        data: memberHistory,
        total: memberHistory.length
      });
    }

    // Continue Watching (non terminés)
    if (action === 'continue') {
      const continueWatching = watchHistory
        .filter(h => h.memberId === memberId && !h.completed && h.progress > 5)
        .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())
        .slice(0, 10);

      return NextResponse.json({
        success: true,
        data: continueWatching
      });
    }

    // Progression d'une série
    if (action === 'seriesProgress' && sermonId) {
      // sermonId est en fait le seriesId ici
      // Simulation car on n'a pas accès aux sermons directement
      return NextResponse.json({
        success: true,
        data: {
          seriesId: sermonId,
          progress: 50, // Simulé
          message: 'Utilisez l\'API sermons pour les données complètes'
        }
      });
    }

    // Vérifier si un sermon est en favoris
    if (sermonId) {
      const isFavorite = favorites.some(f => f.memberId === memberId && f.sermonId === sermonId);
      const lastWatch = watchHistory
        .filter(h => h.memberId === memberId && h.sermonId === sermonId)
        .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())[0];

      return NextResponse.json({
        success: true,
        data: {
          isFavorite,
          watchProgress: lastWatch?.progress || 0,
          completed: lastWatch?.completed || false,
          lastWatched: lastWatch?.watchedAt
        }
      });
    }

    // Liste des favoris
    const memberFavorites = favorites
      .filter(f => f.memberId === memberId)
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

    return NextResponse.json({
      success: true,
      data: memberFavorites,
      total: memberFavorites.length
    });
  } catch (error) {
    console.error('[Favorites GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, memberId, sermonId } = body;

    if (!memberId || !sermonId) {
      return NextResponse.json(
        { success: false, error: 'memberId et sermonId sont requis' },
        { status: 400 }
      );
    }

    // Ajouter aux favoris
    if (action === 'favorite' || !action) {
      // Vérifier si déjà en favoris
      if (favorites.some(f => f.memberId === memberId && f.sermonId === sermonId)) {
        return NextResponse.json(
          { success: false, error: 'Déjà en favoris' },
          { status: 409 }
        );
      }

      const newFavorite: SermonFavorite = {
        id: `fav_${favoriteIdCounter++}`,
        sermonId,
        memberId,
        savedAt: new Date(),
        notes: body.notes
      };

      favorites.push(newFavorite);

      return NextResponse.json({
        success: true,
        message: 'Ajouté aux favoris',
        data: newFavorite
      });
    }

    // Enregistrer la progression
    if (action === 'progress') {
      const { progress, duration, completed, device } = body;

      // Trouver ou créer l'entrée d'historique
      let historyEntry = watchHistory.find(h => 
        h.memberId === memberId && h.sermonId === sermonId
      );

      if (historyEntry) {
        // Mettre à jour
        historyEntry.watchedAt = new Date();
        historyEntry.duration = Math.max(historyEntry.duration, duration || 0);
        historyEntry.progress = progress || historyEntry.progress;
        historyEntry.completed = completed || historyEntry.completed || (progress >= 95);
        if (device) historyEntry.device = device;
      } else {
        // Créer
        historyEntry = {
          id: `hist_${historyIdCounter++}`,
          sermonId,
          memberId,
          watchedAt: new Date(),
          duration: duration || 0,
          progress: progress || 0,
          completed: completed || (progress >= 95),
          device
        };
        watchHistory.push(historyEntry);
      }

      return NextResponse.json({
        success: true,
        message: 'Progression enregistrée',
        data: historyEntry
      });
    }

    // Générer URL de streaming
    if (action === 'getStreamUrl') {
      const { mediaUrl, quality } = body;
      
      if (!mediaUrl) {
        return NextResponse.json(
          { success: false, error: 'mediaUrl est requis' },
          { status: 400 }
        );
      }

      const streamUrl = StreamingService.generateStreamingUrl(mediaUrl, memberId);
      
      return NextResponse.json({
        success: true,
        data: {
          streamUrl,
          quality: quality || 'auto',
          expiresIn: 3600
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Favorites POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'opération' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const sermonId = searchParams.get('sermonId');
    const action = searchParams.get('action');

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'memberId est requis' },
        { status: 400 }
      );
    }

    // Supprimer l'historique
    if (action === 'clearHistory') {
      const before = watchHistory.length;
      watchHistory = watchHistory.filter(h => h.memberId !== memberId);
      
      return NextResponse.json({
        success: true,
        message: 'Historique effacé',
        deleted: before - watchHistory.length
      });
    }

    // Retirer des favoris
    if (!sermonId) {
      return NextResponse.json(
        { success: false, error: 'sermonId est requis' },
        { status: 400 }
      );
    }

    const index = favorites.findIndex(f => f.memberId === memberId && f.sermonId === sermonId);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Favori non trouvé' },
        { status: 404 }
      );
    }

    favorites.splice(index, 1);

    return NextResponse.json({
      success: true,
      message: 'Retiré des favoris'
    });
  } catch (error) {
    console.error('[Favorites DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
