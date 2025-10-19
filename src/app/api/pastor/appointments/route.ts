import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyAuthentication } from '../../../../lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuthentication(request)
    
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const user = auth.user!

    // Vérifier que l'utilisateur est pasteur ou admin
    if (!['PASTOR', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès réservé aux pasteurs et administrateurs' },
        { status: 403 }
      )
    }

    // Récupérer les rendez-vous du pasteur
    const appointments = await prisma.appointment.findMany({
      where: {
        pastorId: user.id
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: [
        { appointmentDate: 'asc' },
        { startTime: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      appointments
    })

  } catch (error) {
    console.error('Erreur récupération rendez-vous pasteur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des rendez-vous' },
      { status: 500 }
    )
  }
}