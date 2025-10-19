import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// POST - Ajouter un support de prière (Je prie pour cette intention)
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const prayerId = searchParams.get('prayerId')

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 401 }
      )
    }

    if (!prayerId) {
      return NextResponse.json(
        { error: 'ID de la prière requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur a déjà prié pour cette intention
    const existingSupport = await prisma.prayerSupport.findUnique({
      where: {
        prayerId_userId: {
          prayerId,
          userId
        }
      }
    })

    if (existingSupport) {
      // Si existe déjà, supprimer le support (toggle)
      await prisma.prayerSupport.delete({
        where: { id: existingSupport.id }
      })

      // Décrémenter le compteur
      await prisma.prayer.update({
        where: { id: prayerId },
        data: {
          prayerCount: {
            decrement: 1
          }
        }
      })

      return NextResponse.json({ 
        message: 'Support de prière retiré',
        action: 'removed'
      })
    } else {
      // Ajouter le support
      await prisma.prayerSupport.create({
        data: {
          prayerId,
          userId
        }
      })

      // Incrémenter le compteur
      await prisma.prayer.update({
        where: { id: prayerId },
        data: {
          prayerCount: {
            increment: 1
          }
        }
      })

      return NextResponse.json({ 
        message: 'Je prie pour cette intention ajouté',
        action: 'added'
      })
    }

  } catch (error) {
    console.error('Erreur lors de l\'ajout du support de prière:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout du support de prière' },
      { status: 500 }
    )
  }
}