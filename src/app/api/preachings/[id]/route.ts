import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyAuthentication } from '@/lib/auth-middleware'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Fonction utilitaire pour supprimer un fichier
async function deleteFile(fileUrl: string | null) {
  if (!fileUrl) return
  
  try {
    const fileName = fileUrl.replace('/uploads/', '')
    const filePath = join(process.cwd(), 'public', 'uploads', fileName)
    
    if (existsSync(filePath)) {
      await unlink(filePath)
      console.log(`Fichier supprimé: ${fileName}`)
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression du fichier ${fileUrl}:`, error)
  }
}

// GET - Récupérer une prédication par ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params
    const { id } = params
    
    const preaching = await prisma.sermon.findUnique({
      where: { id }
    })

    if (!preaching) {
      return NextResponse.json({
        success: false,
        error: 'Prédication introuvable'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      preaching
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de la prédication:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 })
  }
}

// PUT - Modifier une prédication
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const authResult = await verifyAuthentication(request)
    
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Non autorisé'
      }, { status: 401 })
    }

    // Vérifier les permissions (ADMIN, OUVRIER, PASTEUR)
    if (!['ADMIN', 'OUVRIER', 'PASTEUR'].includes(authResult.user!.role)) {
      return NextResponse.json({
        success: false,
        error: 'Permissions insuffisantes'
      }, { status: 403 })
    }

    const params = await context.params
    const { id } = params
    const body = await request.json()

    // Vérifier que la prédication existe
    const existingPreaching = await prisma.sermon.findUnique({
      where: { id }
    })

    if (!existingPreaching) {
      return NextResponse.json({
        success: false,
        error: 'Prédication introuvable'
      }, { status: 404 })
    }

    // Construire les données de mise à jour
    const updateData: any = {
      title: body.title,
      description: body.description,
      bibleVerses: body.bibleVerses,
      sermonType: body.sermonType,
      sermonDate: new Date(body.sermonDate),
      isPublished: body.isPublished ?? true
    }

    // Ajouter les URLs seulement si elles sont présentes
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl
    if (body.audioUrl !== undefined) updateData.audioUrl = body.audioUrl
    if (body.thumbnailUrl !== undefined) updateData.thumbnailUrl = body.thumbnailUrl

    // Mettre à jour la prédication
    const updatedPreaching = await prisma.sermon.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      preaching: updatedPreaching,
      message: 'Prédication modifiée avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la modification de la prédication:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la modification'
    }, { status: 500 })
  }
}

// DELETE - Supprimer une prédication
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const authResult = await verifyAuthentication(request)
    
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Non autorisé'
      }, { status: 401 })
    }

    // Vérifier les permissions (ADMIN, OUVRIER, PASTEUR)
    if (!['ADMIN', 'OUVRIER', 'PASTEUR'].includes(authResult.user!.role)) {
      return NextResponse.json({
        success: false,
        error: 'Permissions insuffisantes'
      }, { status: 403 })
    }

    const params = await context.params
    const { id } = params

    // Récupérer la prédication avec ses fichiers
    const preaching = await prisma.sermon.findUnique({
      where: { id }
    })

    if (!preaching) {
      return NextResponse.json({
        success: false,
        error: 'Prédication introuvable'
      }, { status: 404 })
    }

    // Supprimer les fichiers associés
    await Promise.all([
      deleteFile(preaching.videoUrl),
      deleteFile(preaching.audioUrl),
      deleteFile(preaching.thumbnailUrl)
    ])

    // Supprimer la prédication de la base de données
    await prisma.sermon.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Prédication supprimée avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de la prédication:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la suppression'
    }, { status: 500 })
  }
}