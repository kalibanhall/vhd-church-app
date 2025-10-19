import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        profileImageUrl: true,
        membershipNumber: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    // Récupérer les statistiques de l'utilisateur
    const [donations, appointments, prayers, testimonies] = await Promise.all([
      // Total des dons
      prisma.donation.aggregate({
        where: { userId: user.id },
        _sum: { amount: true },
        _count: true
      }),
      
      // Rendez-vous
      prisma.appointment.count({
        where: { userId: user.id }
      }),
      
      // Intentions de prière
      prisma.prayer.count({
        where: { userId: user.id }
      }),
      
      // Témoignages
      prisma.testimony.count({
        where: { userId: user.id }
      })
    ])

    // Récupérer l'activité récente
    const recentActivity = await Promise.all([
      // Dons récents
      prisma.donation.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          amount: true,
          createdAt: true,
          donationType: true
        }
      }),
      
      // Rendez-vous récents
      prisma.appointment.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 2,
        select: {
          id: true,
          appointmentDate: true,
          createdAt: true,
          status: true
        }
      }),
      
      // Intentions de prière récentes
      prisma.prayer.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 2,
        select: {
          id: true,
          title: true,
          createdAt: true
        }
      })
    ])

    // Formatter l'activité récente
    const formattedActivity = [
      ...recentActivity[0].map((donation: any) => ({
        id: donation.id,
        type: 'donation' as const,
        title: 'Don effectué',
        description: `${donation.donationType} • $${donation.amount}`,
        date: donation.createdAt.toISOString()
      })),
      ...recentActivity[1].map((appointment: any) => ({
        id: appointment.id,
        type: 'appointment' as const,
        title: 'Rendez-vous',
        description: `${appointment.status === 'CONFIRMED' ? 'Confirmé' : 'En attente'}`,
        date: appointment.createdAt.toISOString()
      })),
      ...recentActivity[2].map((prayer: any) => ({
        id: prayer.id,
        type: 'prayer' as const,
        title: 'Intention de prière',
        description: prayer.title,
        date: prayer.createdAt.toISOString()
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
      recentActivity: formattedActivity
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
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      
      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé' },
          { status: 400 }
        )
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        profileImageUrl
      }
    })

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