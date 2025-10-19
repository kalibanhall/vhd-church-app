import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyAuthentication } from '../../../../lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    console.log('=== API MEMBER APPOINTMENTS GET ===')
    
    const auth = await verifyAuthentication(request)
    
    if (!auth.success) {
      console.log('❌ Authentication failed:', auth.error)
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const user = auth.user!
    console.log('✅ User authenticated:', user.email, user.role)

    // Récupérer les rendez-vous de l'utilisateur connecté
    const appointments = await prisma.appointment.findMany({
      where: { userId: user.id },
      include: {
        pastor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: [
        { appointmentDate: 'desc' },
        { startTime: 'desc' }
      ]
    })

    console.log(`✅ Found ${appointments.length} appointments for user ${user.id}`)

    return NextResponse.json({
      success: true,
      appointments
    })

  } catch (error) {
    console.error('❌ Erreur récupération rendez-vous membre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des rendez-vous' },
      { status: 500 }
    )
  }
}