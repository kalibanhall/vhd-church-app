/**
 * =============================================================================
 * API APPOINTMENTS - GESTION DES RENDEZ-VOUS PASTORAUX
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: API REST pour la gestion des rendez-vous entre membres et pasteurs.
 * Permet la création, récupération et modification des rendez-vous avec système
 * de notifications automatiques.
 * 
 * Routes:
 * - GET: Récupération des rendez-vous de l'utilisateur connecté
 * - POST: Création d'un nouveau rendez-vous avec notification automatique
 * 
 * Sécurité: Authentification JWT requise pour toutes les opérations
 * 
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { verifyAuthentication } from '../../../lib/auth-middleware'

/**
 * GET /api/appointments
 * Récupère tous les rendez-vous de l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
  const verification = await verifyAuthentication(request)
  
  if (!verification.success) {
    return NextResponse.json({ error: verification.error }, { status: verification.status || 401 })
  }

  const user = verification.user!

  try {
    const appointments = await prisma.appointment.findMany({
      where: { userId: user.id },
      include: {
        pastor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { appointmentDate: 'asc' }
    })

    return NextResponse.json({
      success: true,
      appointments
    })
  } catch (error) {
    console.error('Erreur récupération rendez-vous:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des rendez-vous' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/appointments
 * Crée un nouveau rendez-vous et envoie automatiquement une notification au pasteur
 */
export async function POST(request: NextRequest) {
  const verification = await verifyAuthentication(request)
  
  if (!verification.success) {
    return NextResponse.json({ error: verification.error }, { status: verification.status || 401 })
  }

  const user = verification.user!
  
  try {
    const { pastorId, appointmentDate, startTime, endTime, reason } = await request.json()

    console.log('Données reçues:', { pastorId, appointmentDate, startTime, endTime, reason })

    // Validation des données requises
    if (!pastorId || !appointmentDate || !startTime || !endTime || !reason) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que le pasteur existe
    const pastor = await prisma.user.findUnique({
      where: { 
        id: pastorId,
        role: { in: ['PASTOR', 'ADMIN'] }
      }
    })

    if (!pastor) {
      return NextResponse.json(
        { error: 'Pasteur introuvable' },
        { status: 404 }
      )
    }

    // Créer les dates et heures complètes
    const appointmentDateTime = new Date(appointmentDate)
    const [startHour, startMinute] = startTime.split(':')
    const [endHour, endMinute] = endTime.split(':')
    
    const startDateTime = new Date(appointmentDateTime)
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0)
    
    const endDateTime = new Date(appointmentDateTime)
    endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0)

    console.log('Dates calculées:', { startDateTime, endDateTime })

    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        pastorId: pastorId,
        appointmentDate: appointmentDateTime,
        startTime: startDateTime,
        endTime: endDateTime,
        reason: reason,
        status: 'PENDING'
      },
      include: {
        pastor: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // Créer une notification pour le pasteur
    try {
      await prisma.notification.create({
        data: {
          userId: pastorId,
          title: 'Nouvelle demande de rendez-vous',
          message: `${user.firstName} ${user.lastName} souhaite prendre rendez-vous avec vous le ${appointmentDateTime.toLocaleDateString('fr-FR')} de ${startTime} à ${endTime}. Motif: ${reason}`,
          type: 'APPOINTMENT',
          isRead: false
        }
      })
      console.log('✅ Notification envoyée au pasteur')
    } catch (notifError) {
      console.error('❌ Erreur lors de l\'envoi de la notification:', notifError)
      // On continue même si la notification échoue
    }

    return NextResponse.json({
      success: true,
      appointment,
      message: 'Rendez-vous demandé avec succès'
    })
  } catch (error) {
    console.error('Erreur création rendez-vous:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du rendez-vous' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const verification = await verifyAuthentication(request)
  
  if (!verification.success) {
    return NextResponse.json({ error: verification.error }, { status: verification.status || 401 })
  }

  const user = verification.user!
  
  try {
    const { appointmentId, action } = await request.json()

    if (action === 'cancel') {
      const appointment = await prisma.appointment.update({
        where: {
          id: appointmentId,
          userId: user.id
        },
        data: {
          status: 'CANCELLED'
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Rendez-vous annulé'
      })
    }

    return NextResponse.json(
      { error: 'Action non reconnue' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erreur modification rendez-vous:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification' },
      { status: 500 }
    )
  }
}