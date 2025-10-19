import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyAuthentication } from '../../../../lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuthentication(request)
    
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    // Pour l'instant, récupérer simplement tous les pasteurs actifs
    // TODO: Ajouter la logique de vérification de disponibilité plus tard
    const pastors = await prisma.user.findMany({
      where: { 
        role: 'PASTOR',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    })

    const pastorsWithAvailability = pastors.map(pastor => ({
      id: pastor.id,
      firstName: pastor.firstName,
      lastName: pastor.lastName,
      email: pastor.email,
      available: true, // Par défaut, tous sont disponibles
      displayName: `Pasteur ${pastor.firstName} ${pastor.lastName}`
    }))

    return NextResponse.json({
      success: true,
      pastors: pastorsWithAvailability
    })

  } catch (error) {
    console.error('Erreur récupération pasteurs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des pasteurs' },
      { status: 500 }
    )
  }
}