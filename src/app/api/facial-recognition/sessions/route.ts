// =============================================================================
// API SESSIONS DE PRÉSENCE
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

/**
 * GET /api/facial-recognition/sessions
 * Récupérer toutes les sessions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT s.*, 
             u.first_name || ' ' || u.last_name as creator_name,
             (SELECT COUNT(*) FROM check_ins WHERE session_id = s.id) as check_ins_count
      FROM attendance_sessions s
      LEFT JOIN users u ON s.created_by = u.id
    `;

    const params: any[] = [];
    
    if (status) {
      query += ' WHERE s.status = $1';
      params.push(status);
    }

    query += ' ORDER BY s.session_date DESC, s.start_time DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      sessions: result.rows,
      total: result.rowCount,
    });
  } catch (error: any) {
    console.error('Erreur récupération sessions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sessions', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/facial-recognition/sessions
 * Créer une nouvelle session de présence
 */
export async function POST(request: NextRequest) {
  try {
    const {
      eventId,
      sessionName,
      sessionType,
      sessionDate,
      startTime,
      endTime,
      location,
      expectedAttendees,
      faceRecognitionEnabled,
      qrCodeEnabled,
      createdBy,
      notes,
    } = await request.json();

    if (!sessionName || !sessionType || !sessionDate || !startTime || !createdBy) {
      return NextResponse.json(
        { error: 'sessionName, sessionType, sessionDate, startTime et createdBy requis' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO attendance_sessions (
        event_id, session_name, session_type, session_date, start_time, end_time,
        location, expected_attendees, face_recognition_enabled, qr_code_enabled,
        created_by, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        eventId || null,
        sessionName,
        sessionType,
        sessionDate,
        startTime,
        endTime || null,
        location || null,
        expectedAttendees || 0,
        faceRecognitionEnabled !== false,
        qrCodeEnabled !== false,
        createdBy,
        notes || null,
      ]
    );

    return NextResponse.json({
      success: true,
      session: result.rows[0],
    });
  } catch (error: any) {
    console.error('Erreur création session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/facial-recognition/sessions/:sessionId
 * Mettre à jour une session
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const updates = await request.json();

    const allowedFields = [
      'session_name',
      'status',
      'end_time',
      'notes',
      'expected_attendees',
      'completed_at',
    ];

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json(
        { error: 'Aucun champ valide à mettre à jour' },
        { status: 400 }
      );
    }

    values.push(sessionId);

    const result = await pool.query(
      `UPDATE attendance_sessions SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: result.rows[0],
    });
  } catch (error: any) {
    console.error('Erreur mise à jour session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la session', details: error.message },
      { status: 500 }
    );
  }
}
