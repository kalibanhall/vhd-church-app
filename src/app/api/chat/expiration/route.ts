import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyAuthentication } from '../../../../lib/auth-middleware'

// GET - Récupérer la configuration d'expiration d'un channel
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuthentication(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')

    if (!channelId) {
      return NextResponse.json({
        error: 'ID du channel requis'
      }, { status: 400 })
    }

    // Récupérer la configuration d'expiration
    const config = await prisma.messageExpirationConfig.findUnique({
      where: { channelId },
      include: {
        channel: {
          select: { name: true, type: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      config: config || {
        channelId,
        isEnabled: false,
        defaultDurationHours: 24,
        autoDelete: false
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de la config:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

// POST - Créer/Mettre à jour la configuration d'expiration (Admin seulement)
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

    const { channelId, isEnabled, defaultDurationHours, autoDelete } = await request.json()

    if (!channelId) {
      return NextResponse.json({
        error: 'ID du channel requis'
      }, { status: 400 })
    }

    // Vérifier que le channel existe
    const channel = await prisma.channel.findUnique({
      where: { id: channelId }
    })

    if (!channel) {
      return NextResponse.json({
        error: 'Channel non trouvé'
      }, { status: 404 })
    }

    // Créer ou mettre à jour la configuration
    const config = await prisma.messageExpirationConfig.upsert({
      where: { channelId },
      create: {
        channelId,
        isEnabled: isEnabled || false,
        defaultDurationHours: defaultDurationHours || 24,
        autoDelete: autoDelete || false
      },
      update: {
        isEnabled: isEnabled !== undefined ? isEnabled : undefined,
        defaultDurationHours: defaultDurationHours || undefined,
        autoDelete: autoDelete !== undefined ? autoDelete : undefined
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Configuration d\'expiration mise à jour',
      config
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la config:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}

// DELETE - Supprimer la configuration d'expiration (Admin seulement)
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')

    if (!channelId) {
      return NextResponse.json({
        error: 'ID du channel requis'
      }, { status: 400 })
    }

    // Supprimer la configuration
    await prisma.messageExpirationConfig.delete({
      where: { channelId }
    })

    return NextResponse.json({
      success: true,
      message: 'Configuration d\'expiration supprimée'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de la config:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}