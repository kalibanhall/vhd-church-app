import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// POST - Ajouter/Retirer un like sur un témoignage
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

    // Vérifier si l'utilisateur a déjà liké ce témoignage
    const existingLike = await prisma.testimonyLike.findUnique({
      where: {
        testimonyId_userId: {
          testimonyId,
          userId
        }
      }
    })

    if (existingLike) {
      // Si existe déjà, supprimer le like (toggle)
      await prisma.testimonyLike.delete({
        where: { id: existingLike.id }
      })

      return NextResponse.json({ 
        message: 'Like retiré',
        action: 'removed'
      })
    } else {
      // Ajouter le like
      await prisma.testimonyLike.create({
        data: {
          testimonyId,
          userId
        }
      })

      return NextResponse.json({ 
        message: 'Like ajouté',
        action: 'added'
      })
    }

  } catch (error) {
    console.error('Erreur lors de la gestion du like:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la gestion du like' },
      { status: 500 }
    )
  }
}