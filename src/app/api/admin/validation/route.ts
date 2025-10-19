import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyAuthentication } from '../../../../lib/auth-middleware'

// Fonction pour vérifier les permissions de modération
async function checkModerationPermission(request: NextRequest) {
  const authResult = await verifyAuthentication(request)
  
  if (!authResult.success) {
    return { 
      error: authResult.error, 
      status: authResult.status || 401 
    }
  }

  if (!['ADMIN', 'PASTEUR', 'PASTOR', 'OUVRIER'].includes(authResult.user?.role || '')) {
    return { 
      error: 'Accès non autorisé - Droits de modération requis', 
      status: 403 
    }
  }

  return { user: authResult.user, status: 200 }
}

// GET - Récupérer les éléments en attente de validation
export async function GET(request: NextRequest) {
  try {
    // Vérification des permissions de modération
    const auth = await checkModerationPermission(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'prayers' ou 'testimonies'

    if (type === 'prayers') {
      // Récupérer les prières en attente
      const prayers = await prisma.prayer.findMany({
        where: {
          status: 'PENDING'
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

      const formattedPrayers = prayers.map((prayer: any) => ({
        id: prayer.id,
        userId: prayer.userId,
        userName: prayer.isAnonymous ? 'Anonyme' : `${prayer.user.firstName} ${prayer.user.lastName}`,
        title: prayer.title,
        content: prayer.content,
        isAnonymous: prayer.isAnonymous,
        isPublic: prayer.isPublic,
        prayerDate: prayer.createdAt.toISOString().split('T')[0],
        status: prayer.status.toLowerCase(),
        prayerCount: prayer.prayerCount || 0
      }))

      return NextResponse.json(formattedPrayers)
    }

    if (type === 'testimonies') {
      // Récupérer les témoignages en attente (non approuvés)
      const testimonies = await prisma.testimony.findMany({
        where: {
          isApproved: false
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

      const formattedTestimonies = testimonies.map((testimony: any) => ({
        id: testimony.id,
        userId: testimony.userId,
        userName: testimony.isAnonymous ? 'Anonyme' : `${testimony.user.firstName} ${testimony.user.lastName}`,
        title: testimony.title,
        content: testimony.content,
        isAnonymous: testimony.isAnonymous,
        testimonyDate: testimony.createdAt.toISOString().split('T')[0],
        status: testimony.isApproved ? 'approved' : 'pending',
        likeCount: 0,
        viewCount: testimony.viewCount || 0
      }))

      return NextResponse.json(formattedTestimonies)
    }

    return NextResponse.json(
      { error: 'Type requis: prayers ou testimonies' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Erreur lors de la récupération des éléments en attente:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}