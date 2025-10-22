import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })
import { prisma } from '../../../../lib/prisma'
import { verifyAuthentication } from '../../../../lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    console.log('=== API MEMBER APPOINTMENTS GET ===')
    
    const auth = await verifyAuthentication(request)
    
    if (!auth.success) {
      console.log('❌ Authentication failed:', auth.error)
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const user = auth.user!
    console.log('✅ User authenticated:', user.email, user.role)

    // Récupérer les rendez-vous de l'utilisateur connecté
    const appointmentsRes = await sql`
      SELECT a.*, u.id AS pastor_id, u.first_name AS pastor_first_name, u.last_name AS pastor_last_name, u.email AS pastor_email
      FROM appointments a
      LEFT JOIN users u ON a.pastor_id = u.id
      WHERE a.user_id = ${user.id}
      ORDER BY a.appointment_date DESC, a.start_time DESC
    `
    const appointments = appointmentsRes;
    console.log(`✅ Found ${appointments.length} appointments for user ${user.id}`)
    return NextResponse.json({ success: true, appointments })

  } catch (error) {
    console.error('❌ Erreur récupération rendez-vous membre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des rendez-vous' },
      { status: 500 }
    )
  }
}