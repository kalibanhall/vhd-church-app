import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
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
    
    const userId = decoded.id || decoded.userId
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return { error: 'Utilisateur introuvable', status: 404 }
    }

    return { user }
  } catch (error) {
    return { error: 'Token invalide', status: 401 }
  }
}

// GET - Récupérer l'activité récente de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyToken(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.user!.id

    // Récupérer l'activité récente (derniers 10 éléments)
    const [recentDonations, recentAppointments, recentPrayers] = await Promise.all([
      // Dernières donations
      prisma.donation.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          amount: true,
          donationType: true,
          createdAt: true,
          status: true
        }
      }),

      // Derniers rendez-vous
      prisma.appointment.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          reason: true,
          appointmentDate: true,
          status: true,
          createdAt: true
        }
      }),

      // Dernières intentions de prière
      prisma.prayer.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          createdAt: true,
          isPublic: true
        }
      })
    ])

    // Formater l'activité en un seul tableau
    const activities: any[] = []

    // Ajouter les donations
    recentDonations.forEach((donation: any) => {
      activities.push({
        id: donation.id,
        type: 'donation',
        title: donation.status === 'COMPLETED' ? 'Don effectué' : 'Don en attente',
        description: `${donation.amount} USD • ${donation.donationType}`,
        date: formatDate(donation.createdAt),
        icon: 'Heart'
      })
    })

    // Ajouter les rendez-vous
    recentAppointments.forEach((appointment: any) => {
      activities.push({
        id: appointment.id,
        type: 'appointment',
        title: appointment.status === 'CONFIRMED' ? 'Rendez-vous confirmé' : 'Nouveau rendez-vous',
        description: appointment.reason,
        date: formatDate(appointment.createdAt),
        icon: 'Calendar'
      })
    })

    // Ajouter les intentions de prière
    recentPrayers.forEach((prayer: any) => {
      activities.push({
        id: prayer.id,
        type: 'prayer',
        title: 'Intention de prière soumise',
        description: prayer.title,
        date: formatDate(prayer.createdAt),
        icon: 'Users'
      })
    })

    // Trier par date (plus récent en premier)
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Limiter à 5 activités
    const limitedActivities = activities.slice(0, 5)

    return NextResponse.json({
      success: true,
      activities: limitedActivities
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

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