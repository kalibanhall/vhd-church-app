/**
 * Route API pour l'upload de fichiers (vidéos, audios, images)
 * Utilise Supabase Storage pour stocker les fichiers
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Taille maximale des fichiers par type (en bytes)
const MAX_FILE_SIZES = {
  video: 500 * 1024 * 1024,    // 500MB pour les vidéos
  audio: 100 * 1024 * 1024,    // 100MB pour les audios
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

// Noms des buckets Supabase Storage
const BUCKETS = {
  video: 'videos',
  audio: 'audios', 
  thumbnail: 'thumbnails',
  image: 'images'
}

// Fonction pour créer le client Supabase à la demande
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Variables Supabase manquantes')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

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
    
    // Déterminer le bucket
    const bucket = BUCKETS[fileType as keyof typeof BUCKETS] || 'files'

    console.log(`📂 Upload vers bucket: ${bucket}, fichier: ${fileName}`)

    // Convertir le fichier en ArrayBuffer puis en Uint8Array pour Supabase
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Créer le client Supabase
    let supabase
    try {
      supabase = getSupabaseClient()
    } catch (configError) {
      console.error('❌ Configuration Supabase manquante:', configError)
      // En développement, simuler l'URL
      const simulatedUrl = `/uploads/${bucket}/${fileName}`
      console.log('🔧 Mode fallback: génération d\'une URL simulée')
      return NextResponse.json({
        success: true,
        url: simulatedUrl,
        fileName: fileName,
        size: file.size,
        type: file.type,
        bucket: bucket,
        warning: 'URL simulée (Supabase non configuré)'
      })
    }

    // Vérifier si le bucket existe, sinon le créer
    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some(b => b.name === bucket)
      
      if (!bucketExists) {
        console.log(`📦 Création du bucket: ${bucket}`)
        const { error: createError } = await supabase.storage.createBucket(bucket, {
          public: true,
          fileSizeLimit: maxSize,
          allowedMimeTypes: acceptedTypes
        })
        
        if (createError && !createError.message.includes('already exists')) {
          console.error(`❌ Erreur création bucket: ${createError.message}`)
          throw createError
        }
      }
    } catch (bucketError) {
      console.log('⚠️ Vérification bucket ignorée (peut déjà exister)')
    }

    // Upload vers Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: true,
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('❌ Erreur upload Supabase:', uploadError)
      
      // Fallback: simuler une URL pour le développement/test
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Mode développement: génération d\'une URL simulée')
        const simulatedUrl = `https://example.com/uploads/${bucket}/${fileName}`
        return NextResponse.json({
          success: true,
          url: simulatedUrl,
          fileName: fileName,
          size: file.size,
          type: file.type,
          bucket: bucket,
          warning: 'URL simulée (mode développement)'
        })
      }
      
      return NextResponse.json(
        { error: `Erreur lors de l'upload: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Générer l'URL publique
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    const publicUrl = publicUrlData.publicUrl

    console.log(`✅ Upload réussi: ${publicUrl}`)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      size: file.size,
      type: file.type,
      bucket: bucket
    })

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
