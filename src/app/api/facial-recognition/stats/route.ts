// =============================================================================
// API STATISTIQUES RECONNAISSANCE FACIALE
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

/**
 * GET /api/facial-recognition/stats
 * Récupérer les statistiques globales
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // jours

    // Statistiques globales
    const globalStats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM face_descriptors) as total_descriptors,
        (SELECT COUNT(DISTINCT user_id) FROM face_descriptors) as users_with_descriptors,
        (SELECT COUNT(*) FROM attendance_sessions WHERE status = 'ACTIVE') as active_sessions,
        (SELECT COUNT(*) FROM attendance_sessions WHERE status = 'COMPLETED') as completed_sessions,
        (SELECT COUNT(*) FROM check_ins WHERE check_in_time >= NOW() - INTERVAL '${period} days') as recent_checkins,
        (SELECT COUNT(DISTINCT user_id) FROM check_ins WHERE check_in_time >= NOW() - INTERVAL '${period} days') as active_users,
        (SELECT AVG(confidence_score) FROM check_ins WHERE check_in_method = 'FACIAL_RECOGNITION' AND check_in_time >= NOW() - INTERVAL '${period} days') as avg_confidence
    `);

    // Répartition par méthode de check-in
    const methodStats = await pool.query(`
      SELECT 
        check_in_method,
        COUNT(*) as count,
        AVG(CASE WHEN check_in_method = 'FACIAL_RECOGNITION' THEN confidence_score END) as avg_confidence
      FROM check_ins
      WHERE check_in_time >= NOW() - INTERVAL '${period} days'
      GROUP BY check_in_method
    `);

    // Top 10 membres les plus assidus
    const topAttendees = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.profile_image_url,
        COUNT(DISTINCT ci.session_id) as sessions_attended,
        MAX(ci.check_in_time) as last_attendance
      FROM users u
      JOIN check_ins ci ON u.id = ci.user_id
      WHERE ci.check_in_time >= NOW() - INTERVAL '${period} days'
      GROUP BY u.id, u.first_name, u.last_name, u.profile_image_url
      ORDER BY sessions_attended DESC
      LIMIT 10
    `);

    // Statistiques par jour (7 derniers jours)
    const dailyStats = await pool.query(`
      SELECT 
        DATE(check_in_time) as date,
        COUNT(*) as total_checkins,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(CASE WHEN check_in_method = 'FACIAL_RECOGNITION' THEN 1 END) as facial_checkins
      FROM check_ins
      WHERE check_in_time >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(check_in_time)
      ORDER BY date DESC
    `);

    return NextResponse.json({
      success: true,
      stats: {
        global: globalStats.rows[0],
        byMethod: methodStats.rows,
        topAttendees: topAttendees.rows,
        daily: dailyStats.rows,
      },
    });
  } catch (error: any) {
    console.error('Erreur récupération statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/facial-recognition/stats/member/:userId
 * Statistiques d'un membre spécifique
 */
export async function getMemberStats(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    const stats = await pool.query(`
      SELECT * FROM member_attendance_stats WHERE user_id = $1
    `, [userId]);

    if (stats.rowCount === 0) {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      );
    }

    // Historique des présences
    const history = await pool.query(`
      SELECT 
        ci.check_in_time,
        ci.check_in_method,
        ci.confidence_score,
        s.session_name,
        s.session_type,
        s.session_date
      FROM check_ins ci
      JOIN attendance_sessions s ON ci.session_id = s.id
      WHERE ci.user_id = $1
      ORDER BY ci.check_in_time DESC
      LIMIT 50
    `, [userId]);

    return NextResponse.json({
      success: true,
      stats: stats.rows[0],
      history: history.rows,
    });
  } catch (error: any) {
    console.error('Erreur statistiques membre:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques', details: error.message },
      { status: 500 }
    );
  }
}
