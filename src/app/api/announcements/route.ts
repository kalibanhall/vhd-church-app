/**
 * API Routes - Announcements Management
 * 
 * GET  /api/announcements - Liste des annonces
 * POST /api/announcements - Créer une annonce
 */

import { NextRequest, NextResponse } from 'next/server';
import { AnnouncementService } from '@/lib/services/messaging-service';

// Stockage temporaire
let announcements: any[] = [
  {
    id: 'ann_demo_1',
    title: 'Culte spécial de Noël',
    content: 'Rejoignez-nous pour une célébration exceptionnelle le 25 décembre à 10h. Programme spécial avec la chorale et moments de partage.',
    authorId: 'admin_1',
    authorName: 'Pasteur Jean',
    priority: 'high',
    targetAudience: 'all',
    isPinned: true,
    readBy: [],
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'ann_demo_2',
    title: 'Inscriptions camp de jeunes',
    content: 'Les inscriptions pour le camp d\'été sont ouvertes ! Places limitées. Contactez le responsable jeunesse.',
    authorId: 'admin_2',
    authorName: 'Marie - Responsable Jeunesse',
    priority: 'normal',
    targetAudience: 'all',
    isPinned: false,
    readBy: [],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

let announcementIdCounter = 3;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const priority = searchParams.get('priority');
    const audience = searchParams.get('audience');
    const pinned = searchParams.get('pinned');
    const limit = parseInt(searchParams.get('limit') || '20');

    let filteredAnnouncements = [...announcements];

    // Filtrer par priorité
    if (priority) {
      filteredAnnouncements = filteredAnnouncements.filter(a => a.priority === priority);
    }

    // Filtrer par audience
    if (audience) {
      filteredAnnouncements = filteredAnnouncements.filter(a => a.targetAudience === audience);
    }

    // Filtrer par épinglé
    if (pinned !== null) {
      filteredAnnouncements = filteredAnnouncements.filter(a => a.isPinned === (pinned === 'true'));
    }

    // Filtrer les expirées
    filteredAnnouncements = filteredAnnouncements.filter(a => {
      if (!a.expiresAt) return true;
      return new Date(a.expiresAt) > new Date();
    });

    // Trier: épinglées d'abord, puis par date
    filteredAnnouncements.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      success: true,
      data: filteredAnnouncements.slice(0, limit),
      total: filteredAnnouncements.length,
      priorities: ['low', 'normal', 'high', 'urgent']
    });
  } catch (error) {
    console.error('[Announcements GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des annonces' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, authorId, authorName, priority, targetAudience, ministryIds, expiresAt, isPinned } = body;

    if (!title || !content || !authorId || !authorName) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes: title, content, authorId et authorName sont requis' },
        { status: 400 }
      );
    }

    const newAnnouncement = AnnouncementService.createAnnouncement(
      title,
      content,
      authorId,
      authorName,
      {
        priority,
        targetAudience,
        ministryIds,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        isPinned
      }
    );

    announcements.push({
      ...newAnnouncement,
      id: `ann_${announcementIdCounter++}`,
      createdAt: newAnnouncement.createdAt.toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Annonce créée avec succès',
      data: newAnnouncement
    }, { status: 201 });
  } catch (error) {
    console.error('[Announcements POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'annonce' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { announcementId, action, userId } = body;

    const index = announcements.findIndex(a => a.id === announcementId);
    
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    if (action === 'read') {
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'userId est requis' },
          { status: 400 }
        );
      }

      if (!announcements[index].readBy.includes(userId)) {
        announcements[index].readBy.push(userId);
      }

      return NextResponse.json({
        success: true,
        message: 'Annonce marquée comme lue'
      });
    }

    if (action === 'pin') {
      announcements[index].isPinned = !announcements[index].isPinned;
      
      return NextResponse.json({
        success: true,
        message: announcements[index].isPinned ? 'Annonce épinglée' : 'Annonce désépinglée',
        data: announcements[index]
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Announcements PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'annonce' },
      { status: 500 }
    );
  }
}
