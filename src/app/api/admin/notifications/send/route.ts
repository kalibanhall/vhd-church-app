import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { verifyAuthentication } from '../../../../../lib/auth-middleware'

// POST - Envoyer une notification à des utilisateurs
export async function POST(request: NextRequest) {
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

    const { 
      title, 
      message, 
      type = 'info', 
      recipientType, 
      recipientIds = [],
      role = null,
      sendPush = true 
    } = await request.json()

    if (!title || !message || !recipientType) {
      return NextResponse.json({
        error: 'Titre, message et type de destinataire sont requis'
      }, { status: 400 })
    }

    let targetUsers: any[] = []

    // Déterminer les destinataires
    switch (recipientType) {
      case 'all':
        targetUsers = await prisma.user.findMany({
          where: { status: 'ACTIVE' },
          select: { id: true, firstName: true, lastName: true, email: true }
        })
        break

      case 'role':
        if (!role) {
          return NextResponse.json({
            error: 'Rôle requis pour ce type de destinataire'
          }, { status: 400 })
        }
        targetUsers = await prisma.user.findMany({
          where: { 
            status: 'ACTIVE',
            role: role
          },
          select: { id: true, firstName: true, lastName: true, email: true }
        })
        break

      case 'specific':
        if (recipientIds.length === 0) {
          return NextResponse.json({
            error: 'IDs des destinataires requis'
          }, { status: 400 })
        }
        targetUsers = await prisma.user.findMany({
          where: { 
            id: { in: recipientIds },
            status: 'ACTIVE'
          },
          select: { id: true, firstName: true, lastName: true, email: true }
        })
        break

      default:
        return NextResponse.json({
          error: 'Type de destinataire invalide'
        }, { status: 400 })
    }

    if (targetUsers.length === 0) {
      return NextResponse.json({
        error: 'Aucun destinataire trouvé'
      }, { status: 400 })
    }

    // Créer les notifications dans la base
    const notifications = await Promise.all(
      targetUsers.map(user =>
        prisma.notification.create({
          data: {
            title: title.replace('{name}', `${user.firstName} ${user.lastName}`),
            message: message.replace('{name}', `${user.firstName} ${user.lastName}`),
            type,
            userId: user.id,
            isRead: false
          }
        })
      )
    )

    // TODO: Envoyer les notifications push si activé
    if (sendPush) {
      // Ici on pourrait intégrer avec un service de push notifications
      // comme Firebase Cloud Messaging ou Web Push Protocol
      console.log(`📱 Envoi de ${notifications.length} notifications push`)
    }

    return NextResponse.json({
      success: true,
      message: `${notifications.length} notification(s) envoyée(s)`,
      sentCount: notifications.length,
      recipients: targetUsers.map(u => `${u.firstName} ${u.lastName}`)
    })

  } catch (error) {
    console.error('Erreur lors de l\'envoi de notifications:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}