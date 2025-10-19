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

    if (!['PASTOR', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès réservé aux pasteurs et administrateurs' },
        { status: 403 }
      )
    }

    const availability = await prisma.pastorAvailability.findMany({
      where: { pastorId: user.id },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      availability
    })

  } catch (error) {
    console.error('Erreur récupération disponibilités:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des disponibilités' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    console.log('Données reçues:', body)
    
    const { dayOfWeek, startTime, endTime, isAvailable } = body

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { error: 'Jour de la semaine invalide (0-6)' },
        { status: 400 }
      )
    }

    // Vérifier qu'il n'y a pas de conflit avec un créneau existant
    const existingSlot = await prisma.pastorAvailability.findFirst({
      where: {
        pastorId: user.id,
        dayOfWeek: dayOfWeek,
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } }
            ]
          }
        ]
      }
    })

    if (existingSlot) {
      return NextResponse.json(
        { error: 'Conflit avec un créneau existant' },
        { status: 400 }
      )
    }

    const availability = await prisma.pastorAvailability.create({
      data: {
        pastorId: user.id,
        dayOfWeek,
        startTime,
        endTime,
        isAvailable: isAvailable ?? true
      }
    })

    return NextResponse.json({
      success: true,
      availability
    })

  } catch (error) {
    console.error('Erreur création disponibilité:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la disponibilité' },
      { status: 500 }
    )
  }
}