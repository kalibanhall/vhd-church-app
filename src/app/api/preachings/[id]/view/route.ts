import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Incrémenter le compteur de vues
    await prisma.sermon.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })

    // Enregistrer la vue dans les analytics si l'utilisateur est authentifié
    const cookieHeader = request.headers.get('cookie')
    if (cookieHeader) {
      // Optionnel: enregistrer qui a vu la prédication pour des analytics plus détaillés
      // Cela pourrait être utile pour la page Analytics
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Vue enregistrée' 
    })
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la vue:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur serveur' 
      },
      { status: 500 }
    )
  }
}