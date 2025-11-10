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
import { verifyAuthentication } from '../../../lib/auth-middleware'

// GET - Récupérer tous les sondages actifs
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuthentication(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeExpired = searchParams.get('includeExpired') === 'true'
    const onlyMine = searchParams.get('onlyMine') === 'true'

    const where: any = {}
    
    if (!includeExpired) {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    }

    if (onlyMine) {
      where.creatorId = auth.user!.id
    }

    const polls = await prisma.poll.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        options: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { votes: true }
            }
          }
        },
        _count: {
          select: { votes: true }
        },
        votes: {
          where: { userId: auth.user!.id },
          include: {
            option: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculer les statistiques pour chaque sondage
    const pollsWithStats = polls.map(poll => ({
      ...poll,
      totalVotes: poll._count.votes,
      hasVoted: poll.votes.length > 0,
      userVotes: poll.votes,
      isExpired: poll.expiresAt ? new Date(poll.expiresAt) < new Date() : false
    }))

    return NextResponse.json({
      success: true,
      polls: pollsWithStats
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des sondages:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

// POST - Créer un nouveau sondage (Admin/Pastor seulement)
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthentication(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    // Vérifier les permissions
    if (!['ADMIN', 'PASTEUR', 'PASTOR'].includes(auth.user!.role)) {
      return NextResponse.json({
        error: 'Accès non autorisé - Droits administrateur requis'
      }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, options, isAnonymous = false, allowMultiple = false, expiresAt } = body

    if (!title || !options || options.length < 2) {
      return NextResponse.json({
        error: 'Titre et au moins 2 options sont requis'
      }, { status: 400 })
    }

    // Créer le sondage avec les options
    const poll = await prisma.poll.create({
      data: {
        title,
        description,
        creatorId: auth.user!.id,
        isAnonymous,
        allowMultiple,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        options: {
          create: options.map((option: string, index: number) => ({
            text: option,
            order: index
          }))
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        options: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json({
      success: true,
      poll
    })
  } catch (error) {
    console.error('Erreur lors de la création du sondage:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}