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

import postgres from 'postgres'
import jwt from 'jsonwebtoken'
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

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
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const userId = decoded.userId
    const { pastorId, appointmentDate, appointmentTime, reason } = await request.json()

    // Validation des données requises
    if (!pastorId || !appointmentDate || !appointmentTime || !reason) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
    }

    // Validation date : pas de date antérieure
    const today = new Date()
    today.setHours(0,0,0,0)
    const selectedDate = new Date(appointmentDate)
    if (selectedDate < today) {
      return NextResponse.json({ error: 'La date du rendez-vous ne peut pas être antérieure à aujourd\'hui.' }, { status: 400 })
    }

    // Vérifier que le pasteur existe
    const pastors = await sql`SELECT id, first_name, last_name, email FROM users WHERE id = ${pastorId} AND role IN ('PASTEUR', 'ADMIN') LIMIT 1`
    if (pastors.length === 0) {
      return NextResponse.json({ error: 'Pasteur introuvable' }, { status: 404 })
    }
    const pastor = pastors[0]

    // Créer la date et l'heure complète
    const [hour, minute] = appointmentTime.split(':')
    const startDateTime = new Date(selectedDate)
    startDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0)
    const endDateTime = new Date(startDateTime)
    endDateTime.setHours(startDateTime.getHours() + 1) // Durée par défaut 1h

    // Créer le rendez-vous
    const result = await sql`
      INSERT INTO appointments (user_id, pastor_id, appointment_date, start_time, end_time, reason, status, created_at, updated_at)
      VALUES (${userId}, ${pastorId}, ${selectedDate}, ${startDateTime}, ${endDateTime}, ${reason}, 'PENDING', NOW(), NOW())
      RETURNING *
    `
    const appointment = result[0]
    appointment.pastor = pastor

    // Créer une notification pour le pasteur
    try {
      await sql`
        INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
        VALUES (${pastorId}, 'Nouvelle demande de rendez-vous', ${`Un membre souhaite prendre rendez-vous avec vous le ${selectedDate.toLocaleDateString('fr-FR')} à ${appointmentTime}. Motif: ${reason}`}, 'APPOINTMENT', false, NOW())
      `
    } catch (notifError) {
      console.error('❌ Erreur lors de l\'envoi de la notification:', notifError)
    }

    return NextResponse.json({ success: true, appointment, message: 'Rendez-vous demandé avec succès' })
  } catch (error) {
    console.error('Erreur création rendez-vous:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du rendez-vous', details: error instanceof Error ? error.message : error }, { status: 500 })
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