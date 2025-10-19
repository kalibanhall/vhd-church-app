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
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Vérification JWT du rôle utilisateur par cookies
async function checkUserRole(request: NextRequest, requiredRoles?: string[]) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    // Si pas de token, accès public (lecture seulement)
    if (!token) {
      return { user: null }
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    
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
    console.error('Erreur lors de la vérification JWT:', error)
    return { error: 'Token invalide', status: 401 }
  }
}

// GET - Récupérer tous les événements/cultes
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API /api/events appelée')
    
    const { searchParams } = new URL(request.url)
    const upcoming = searchParams.get('upcoming') === 'true'
    const homepage = searchParams.get('homepage') === 'true'
    const past = searchParams.get('past') === 'true'
    
    let whereClause: any = {}
    if (upcoming) {
      whereClause.eventDate = {
        gte: new Date()
      }
    }

    if (past) {
      whereClause.eventDate = {
        lt: new Date()
      }
    }

    if (homepage) {
      whereClause.showOnHomepage = true
    }

    console.log('📅 Recherche événements avec:', whereClause)

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        pastor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true
          }
        },
        attendances: {
          select: {
            id: true
          }
        },
        sermons: {
          select: {
            id: true,
            title: true,
            sermonType: true,
            durationMinutes: true,
            isPublished: true,
            viewCount: true,
            downloadCount: true,
            audioUrl: true,
            videoUrl: true,
            thumbnailUrl: true
          }
        }
      },
      orderBy: {
        eventDate: past ? 'desc' : 'asc' // Plus récents d'abord pour les événements passés
      }
    })

    console.log('📊 Événements trouvés:', events.length)

    const formattedEvents = events.map((event: any) => {
      // Formater les heures pour les inputs HTML
      const formatTime = (dateTime: Date | string) => {
        if (!dateTime) return ''
        const date = new Date(dateTime)
        return date.toTimeString().slice(0, 5) // HH:mm
      }

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        eventDate: event.eventDate.toISOString().split('T')[0], // YYYY-MM-DD pour input date
        startTime: formatTime(event.startTime),
        endTime: formatTime(event.endTime),
        eventType: event.eventType,
        location: event.location,
        status: event.status,
        maxAttendees: event.maxAttendees,
        currentAttendees: event.currentAttendees || event.attendances?.length || 0,
        isLive: event.status === 'IN_PROGRESS',
        liveUrl: event.eventImageUrl, // Réutilisé pour l'URL de stream
        showOnHomepage: event.showOnHomepage,
        animatedBy: event.animatedBy, // ID du pasteur qui anime
        pastor: event.pastor, // Données du pasteur qui anime
        creator: event.creator, // Données de l'utilisateur créateur
        createdBy: event.createdBy, // ID du créateur
        sermons: event.sermons || [], // Prédications associées
        createdAt: event.createdAt
      }
    })

    return NextResponse.json({ 
      success: true, 
      events: formattedEvents 
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, { status: 500 })
  }
}

// POST - Créer un nouvel événement/culte (ADMIN, OUVRIER, PASTEUR)
export async function POST(request: NextRequest) {
  try {
    const auth = await checkUserRole(request, ['ADMIN', 'OUVRIER', 'PASTEUR'])
    if (auth.error) {
      return NextResponse.json({ 
        success: false, 
        error: auth.error 
      }, { status: auth.status })
    }

    const dbUser = auth.user
    
    if (!dbUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentification requise pour créer un événement' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title, 
      description, 
      eventDate, 
      startTime, 
      endTime, 
      eventType, 
      location, 
      maxAttendees,
      liveUrl,
      showOnHomepage,
      animatedBy 
    } = body

    // Validation des champs requis
    if (!title || !eventDate || !startTime || !eventType) {
      return NextResponse.json({ 
        success: false, 
        error: 'Champs requis manquants' 
      }, { status: 400 })
    }

    // Créer une date complète en combinant eventDate et startTime
    const eventDateTime = new Date(eventDate)
    const [hours, minutes] = startTime.split(':')
    eventDateTime.setHours(parseInt(hours), parseInt(minutes))
    
    let endDateTime = null
    if (endTime) {
      const [endHours, endMinutes] = endTime.split(':')
      endDateTime = new Date(eventDate)
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes))
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        eventDate: new Date(eventDate),
        startTime: eventDateTime,
        endTime: endDateTime,
        eventType,
        location,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
        status: 'SCHEDULED',
        createdBy: dbUser?.id || auth.user.id,
        animatedBy: animatedBy || null, // ID du pasteur qui anime le culte
        eventImageUrl: liveUrl || null, // URL de stream stockée ici
        showOnHomepage: showOnHomepage !== undefined ? Boolean(showOnHomepage) : true
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      event: newEvent 
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la création' 
    }, { status: 500 })
  }
}

