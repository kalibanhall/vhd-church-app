import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyAuthentication } from '../../../../lib/auth-middleware'

export async function GET(request: NextRequest) {
  const verification = await verifyAuthentication(request)
  
  if (!verification.success) {
    return NextResponse.json({ error: verification.error }, { status: verification.status || 401 })
  }

  try {
    const pastors = await prisma.user.findMany({
      where: {
        role: { in: ['PASTOR', 'ADMIN'] },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        profileImageUrl: true
      },
      orderBy: { firstName: 'asc' }
    })

    return NextResponse.json({
      success: true,
      pastors
    })
  } catch (error) {
    console.error('Erreur récupération pasteurs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des pasteurs' },
      { status: 500 }
    )
  }
}