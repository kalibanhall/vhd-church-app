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

// GET - Récupérer les statistiques de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyToken(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.user!.id

    // Calculer les statistiques
    const [donations, appointments, prayers, testimonies] = await Promise.all([
      // Total des dons
      prisma.donation.aggregate({
        where: { 
          userId: userId,
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      }),

      // Nombre de rendez-vous
      prisma.appointment.count({
        where: { userId: userId }
      }),

      // Nombre d'intentions de prière
      prisma.prayer.count({
        where: { userId: userId }
      }),

      // Nombre de témoignages
      prisma.testimony.count({
        where: { userId: userId }
      })
    ])

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