/**
 * API Routes - Sermon Series
 * 
 * GET    /api/sermons/series - Liste des séries
 * POST   /api/sermons/series - Créer une série
 */

import { NextRequest, NextResponse } from 'next/server';
import { SeriesService, SermonSeries, Sermon } from '@/lib/services/sermons-service';

// Stockage temporaire
let series: SermonSeries[] = [];
let seriesIdCounter = 1;

// Données de démo
if (series.length === 0) {
  series = [
    {
      id: 'series_1',
      title: 'L\'amour de Dieu',
      description: 'Une série en 4 parties explorant les différentes facettes de l\'amour de Dieu.',
      coverImageUrl: 'https://example.com/covers/series1.jpg',
      preacher: { id: 'preacher_1', name: 'Pasteur Martin' },
      startDate: new Date('2025-01-12'),
      sermonCount: 4,
      totalDuration: 12000,
      tags: ['amour', 'grâce', 'série'],
      status: 'ongoing',
      createdAt: new Date('2025-01-10')
    }
  ];
  seriesIdCounter = 2;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');

    // Détail d'une série
    if (id) {
      const seriesItem = series.find(s => s.id === id);
      if (!seriesItem) {
        return NextResponse.json(
          { success: false, error: 'Série non trouvée' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: seriesItem
      });
    }

    // Liste des séries
    let filteredSeries = [...series];

    if (status && status !== 'all') {
      filteredSeries = filteredSeries.filter(s => s.status === status);
    }

    // Trier par date de création (plus récentes d'abord)
    filteredSeries.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: filteredSeries,
      total: filteredSeries.length
    });
  } catch (error) {
    console.error('[Series GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des séries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, coverImageUrl, preacher, tags } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'title est requis' },
        { status: 400 }
      );
    }

    const newSeries: SermonSeries = {
      id: `series_${seriesIdCounter++}`,
      title,
      description,
      coverImageUrl,
      preacher,
      sermonCount: 0,
      totalDuration: 0,
      tags: tags || [],
      status: 'ongoing',
      createdAt: new Date()
    };

    series.push(newSeries);

    return NextResponse.json({
      success: true,
      message: 'Série créée',
      data: newSeries
    }, { status: 201 });
  } catch (error) {
    console.error('[Series POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { seriesId, title, description, coverImageUrl, preacher, tags, status, endDate } = body;

    if (!seriesId) {
      return NextResponse.json(
        { success: false, error: 'seriesId est requis' },
        { status: 400 }
      );
    }

    const index = series.findIndex(s => s.id === seriesId);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Série non trouvée' },
        { status: 404 }
      );
    }

    if (title !== undefined) series[index].title = title;
    if (description !== undefined) series[index].description = description;
    if (coverImageUrl !== undefined) series[index].coverImageUrl = coverImageUrl;
    if (preacher !== undefined) series[index].preacher = preacher;
    if (tags !== undefined) series[index].tags = tags;
    if (status !== undefined) series[index].status = status;
    if (endDate !== undefined) series[index].endDate = new Date(endDate);

    return NextResponse.json({
      success: true,
      message: 'Série mise à jour',
      data: series[index]
    });
  } catch (error) {
    console.error('[Series PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seriesId = searchParams.get('id');

    if (!seriesId) {
      return NextResponse.json(
        { success: false, error: 'id est requis' },
        { status: 400 }
      );
    }

    const index = series.findIndex(s => s.id === seriesId);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Série non trouvée' },
        { status: 404 }
      );
    }

    const deleted = series.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      message: 'Série supprimée',
      data: { id: deleted.id, title: deleted.title }
    });
  } catch (error) {
    console.error('[Series DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
