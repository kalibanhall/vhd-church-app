import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { verifyAuthentication } from '@/lib/auth-middleware'

// Vérification du rôle utilisateur avec nouvelle authentification
async function checkUserRole(request: NextRequest, requiredRoles?: string[]) {
  try {
    const authResult = await verifyAuthentication(request)
    
    // Si pas d'authentification, accès public (lecture seulement)
    if (!authResult.success) {
      return { user: null }
    }
    
    const user = authResult.user
    
    if (!user) {
      return { error: 'Utilisateur introuvable', status: 404 }
    }

    // Vérifier les rôles si spécifiés (ADMIN, OUVRIER, PASTEUR peuvent tout faire)
    if (requiredRoles && !['ADMIN', 'OUVRIER', 'PASTEUR'].includes(user.role)) {
      return { 
        error: `Accès réservé aux administrateurs, ouvriers et pasteurs. Votre rôle: ${user.role}`, 
        status: 403 
      }
    }

    return { user }
  } catch (error) {
    return { error: 'Erreur lors de la vérification', status: 500 }
  }
}

// GET - Récupérer toutes les prédications (accès public)
export async function GET(request: NextRequest) {
  try {
    // Vérification simple du rôle (optionnelle)
    const auth = await checkUserRole(request)
    const user = auth.user

    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published') !== 'false' // Par défaut, n'afficher que les publiées
    const pastorId = searchParams.get('pastorId')
    const type = searchParams.get('type')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    
    // Si pas d'utilisateur connecté, ne montrer que les prédications publiées
    const showOnlyPublished = !user || published

    const whereClause: any = {}
    
    // Par défaut, ne montrer que les prédications publiées (accès public)
    // Seuls les admin/pasteur/ouvriers peuvent voir les non-publiées avec published=false
    if (showOnlyPublished || 
        (user?.role === 'FIDELE') ||
        (!user && !published)) {
      whereClause.isPublished = true
    } else if (published !== undefined) {
      whereClause.isPublished = published
    }

    if (pastorId) {
      whereClause.pastorId = pastorId
    }

    if (type) {
      whereClause.sermonType = type
    }

    const sermons = await prisma.sermon.findMany({
      where: whereClause,
      include: {
        pastor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            eventType: true,
            status: true,
            eventDate: true,
            location: true
          }
        }
      },
      orderBy: {
        sermonDate: 'desc'
      },
      take: limit
    })

    // Formater les données pour correspondre au frontend
    const formattedSermons = sermons.map((sermon: any) => ({
      id: sermon.id,
      title: sermon.title,
      pastorName: `${sermon.pastor.firstName} ${sermon.pastor.lastName}`,
      preacher: `${sermon.pastor.firstName} ${sermon.pastor.lastName}`,
      preachingDate: sermon.sermonDate.toISOString(),
      sermonDate: sermon.sermonDate.toISOString(),
      duration: sermon.durationMinutes ? `${sermon.durationMinutes}min` : '0min',
      preachingType: sermon.sermonType,
      description: sermon.description || '',
      bibleVerses: sermon.bibleVerses || '',
      audioUrl: sermon.audioUrl,
      videoUrl: sermon.videoUrl,
      thumbnailUrl: sermon.thumbnailUrl,
      isLive: sermon.sermonType === 'LIVE_STREAM' && sermon.isPublished,
      viewCount: sermon.viewCount,
      downloadCount: sermon.downloadCount,
      isPublished: sermon.isPublished,
      event: sermon.event ? {
        id: sermon.event.id,
        title: sermon.event.title,
        eventType: sermon.event.eventType,
        status: sermon.event.status,
        isLive: sermon.event.status === 'ONGOING',
        eventDate: sermon.event.eventDate.toISOString(),
        location: sermon.event.location || ''
      } : undefined
    }))

    return NextResponse.json({
      success: true,
      preachings: formattedSermons
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des prédications:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer une nouvelle prédication (ADMIN, OUVRIER, PASTEUR)
export async function POST(request: NextRequest) {
  try {
    const auth = await checkUserRole(request, ['ADMIN', 'OUVRIER', 'PASTEUR'])
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const {
      title,
      eventId,
      sermonDate,
      sermonType,
      durationMinutes,
      audioUrl,
      videoUrl,
      thumbnailUrl,
      description,
      bibleVerses,
      sermonNotes,
      isPublished
    } = body

    // Validation des données requises
    if (!title || !sermonDate || !sermonType) {
      return NextResponse.json(
        { error: 'Titre, date et type de prédication sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur est connecté
    if (!auth.user) {
      return NextResponse.json(
        { error: 'Authentification requise pour créer une prédication' },
        { status: 401 }
      )
    }

    // Utiliser l'ID de l'utilisateur connecté comme pasteur
    const pastorId = auth.user.id

    const sermon = await prisma.sermon.create({
      data: {
        title,
        pastorId: pastorId,
        eventId,
        sermonDate: new Date(sermonDate),
        sermonType,
        durationMinutes,
        audioUrl,
        videoUrl,
        thumbnailUrl,
        description,
        bibleVerses,
        sermonNotes,
        isPublished: isPublished || false
      },
      include: {
        pastor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        event: true
      }
    })

    return NextResponse.json({
      message: 'Prédication créée avec succès',
      sermon
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création de la prédication:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Modifier une prédication (ADMIN, OUVRIER, PASTEUR)
export async function PUT(request: NextRequest) {
  try {
    const auth = await checkUserRole(request, ['ADMIN', 'OUVRIER', 'PASTEUR'])
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'ID de prédication requis' }, { status: 400 })
    }

    // Vérifier que la prédication existe
    const existingSermon = await prisma.sermon.findUnique({
      where: { id }
    })

    if (!existingSermon) {
      return NextResponse.json({ error: 'Prédication introuvable' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est connecté
    if (!auth.user) {
      return NextResponse.json(
        { error: 'Authentification requise pour modifier une prédication' },
        { status: 401 }
      )
    }

    // Seul le pasteur créateur ou un admin peut modifier
    if (existingSermon.pastorId !== auth.user.id && auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Vous ne pouvez modifier que vos propres prédications' },
        { status: 403 }
      )
    }

    // Préparer les données de mise à jour
    const dataToUpdate: any = { ...updateData }
    if (dataToUpdate.sermonDate) {
      dataToUpdate.sermonDate = new Date(dataToUpdate.sermonDate)
    }

    const updatedSermon = await prisma.sermon.update({
      where: { id },
      data: dataToUpdate,
      include: {
        pastor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        event: true
      }
    })

    return NextResponse.json({
      message: 'Prédication mise à jour avec succès',
      sermon: updatedSermon
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la prédication:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer une prédication (ADMIN, OUVRIER, PASTEUR)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID de prédication requis' }, { status: 400 })
    }

    // Vérifier que la prédication existe
    const existingSermon = await prisma.sermon.findUnique({
      where: { id }
    })

    if (!existingSermon) {
      return NextResponse.json({ error: 'Prédication introuvable' }, { status: 404 })
    }

    // Vérification du rôle utilisateur
    const auth = await checkUserRole(request, ['ADMIN', 'OUVRIER', 'PASTEUR'])
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Vérifier que l'utilisateur est connecté
    if (!auth.user) {
      return NextResponse.json(
        { error: 'Authentification requise pour supprimer une prédication' },
        { status: 401 }
      )
    }

    // Les ADMIN, OUVRIER, PASTEUR peuvent supprimer n'importe quelle prédication
    if (!['ADMIN', 'OUVRIER', 'PASTEUR'].includes(auth.user.role)) {
      return NextResponse.json(
        { error: 'Seuls les administrateurs, ouvriers et pasteurs peuvent supprimer des prédications' },
        { status: 403 }
      )
    }

    await prisma.sermon.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Prédication supprimée avec succès',
      deleted: {
        id: existingSermon.id,
        title: existingSermon.title
      }
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de la prédication:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}