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

    // Vérifier que le créneau appartient au pasteur
    const availability = await prisma.pastorAvailability.findFirst({
      where: {
        id: id,
        pastorId: user.id
      }
    })

    if (!availability) {
      return NextResponse.json(
        { error: 'Créneau non trouvé' },
        { status: 404 }
      )
    }

    await prisma.pastorAvailability.delete({
      where: { id: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Créneau supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur suppression disponibilité:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}