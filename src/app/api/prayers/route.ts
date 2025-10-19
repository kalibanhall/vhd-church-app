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

// Fonction pour vérifier les permissions utilisateur
async function checkUserPermission(userId: string, action: 'read' | 'create' | 'moderate') {
  if (!userId) {
    return { error: 'ID utilisateur requis', status: 401 }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, firstName: true, lastName: true }
    })

    if (!user) {
      return { error: 'Utilisateur non trouvé', status: 404 }
    }

    // Permissions par action
    if (action === 'moderate' && !['ADMIN', 'PASTOR', 'OUVRIER'].includes(user.role)) {
      return { error: 'Accès non autorisé - Droits de modération requis', status: 403 }
    }

    return { user, status: 200 }
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions:', error)
    return { error: 'Erreur serveur', status: 500 }
  }
}

// GET - Récupérer les prières
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status') // 'pending', 'approved', 'all'
    const userOnly = searchParams.get('userOnly') === 'true'

    // Vérification des permissions
    const auth = await checkUserPermission(userId || '', 'read')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Construction de la requête
    let whereClause: any = {}

    // Filtres par statut
    if (status === 'pending') {
      whereClause.status = 'PENDING'
    } else if (status === 'approved') {
      whereClause.status = 'APPROVED'
    }

    // Filtrer par utilisateur si demandé
    if (userOnly) {
      whereClause.userId = userId
    } else {
      // Pour les prières publiques seulement (sauf pour modération)
      if (status !== 'pending') {
        whereClause.isPublic = true
        whereClause.status = 'APPROVED'
      }
    }

    const prayers = await prisma.prayer.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        supporters: userId ? {
          where: {
            userId: userId
          },
          select: {
            id: true
          }
        } : undefined,
        _count: {
          select: {
            supporters: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Anonymiser les données si nécessaire
    const formattedPrayers = prayers.map((prayer: any) => ({
      id: prayer.id,
      title: prayer.title,
      content: prayer.content,
      isAnonymous: prayer.isAnonymous || false,
      isPublic: prayer.isPublic,
      status: prayer.status,
      prayerDate: prayer.createdAt,
      prayerCount: prayer._count.supporters,
      hasUserPrayed: prayer.supporters.length > 0,
      userId: prayer.userId,
      userName: prayer.isAnonymous ? 'Anonyme' : `${prayer.user.firstName} ${prayer.user.lastName}`,
      canEdit: prayer.userId === userId || auth.user?.role === 'ADMIN' || auth.user?.role === 'PASTEUR'
    }))

    return NextResponse.json(formattedPrayers)

  } catch (error) {
    console.error('Erreur lors de la récupération des prières:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des prières' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle prière
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Vérification des permissions
    const auth = await checkUserPermission(userId || '', 'create')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { title, content, isAnonymous, isPublic } = body

    // Validation des données
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Titre et contenu requis' },
        { status: 400 }
      )
    }

    // Créer la prière
    const prayer = await prisma.prayer.create({
      data: {
        title,
        content,
        isAnonymous: isAnonymous || false,
        isPublic: isPublic || false,
        userId: userId!,
        category: 'GENERAL',
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json({
      ...prayer,
      userName: prayer.isAnonymous ? 'Anonyme' : `${prayer.user.firstName} ${prayer.user.lastName}`
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création de la prière:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la prière' },
      { status: 500 }
    )
  }
}

// PATCH - Modérer une prière (approuver/rejeter)
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Vérification des permissions de modération
    const auth = await checkUserPermission(userId || '', 'moderate')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { prayerId, action } = body // 'approve' ou 'reject'

    if (!prayerId) {
      return NextResponse.json(
        { error: 'ID de la prière requis' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action invalide. Utilisez "approve" ou "reject"' },
        { status: 400 }
      )
    }

    // Mettre à jour le statut
    const updatedPrayer = await prisma.prayer.update({
      where: { id: prayerId },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        approvedBy: action === 'approve' ? userId : null,
        approvedAt: action === 'approve' ? new Date() : null
      }
    })

    return NextResponse.json(updatedPrayer)

  } catch (error) {
    console.error('Erreur lors de la modération de la prière:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modération de la prière' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une prière
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const prayerId = searchParams.get('id')

    // Vérification des permissions
    const auth = await checkUserPermission(userId || '', 'moderate')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    if (!prayerId) {
      return NextResponse.json(
        { error: 'ID de la prière requis' },
        { status: 400 }
      )
    }

    await prisma.prayer.delete({
      where: { id: prayerId }
    })

    return NextResponse.json({ message: 'Prière supprimée avec succès' })

  } catch (error) {
    console.error('Erreur lors de la suppression de la prière:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la prière' },
      { status: 500 }
    )
  }
}