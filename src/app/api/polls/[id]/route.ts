import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyAuthentication } from '../../../../lib/auth-middleware'

// PUT - Modifier un sondage (Admin/Pastor seulement)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params
    const body = await request.json()
    const { title, description, isActive, expiresAt } = body

    // Vérifier que le sondage existe
    const existingPoll = await prisma.poll.findUnique({
      where: { id }
    })

    if (!existingPoll) {
      return NextResponse.json({
        error: 'Sondage non trouvé'
      }, { status: 404 })
    }

    // Mise à jour du sondage
    const updatedPoll = await prisma.poll.update({
      where: { id },
      data: {
        title: title || existingPoll.title,
        description: description !== undefined ? description : existingPoll.description,
        isActive: isActive !== undefined ? isActive : existingPoll.isActive,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : existingPoll.expiresAt
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
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { votes: true }
            }
          }
        },
        _count: {
          select: { votes: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      poll: updatedPoll
    })
  } catch (error) {
    console.error('Erreur lors de la modification du sondage:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

// DELETE - Supprimer un sondage (Admin seulement)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuthentication(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    // Vérifier les permissions (seuls les admins peuvent supprimer)
    if (auth.user!.role !== 'ADMIN') {
      return NextResponse.json({
        error: 'Accès non autorisé - Droits administrateur requis'
      }, { status: 403 })
    }

    const { id } = params

    // Vérifier que le sondage existe
    const existingPoll = await prisma.poll.findUnique({
      where: { id },
      include: {
        _count: {
          select: { votes: true }
        }
      }
    })

    if (!existingPoll) {
      return NextResponse.json({
        error: 'Sondage non trouvé'
      }, { status: 404 })
    }

    // Supprimer le sondage (cascade supprime automatiquement les options et votes)
    await prisma.poll.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: `Sondage supprimé avec succès (${existingPoll._count.votes} votes supprimés)`
    })
  } catch (error) {
    console.error('Erreur lors de la suppression du sondage:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

// GET - Récupérer un sondage spécifique avec statistiques détaillées
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuthentication(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const { id } = params

    const poll = await prisma.poll.findUnique({
      where: { id },
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
            votes: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            },
            _count: {
              select: { votes: true }
            }
          }
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            option: true
          }
        }
      }
    })

    if (!poll) {
      return NextResponse.json({
        error: 'Sondage non trouvé'
      }, { status: 404 })
    }

    // Calculer les statistiques
    const totalVotes = poll.votes.length
    const userVotes = poll.votes.filter(vote => vote.userId === auth.user!.id)
    const hasVoted = userVotes.length > 0
    const isExpired = poll.expiresAt ? new Date(poll.expiresAt) < new Date() : false

    const optionsWithStats = poll.options.map(option => ({
      ...option,
      voteCount: option._count.votes,
      percentage: totalVotes > 0 ? Math.round((option._count.votes / totalVotes) * 100) : 0,
      voters: poll.isAnonymous ? [] : option.votes.map(vote => vote.user)
    }))

    return NextResponse.json({
      success: true,
      poll: {
        ...poll,
        totalVotes,
        hasVoted,
        userVotes,
        isExpired,
        options: optionsWithStats
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du sondage:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}