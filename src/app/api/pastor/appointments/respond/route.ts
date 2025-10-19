import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { verifyAuthentication } from '../../../../../lib/auth-middleware'

export async function POST(request: NextRequest) {
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

    const { appointmentId, status, responseMessage } = await request.json()

    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: 'ID du rendez-vous et statut requis' },
        { status: 400 }
      )
    }

    if (!['CONFIRMED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      )
    }

    // Vérifier que le rendez-vous appartient au pasteur
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        pastorId: user.id,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé ou déjà traité' },
        { status: 404 }
      )
    }

    // Mettre à jour le statut du rendez-vous
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { 
        status,
        updatedAt: new Date()
      }
    })

    // Créer une notification pour l'utilisateur demandeur
    const notificationTitle = status === 'CONFIRMED' 
      ? 'Rendez-vous confirmé !' 
      : 'Rendez-vous annulé'
    
    const notificationMessage = status === 'CONFIRMED'
      ? `Votre rendez-vous du ${new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')} à ${new Date(appointment.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} a été confirmé par le pasteur.${responseMessage ? ` Message: ${responseMessage}` : ''}`
      : `Votre rendez-vous du ${new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')} a été annulé.${responseMessage ? ` Motif: ${responseMessage}` : ''}`

    await prisma.notification.create({
      data: {
        userId: appointment.userId,
        title: notificationTitle,
        message: notificationMessage,
        type: 'APPOINTMENT',
        isRead: false
      }
    })

    return NextResponse.json({
      success: true,
      message: `Rendez-vous ${status === 'CONFIRMED' ? 'confirmé' : 'annulé'} avec succès`,
      appointment: updatedAppointment
    })

  } catch (error) {
    console.error('Erreur réponse rendez-vous:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la réponse au rendez-vous' },
      { status: 500 }
    )
  }
}