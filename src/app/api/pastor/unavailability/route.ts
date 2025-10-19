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

    const periods = await prisma.pastorUnavailability.findMany({
      where: { pastorId: user.id },
      orderBy: { startDate: 'asc' }
    })

    return NextResponse.json({
      success: true,
      periods
    })

  } catch (error) {
    console.error('Erreur récupération indisponibilités:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des indisponibilités' },
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

    const { startDate, endDate, reason } = await request.json()

    if (!startDate || !endDate || !reason) {
      return NextResponse.json(
        { error: 'Dates de début, fin et motif requis' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start >= end) {
      return NextResponse.json(
        { error: 'La date de fin doit être postérieure à la date de début' },
        { status: 400 }
      )
    }

    const period = await prisma.pastorUnavailability.create({
      data: {
        pastorId: user.id,
        startDate: start,
        endDate: end,
        reason
      }
    })

    return NextResponse.json({
      success: true,
      period
    })

  } catch (error) {
    console.error('Erreur création indisponibilité:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'indisponibilité' },
      { status: 500 }
    )
  }
}