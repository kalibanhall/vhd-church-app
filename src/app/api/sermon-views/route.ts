import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

// POST - Enregistrer une vue de sermon
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API /api/sermon-views appelée')
    
    const body = await request.json()
    const { sermonId, action } = body // action: 'view' | 'download'

    if (!sermonId || !action) {
      return NextResponse.json(
        { error: 'sermonId et action sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que le sermon existe
    const sermon = await prisma.sermon.findUnique({
      where: { id: sermonId }
    })

    if (!sermon) {
      return NextResponse.json(
        { error: 'Sermon non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour le compteur approprié
    if (action === 'view') {
      await prisma.sermon.update({
        where: { id: sermonId },
        data: {
          viewCount: {
            increment: 1
          }
        }
      })
    } else if (action === 'download') {
      await prisma.sermon.update({
        where: { id: sermonId },
        data: {
          downloadCount: {
            increment: 1
          }
        }
      })
    }

    // Obtenir l'utilisateur si connecté (optionnel)
    let userId = null
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get('auth-token')?.value
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        userId = decoded.id || decoded.userId
      }
    } catch (error) {
      // Ignorer les erreurs d'authentification pour cette API
      console.log('Vue anonyme enregistrée')
    }

    // Enregistrer l'activité si utilisateur connecté
    if (userId) {
      try {
        // Créer un enregistrement d'activité (optionnel - pour analytics avancés)
        await prisma.user.update({
          where: { id: userId },
          data: {
            updatedAt: new Date()
          }
        })
      } catch (error) {
        console.log('Erreur enregistrement activité utilisateur:', error)
      }
    }

    console.log(`✅ ${action} enregistré pour sermon ${sermonId}`)
    return NextResponse.json({ 
      success: true,
      message: `${action} enregistré avec succès`
    })

  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de l\'activité' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET - Récupérer les statistiques d'un sermon spécifique
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sermonId = searchParams.get('sermonId')

    if (!sermonId) {
      return NextResponse.json(
        { error: 'sermonId requis' },
        { status: 400 }
      )
    }

    const sermon = await prisma.sermon.findUnique({
      where: { id: sermonId },
      select: {
        id: true,
        title: true,
        viewCount: true,
        downloadCount: true,
        createdAt: true,
        isPublished: true
      }
    })

    if (!sermon) {
      return NextResponse.json(
        { error: 'Sermon non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      sermon
    })

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des stats:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}