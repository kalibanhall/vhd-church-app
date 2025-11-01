// =============================================================================
// API VÉRIFICATION FACIALE
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const SIMILARITY_THRESHOLD = 0.6;

/**
 * POST /api/facial-recognition/verify
 * Vérifier un visage contre la base de données
 */
export async function POST(request: NextRequest) {
  try {
    const { descriptor, sessionId } = await request.json();

    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return NextResponse.json(
        { error: 'Descripteur invalide (128 valeurs requises)' },
        { status: 400 }
      );
    }

    // Récupérer tous les descripteurs actifs
    const descriptorsResult = await pool.query(
      `SELECT fd.*, u.first_name, u.last_name, u.email, u.profile_image_url
       FROM face_descriptors fd
       JOIN users u ON fd.user_id = u.id
       WHERE u.status = 'ACTIVE'`
    );

    if (descriptorsResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Aucun descripteur enregistré',
      });
    }

    // Comparer avec chaque descripteur
    let bestMatch: any = null;
    let bestDistance = Infinity;

    for (const row of descriptorsResult.rows) {
      const storedDescriptor = JSON.parse(row.descriptor);
      const distance = euclideanDistance(descriptor, storedDescriptor);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = {
          ...row,
          distance,
          similarity: 1 - distance, // Convertir distance en similarité
        };
      }
    }

    // Vérifier si le match est suffisamment bon
    const similarity = 1 - bestDistance;
    const isMatch = similarity >= SIMILARITY_THRESHOLD;

    if (isMatch && bestMatch) {
      return NextResponse.json({
        success: true,
        match: true,
        user: {
          id: bestMatch.user_id,
          firstName: bestMatch.first_name,
          lastName: bestMatch.last_name,
          email: bestMatch.email,
          profileImageUrl: bestMatch.profile_image_url,
        },
        confidence: similarity,
        descriptorId: bestMatch.id,
      });
    } else {
      return NextResponse.json({
        success: true,
        match: false,
        message: 'Aucune correspondance trouvée',
        bestSimilarity: similarity,
      });
    }
  } catch (error: any) {
    console.error('Erreur vérification faciale:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Calcul de la distance euclidienne entre deux descripteurs
 */
function euclideanDistance(descriptor1: number[], descriptor2: number[]): number {
  if (descriptor1.length !== descriptor2.length) {
    throw new Error('Les descripteurs doivent avoir la même longueur');
  }

  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}
