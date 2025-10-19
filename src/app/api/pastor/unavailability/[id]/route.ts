import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { verifyAuthentication } from '../../../../../lib/auth-middleware'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuthentication(request)
    
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const user = auth.user!

    if (!['PASTOR', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès réservé aux pasteurs et administrateurs' },
        { status: 403 }
      )
    }

    const { id } = params

    // Vérifier que la période appartient au pasteur
    const period = await prisma.pastorUnavailability.findFirst({
      where: {
        id: id,
        pastorId: user.id
      }
    })

    if (!period) {
      return NextResponse.json(
        { error: 'Période non trouvée' },
        { status: 404 }
      )
    }

    await prisma.pastorUnavailability.delete({
      where: { id: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Période supprimée avec succès'
    })

  } catch (error) {
    console.error('Erreur suppression indisponibilité:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}