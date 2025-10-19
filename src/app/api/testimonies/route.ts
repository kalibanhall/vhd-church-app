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

// GET - Récupérer les témoignages
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
      whereClause.isApproved = false
    } else if (status === 'approved') {
      whereClause.isApproved = true
    }

    // Filtrer par utilisateur si demandé
    if (userOnly) {
      whereClause.userId = userId
    } else {
      // Pour les témoignages approuvés seulement (sauf pour modération)
      if (status !== 'pending') {
        whereClause.isApproved = true
        whereClause.isPublished = true
      }
    }

    const testimonies = await prisma.testimony.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Anonymiser les données si nécessaire
    const formattedTestimonies = testimonies.map((testimony: any) => ({
      id: testimony.id,
      title: testimony.title,
      content: testimony.content,
      isAnonymous: testimony.isAnonymous || false,
      isApproved: testimony.isApproved,
      isPublished: testimony.isPublished,
      status: testimony.isApproved ? 'APPROVED' : 'PENDING',
      testimonyDate: testimony.createdAt,
      likeCount: testimony._count.likes,
      commentCount: testimony._count.comments,
      viewCount: testimony.viewCount || 0,
      userId: testimony.userId,
      userName: testimony.isAnonymous ? 'Anonyme' : `${testimony.user.firstName} ${testimony.user.lastName}`,
      canEdit: testimony.userId === userId || auth.user?.role === 'ADMIN' || auth.user?.role === 'PASTEUR'
    }))

    return NextResponse.json(formattedTestimonies)

  } catch (error) {
    console.error('Erreur lors de la récupération des témoignages:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des témoignages' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau témoignage
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
    const { title, content, isAnonymous } = body

    // Validation des données
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Titre et contenu requis' },
        { status: 400 }
      )
    }

    // Créer le témoignage
    const testimony = await prisma.testimony.create({
      data: {
        title,
        content,
        isAnonymous: isAnonymous || false,
        isApproved: false, // Tous les témoignages nécessitent une approbation
        isPublished: false,
        userId: userId!,
        category: 'HEALING'
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
      ...testimony,
      userName: testimony.isAnonymous ? 'Anonyme' : `${testimony.user.firstName} ${testimony.user.lastName}`
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création du témoignage:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du témoignage' },
      { status: 500 }
    )
  }
}

// PATCH - Modérer un témoignage (approuver/rejeter)
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const testimonyId = searchParams.get('id')

    // Vérification des permissions de modération
    const auth = await checkUserPermission(userId || '', 'moderate')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    if (!testimonyId) {
      return NextResponse.json(
        { error: 'ID du témoignage requis' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { action } = body // 'approve' ou 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action invalide. Utilisez "approve" ou "reject"' },
        { status: 400 }
      )
    }

    // Mettre à jour le statut
    const updatedTestimony = await prisma.testimony.update({
      where: { id: testimonyId },
      data: {
        isApproved: action === 'approve',
        isPublished: action === 'approve',
        approvedBy: action === 'approve' ? userId : null,
        approvedAt: action === 'approve' ? new Date() : null,
        publishedAt: action === 'approve' ? new Date() : null
      }
    })

    return NextResponse.json(updatedTestimony)

  } catch (error) {
    console.error('Erreur lors de la modération du témoignage:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modération du témoignage' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un témoignage
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const testimonyId = searchParams.get('id')

    // Vérification des permissions
    const auth = await checkUserPermission(userId || '', 'moderate')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    if (!testimonyId) {
      return NextResponse.json(
        { error: 'ID du témoignage requis' },
        { status: 400 }
      )
    }

    await prisma.testimony.delete({
      where: { id: testimonyId }
    })

    return NextResponse.json({ message: 'Témoignage supprimé avec succès' })

  } catch (error) {
    console.error('Erreur lors de la suppression du témoignage:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du témoignage' },
      { status: 500 }
    )
  }
}