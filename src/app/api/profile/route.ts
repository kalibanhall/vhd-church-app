import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })
// ...existing code...
import jwt from 'jsonwebtoken'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

import { verifyAuthentication } from '../../../lib/auth-middleware'

// GET - Récupérer le profil utilisateur avec statistiques
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuthentication(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const userId = auth.user!.id

    // Récupérer l'utilisateur complet depuis la base
    const userRes = await sql`
      SELECT id, email, first_name AS "firstName", last_name AS "lastName", phone, role, profile_image_url AS "profileImageUrl", membership_number AS "membershipNumber", created_at AS "createdAt" FROM users WHERE id = ${userId}
    `
    const user = userRes[0]

    // Récupérer les statistiques de l'utilisateur
    const donationsRes = await sql`SELECT COALESCE(SUM(amount),0) AS total, COUNT(*) AS count FROM donations WHERE user_id = ${user.id}`
    const appointmentsRes = await sql`SELECT COUNT(*) AS count FROM appointments WHERE user_id = ${user.id}`
    const prayersRes = await sql`SELECT COUNT(*) AS count FROM prayers WHERE user_id = ${user.id}`
    const testimoniesRes = await sql`SELECT COUNT(*) AS count FROM testimonies WHERE user_id = ${user.id}`
    const donations = { _sum: { amount: donationsRes[0].total }, _count: donationsRes[0].count }
    const appointments = parseInt(appointmentsRes[0].count)
    const prayers = parseInt(prayersRes[0].count)
    const testimonies = parseInt(testimoniesRes[0].count)

    // Récupérer l'activité récente
    const donationsRecentRes = await sql`SELECT id, amount, created_at, donation_type FROM donations WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 3`
    const appointmentsRecentRes = await sql`SELECT id, appointment_date, created_at, status FROM appointments WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 2`
    const prayersRecentRes = await sql`SELECT id, title, created_at FROM prayers WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 2`
    const recentActivity = [
      ...donationsRecentRes.map((donation: any) => ({
        id: donation.id,
        type: 'donation' as const,
        title: 'Don effectué',
        description: `${donation.donation_type} • $${donation.amount}`,
        date: new Date(donation.created_at).toISOString()
      })),
      ...appointmentsRecentRes.map((appointment: any) => ({
        id: appointment.id,
        type: 'appointment' as const,
        title: 'Rendez-vous',
        description: `${appointment.status === 'CONFIRMED' ? 'Confirmé' : 'En attente'}`,
        date: new Date(appointment.created_at).toISOString()
      })),
      ...prayersRecentRes.map((prayer: any) => ({
        id: prayer.id,
        type: 'prayer' as const,
        title: 'Intention de prière',
        description: prayer.title,
        date: new Date(prayer.created_at).toISOString()
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

    const userProfile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      membershipNumber: user.membershipNumber,
      membershipDate: user.createdAt.toLocaleDateString('fr-FR'),
      role: user.role,
      stats: {
        totalDonations: donations._sum.amount || 0,
        appointments: appointments,
        prayerIntentions: prayers,
        testimonies: testimonies
      },
  recentActivity: recentActivity
    }

    return NextResponse.json({ success: true, profile: userProfile })
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour le profil utilisateur
export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAuthentication(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const user = auth.user!
    const body = await request.json()
    
    const { firstName, lastName, email, phone, profileImageUrl } = body

    // Validation des données
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Prénom, nom et email sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'email n'est pas déjà utilisé par un autre utilisateur
    if (email !== user.email) {
      const existingUserRes = await sql`SELECT id FROM users WHERE email = ${email}`
      const existingUser = existingUserRes[0]
      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé' },
          { status: 400 }
        )
      }
    }
    // Mettre à jour l'utilisateur
    const updatedUserRes = await sql`
      UPDATE users SET first_name = ${firstName}, last_name = ${lastName}, email = ${email}, phone = ${phone}, profile_image_url = ${profileImageUrl} WHERE id = ${user.id} RETURNING *
    `
    const updatedUser = updatedUserRes[0]

    return NextResponse.json({ 
      success: true, 
      message: 'Profil mis à jour avec succès',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        profileImageUrl: updatedUser.profileImageUrl
      }
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    )
  }
}