import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { verifyAuthentication } from '../../../../../lib/auth-middleware'

// GET - Récupérer les templates de notifications
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuthentication(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    // Vérifier les permissions admin
    if (!['ADMIN', 'PASTEUR', 'PASTOR'].includes(auth.user!.role)) {
      return NextResponse.json({
        error: 'Accès non autorisé - Droits administrateur requis'
      }, { status: 403 })
    }

    const templates = await prisma.notificationTemplate.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            scheduled: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      templates
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des templates:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

// POST - Créer un nouveau template de notification
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthentication(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    // Vérifier les permissions admin
    if (!['ADMIN', 'PASTEUR', 'PASTOR'].includes(auth.user!.role)) {
      return NextResponse.json({
        error: 'Accès non autorisé - Droits administrateur requis'
      }, { status: 403 })
    }

    const { title, message, type = 'info', isActive = true } = await request.json()

    if (!title || !message) {
      return NextResponse.json({
        error: 'Titre et message sont requis'
      }, { status: 400 })
    }

    const template = await prisma.notificationTemplate.create({
      data: {
        title,
        message,
        type,
        isActive,
        createdById: auth.user!.id
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      template
    })
  } catch (error) {
    console.error('Erreur lors de la création du template:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}