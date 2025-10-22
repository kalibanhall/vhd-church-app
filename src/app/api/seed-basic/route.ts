import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    
    if (action !== 'seed-basic-data') {
      return NextResponse.json({ error: 'Action non autorisée' }, { status: 400 });
    }

    // Créer quelques événements de test
    await sql`
      INSERT INTO events (title, description, event_type, start_date, end_date, location, is_public, created_by)
      VALUES (
        'Culte du Dimanche',
        'Culte dominical hebdomadaire',
        'WORSHIP_SERVICE',
        ${new Date('2025-10-27T10:00:00')},
        ${new Date('2025-10-27T12:00:00')},
        'Sanctuaire Principal',
        true,
        'admin-chris-kasongo-1760972831746'
      )
    `;

    // Créer quelques prédications de test
    await sql`
      INSERT INTO preachings (title, description, scripture_reference, preacher, preached_at, is_public, created_by)
      VALUES (
        'La Foi en Action',
        'Une prédication sur la foi pratique',
        'Jacques 2:14-26',
        'Pasteur Chris Kasongo',
        ${new Date('2025-10-20')},
        true,
        'admin-chris-kasongo-1760972831746'
      )
    `;

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