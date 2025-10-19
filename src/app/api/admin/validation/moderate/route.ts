import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { verifyAuthentication } from '../../../../../lib/auth-middleware'

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

// PATCH - Approuver ou rejeter un élément
export async function PATCH(request: NextRequest) {
  try {
    // Vérification des permissions de modération
    const auth = await checkModerationPermission(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { type, itemId, action } = body

    if (!type || !itemId || !action) {
      return NextResponse.json(
        { error: 'Type, ID de l\'élément et action requis' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action doit être "approve" ou "reject"' },
        { status: 400 }
      )
    }

    const status = action === 'approve' ? 'APPROVED' : 'REJECTED'
    const moderatorId = auth.user?.id

    if (type === 'prayer') {
      // Mettre à jour la prière
      const updatedPrayer = await prisma.prayer.update({
        where: { id: itemId },
        data: {
          status: status,
          approvedBy: moderatorId,
          approvedAt: new Date(),
          updatedAt: new Date()
        },
        select: {
          id: true,
          title: true,
          status: true
        }
      })

      return NextResponse.json({
        message: `Prière ${action === 'approve' ? 'approuvée' : 'rejetée'} avec succès`,
        prayer: updatedPrayer
      })
    }

    if (type === 'testimony') {
      // Mettre à jour le témoignage
      const isApproved = action === 'approve'
      const updatedTestimony = await prisma.testimony.update({
        where: { id: itemId },
        data: {
          isApproved: isApproved,
          approvedBy: moderatorId,
          approvedAt: new Date(),
          isPublished: isApproved,
          publishedAt: isApproved ? new Date() : null,
          updatedAt: new Date()
        },
        select: {
          id: true,
          title: true,
          isApproved: true
        }
      })

      return NextResponse.json({
        message: `Témoignage ${action === 'approve' ? 'approuvé' : 'rejeté'} avec succès`,
        testimony: updatedTestimony
      })
    }

    return NextResponse.json(
      { error: 'Type doit être "prayer" ou "testimony"' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Erreur lors de la modération:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modération' },
      { status: 500 }
    )
  }
}