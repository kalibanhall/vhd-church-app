/**
 * =============================================================================
 * API PROFIL FACIAL - Enregistrement du visage de l'utilisateur
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * 
 * Description: API pour permettre aux utilisateurs d'enregistrer ou modifier
 * leur descripteur facial depuis leur profil.
 * 
 * Cette API stocke le descripteur dans la table face_descriptors (principale)
 * et/ou dans la table membres si un membre_id existe.
 * 
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

// Créer le client Supabase à la demande
function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Configuration Supabase manquante')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

// Vérifier le token JWT
function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    const decoded = jwt.verify(token, secret) as any
    // Support both userId and id fields
    return {
      userId: decoded.userId || decoded.id,
      email: decoded.email
    }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const user = verifyToken(token)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      )
    }

    // Récupérer les données
    const body = await request.json()
    const { descriptor, imageData } = body

    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return NextResponse.json(
        { success: false, error: 'Descripteur facial invalide (128 valeurs requises)' },
        { status: 400 }
      )
    }

    // Initialiser Supabase
    const supabase = getSupabaseClient()

    // Récupérer l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, membre_id, first_name, last_name')
      .eq('id', user.userId)
      .single()

    if (userError || !userData) {
      console.error('❌ Erreur user lookup:', userError)
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    console.log('📸 Enregistrement facial pour:', userData.first_name, userData.last_name)

    let photoUrl = null

    // Upload de la photo si fournie
    if (imageData && imageData.startsWith('data:image')) {
      try {
        const fileName = `face_${user.userId}_${Date.now()}.jpg`
        const base64Data = imageData.split(',')[1]
        const buffer = Buffer.from(base64Data, 'base64')

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: true
          })

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('photos')
            .getPublicUrl(fileName)
          photoUrl = urlData.publicUrl
          console.log('✅ Photo uploadée:', photoUrl)
        } else {
          console.warn('⚠️ Erreur upload photo:', uploadError)
        }
      } catch (uploadErr) {
        console.warn('⚠️ Erreur upload:', uploadErr)
      }
    }

    // STRATÉGIE 1: Stocker dans face_descriptors (table principale)
    try {
      // Supprimer l'ancien descripteur s'il existe
      await supabase
        .from('face_descriptors')
        .delete()
        .eq('user_id', user.userId)

      // Insérer le nouveau descripteur
      const { error: insertError } = await supabase
        .from('face_descriptors')
        .insert({
          user_id: user.userId,
          descriptor: descriptor,
          photo_url: photoUrl,
          quality_score: 0.95,
          is_primary: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        console.warn('⚠️ Erreur insert face_descriptors:', insertError)
      } else {
        console.log('✅ Descripteur enregistré dans face_descriptors')
      }
    } catch (err) {
      console.warn('⚠️ Table face_descriptors non disponible:', err)
    }

    // STRATÉGIE 2: Stocker aussi dans membres si membre_id existe
    if (userData.membre_id) {
      try {
        const updateData: Record<string, unknown> = {
          face_descriptor: descriptor,
          updated_at: new Date().toISOString()
        }
        
        if (photoUrl) {
          updateData.photo_url = photoUrl
        }

        const { error: updateError } = await supabase
          .from('membres')
          .update(updateData)
          .eq('id', userData.membre_id)

        if (updateError) {
          console.warn('⚠️ Erreur update membres:', updateError)
        } else {
          console.log('✅ Descripteur enregistré dans membres')
        }
      } catch (err) {
        console.warn('⚠️ Table membres non disponible:', err)
      }
    }

    // STRATÉGIE 3: Mettre à jour le profil utilisateur avec la photo
    if (photoUrl) {
      try {
        await supabase
          .from('users')
          .update({
            profile_image_url: photoUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.userId)
        console.log('✅ Photo profil mise à jour')
      } catch (err) {
        console.warn('⚠️ Erreur mise à jour profil:', err)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Visage enregistré avec succès',
      photoUrl
    })

  } catch (error) {
    console.error('❌ Erreur API facial:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// GET - Vérifier si l'utilisateur a un visage enregistré
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const user = verifyToken(token)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      )
    }

    // Initialiser Supabase
    const supabase = getSupabaseClient()

    // Vérifier dans face_descriptors (priorité)
    try {
      const { data: faceData } = await supabase
        .from('face_descriptors')
        .select('id, photo_url, created_at, updated_at')
        .eq('user_id', user.userId)
        .eq('is_primary', true)
        .single()

      if (faceData) {
        return NextResponse.json({
          success: true,
          hasFaceDescriptor: true,
          photoUrl: faceData.photo_url,
          lastUpdated: faceData.updated_at || faceData.created_at
        })
      }
    } catch (err) {
      console.warn('⚠️ Table face_descriptors non disponible:', err)
    }

    // Sinon vérifier dans membres
    const { data: userData } = await supabase
      .from('users')
      .select('membre_id')
      .eq('id', user.userId)
      .single()

    if (userData?.membre_id) {
      const { data: membreData } = await supabase
        .from('membres')
        .select('face_descriptor, photo_url, updated_at')
        .eq('id', userData.membre_id)
        .single()

      if (membreData?.face_descriptor) {
        return NextResponse.json({
          success: true,
          hasFaceDescriptor: true,
          photoUrl: membreData.photo_url,
          lastUpdated: membreData.updated_at
        })
      }
    }

    return NextResponse.json({
      success: true,
      hasFaceDescriptor: false,
      photoUrl: null
    })

  } catch (error) {
    console.error('❌ Erreur API facial GET:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer les données faciales de l'utilisateur
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const user = verifyToken(token)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      )
    }

    // Initialiser Supabase
    const supabase = getSupabaseClient()

    // Supprimer de face_descriptors
    try {
      await supabase
        .from('face_descriptors')
        .delete()
        .eq('user_id', user.userId)
      console.log('✅ Supprimé de face_descriptors')
    } catch (err) {
      console.warn('⚠️ Erreur suppression face_descriptors:', err)
    }

    // Supprimer de membres si applicable
    const { data: userData } = await supabase
      .from('users')
      .select('membre_id')
      .eq('id', user.userId)
      .single()

    if (userData?.membre_id) {
      try {
        await supabase
          .from('membres')
          .update({
            face_descriptor: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', userData.membre_id)
        console.log('✅ Supprimé de membres')
      } catch (err) {
        console.warn('⚠️ Erreur suppression membres:', err)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Données faciales supprimées avec succès'
    })

  } catch (error) {
    console.error('❌ Erreur API facial DELETE:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}