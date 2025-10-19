import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyAuthentication } from '../../../../lib/auth-middleware'

// PATCH - Marquer une notification comme lue
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuthentication(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const { id } = params

    // Vérifier que la notification appartient à l'utilisateur
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: auth.user!.id
      }
    })

    if (!notification) {
      return NextResponse.json({
        error: 'Notification non trouvée'
      }, { status: 404 })
    }

    // Marquer comme lue
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    })

    return NextResponse.json({
      success: true,
      notification: updatedNotification
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

// DELETE - Supprimer une notification
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuthentication(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const { id } = params

    // Vérifier que la notification appartient à l'utilisateur
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: auth.user!.id
      }
    })

    if (!notification) {
      return NextResponse.json({
        error: 'Notification non trouvée'
      }, { status: 404 })
    }

    // Supprimer la notification
    await prisma.notification.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Notification supprimée'
    })
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}