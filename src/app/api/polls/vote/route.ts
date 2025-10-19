import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyAuthentication } from '../../../../lib/auth-middleware'

// POST - Voter pour un sondage
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthentication(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const body = await request.json()
    const { pollId, optionIds } = body

    if (!pollId || !optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
      return NextResponse.json({
        error: 'ID du sondage et options sélectionnées requises'
      }, { status: 400 })
    }

    // Vérifier que le sondage existe et n'est pas expiré
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true }
    })

    if (!poll) {
      return NextResponse.json({
        error: 'Sondage non trouvé'
      }, { status: 404 })
    }

    if (!poll.isActive) {
      return NextResponse.json({
        error: 'Ce sondage n\'est plus actif'
      }, { status: 400 })
    }

    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return NextResponse.json({
        error: 'Ce sondage a expiré'
      }, { status: 400 })
    }

    // Vérifier si l'utilisateur a déjà voté
    const existingVotes = await prisma.pollVote.findMany({
      where: {
        pollId,
        userId: auth.user!.id
      }
    })

    // Si le sondage n'autorise pas les votes multiples et l'utilisateur a déjà voté
    if (!poll.allowMultiple && existingVotes.length > 0) {
      // Supprimer les anciens votes
      await prisma.pollVote.deleteMany({
        where: {
          pollId,
          userId: auth.user!.id
        }
      })
    }

    // Si le sondage autorise les votes multiples, vérifier qu'on ne vote pas plusieurs fois pour la même option
    if (poll.allowMultiple && optionIds.length !== new Set(optionIds).size) {
      return NextResponse.json({
        error: 'Impossible de voter plusieurs fois pour la même option'
      }, { status: 400 })
    }

    // Vérifier que toutes les options appartiennent au sondage
    const validOptionIds = poll.options.map(option => option.id)
    const invalidOptions = optionIds.filter((id: string) => !validOptionIds.includes(id))
    
    if (invalidOptions.length > 0) {
      return NextResponse.json({
        error: 'Une ou plusieurs options sélectionnées n\'appartiennent pas à ce sondage'
      }, { status: 400 })
    }

    // Créer les nouveaux votes
    const votes = await Promise.all(
      optionIds.map((optionId: string) =>
        prisma.pollVote.create({
          data: {
            pollId,
            optionId,
            userId: auth.user!.id
          },
          include: {
            option: true
          }
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: 'Vote enregistré avec succès',
      votes
    })
  } catch (error) {
    console.error('Erreur lors du vote:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

// DELETE - Retirer son vote d'un sondage
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAuthentication(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const { searchParams } = new URL(request.url)
    const pollId = searchParams.get('pollId')

    if (!pollId) {
      return NextResponse.json({
        error: 'ID du sondage requis'
      }, { status: 400 })
    }

    // Supprimer tous les votes de l'utilisateur pour ce sondage
    const deletedVotes = await prisma.pollVote.deleteMany({
      where: {
        pollId,
        userId: auth.user!.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Vote retiré avec succès',
      deletedCount: deletedVotes.count
    })
  } catch (error) {
    console.error('Erreur lors du retrait du vote:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}