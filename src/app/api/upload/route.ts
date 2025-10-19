import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { verifyAuthentication } from '@/lib/auth-middleware'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await verifyAuthentication(request)
    
    if (!authResult.success) {
      console.log('❌ Upload: Authentification échouée')
      return NextResponse.json({
        success: false,
        error: 'Non autorisé'
      }, { status: 401 })
    }

    console.log('✅ Upload: Utilisateur authentifié:', authResult.user?.email)
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const type: string = data.get('type') as string

    if (!file) {
      return NextResponse.json({ success: false, error: 'Aucun fichier fourni' })
    }

    // Validation du type de fichier
    const allowedTypes = {
      video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'],
      audio: ['audio/mp3', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/m4a'],
      thumbnail: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      profile: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    }

    if (type && allowedTypes[type as keyof typeof allowedTypes]) {
      const validTypes = allowedTypes[type as keyof typeof allowedTypes]
      if (!validTypes.includes(file.type)) {
        return NextResponse.json({ 
          success: false, 
          error: `Type de fichier non autorisé. Types acceptés: ${validTypes.join(', ')}` 
        })
      }
    }

    // Créer le nom de fichier unique
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = `${type}_${timestamp}.${extension}`

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public', 'uploads', type + 's')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Écrire le fichier
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = join(uploadsDir, fileName)
    
    await writeFile(filePath, buffer)

    // Retourner l'URL publique
    const publicUrl = `/uploads/${type}s/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: 'Fichier uploadé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'upload du fichier'
    }, { status: 500 })
  }
}

// Configuration pour les gros fichiers
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb', // Limite à 100MB
    },
  },
}