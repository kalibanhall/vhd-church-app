import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // Récupérer tous les projets actifs
    const projects = await prisma.donationProject.findMany({
      where: {
        status: 'ACTIVE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Erreur récupération projets:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const userId = decoded.id || decoded.userId
    
    // Vérifier que l'utilisateur est admin ou pasteur
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user || !['ADMIN', 'PASTOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }
    
    const body = await request.json()
    
    const {
      projectName,
      description,
      targetAmount,
      startDate,
      endDate,
      projectImageUrl
    } = body

    const newProject = await prisma.donationProject.create({
      data: {
        projectName,
        description,
        targetAmount: parseFloat(targetAmount),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        projectImageUrl,
        status: 'ACTIVE'
      }
    })

    return NextResponse.json(newProject, { status: 201 })
  } catch (error) {
    console.error('Erreur création projet:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}