import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })
function formatDate(date: Date) {
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInHours < 1) {
    return 'Il y a moins d\'1 heure'
  } else if (diffInHours < 24) {
    return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`
  } else if (diffInDays < 7) {
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`
  } else {
    return `Il y a ${Math.floor(diffInDays / 7)} semaine${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`
  }
}
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
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userRes = await sql`SELECT * FROM users WHERE id = ${decoded.userId}`
    const user = userRes[0]
    if (!user) {
      return { error: 'Utilisateur introuvable', status: 404 }
    }
    return { user }
  } catch (error) {
    return { error: 'Erreur serveur', status: 500 }
  }

// GET - Récupérer l'activité récente de l'utilisateur
async function GET(request: NextRequest) {
  try {
    const auth = await verifyToken(request)
    if (!auth || auth.error) {
      return NextResponse.json({ error: auth?.error || 'Erreur d\'authentification' }, { status: auth?.status || 401 })
    }
  const userId = auth?.user?.id
    // Direct SQL queries for recent activities
    const donationsRes = await sql`SELECT id, amount, donation_type, created_at, status FROM donations WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 3`
    const appointmentsRes = await sql`SELECT id, reason, appointment_date, status, created_at FROM appointments WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 3`
    const prayersRes = await sql`SELECT id, title, created_at FROM prayers WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 3`
    const recentDonations = donationsRes
    const recentAppointments = appointmentsRes
    const recentPrayers = prayersRes
    // Format activities
    const activities: any[] = []
    recentDonations.forEach((donation: any) => {
      activities.push({
        id: donation.id,
        type: 'donation',
        title: donation.status === 'COMPLETED' ? 'Don effectué' : 'Don en attente',
        description: `${donation.amount} USD • ${donation.donation_type}`,
        date: formatDate(new Date(donation.created_at)),
        icon: 'Heart'
      })
    })
    recentAppointments.forEach((appointment: any) => {
      activities.push({
        id: appointment.id,
        type: 'appointment',
        title: appointment.status === 'CONFIRMED' ? 'Rendez-vous confirmé' : 'Nouveau rendez-vous',
        description: appointment.reason,
        date: formatDate(new Date(appointment.created_at)),
        icon: 'Calendar'
      })
    })
    recentPrayers.forEach((prayer: any) => {
      activities.push({
        id: prayer.id,
        type: 'prayer',
        title: 'Intention de prière soumise',
        description: prayer.title,
        date: formatDate(new Date(prayer.created_at)),
        icon: 'Users'
      })
    })
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const limitedActivities = activities.slice(0, 5)
    return NextResponse.json({ success: true, activities: limitedActivities })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
  }
