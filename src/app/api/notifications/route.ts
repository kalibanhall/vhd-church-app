/**
 * =============================================================================
 * MINISTÈRE DES VAILLANTS HOMMES DE DAVID
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * Version: 1.0.3
 * Date: Octobre 2025
 * 
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Vérification JWT par cookies
async function verifyToken(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return { error: 'Non authentifié', status: 401 }
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    
    if (!user) {
      return { error: 'Utilisateur introuvable', status: 404 }
    }

    return { user }
  } catch (error) {
    return { error: 'Token invalide', status: 401 }
  }
}

export async function GET(request: NextRequest) {
  const verification = await verifyToken(request)
  
  if (verification.error) {
    return NextResponse.json({ error: verification.error }, { status: verification.status })
  }

  if (!verification.user) {
    return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 401 })
  }

  const user = verification.user
  const url = new URL(request.url)
  const unreadOnly = url.searchParams.get('unread') === 'true'

  try {
    const whereClause: any = { userId: user.id }
    
    if (unreadOnly) {
      whereClause.isRead = false
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Compter les non lues
    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false
      }
    })

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount
    })
  } catch (error) {
    console.error('Erreur récupération notifications:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const verification = await verifyToken(request)
  
  if (verification.error) {
    return NextResponse.json({ error: verification.error }, { status: verification.status })
  }

  if (!verification.user) {
    return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 401 })
  }

  const user = verification.user
  
  try {
    const { notificationId, markAllAsRead } = await request.json()

    if (markAllAsRead) {
      // Marquer toutes les notifications comme lues
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          isRead: false
        },
        data: {
          isRead: true
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Toutes les notifications ont été marquées comme lues'
      })
    }

    if (notificationId) {
      // Marquer une notification spécifique comme lue
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId: user.id
        },
        data: {
          isRead: true
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Notification marquée comme lue'
      })
    }

    return NextResponse.json(
      { error: 'Action non spécifiée' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erreur mise à jour notification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}