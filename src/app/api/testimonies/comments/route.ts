import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// GET - Récupérer les commentaires d'un témoignage
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testimonyId = searchParams.get('testimonyId')

    if (!testimonyId) {
      return NextResponse.json(
        { error: 'ID du témoignage requis' },
        { status: 400 }
      )
    }

    const comments = await prisma.testimonyComment.findMany({
      where: {
        testimonyId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        id: comment.user.id,
        name: `${comment.user.firstName} ${comment.user.lastName}`
      }
    }))

    return NextResponse.json(formattedComments)

  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commentaires' },
      { status: 500 }
    )
  }
}

// POST - Ajouter un commentaire à un témoignage
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const testimonyId = searchParams.get('testimonyId')

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 401 }
      )
    }

    if (!testimonyId) {
      return NextResponse.json(
        { error: 'ID du témoignage requis' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { content } = body

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Le contenu du commentaire est requis' },
        { status: 400 }
      )
    }

    const comment = await prisma.testimonyComment.create({
      data: {
        testimonyId,
        userId,
        content: content.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    const formattedComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        id: comment.user.id,
        name: `${comment.user.firstName} ${comment.user.lastName}`
      }
    }

    return NextResponse.json(formattedComment, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du commentaire' },
      { status: 500 }
    )
  }
}