import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

import { verifyAuthentication } from '../../../../lib/auth-middleware'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthentication(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const userId = auth.user!.id
    const formData = await request.formData()
    const file = formData.get('photo') as File

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Utilisez JPG, PNG ou WebP.' },
        { status: 400 }
      )
    }

    // Vérifier la taille du fichier (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux. Maximum 5MB.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Créer le nom de fichier unique
    const fileName = `profile_${userId}_${Date.now()}.${file.type.split('/')[1]}`
    
    // Créer le dossier s'il n'existe pas
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Le dossier existe déjà
    }

    // Écrire le fichier
    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    // URL publique du fichier
    const publicUrl = `/uploads/profiles/${fileName}`

    // Mettre à jour le profil utilisateur avec la nouvelle photo
    await prisma.user.update({
      where: { id: userId },
      data: { profileImageUrl: publicUrl }
    })

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: 'Photo de profil mise à jour avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload de la photo' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAuthentication(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const userId = auth.user!.id

    // Mettre à jour l'utilisateur pour supprimer la photo de profil
    await prisma.user.update({
      where: { id: userId },
      data: {
        profileImageUrl: null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Photo de profil supprimée avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la suppression de la photo:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la photo' },
      { status: 500 }
    )
  }
}