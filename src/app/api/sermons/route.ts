/**
 * API Routes - Sermons (Prédications)
 * 
 * GET    /api/sermons - Liste des prédications
 * POST   /api/sermons - Créer une prédication
 * GET    /api/sermons?id=xxx - Détails d'une prédication
 * PATCH  /api/sermons - Mettre à jour une prédication
 * DELETE /api/sermons - Supprimer une prédication
 */

import { NextRequest, NextResponse } from 'next/server';
import { SermonService, Sermon } from '@/lib/services/sermons-service';

// Stockage temporaire
let sermons: Sermon[] = [];
let sermonIdCounter = 1;

// Initialiser avec quelques prédications de démo
if (sermons.length === 0) {
  sermons = [
    {
      id: 'sermon_1',
      title: 'La puissance de la foi',
      description: 'Une exploration profonde de ce que signifie avoir la foi en Dieu dans les moments difficiles.',
      preacher: { id: 'preacher_1', name: 'Pasteur Martin' },
      date: new Date('2025-01-05'),
      duration: 2700, // 45 min
      tags: ['foi', 'confiance', 'épreuves'],
      scripture: [{ book: 'Hébreux', chapter: 11, verses: '1-6' }],
      media: {
        videoUrl: 'https://example.com/video/sermon1.mp4',
        audioUrl: 'https://example.com/audio/sermon1.mp3',
        thumbnailUrl: 'https://example.com/thumb/sermon1.jpg'
      },
      stats: { views: 156, downloads: 34, favorites: 28, averageWatchTime: 2100 },
      status: 'published',
      publishedAt: new Date('2025-01-05'),
      createdAt: new Date('2025-01-05'),
      updatedAt: new Date('2025-01-05')
    },
    {
      id: 'sermon_2',
      title: 'L\'amour inconditionnel de Dieu',
      description: 'Découvrez l\'amour infini que Dieu a pour chacun de nous.',
      preacher: { id: 'preacher_1', name: 'Pasteur Martin' },
      date: new Date('2025-01-12'),
      duration: 3000, // 50 min
      seriesId: 'series_1',
      seriesOrder: 1,
      tags: ['amour', 'grâce', 'salut'],
      scripture: [{ book: 'Jean', chapter: 3, verses: '16-17' }, { book: 'Romains', chapter: 8, verses: '38-39' }],
      media: {
        videoUrl: 'https://example.com/video/sermon2.mp4',
        audioUrl: 'https://example.com/audio/sermon2.mp3',
        thumbnailUrl: 'https://example.com/thumb/sermon2.jpg'
      },
      stats: { views: 203, downloads: 45, favorites: 52, averageWatchTime: 2400 },
      status: 'published',
      publishedAt: new Date('2025-01-12'),
      createdAt: new Date('2025-01-12'),
      updatedAt: new Date('2025-01-12')
    }
  ];
  sermonIdCounter = 3;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    // Statistiques de la bibliothèque
    if (action === 'stats') {
      const stats = SermonService.getLibraryStats(sermons);
      return NextResponse.json({
        success: true,
        data: {
          ...stats,
          formattedDuration: SermonService.formatDuration(stats.totalDuration)
        }
      });
    }

    // Recommandations
    if (action === 'recommendations') {
      const memberId = searchParams.get('memberId');
      // Simulation (dans un vrai cas, on irait chercher l'historique en base)
      const recommendations = SermonService.getRecommendations(sermons, [], [], 5);
      return NextResponse.json({
        success: true,
        data: recommendations
      });
    }

    // Détail d'une prédication
    if (id) {
      const sermon = sermons.find(s => s.id === id);
      if (!sermon) {
        return NextResponse.json(
          { success: false, error: 'Prédication non trouvée' },
          { status: 404 }
        );
      }

      // Incrémenter les vues
      sermon.stats.views++;

      return NextResponse.json({
        success: true,
        data: {
          ...sermon,
          formattedDuration: SermonService.formatDuration(sermon.duration),
          chapters: SermonService.generateChapters(sermon.duration)
        }
      });
    }

    // Recherche et liste
    const query = searchParams.get('q') || '';
    const preacherId = searchParams.get('preacherId') || undefined;
    const seriesId = searchParams.get('seriesId') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredSermons = SermonService.searchSermons(sermons, query, {
      preacherId,
      seriesId,
      tags: tag ? [tag] : undefined
    });

    // Filtrer par statut (par défaut: published)
    const status = searchParams.get('status') || 'published';
    if (status !== 'all') {
      filteredSermons = filteredSermons.filter(s => s.status === status);
    }

    // Tri
    const sort = searchParams.get('sort') || 'date';
    switch (sort) {
      case 'views':
        filteredSermons.sort((a, b) => b.stats.views - a.stats.views);
        break;
      case 'favorites':
        filteredSermons.sort((a, b) => b.stats.favorites - a.stats.favorites);
        break;
      case 'title':
        filteredSermons.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default: // date
        filteredSermons.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // Pagination
    const total = filteredSermons.length;
    const start = (page - 1) * limit;
    const paginatedSermons = filteredSermons.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      data: paginatedSermons.map(s => ({
        ...s,
        formattedDuration: SermonService.formatDuration(s.duration)
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[Sermons GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des prédications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, preacher, date, duration, seriesId, seriesOrder, scripture, tags, media } = body;

    if (!title || !preacher || !date) {
      return NextResponse.json(
        { success: false, error: 'title, preacher et date sont requis' },
        { status: 400 }
      );
    }

    const newSermon: Sermon = {
      id: `sermon_${sermonIdCounter++}`,
      title,
      description,
      preacher,
      date: new Date(date),
      duration: duration || 0,
      seriesId,
      seriesOrder,
      scripture: scripture || [],
      tags: tags || [],
      media: media || {},
      stats: { views: 0, downloads: 0, favorites: 0, averageWatchTime: 0 },
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    sermons.push(newSermon);

    return NextResponse.json({
      success: true,
      message: 'Prédication créée',
      data: newSermon
    }, { status: 201 });
  } catch (error) {
    console.error('[Sermons POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { sermonId, title, description, preacher, date, duration, seriesId, seriesOrder, scripture, tags, media, status } = body;

    if (!sermonId) {
      return NextResponse.json(
        { success: false, error: 'sermonId est requis' },
        { status: 400 }
      );
    }

    const index = sermons.findIndex(s => s.id === sermonId);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Prédication non trouvée' },
        { status: 404 }
      );
    }

    if (title !== undefined) sermons[index].title = title;
    if (description !== undefined) sermons[index].description = description;
    if (preacher !== undefined) sermons[index].preacher = preacher;
    if (date !== undefined) sermons[index].date = new Date(date);
    if (duration !== undefined) sermons[index].duration = duration;
    if (seriesId !== undefined) sermons[index].seriesId = seriesId;
    if (seriesOrder !== undefined) sermons[index].seriesOrder = seriesOrder;
    if (scripture !== undefined) sermons[index].scripture = scripture;
    if (tags !== undefined) sermons[index].tags = tags;
    if (media !== undefined) sermons[index].media = { ...sermons[index].media, ...media };
    
    if (status !== undefined) {
      sermons[index].status = status;
      if (status === 'published' && !sermons[index].publishedAt) {
        sermons[index].publishedAt = new Date();
      }
    }

    sermons[index].updatedAt = new Date();

    return NextResponse.json({
      success: true,
      message: 'Prédication mise à jour',
      data: sermons[index]
    });
  } catch (error) {
    console.error('[Sermons PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sermonId = searchParams.get('id');

    if (!sermonId) {
      return NextResponse.json(
        { success: false, error: 'id est requis' },
        { status: 400 }
      );
    }

    const index = sermons.findIndex(s => s.id === sermonId);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Prédication non trouvée' },
        { status: 404 }
      );
    }

    const deleted = sermons.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      message: 'Prédication supprimée',
      data: { id: deleted.id, title: deleted.title }
    });
  } catch (error) {
    console.error('[Sermons DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