// PUT - Mettre à jour un événement
export async function PUT(request: NextRequest) {
  try {
    const auth = await checkUserRole(request, ['ADMIN', 'OUVRIER', 'PASTEUR'])
    if (auth.error) {
      return NextResponse.json({ 
        success: false, 
        error: auth.error 
      }, { status: auth.status })
    }

    if (!auth.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentification requise pour modifier un événement' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { 
      id, 
      status, 
      liveUrl, 
      eventDate, 
      startTime, 
      endTime,
      maxAttendees,
      ...updateData 
    } = body

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID de l\'événement requis' 
      }, { status: 400 })
    }

    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id }
    })

    if (!event) {
      return NextResponse.json({ 
        success: false, 
        error: 'Événement non trouvé' 
      }, { status: 404 })
    }

    // Traitement des dates similaire à l'API POST
    // Filtrer les champs valides du schéma Prisma Event
    const validEventFields = [
      'title', 'description', 'eventType', 'location', 'isRecurring', 
      'recurringPattern', 'showOnHomepage', 'animatedBy'
    ]
    let processedUpdateData: any = {}
    for (const [key, value] of Object.entries(updateData)) {
      if (validEventFields.includes(key)) {
        processedUpdateData[key] = value
      }
    }
    
    if (eventDate) {
      processedUpdateData.eventDate = new Date(eventDate)
      
      if (startTime) {
        const eventDateTime = new Date(eventDate)
        const [hours, minutes] = startTime.split(':')
        eventDateTime.setHours(parseInt(hours), parseInt(minutes))
        processedUpdateData.startTime = eventDateTime
      }
      
      if (endTime) {
        const endDateTime = new Date(eventDate)
        const [endHours, endMinutes] = endTime.split(':')
        endDateTime.setHours(parseInt(endHours), parseInt(endMinutes))
        processedUpdateData.endTime = endDateTime
      }
    }
    
    if (maxAttendees) {
      processedUpdateData.maxAttendees = parseInt(maxAttendees)
    }

    // Les ADMIN, OUVRIER, PASTEUR peuvent modifier tous les événements

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...processedUpdateData,
        status: status || event.status,
        eventImageUrl: liveUrl || event.eventImageUrl,
        updatedAt: new Date()
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      event: updatedEvent 
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la mise à jour' 
    }, { status: 500 })
  }
}

// DELETE - Supprimer un événement
export async function DELETE(request: NextRequest) {
  try {
    const auth = await checkUserRole(request, ['ADMIN', 'OUVRIER', 'PASTEUR'])
    if (auth.error) {
      return NextResponse.json({ 
        success: false, 
        error: auth.error 
      }, { status: auth.status })
    }

    if (!auth.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentification requise pour supprimer un événement' 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID de l\'événement requis' 
      }, { status: 400 })
    }

    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id }
    })

    if (!event) {
      return NextResponse.json({ 
        success: false, 
        error: 'Événement non trouvé' 
      }, { status: 404 })
    }

    // Les ADMIN, OUVRIER, PASTEUR peuvent supprimer tous les événements

    await prisma.event.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Événement supprimé avec succès' 
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la suppression' 
    }, { status: 500 })
  }
}