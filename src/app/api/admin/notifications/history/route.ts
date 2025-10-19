import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { verifyAuthentication } from '../../../../../lib/auth-middleware'

// GET - Récupérer l'historique des notifications
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuthentication(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    // Vérifier les permissions admin
    if (!['ADMIN', 'PASTEUR', 'PASTOR'].includes(auth.user!.role)) {
      return NextResponse.json({
        error: 'Accès non autorisé - Droits administrateur requis'
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type')
    const userId = searchParams.get('userId')

    const skip = (page - 1) * limit

    // Construire les filtres
    const where: any = {}
    if (type) where.type = type
    if (userId) where.userId = userId

    // Récupérer les notifications avec pagination
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ])

    // Statistiques
    const stats = await prisma.notification.groupBy({
      by: ['type'],
      _count: { id: true },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
        }
      }
    })

    const readStats = await prisma.notification.groupBy({
      by: ['isRead'],
      _count: { id: true }
    })

    return NextResponse.json({
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        byType: stats.reduce((acc, stat) => {
          acc[stat.type] = stat._count.id
          return acc
        }, {} as Record<string, number>),
        readCount: readStats.find(s => s.isRead)?._count.id || 0,
        unreadCount: readStats.find(s => !s.isRead)?._count.id || 0
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}