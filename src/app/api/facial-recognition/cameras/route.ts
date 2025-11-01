// =============================================================================
// API GESTION DES CAMÉRAS
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

/**
 * GET /api/facial-recognition/cameras
 * Récupérer toutes les caméras
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    let query = `
      SELECT c.*,
             u.first_name || ' ' || u.last_name as assigned_name
      FROM cameras c
      LEFT JOIN users u ON c.assigned_to = u.id
    `;

    if (activeOnly) {
      query += ' WHERE c.is_active = true';
    }

    query += ' ORDER BY c.camera_location, c.camera_name';

    const result = await pool.query(query);

    return NextResponse.json({
      success: true,
      cameras: result.rows,
    });
  } catch (error: any) {
    console.error('Erreur récupération caméras:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des caméras', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/facial-recognition/cameras
 * Créer une nouvelle caméra
 */
export async function POST(request: NextRequest) {
  try {
    const {
      cameraName,
      cameraLocation,
      cameraType,
      deviceId,
      ipAddress,
      settings,
      assignedTo,
      notes,
    } = await request.json();

    if (!cameraName) {
      return NextResponse.json(
        { error: 'cameraName requis' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO cameras (
        camera_name, camera_location, camera_type, device_id,
        ip_address, settings, assigned_to, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        cameraName,
        cameraLocation || null,
        cameraType || 'MOBILE',
        deviceId || null,
        ipAddress || null,
        settings ? JSON.stringify(settings) : null,
        assignedTo || null,
        notes || null,
      ]
    );

    return NextResponse.json({
      success: true,
      camera: result.rows[0],
    });
  } catch (error: any) {
    console.error('Erreur création caméra:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la caméra', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/facial-recognition/cameras/:cameraId/ping
 * Mettre à jour le dernier ping d'une caméra
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { cameraId: string } }
) {
  try {
    const { cameraId } = params;

    await pool.query(
      'UPDATE cameras SET last_ping = NOW() WHERE id = $1',
      [cameraId]
    );

    return NextResponse.json({
      success: true,
      message: 'Ping enregistré',
    });
  } catch (error: any) {
    console.error('Erreur ping caméra:', error);
    return NextResponse.json(
      { error: 'Erreur lors du ping de la caméra', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/facial-recognition/cameras/:cameraId
 * Supprimer une caméra
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { cameraId: string } }
) {
  try {
    const { cameraId } = params;

    await pool.query('DELETE FROM cameras WHERE id = $1', [cameraId]);

    return NextResponse.json({
      success: true,
      message: 'Caméra supprimée',
    });
  } catch (error: any) {
    console.error('Erreur suppression caméra:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la caméra', details: error.message },
      { status: 500 }
    );
  }
}
