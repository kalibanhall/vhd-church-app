// =============================================================================
// API RECONNAISSANCE FACIALE
// =============================================================================
// Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
// Version: 1.0.0
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import * as faceapi from '@vladmandic/face-api';

// Configuration PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Seuil de similarité pour la reconnaissance faciale (0.6 = 60% de similarité)
const SIMILARITY_THRESHOLD = 0.6;

/**
 * POST /api/facial-recognition/upload-descriptor
 * Upload un descripteur facial pour un membre
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, descriptor, photoUrl, qualityScore, isPrimary } = await request.json();

    if (!userId || !descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return NextResponse.json(
        { error: 'userId et descriptor (128 valeurs) requis' },
        { status: 400 }
      );
    }

    // Si isPrimary = true, désactiver les autres descripteurs primaires
    if (isPrimary) {
      await pool.query(
        'UPDATE face_descriptors SET is_primary = false WHERE user_id = $1',
        [userId]
      );
    }

    // Insérer le nouveau descripteur
    const result = await pool.query(
      `INSERT INTO face_descriptors (user_id, descriptor, photo_url, quality_score, is_primary)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, JSON.stringify(descriptor), photoUrl, qualityScore || null, isPrimary || false]
    );

    return NextResponse.json({
      success: true,
      descriptor: result.rows[0],
    });
  } catch (error: any) {
    console.error('Erreur upload descriptor:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du descripteur', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/facial-recognition/descriptors/:userId
 * Récupérer tous les descripteurs d'un membre
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    const result = await pool.query(
      'SELECT * FROM face_descriptors WHERE user_id = $1 ORDER BY is_primary DESC, created_at DESC',
      [userId]
    );

    return NextResponse.json({
      success: true,
      descriptors: result.rows,
    });
  } catch (error: any) {
    console.error('Erreur récupération descripteurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des descripteurs', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/facial-recognition/descriptors/:descriptorId
 * Supprimer un descripteur
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { descriptorId: string } }
) {
  try {
    const { descriptorId } = params;

    await pool.query('DELETE FROM face_descriptors WHERE id = $1', [descriptorId]);

    return NextResponse.json({
      success: true,
      message: 'Descripteur supprimé',
    });
  } catch (error: any) {
    console.error('Erreur suppression descripteur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du descripteur', details: error.message },
      { status: 500 }
    );
  }
}
