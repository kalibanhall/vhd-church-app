/**
 * Route API pour l'upload de fichiers (vidéos, audios, images)
 * Proxy vers le backend Render ou stockage local
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Taille maximale des fichiers par type (en bytes)
const MAX_FILE_SIZES = {
  video: 100 * 1024 * 1024,    // 100MB pour les vidéos
  audio: 50 * 1024 * 1024,     // 50MB pour les audios
  thumbnail: 10 * 1024 * 1024,  // 10MB pour les images
  image: 10 * 1024 * 1024       // 10MB pour les images
}

// Types MIME acceptés par type de fichier
const ACCEPTED_TYPES = {
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a', 'audio/x-m4a'],
  thumbnail: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Début de l\'upload de fichier...')
    
    // Vérifier l'authentification
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth-token')?.value
    
    if (!token) {
      console.error('❌ Upload refusé: non authentifié')
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Parser le FormData
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const fileType = (formData.get('type') as string) || 'image'

    if (!file) {
      console.error('❌ Upload refusé: aucun fichier fourni')
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    console.log(`📁 Fichier reçu: ${file.name}, type: ${file.type}, taille: ${(file.size / 1024 / 1024).toFixed(2)}MB`)

    // Valider le type de fichier
    const acceptedTypes = ACCEPTED_TYPES[fileType as keyof typeof ACCEPTED_TYPES] || ACCEPTED_TYPES.image
    if (!acceptedTypes.includes(file.type)) {
      console.error(`❌ Type de fichier non accepté: ${file.type}`)
      return NextResponse.json(
        { error: `Type de fichier non accepté. Types acceptés: ${acceptedTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Valider la taille du fichier
    const maxSize = MAX_FILE_SIZES[fileType as keyof typeof MAX_FILE_SIZES] || MAX_FILE_SIZES.image
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0)
      console.error(`❌ Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(2)}MB > ${maxSizeMB}MB`)
      return NextResponse.json(
        { error: `Fichier trop volumineux. Taille maximale: ${maxSizeMB}MB` },
        { status: 400 }
      )
    }

    // Préparer le nom du fichier
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${randomId}_${sanitizedName}`

    // Essayer d'abord le backend Render
    try {
      console.log('🔄 Tentative d\'upload vers le backend Render...')
      
      const backendFormData = new FormData()
      backendFormData.append('file', file)
      backendFormData.append('type', fileType)
      
      const backendResponse = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: backendFormData
      })

      if (backendResponse.ok) {
        const result = await backendResponse.json()
        console.log('✅ Upload backend réussi:', result)
        return NextResponse.json({
          success: true,
          url: result.url || result.fileUrl || result.path,
          fileName: result.fileName || fileName,
          size: file.size,
          type: file.type
        })
      } else {
        console.log('⚠️ Backend upload failed, using fallback...')
      }
    } catch (backendError) {
      console.log('⚠️ Backend non disponible, utilisation du fallback local')
    }

    // Fallback: Stockage local dans /public/uploads
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', fileType + 's')
      
      // Créer le dossier s'il n'existe pas
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      // Écrire le fichier
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const filePath = path.join(uploadsDir, fileName)
      
      await writeFile(filePath, buffer)
      
      // URL publique
      const publicUrl = `/uploads/${fileType}s/${fileName}`
      
      console.log(`✅ Fichier sauvegardé localement: ${publicUrl}`)
      
      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName: fileName,
        size: file.size,
        type: file.type,
        storage: 'local'
      })
    } catch (localError) {
      console.error('❌ Erreur stockage local:', localError)
      
      // Dernier recours: retourner une URL data base64 pour les petits fichiers (images)
      if (file.size < 5 * 1024 * 1024 && fileType === 'thumbnail') {
        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        const dataUrl = `data:${file.type};base64,${base64}`
        
        console.log('✅ Fichier converti en base64')
        
        return NextResponse.json({
          success: true,
          url: dataUrl,
          fileName: fileName,
          size: file.size,
          type: file.type,
          storage: 'base64'
        })
      }
      
      return NextResponse.json(
        { error: 'Impossible de stocker le fichier. Veuillez utiliser une URL externe (YouTube, etc.)' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('💥 Erreur générale upload:', error)
    return NextResponse.json(
      { error: `Erreur serveur: ${error.message}` },
      { status: 500 }
    )
  }
}

// Route OPTIONS pour CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
