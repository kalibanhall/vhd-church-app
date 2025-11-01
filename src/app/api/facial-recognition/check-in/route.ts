// =============================================================================
// API CHECK-IN (POINTAGE)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

/**
 * POST /api/facial-recognition/check-in
 * Enregistrer une présence
 */
export async function POST(request: NextRequest) {
  try {
    const {
      sessionId,
      userId,
      checkInMethod,
      confidenceScore,
      photoUrl,
      matchedDescriptorId,
      cameraId,
      deviceInfo,
      locationData,
    } = await request.json();

    if (!sessionId || !userId || !checkInMethod) {
      return NextResponse.json(
        { error: 'sessionId, userId et checkInMethod requis' },
        { status: 400 }
      );
    }

    // Vérifier si la session existe et est active
    const sessionCheck = await pool.query(
      'SELECT status FROM attendance_sessions WHERE id = $1',
      [sessionId]
    );

    if (sessionCheck.rowCount === 0) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      );
    }

    if (sessionCheck.rows[0].status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'La session n\'est pas active' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur n'a pas déjà pointé
    const existingCheckIn = await pool.query(
      'SELECT id FROM check_ins WHERE session_id = $1 AND user_id = $2',
      [sessionId, userId]
    );

    if (existingCheckIn.rowCount > 0) {
      return NextResponse.json(
        { error: 'Vous avez déjà pointé pour cette session', checkInId: existingCheckIn.rows[0].id },
        { status: 409 }
      );
    }

    // Créer le check-in
    const result = await pool.query(
      `INSERT INTO check_ins (
        session_id, user_id, check_in_method, confidence_score, photo_url,
        matched_descriptor_id, camera_id, device_info, location_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        sessionId,
        userId,
        checkInMethod,
        confidenceScore || null,
        photoUrl || null,
        matchedDescriptorId || null,
        cameraId || null,
        deviceInfo ? JSON.stringify(deviceInfo) : null,
        locationData ? JSON.stringify(locationData) : null,
      ]
    );

    // Récupérer les infos utilisateur
    const userInfo = await pool.query(
      'SELECT first_name, last_name, email, profile_image_url FROM users WHERE id = $1',
      [userId]
    );

    return NextResponse.json({
      success: true,
      checkIn: {
        ...result.rows[0],
        user: userInfo.rows[0],
      },
    });
  } catch (error: any) {
    console.error('Erreur check-in:', error);
    return NextResponse.json(
      { error: 'Erreur lors du check-in', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/facial-recognition/check-in/:sessionId
 * Récupérer tous les check-ins d'une session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    const result = await pool.query(
      `SELECT ci.*,
              u.first_name, u.last_name, u.email, u.profile_image_url,
              c.camera_name, c.camera_location
       FROM check_ins ci
       JOIN users u ON ci.user_id = u.id
       LEFT JOIN cameras c ON ci.camera_id = c.id
       WHERE ci.session_id = $1
       ORDER BY ci.check_in_time DESC`,
      [sessionId]
    );

    return NextResponse.json({
      success: true,
      checkIns: result.rows,
      total: result.rowCount,
    });
  } catch (error: any) {
    console.error('Erreur récupération check-ins:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des check-ins', details: error.message },
      { status: 500 }
    );
  }
}
