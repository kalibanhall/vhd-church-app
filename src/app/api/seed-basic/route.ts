import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    
    if (action !== 'seed-basic-data') {
      return NextResponse.json({ error: 'Action non autorisée' }, { status: 400 });
    }

    // Créer quelques événements de test
    await prisma.event.create({
      data: {
        title: 'Culte du Dimanche',
        description: 'Culte dominical hebdomadaire',
        eventType: 'WORSHIP_SERVICE',
        startDate: new Date('2025-10-27T10:00:00'),
        endDate: new Date('2025-10-27T12:00:00'),
        location: 'Sanctuaire Principal',
        isPublic: true,
        createdBy: 'admin-chris-kasongo-1760972831746'
      }
    });

    // Créer quelques prédications de test
    await prisma.preaching.create({
      data: {
        title: 'La Foi en Action',
        description: 'Une prédication sur la foi pratique',
        scriptureReference: 'Jacques 2:14-26',
        preacher: 'Pasteur Chris Kasongo',
        preachedAt: new Date('2025-10-20'),
        isPublic: true,
        createdBy: 'admin-chris-kasongo-1760972831746'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Données de base créées avec succès'
    });

  } catch (error: any) {
    console.error('❌ Erreur seed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création des données',
      details: error.message
    }, { status: 500 });
  }
}