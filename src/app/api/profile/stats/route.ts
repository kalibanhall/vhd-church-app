import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })
// @ts-ignore
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Vérification JWT
async function verifyToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Token manquant', status: 401 }
    }
    
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    const userRes = await sql`SELECT * FROM users WHERE id = ${decoded.userId}`
    const user = userRes[0]
    
    if (!user) {
      return { error: 'Utilisateur introuvable', status: 404 }
    }

    return { user }
  } catch (error) {
    return { error: 'Token invalide', status: 401 }
  }
}

// GET - Récupérer les statistiques de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyToken(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.user!.id

    // Calculer les statistiques
    const donationsRes = await sql`SELECT COALESCE(SUM(amount),0) AS total FROM donations WHERE user_id = ${userId} AND status = 'COMPLETED'`
    const appointmentsRes = await sql`SELECT COUNT(*) AS count FROM appointments WHERE user_id = ${userId}`
    const prayersRes = await sql`SELECT COUNT(*) AS count FROM prayers WHERE user_id = ${userId}`
    const testimoniesRes = await sql`SELECT COUNT(*) AS count FROM testimonies WHERE user_id = ${userId}`
    const donations = donationsRes[0].total
    const appointments = parseInt(appointmentsRes[0].count)
    const prayers = parseInt(prayersRes[0].count)
    const testimonies = parseInt(testimoniesRes[0].count)

    const stats = {
      totalDonations: donations._sum.amount || 0,
      appointments: appointments || 0,
      prayers: prayers || 0,
      testimonies: testimonies || 0
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}