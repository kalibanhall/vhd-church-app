import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import postgres from 'postgres'
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })
import { verifyAuthentication } from '../../../../lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuthentication(request)
    
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const user = auth.user!

    // Vérifier que l'utilisateur est pasteur ou admin
    if (!['PASTOR', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès réservé aux pasteurs et administrateurs' },
        { status: 403 }
      )
    }

    // Récupérer les rendez-vous du pasteur
    const appointments = await sql`
      SELECT a.*, u.first_name, u.last_name, u.email, u.phone
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.pastor_id = ${user.id}
      ORDER BY a.appointment_date ASC, a.start_time ASC
    `
    return NextResponse.json({ success: true, appointments })

  } catch (error) {
    console.error('Erreur récupération rendez-vous pasteur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des rendez-vous' },
      { status: 500 }
    )
  }
}